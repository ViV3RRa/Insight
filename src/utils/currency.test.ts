import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  convertToDKK,
  convertFromDKK,
  convertToDKKBatch,
  getDKKEquivalent,
} from './currency'

// Mock the exchange rate service
const mockGetRate = vi.fn()

vi.mock('@/services/exchangeRates', () => ({
  getRate: (...args: unknown[]) => mockGetRate(...args),
}))

describe('currency utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('convertToDKK', () => {
    it('returns amount directly for DKK', async () => {
      const result = await convertToDKK(1000, 'DKK', '2026-01-15')

      expect(result).toBe(1000)
      expect(mockGetRate).not.toHaveBeenCalled()
    })

    it('multiplies amount by rate', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await convertToDKK(1000, 'EUR', '2026-01-15')

      expect(result).toBe(7460)
      expect(mockGetRate).toHaveBeenCalledWith('EUR', 'DKK', '2026-01-15')
    })

    it('returns null when no rate available', async () => {
      mockGetRate.mockResolvedValueOnce(null)

      const result = await convertToDKK(1000, 'EUR', '2026-01-15')

      expect(result).toBeNull()
    })

    it('handles zero amount', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await convertToDKK(0, 'EUR', '2026-01-15')

      expect(result).toBe(0)
    })
  })

  describe('convertFromDKK', () => {
    it('returns amount directly for DKK', async () => {
      const result = await convertFromDKK(7460, 'DKK', '2026-01-15')

      expect(result).toBe(7460)
      expect(mockGetRate).not.toHaveBeenCalled()
    })

    it('divides amount by rate', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await convertFromDKK(7460, 'EUR', '2026-01-15')

      expect(result).toBe(1000)
    })

    it('returns null when no rate available', async () => {
      mockGetRate.mockResolvedValueOnce(null)

      const result = await convertFromDKK(7460, 'EUR', '2026-01-15')

      expect(result).toBeNull()
    })

    it('handles zero amount', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await convertFromDKK(0, 'EUR', '2026-01-15')

      expect(result).toBe(0)
    })
  })

  describe('convertToDKKBatch', () => {
    it('deduplicates rate lookups', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await convertToDKKBatch([
        { amount: 1000, currency: 'EUR', date: '2026-01-15' },
        { amount: 2000, currency: 'EUR', date: '2026-01-15' },
      ])

      expect(mockGetRate).toHaveBeenCalledTimes(1)
      expect(result).toEqual([7460, 14920])
    })

    it('handles mixed currencies', async () => {
      mockGetRate
        .mockResolvedValueOnce(7.46) // EUR
        .mockResolvedValueOnce(0.91) // USD

      const result = await convertToDKKBatch([
        { amount: 1000, currency: 'EUR', date: '2026-01-15' },
        { amount: 500, currency: 'DKK', date: '2026-01-15' },
        { amount: 2000, currency: 'USD', date: '2026-01-15' },
      ])

      expect(mockGetRate).toHaveBeenCalledTimes(2)
      expect(result).toEqual([7460, 500, 1820])
    })

    it('returns null for items with no rate', async () => {
      mockGetRate.mockResolvedValueOnce(null)

      const result = await convertToDKKBatch([
        { amount: 1000, currency: 'EUR', date: '2026-01-15' },
      ])

      expect(result).toEqual([null])
    })

    it('handles empty array', async () => {
      const result = await convertToDKKBatch([])

      expect(result).toEqual([])
      expect(mockGetRate).not.toHaveBeenCalled()
    })

    it('handles all DKK items without lookups', async () => {
      const result = await convertToDKKBatch([
        { amount: 100, currency: 'DKK', date: '2026-01-15' },
        { amount: 200, currency: 'DKK', date: '2026-01-15' },
      ])

      expect(result).toEqual([100, 200])
      expect(mockGetRate).not.toHaveBeenCalled()
    })

    it('deduplicates by currency and date pair', async () => {
      mockGetRate
        .mockResolvedValueOnce(7.46)  // EUR 2026-01-15
        .mockResolvedValueOnce(7.50)  // EUR 2026-02-01

      const result = await convertToDKKBatch([
        { amount: 100, currency: 'EUR', date: '2026-01-15' },
        { amount: 200, currency: 'EUR', date: '2026-02-01' },
        { amount: 300, currency: 'EUR', date: '2026-01-15' },
      ])

      expect(mockGetRate).toHaveBeenCalledTimes(2)
      expect(result).toEqual([746, 1500, 2238])
    })
  })

  describe('getDKKEquivalent', () => {
    it('returns dkk amount and rate', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await getDKKEquivalent(1000, 'EUR', '2026-01-15')

      expect(result).toEqual({ dkk: 7460, rate: 7.46 })
    })

    it('returns rate 1.0 for DKK', async () => {
      const result = await getDKKEquivalent(1000, 'DKK', '2026-01-15')

      expect(result).toEqual({ dkk: 1000, rate: 1.0 })
      expect(mockGetRate).not.toHaveBeenCalled()
    })

    it('returns null when no rate available', async () => {
      mockGetRate.mockResolvedValueOnce(null)

      const result = await getDKKEquivalent(1000, 'EUR', '2026-01-15')

      expect(result).toBeNull()
    })

    it('handles zero amount', async () => {
      mockGetRate.mockResolvedValueOnce(7.46)

      const result = await getDKKEquivalent(0, 'EUR', '2026-01-15')

      expect(result).toEqual({ dkk: 0, rate: 7.46 })
    })
  })
})
