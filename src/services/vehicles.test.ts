import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  markAsSold,
  reactivateVehicle,
  getVehiclePhotoUrl,
  getActiveVehicles,
  getSoldVehicles,
} from './vehicles'
import { buildVehicle } from '@/test/factories'

const mockGetFullList = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockGetUrl = vi.fn()

vi.mock('./pb', () => ({
  default: {
    authStore: {
      model: { id: 'user_001' },
    },
    collection: () => ({
      getFullList: mockGetFullList,
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    }),
    files: {
      getUrl: (...args: unknown[]) => mockGetUrl(...args),
    },
  },
}))

describe('vehicles service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('returns vehicles filtered by ownerId', async () => {
      const vehicles = [
        buildVehicle({ name: 'Car A', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Car B', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getAll()

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'ownerId = "user_001"',
      })
      expect(result).toHaveLength(2)
    })

    it('sorts active vehicles alphabetically before sold vehicles', async () => {
      const vehicles = [
        buildVehicle({ name: 'Zephyr', status: 'active', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Alpha', status: 'sold', saleDate: '2026-01-01', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Beta', status: 'active', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getAll()

      expect(result[0]!.name).toBe('Beta')
      expect(result[1]!.name).toBe('Zephyr')
      expect(result[2]!.name).toBe('Alpha')
    })

    it('sorts sold vehicles by saleDate descending', async () => {
      const vehicles = [
        buildVehicle({ name: 'Old', status: 'sold', saleDate: '2025-01-01', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Recent', status: 'sold', saleDate: '2026-03-01', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Mid', status: 'sold', saleDate: '2025-06-15', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getAll()

      expect(result[0]!.name).toBe('Recent')
      expect(result[1]!.name).toBe('Mid')
      expect(result[2]!.name).toBe('Old')
    })

    it('returns empty array when no vehicles exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getAll()

      expect(result).toEqual([])
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getAll()).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('rejects invalid data through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }]
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getAll()).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single vehicle by id and ownerId', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)

      const result = await getOne(vehicle.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${vehicle.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(vehicle.id)
    })

    it('parses response through Zod schema', async () => {
      mockGetFirstListItem.mockResolvedValueOnce({ id: 123 })

      await expect(getOne('bad_id')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('sets ownerId and passes data correctly', async () => {
      const data = {
        name: 'New Car',
        type: 'Car',
        make: 'Toyota',
        model: 'Corolla',
        year: 2024,
        licensePlate: 'AB 12 345',
        fuelType: 'Petrol' as const,
        status: 'active' as const,
        purchaseDate: '2024-01-01',
        purchasePrice: 300000,
        photo: null,
      }
      const created = buildVehicle({
        ...data,
        ownerId: 'user_001' as never,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith({
        ...data,
        ownerId: 'user_001',
      })
      expect(result.name).toBe('New Car')
    })

    it('handles FormData by setting ownerId on it', async () => {
      const formData = new FormData()
      formData.set('name', 'Photo Car')

      const created = buildVehicle({
        name: 'Photo Car',
        ownerId: 'user_001' as never,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result.name).toBe('Photo Car')
    })

    it('rejects invalid response through Zod schema', async () => {
      const data = {
        name: 'Bad',
        type: null,
        make: null,
        model: null,
        year: null,
        licensePlate: null,
        fuelType: 'Petrol' as const,
        status: 'active' as const,
        purchaseDate: null,
        purchasePrice: null,
        photo: null,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 })

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership then updates fields', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      const updated = { ...vehicle, name: 'Updated Name' }
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(vehicle.id, { name: 'Updated Name' })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${vehicle.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(vehicle.id, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })

    it('handles FormData for photo uploads', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      const formData = new FormData()
      formData.set('name', 'Updated')

      const updated = { ...vehicle, name: 'Updated' }
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(vehicle.id, formData)

      expect(mockUpdate).toHaveBeenCalledWith(vehicle.id, formData)
      expect(result.name).toBe('Updated')
    })

    it('throws when vehicle not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { name: 'Hack' })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('verifies ownership then deletes', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(vehicle.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${vehicle.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(vehicle.id)
    })

    it('throws when vehicle not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('markAsSold', () => {
    it('sets status to sold with saleDate, salePrice, and saleNote', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      const sold = {
        ...vehicle,
        status: 'sold',
        saleDate: '2026-03-15',
        salePrice: 200000,
        saleNote: 'Sold to dealer',
      }
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockUpdate.mockResolvedValueOnce(sold)

      const result = await markAsSold(vehicle.id, '2026-03-15', 200000, 'Sold to dealer')

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${vehicle.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(vehicle.id, {
        status: 'sold',
        saleDate: '2026-03-15',
        salePrice: 200000,
        saleNote: 'Sold to dealer',
      })
      expect(result.status).toBe('sold')
      expect(result.saleDate).toBe('2026-03-15')
    })

    it('sets salePrice and saleNote to null when not provided', async () => {
      const vehicle = buildVehicle({ ownerId: 'user_001' as never })
      const sold = {
        ...vehicle,
        status: 'sold',
        saleDate: '2026-03-15',
        salePrice: null,
        saleNote: null,
      }
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockUpdate.mockResolvedValueOnce(sold)

      await markAsSold(vehicle.id, '2026-03-15')

      expect(mockUpdate).toHaveBeenCalledWith(vehicle.id, {
        status: 'sold',
        saleDate: '2026-03-15',
        salePrice: null,
        saleNote: null,
      })
    })

    it('throws when vehicle not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(markAsSold('other_id', '2026-03-15')).rejects.toThrow()
    })
  })

  describe('reactivateVehicle', () => {
    it('sets status to active and clears sale fields', async () => {
      const vehicle = buildVehicle({
        ownerId: 'user_001' as never,
        status: 'sold',
        saleDate: '2026-03-15',
        salePrice: 200000,
        saleNote: 'Sold',
      })
      const reactivated = {
        ...vehicle,
        status: 'active',
        saleDate: null,
        salePrice: null,
        saleNote: null,
      }
      mockGetFirstListItem.mockResolvedValueOnce(vehicle)
      mockUpdate.mockResolvedValueOnce(reactivated)

      const result = await reactivateVehicle(vehicle.id)

      expect(mockUpdate).toHaveBeenCalledWith(vehicle.id, {
        status: 'active',
        saleDate: null,
        salePrice: null,
        saleNote: null,
      })
      expect(result.status).toBe('active')
      expect(result.saleDate).toBeNull()
      expect(result.salePrice).toBeNull()
      expect(result.saleNote).toBeNull()
    })

    it('throws when vehicle not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(reactivateVehicle('other_id')).rejects.toThrow()
    })
  })

  describe('getVehiclePhotoUrl', () => {
    it('returns the file URL when photo exists', () => {
      const vehicle = buildVehicle({ photo: 'car.jpg' })
      mockGetUrl.mockReturnValueOnce('http://localhost:8090/api/files/vehicles/abc/car.jpg')

      const url = getVehiclePhotoUrl(vehicle)

      expect(mockGetUrl).toHaveBeenCalledWith(vehicle, 'car.jpg')
      expect(url).toBe('http://localhost:8090/api/files/vehicles/abc/car.jpg')
    })

    it('returns null when photo is null', () => {
      const vehicle = buildVehicle({ photo: null })

      const url = getVehiclePhotoUrl(vehicle)

      expect(mockGetUrl).not.toHaveBeenCalled()
      expect(url).toBeNull()
    })
  })

  describe('getActiveVehicles', () => {
    it('returns only active vehicles', async () => {
      const vehicles = [
        buildVehicle({ name: 'Active One', status: 'active', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Sold One', status: 'sold', saleDate: '2026-01-01', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Active Two', status: 'active', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getActiveVehicles()

      expect(result).toHaveLength(2)
      expect(result.every((v) => v.status === 'active')).toBe(true)
    })

    it('returns empty array when no active vehicles', async () => {
      const vehicles = [
        buildVehicle({ status: 'sold', saleDate: '2026-01-01', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getActiveVehicles()

      expect(result).toEqual([])
    })
  })

  describe('getSoldVehicles', () => {
    it('returns only sold vehicles', async () => {
      const vehicles = [
        buildVehicle({ name: 'Active One', status: 'active', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Sold One', status: 'sold', saleDate: '2026-01-01', ownerId: 'user_001' as never }),
        buildVehicle({ name: 'Sold Two', status: 'sold', saleDate: '2026-02-01', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getSoldVehicles()

      expect(result).toHaveLength(2)
      expect(result.every((v) => v.status === 'sold')).toBe(true)
    })

    it('returns empty array when no sold vehicles', async () => {
      const vehicles = [
        buildVehicle({ status: 'active', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(vehicles)

      const result = await getSoldVehicles()

      expect(result).toEqual([])
    })
  })
})
