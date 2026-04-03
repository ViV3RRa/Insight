import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByPlatform,
  getByPlatformInRange,
  getOne,
  create,
  update,
  remove,
  getLatest,
  getLatestBefore,
  getEarliestAfter,
  getMonthEndValue,
} from './dataPoints'
import { buildDataPoint } from '@/test/factories/investmentFactory'

const mockGetFullList = vi.fn()
const mockGetOne = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('./pb', () => ({
  default: {
    authStore: {
      model: { id: 'user_001' },
    },
    collection: () => ({
      getFullList: mockGetFullList,
      getOne: mockGetOne,
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    }),
  },
}))

const PLATFORM_ID = 'plat_001'

describe('dataPoints service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByPlatform', () => {
    it('returns data points sorted by timestamp ascending', async () => {
      const dp1 = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      const dp2 = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-02-15T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([dp1, dp2])

      const result = await getByPlatform(PLATFORM_ID)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && platformId = "${PLATFORM_ID}"`,
        sort: 'timestamp',
      })
      expect(result).toEqual([dp1, dp2])
    })

    it('returns empty array when no data points exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByPlatform(PLATFORM_ID)

      expect(result).toEqual([])
    })
  })

  describe('getByPlatformInRange', () => {
    it('filters by date range', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-20T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([dp])

      const result = await getByPlatformInRange(
        PLATFORM_ID,
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && platformId = "${PLATFORM_ID}" && timestamp >= "2026-01-01T00:00:00.000Z" && timestamp <= "2026-01-31T23:59:59.999Z"`,
        sort: 'timestamp',
      })
      expect(result).toEqual([dp])
    })
  })

  describe('getOne', () => {
    it('returns a single data point by id', async () => {
      const dp = buildDataPoint({ platformId: PLATFORM_ID as any })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      const result = await getOne(dp.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${dp.id}" && ownerId = "user_001"`,
      )
      expect(result).toEqual(dp)
    })
  })

  describe('create', () => {
    it('sets ownerId and defaults isInterpolated to false', async () => {
      const input = {
        platformId: PLATFORM_ID as any,
        value: 15000,
        timestamp: '2026-03-01T00:00:00.000Z',
        note: null,
      }
      const created = buildDataPoint({
        ...input,
        isInterpolated: false,
        ownerId: 'user_001' as any,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(input as any)

      expect(mockCreate).toHaveBeenCalledWith({
        ...input,
        isInterpolated: false,
        timestamp: '2026-03-01T00:00:00.000Z',
        ownerId: 'user_001',
      })
      expect(result.isInterpolated).toBe(false)
      expect(result.ownerId).toBe('user_001')
    })

    it('defaults timestamp to now when not provided', async () => {
      const now = '2026-04-03T12:00:00.000Z'
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValueOnce(now)

      const input = {
        platformId: PLATFORM_ID as any,
        value: 10000,
        note: null,
      }
      const created = buildDataPoint({
        ...input,
        timestamp: now,
        isInterpolated: false,
        ownerId: 'user_001' as any,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(input as any)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: now }),
      )
      expect(result.timestamp).toBe(now)

      vi.restoreAllMocks()
    })

    it('preserves isInterpolated when explicitly set to true', async () => {
      const input = {
        platformId: PLATFORM_ID as any,
        value: 10000,
        timestamp: '2026-01-15T00:00:00.000Z',
        isInterpolated: true,
        note: null,
      }
      const created = buildDataPoint({
        ...input,
        ownerId: 'user_001' as any,
      })
      mockCreate.mockResolvedValueOnce(created)

      await create(input as any)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ isInterpolated: true }),
      )
    })
  })

  describe('update', () => {
    it('updates a data point', async () => {
      const existing = buildDataPoint({
        platformId: PLATFORM_ID as any,
        isInterpolated: false,
        value: 10000,
      })
      const updated = { ...existing, value: 12000 }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(existing.id, { value: 12000 })

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, { value: 12000 })
      expect(result.value).toBe(12000)
    })

    it('sets isInterpolated to false when updating an interpolated point', async () => {
      const existing = buildDataPoint({
        platformId: PLATFORM_ID as any,
        isInterpolated: true,
        value: 10000,
      })
      const updated = { ...existing, value: 12000, isInterpolated: false }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(existing.id, { value: 12000 })

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, {
        value: 12000,
        isInterpolated: false,
      })
      expect(result.isInterpolated).toBe(false)
    })

    it('does not override isInterpolated when explicitly provided', async () => {
      const existing = buildDataPoint({
        platformId: PLATFORM_ID as any,
        isInterpolated: true,
      })
      const updated = { ...existing, isInterpolated: true, value: 12000 }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      await update(existing.id, { value: 12000, isInterpolated: true } as any)

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, {
        value: 12000,
        isInterpolated: true,
      })
    })
  })

  describe('remove', () => {
    it('deletes a data point after verifying ownership', async () => {
      const dp = buildDataPoint({ platformId: PLATFORM_ID as any })
      mockGetFirstListItem.mockResolvedValueOnce(dp)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(dp.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${dp.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(dp.id)
    })
  })

  describe('getLatest', () => {
    it('returns most recent data point by timestamp', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-03-15T00:00:00.000Z',
      })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      const result = await getLatest(PLATFORM_ID)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `ownerId = "user_001" && platformId = "${PLATFORM_ID}"`,
        { sort: '-timestamp' },
      )
      expect(result).toEqual(dp)
    })
  })

  describe('getLatestBefore', () => {
    it('returns most recent data point at or before date', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-31T00:00:00.000Z',
      })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      const result = await getLatestBefore(PLATFORM_ID, '2026-01-31T23:59:59.999Z')

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `ownerId = "user_001" && platformId = "${PLATFORM_ID}" && timestamp <= "2026-01-31T23:59:59.999Z"`,
        { sort: '-timestamp' },
      )
      expect(result).toEqual(dp)
    })
  })

  describe('getEarliestAfter', () => {
    it('returns first data point after date', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-02-01T00:00:00.000Z',
      })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      const result = await getEarliestAfter(PLATFORM_ID, '2026-01-31T23:59:59.999Z')

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `ownerId = "user_001" && platformId = "${PLATFORM_ID}" && timestamp > "2026-01-31T23:59:59.999Z"`,
        { sort: 'timestamp' },
      )
      expect(result).toEqual(dp)
    })
  })

  describe('getMonthEndValue', () => {
    it('delegates to getLatestBefore with last day of month', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-31T00:00:00.000Z',
      })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      const result = await getMonthEndValue(PLATFORM_ID, 2026, 1)

      // new Date(2026, 1, 0) = Jan 31, 2026
      const lastDay = new Date(2026, 1, 0).toISOString()
      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `ownerId = "user_001" && platformId = "${PLATFORM_ID}" && timestamp <= "${lastDay}"`,
        { sort: '-timestamp' },
      )
      expect(result).toEqual(dp)
    })

    it('handles February correctly', async () => {
      const dp = buildDataPoint({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-02-28T00:00:00.000Z',
      })
      mockGetFirstListItem.mockResolvedValueOnce(dp)

      await getMonthEndValue(PLATFORM_ID, 2026, 2)

      // new Date(2026, 2, 0) = Feb 28, 2026
      const lastDay = new Date(2026, 2, 0).toISOString()
      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        expect.stringContaining(`timestamp <= "${lastDay}"`),
        { sort: '-timestamp' },
      )
    })
  })

  describe('error handling', () => {
    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getByPlatform(PLATFORM_ID)).rejects.toThrow('Not authenticated')
      await expect(create({} as any)).rejects.toThrow('Not authenticated')
      await expect(getLatest(PLATFORM_ID)).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('throws on malformed response (Zod parsing)', async () => {
      const invalidRecord = { id: 123, value: 'not a number' }
      mockGetFullList.mockResolvedValueOnce([invalidRecord])

      await expect(getByPlatform(PLATFORM_ID)).rejects.toThrow()
    })
  })
})
