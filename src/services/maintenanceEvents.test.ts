import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByVehicle,
  getOne,
  create,
  update,
  remove,
  getReceiptUrl,
} from './maintenanceEvents'
import { buildMaintenanceEvent } from '@/test/factories'

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

describe('maintenanceEvents service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByVehicle', () => {
    it('returns events filtered by vehicleId and ownerId, sorted by -date', async () => {
      const events = [
        buildMaintenanceEvent({
          vehicleId: vehicleId as never,
          ownerId: 'user_001' as never,
          date: '2026-02-20',
        }),
        buildMaintenanceEvent({
          vehicleId: vehicleId as never,
          ownerId: 'user_001' as never,
          date: '2026-01-20',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(events)

      const result = await getByVehicle(vehicleId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && vehicleId = "${vehicleId}"`,
        sort: '-date',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no events exist', async () => {
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
    it('returns a single event by id and ownerId', async () => {
      const event = buildMaintenanceEvent({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(event)

      const result = await getOne(event.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${event.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(event.id)
    })
  })

  describe('create', () => {
    it('sets ownerId and returns parsed event with plain object', async () => {
      const data: Parameters<typeof create>[0] = {
        vehicleId: vehicleId as never,
        date: '2026-03-01',
        description: 'Brake pad replacement',
        cost: 2500,
        note: null,
        receipt: null,
      }
      const created = buildMaintenanceEvent({
        vehicleId: vehicleId as never,
        ownerId: 'user_001' as never,
        description: 'Brake pad replacement',
        cost: 2500,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          description: 'Brake pad replacement',
          cost: 2500,
        }),
      )
      expect(result.description).toBe('Brake pad replacement')
      expect(result.cost).toBe(2500)
    })

    it('sets ownerId on FormData and passes to PocketBase', async () => {
      const formData = new FormData()
      formData.set('description', 'Tire rotation')
      formData.set('cost', '500')
      formData.set('vehicleId', vehicleId)

      const created = buildMaintenanceEvent({
        vehicleId: vehicleId as never,
        ownerId: 'user_001' as never,
        description: 'Tire rotation',
        cost: 500,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result.description).toBe('Tire rotation')
    })

    it('parses created record through Zod schema', async () => {
      const data: Parameters<typeof create>[0] = {
        vehicleId: vehicleId as never,
        date: '2026-03-01',
        description: 'Oil change',
        cost: 800,
        note: null,
        receipt: null,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership and updates with plain object', async () => {
      const event = buildMaintenanceEvent({ ownerId: 'user_001' as never })
      const updated = { ...event, cost: 1200 }
      mockGetFirstListItem.mockResolvedValueOnce(event)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(event.id, { cost: 1200 })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${event.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(event.id, { cost: 1200 })
      expect(result.cost).toBe(1200)
    })

    it('verifies ownership and passes FormData to update', async () => {
      const event = buildMaintenanceEvent({ ownerId: 'user_001' as never })
      const formData = new FormData()
      formData.set('cost', '1500')

      const updated = { ...event, cost: 1500 }
      mockGetFirstListItem.mockResolvedValueOnce(event)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(event.id, formData)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${event.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(event.id, formData)
      expect(result.cost).toBe(1500)
    })

    it('throws when event not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { cost: 0 })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('verifies ownership and deletes', async () => {
      const event = buildMaintenanceEvent({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(event)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(event.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${event.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(event.id)
    })

    it('throws when event not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('getReceiptUrl', () => {
    it('returns URL when receipt exists', () => {
      const event = buildMaintenanceEvent({ receipt: 'receipt.pdf' })
      mockGetUrl.mockReturnValueOnce(
        'http://localhost:8090/api/files/maintenance_events/abc/receipt.pdf',
      )

      const url = getReceiptUrl(event)

      expect(mockGetUrl).toHaveBeenCalledWith(event, 'receipt.pdf')
      expect(url).toBe('http://localhost:8090/api/files/maintenance_events/abc/receipt.pdf')
    })

    it('returns null when no receipt', () => {
      const event = buildMaintenanceEvent({ receipt: null })

      const url = getReceiptUrl(event)

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
