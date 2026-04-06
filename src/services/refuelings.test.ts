import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByVehicle,
  getOne,
  create,
  update,
  remove,
  getReceiptUrl,
  getTripCounterPhotoUrl,
} from './refuelings'
import { buildRefueling } from '@/test/factories'

// Mock PocketBase
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

const vehicleId = 'vehicle_001'

describe('refuelings service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByVehicle', () => {
    it('returns refuelings filtered by vehicleId and ownerId, sorted by -date', async () => {
      const refuelings = [
        buildRefueling({
          vehicleId: vehicleId as never,
          ownerId: 'user_001' as never,
          date: '2026-02-15',
        }),
        buildRefueling({
          vehicleId: vehicleId as never,
          ownerId: 'user_001' as never,
          date: '2026-01-15',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(refuelings)

      const result = await getByVehicle(vehicleId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && vehicleId = "${vehicleId}"`,
        sort: '-date',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no refuelings exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByVehicle(vehicleId)

      expect(result).toEqual([])
    })

    it('parses response through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }] // id must be string
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getByVehicle(vehicleId)).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single refueling by id and ownerId', async () => {
      const refueling = buildRefueling({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(refueling)

      const result = await getOne(refueling.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${refueling.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(refueling.id)
    })

    it('throws when refueling not found', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(getOne('nonexistent')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('sets ownerId and returns parsed refueling with plain object', async () => {
      const data: Parameters<typeof create>[0] = {
        vehicleId: vehicleId as never,
        date: '2026-03-01',
        fuelAmount: 45,
        costPerUnit: 12.5,
        totalCost: 562.5,
        odometerReading: 15000,
        station: null,
        chargedAtHome: false,
        note: null,
        receipt: null,
        tripCounterPhoto: null,
      }
      const created = buildRefueling({
        vehicleId: vehicleId as never,
        ownerId: 'user_001' as never,
        fuelAmount: 45,
        costPerUnit: 12.5,
        totalCost: 562.5,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          fuelAmount: 45,
          totalCost: 562.5,
        }),
      )
      expect(result.fuelAmount).toBe(45)
      expect(result.totalCost).toBe(562.5)
    })

    it('auto-computes totalCost when not provided', async () => {
      const data: Parameters<typeof create>[0] = {
        vehicleId: vehicleId as never,
        date: '2026-03-01',
        fuelAmount: 40,
        costPerUnit: 13.0,
        odometerReading: 16000,
        station: null,
        chargedAtHome: false,
        note: null,
        receipt: null,
        tripCounterPhoto: null,
      }

      const created = buildRefueling({
        vehicleId: vehicleId as never,
        ownerId: 'user_001' as never,
        fuelAmount: 40,
        costPerUnit: 13.0,
        totalCost: 520,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          totalCost: 520, // 40 * 13.0
        }),
      )
      expect(result.totalCost).toBe(520)
    })

    it('sets ownerId on FormData and passes to PocketBase', async () => {
      const formData = new FormData()
      formData.set('vehicleId', vehicleId)
      formData.set('fuelAmount', '45')
      formData.set('costPerUnit', '12.5')
      formData.set('totalCost', '562.5')

      const created = buildRefueling({
        vehicleId: vehicleId as never,
        ownerId: 'user_001' as never,
        fuelAmount: 45,
        totalCost: 562.5,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result.fuelAmount).toBe(45)
    })

    it('parses created record through Zod schema', async () => {
      const data: Parameters<typeof create>[0] = {
        vehicleId: vehicleId as never,
        date: '2026-03-01',
        fuelAmount: 45,
        costPerUnit: 12.5,
        totalCost: 562.5,
        odometerReading: 15000,
        station: null,
        chargedAtHome: false,
        note: null,
        receipt: null,
        tripCounterPhoto: null,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership and updates with plain object', async () => {
      const refueling = buildRefueling({ ownerId: 'user_001' as never })
      const updated = { ...refueling, fuelAmount: 50 }
      mockGetFirstListItem.mockResolvedValueOnce(refueling)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(refueling.id, { fuelAmount: 50 })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${refueling.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(refueling.id, { fuelAmount: 50 })
      expect(result.fuelAmount).toBe(50)
    })

    it('verifies ownership and passes FormData to update', async () => {
      const refueling = buildRefueling({ ownerId: 'user_001' as never })
      const formData = new FormData()
      formData.set('fuelAmount', '55')

      const updated = { ...refueling, fuelAmount: 55 }
      mockGetFirstListItem.mockResolvedValueOnce(refueling)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(refueling.id, formData)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${refueling.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(refueling.id, formData)
      expect(result.fuelAmount).toBe(55)
    })

    it('throws when refueling not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { fuelAmount: 0 })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('verifies ownership and deletes', async () => {
      const refueling = buildRefueling({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(refueling)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(refueling.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${refueling.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(refueling.id)
    })

    it('throws when refueling not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('getReceiptUrl', () => {
    it('returns URL when receipt exists', () => {
      const refueling = buildRefueling({ receipt: 'receipt.jpg' })
      mockGetUrl.mockReturnValueOnce(
        'http://localhost:8090/api/files/refuelings/abc/receipt.jpg',
      )

      const url = getReceiptUrl(refueling)

      expect(mockGetUrl).toHaveBeenCalledWith(refueling, 'receipt.jpg')
      expect(url).toBe('http://localhost:8090/api/files/refuelings/abc/receipt.jpg')
    })

    it('returns null when no receipt', () => {
      const refueling = buildRefueling({ receipt: null })

      const url = getReceiptUrl(refueling)

      expect(mockGetUrl).not.toHaveBeenCalled()
      expect(url).toBeNull()
    })
  })

  describe('getTripCounterPhotoUrl', () => {
    it('returns URL when tripCounterPhoto exists', () => {
      const refueling = buildRefueling({ tripCounterPhoto: 'trip.jpg' })
      mockGetUrl.mockReturnValueOnce(
        'http://localhost:8090/api/files/refuelings/abc/trip.jpg',
      )

      const url = getTripCounterPhotoUrl(refueling)

      expect(mockGetUrl).toHaveBeenCalledWith(refueling, 'trip.jpg')
      expect(url).toBe('http://localhost:8090/api/files/refuelings/abc/trip.jpg')
    })

    it('returns null when no tripCounterPhoto', () => {
      const refueling = buildRefueling({ tripCounterPhoto: null })

      const url = getTripCounterPhotoUrl(refueling)

      expect(mockGetUrl).not.toHaveBeenCalled()
      expect(url).toBeNull()
    })
  })

  describe('authentication', () => {
    it('throws Not authenticated when no user', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getByVehicle(vehicleId)).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })
  })
})
