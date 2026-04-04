import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByUtility,
  getOne,
  create,
  update,
  remove,
  getAttachmentUrl,
} from './meterReadings'
import { buildMeterReading } from '@/test/factories'

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

const utilityId = 'utility_001'

describe('meterReadings service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByUtility', () => {
    it('returns readings filtered by utilityId and ownerId, sorted by -timestamp', async () => {
      const readings = [
        buildMeterReading({
          utilityId: utilityId as never,
          ownerId: 'user_001' as never,
          timestamp: '2026-02-15T10:00:00.000Z',
        }),
        buildMeterReading({
          utilityId: utilityId as never,
          ownerId: 'user_001' as never,
          timestamp: '2026-01-15T10:00:00.000Z',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(readings)

      const result = await getByUtility(utilityId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && utilityId = "${utilityId}"`,
        sort: '-timestamp',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no readings exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByUtility(utilityId)

      expect(result).toEqual([])
    })

    it('parses response through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }] // id must be string
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getByUtility(utilityId)).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single reading by id and ownerId', async () => {
      const reading = buildMeterReading({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(reading)

      const result = await getOne(reading.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${reading.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(reading.id)
    })
  })

  describe('create', () => {
    it('sets ownerId and returns parsed reading with plain object', async () => {
      const data: Parameters<typeof create>[0] = {
        utilityId: utilityId as never,
        value: 5678,
        timestamp: '2026-03-01T10:00:00.000Z',
        note: null,
        attachment: null,
      }
      const created = buildMeterReading({
        utilityId: utilityId as never,
        ownerId: 'user_001' as never,
        value: 5678,
        timestamp: '2026-03-01T10:00:00.000Z',
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          value: 5678,
        }),
      )
      expect(result.value).toBe(5678)
    })

    it('sets ownerId on FormData and passes to PocketBase', async () => {
      const formData = new FormData()
      formData.set('value', '9999')
      formData.set('utilityId', utilityId)

      const created = buildMeterReading({
        utilityId: utilityId as never,
        ownerId: 'user_001' as never,
        value: 9999,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result.value).toBe(9999)
    })

    it('parses created record through Zod schema', async () => {
      const data: Parameters<typeof create>[0] = {
        utilityId: utilityId as never,
        value: 100,
        timestamp: '2026-03-01T10:00:00.000Z',
        note: null,
        attachment: null,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership and updates with plain object', async () => {
      const reading = buildMeterReading({ ownerId: 'user_001' as never })
      const updated = { ...reading, value: 7777 }
      mockGetFirstListItem.mockResolvedValueOnce(reading)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(reading.id, { value: 7777 })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${reading.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(reading.id, { value: 7777 })
      expect(result.value).toBe(7777)
    })

    it('verifies ownership and passes FormData to update', async () => {
      const reading = buildMeterReading({ ownerId: 'user_001' as never })
      const formData = new FormData()
      formData.set('value', '8888')

      const updated = { ...reading, value: 8888 }
      mockGetFirstListItem.mockResolvedValueOnce(reading)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(reading.id, formData)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${reading.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(reading.id, formData)
      expect(result.value).toBe(8888)
    })

    it('throws when reading not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { value: 0 })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('verifies ownership and deletes', async () => {
      const reading = buildMeterReading({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(reading)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(reading.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${reading.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(reading.id)
    })

    it('throws when reading not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('getAttachmentUrl', () => {
    it('returns URL when attachment exists', () => {
      const reading = buildMeterReading({ attachment: 'photo.jpg' })
      mockGetUrl.mockReturnValueOnce(
        'http://localhost:8090/api/files/meter_readings/abc/photo.jpg',
      )

      const url = getAttachmentUrl(reading)

      expect(mockGetUrl).toHaveBeenCalledWith(reading, 'photo.jpg')
      expect(url).toBe('http://localhost:8090/api/files/meter_readings/abc/photo.jpg')
    })

    it('returns null when no attachment', () => {
      const reading = buildMeterReading({ attachment: null })

      const url = getAttachmentUrl(reading)

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

      await expect(getByUtility(utilityId)).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })
  })
})
