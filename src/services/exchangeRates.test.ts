import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAll,
  getOne,
  getByDateRange,
  create,
  update,
  remove,
  getRate,
  fetchRate,
  fetchMonthlyRates,
  fetchTransactionDayRate,
} from './exchangeRates'
import { buildExchangeRate } from '@/test/factories'

// Mock PocketBase
const mockGetFullList = vi.fn()
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
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    }),
  },
}))

describe('exchangeRates service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('getAll', () => {
    it('returns rates sorted by date descending', async () => {
      const rates = [
        buildExchangeRate({ date: '2026-02-01' }),
        buildExchangeRate({ date: '2026-01-15' }),
      ]
      mockGetFullList.mockResolvedValueOnce(rates)

      const result = await getAll()

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'ownerId = "user_001"',
        sort: '-date',
      })
      expect(result).toEqual(rates)
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getAll()).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original
      pb.authStore.model = original
    })

    it('parses response through Zod schema', async () => {
      mockGetFullList.mockResolvedValueOnce([{ id: 123, bad: 'data' }])

      await expect(getAll()).rejects.toThrow()
    })
  })

  describe('getByDateRange', () => {
    it('returns rates for currency within date range', async () => {
      const rates = [buildExchangeRate({ fromCurrency: 'EUR', date: '2026-01-15' })]
      mockGetFullList.mockResolvedValueOnce(rates)

      const result = await getByDateRange('EUR', '2026-01-01', '2026-01-31')

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'ownerId = "user_001" && fromCurrency = "EUR" && toCurrency = "DKK" && date >= "2026-01-01" && date <= "2026-01-31"',
        sort: '-date',
      })
      expect(result).toEqual(rates)
    })
  })

  describe('getOne', () => {
    it('returns a single rate by id', async () => {
      const rate = buildExchangeRate()
      mockGetFirstListItem.mockResolvedValueOnce(rate)

      const result = await getOne(rate.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${rate.id}" && ownerId = "user_001"`,
      )
      expect(result).toEqual(rate)
    })
  })

  describe('create', () => {
    it('stores rate with ownerId', async () => {
      const input = {
        fromCurrency: 'EUR',
        toCurrency: 'DKK',
        rate: 7.46,
        date: '2026-01-15',
        source: 'manual' as const,
      }
      const created = buildExchangeRate(input)
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(input)

      expect(mockCreate).toHaveBeenCalledWith({
        ...input,
        ownerId: 'user_001',
      })
      expect(result).toEqual(created)
    })
  })

  describe('update', () => {
    it('updates rate data', async () => {
      const existing = buildExchangeRate({ source: 'manual' })
      const updated = { ...existing, rate: 7.50 }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(existing.id, { rate: 7.50 })

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, { rate: 7.50 })
      expect(result.rate).toBe(7.50)
    })

    it('changes source to manual when updating auto rate', async () => {
      const existing = buildExchangeRate({ source: 'auto' })
      const updated = { ...existing, rate: 7.50, source: 'manual' }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      await update(existing.id, { rate: 7.50 })

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, {
        rate: 7.50,
        source: 'manual',
      })
    })
  })

  describe('remove', () => {
    it('deletes rate after verifying ownership', async () => {
      const rate = buildExchangeRate()
      mockGetFirstListItem.mockResolvedValueOnce(rate)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(rate.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${rate.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(rate.id)
    })
  })

  describe('getRate', () => {
    it('returns 1.0 for DKK-to-DKK without lookup', async () => {
      const result = await getRate('DKK', 'DKK', '2026-01-15')

      expect(result).toBe(1.0)
      expect(mockGetFirstListItem).not.toHaveBeenCalled()
    })

    it('returns exact date match', async () => {
      const rate = buildExchangeRate({ rate: 7.46, date: '2026-01-15' })
      mockGetFirstListItem.mockResolvedValueOnce(rate)

      const result = await getRate('EUR', 'DKK', '2026-01-15')

      expect(result).toBe(7.46)
    })

    it('falls back to closest previous date', async () => {
      const priorRate = buildExchangeRate({ rate: 7.44, date: '2026-01-10' })
      // First call (exact match) fails
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))
      // Second call (nearest prior) succeeds
      mockGetFirstListItem.mockResolvedValueOnce(priorRate)

      const result = await getRate('EUR', 'DKK', '2026-01-15')

      expect(result).toBe(7.44)
    })

    it('auto-fetches from API when no stored rate', async () => {
      // Both exact and prior lookups fail
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      // Mock fetch
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          amount: 1,
          base: 'EUR',
          date: '2026-01-15',
          rates: { DKK: 7.46 },
        }),
      })
      vi.stubGlobal('fetch', mockFetch)
      mockCreate.mockResolvedValueOnce(buildExchangeRate({ rate: 7.46 }))

      const result = await getRate('EUR', 'DKK', '2026-01-15')

      expect(result).toBe(7.46)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.frankfurter.app/2026-01-15?from=EUR&to=DKK',
      )
    })

    it('returns null when all lookups fail', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await getRate('EUR', 'DKK', '2026-01-15')

      expect(result).toBeNull()
      warnSpy.mockRestore()
    })
  })

  describe('fetchRate', () => {
    it('returns rate from API on success', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          amount: 1,
          base: 'EUR',
          date: '2026-01-15',
          rates: { DKK: 7.46 },
        }),
      })
      vi.stubGlobal('fetch', mockFetch)
      mockCreate.mockResolvedValueOnce(buildExchangeRate({ rate: 7.46 }))

      const result = await fetchRate('EUR', '2026-01-15')

      expect(result).toBe(7.46)
      expect(mockCreate).toHaveBeenCalledWith({
        fromCurrency: 'EUR',
        toCurrency: 'DKK',
        rate: 7.46,
        date: '2026-01-15',
        source: 'auto',
        ownerId: 'user_001',
      })
    })

    it('returns null on API failure without throwing', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      vi.stubGlobal('fetch', mockFetch)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await fetchRate('EUR', '2026-01-15')

      expect(result).toBeNull()
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })

    it('returns null on network error without throwing', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await fetchRate('EUR', '2026-01-15')

      expect(result).toBeNull()
      warnSpy.mockRestore()
    })

    it('returns null when response has unexpected format', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ rates: {} }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await fetchRate('EUR', '2026-01-15')

      expect(result).toBeNull()
      warnSpy.mockRestore()
    })
  })

  describe('fetchMonthlyRates', () => {
    it('skips DKK currency', async () => {
      await fetchMonthlyRates('DKK')

      expect(mockGetFirstListItem).not.toHaveBeenCalled()
    })

    it('skips fetch if rate already exists', async () => {
      const existing = buildExchangeRate()
      mockGetFirstListItem.mockResolvedValueOnce(existing)

      await fetchMonthlyRates('EUR')

      expect(mockGetFirstListItem).toHaveBeenCalledTimes(1)
    })

    it('fetches rate if not stored', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          amount: 1,
          base: 'EUR',
          date: '2026-04-01',
          rates: { DKK: 7.46 },
        }),
      })
      vi.stubGlobal('fetch', mockFetch)
      mockCreate.mockResolvedValueOnce(buildExchangeRate())

      await fetchMonthlyRates('EUR')

      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('fetchTransactionDayRate', () => {
    it('skips DKK currency', async () => {
      await fetchTransactionDayRate('DKK', '2026-01-15')

      expect(mockGetFirstListItem).not.toHaveBeenCalled()
    })

    it('skips fetch if rate already exists', async () => {
      const existing = buildExchangeRate()
      mockGetFirstListItem.mockResolvedValueOnce(existing)

      await fetchTransactionDayRate('EUR', '2026-01-15')

      expect(mockGetFirstListItem).toHaveBeenCalledTimes(1)
    })

    it('fetches rate if not stored', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          amount: 1,
          base: 'EUR',
          date: '2026-01-15',
          rates: { DKK: 7.46 },
        }),
      })
      vi.stubGlobal('fetch', mockFetch)
      mockCreate.mockResolvedValueOnce(buildExchangeRate())

      await fetchTransactionDayRate('EUR', '2026-01-15')

      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
