import { describe, expect, it, vi } from 'vitest'
import { buildPlatform, buildDataPoint, buildTransaction } from '@/test/factories'
import type { PlatformWithData } from '@/utils/portfolioAggregation'
import {
  buildCompositeValueSeries,
  mergeTransactions,
  computePortfolioXIRR,
  computePortfolioGainLoss,
  computePortfolioMonthlyEarnings,
  computeTotalPortfolioValue,
} from '@/utils/portfolioAggregation'

vi.mock('@/services/currency', () => ({
  convertToDKK: vi.fn(async (amount: number, currency: string) => {
    if (currency === 'DKK') return amount
    if (currency === 'EUR') return amount * 7.46
    return amount
  }),
  convertToDKKBatch: vi.fn(),
}))

// --- Helpers ---

function makePlatformWithData(
  overrides: Parameters<typeof buildPlatform>[0],
  dataPoints: Parameters<typeof buildDataPoint>[0][] = [],
  transactions: Parameters<typeof buildTransaction>[0][] = [],
): PlatformWithData {
  const platform = buildPlatform(overrides)
  return {
    platform,
    dataPoints: dataPoints.map((dp) =>
      buildDataPoint({ platformId: platform.id, ...dp }),
    ),
    transactions: transactions.map((tx) =>
      buildTransaction({ platformId: platform.id, ...tx }),
    ),
  }
}

// --- Test data ---

const JAN_1 = '2026-01-01T00:00:00.000Z'
const FEB_1 = '2026-02-01T00:00:00.000Z'
const MAR_1 = '2026-03-01T00:00:00.000Z'
const APR_1 = '2026-04-01T00:00:00.000Z'
const JAN_15 = '2026-01-15T00:00:00.000Z'
const FEB_15 = '2026-02-15T00:00:00.000Z'
const JAN_31 = '2026-01-31T00:00:00.000Z'
const FEB_28 = '2026-02-28T00:00:00.000Z'

describe('portfolioAggregation', () => {
  describe('buildCompositeValueSeries', () => {
    it('sums all platform values in DKK at each timestamp', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: FEB_1 },
        ],
      )
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 5000, timestamp: JAN_1 },
          { value: 6000, timestamp: FEB_1 },
        ],
      )

      const series = await buildCompositeValueSeries(
        [platformA, platformB],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(2)
      expect(series[0]!.totalValueDKK).toBe(15000)
      expect(series[1]!.totalValueDKK).toBe(18000)
    })

    it('carries forward most recent value for platforms missing data at a timestamp', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: FEB_1 },
          { value: 14000, timestamp: MAR_1 },
        ],
      )
      // Platform B only has data at JAN_1 — should carry forward
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 5000, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [platformA, platformB],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(series).toHaveLength(3)
      // At FEB_1: A=12000, B=5000 (carry-forward)
      expect(series[1]!.totalValueDKK).toBe(17000)
      // At MAR_1: A=14000, B=5000 (carry-forward)
      expect(series[2]!.totalValueDKK).toBe(19000)
    })

    it('contributes DKK values directly without conversion', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [platform],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(1)
      expect(series[0]!.totalValueDKK).toBe(10000)
    })

    it('converts EUR values using mocked rate (×7.46)', async () => {
      const platform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [{ value: 1000, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [platform],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(1)
      expect(series[0]!.totalValueDKK).toBeCloseTo(7460)
    })

    it('includes platform breakdown per composite point', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )
      const platformB = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [{ value: 1000, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [platformA, platformB],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(1)
      const point = series[0]!
      expect(point.platformBreakdown[platformA.platform.id as string]).toBe(10000)
      expect(point.platformBreakdown[platformB.platform.id as string]).toBeCloseTo(7460)
    })

    it('returns empty array for no active platforms', async () => {
      const series = await buildCompositeValueSeries(
        [],
        new Date(JAN_1),
        new Date(FEB_1),
      )
      expect(series).toEqual([])
    })

    it('returns sorted by date', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 12000, timestamp: FEB_1 },
          { value: 10000, timestamp: JAN_1 },
        ],
      )

      const series = await buildCompositeValueSeries(
        [platform],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(2)
      expect(series[0]!.date.getTime()).toBeLessThan(series[1]!.date.getTime())
    })
  })

  describe('mergeTransactions', () => {
    it('converts all transaction amounts to DKK with correct signs', async () => {
      const platform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [],
        [
          { type: 'deposit', amount: 1000, timestamp: JAN_15 },
          { type: 'withdrawal', amount: 500, timestamp: FEB_15 },
        ],
      )

      const flows = await mergeTransactions([platform])

      expect(flows).toHaveLength(2)
      // Deposit → negative, EUR×7.46
      expect(flows[0]!.amount).toBeCloseTo(-7460)
      // Withdrawal → positive, EUR×7.46
      expect(flows[1]!.amount).toBeCloseTo(3730)
    })

    it('sorts cash flows by date', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
        [{ type: 'deposit', amount: 1000, timestamp: FEB_15 }],
      )
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
        [{ type: 'deposit', amount: 2000, timestamp: JAN_15 }],
      )

      const flows = await mergeTransactions([platformA, platformB])

      expect(flows).toHaveLength(2)
      expect(flows[0]!.date.getTime()).toBeLessThan(flows[1]!.date.getTime())
      expect(flows[0]!.amount).toBe(-2000)
      expect(flows[1]!.amount).toBe(-1000)
    })

    it('excludes closed platforms', async () => {
      const active = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
        [{ type: 'deposit', amount: 1000, timestamp: JAN_15 }],
      )
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [],
        [{ type: 'deposit', amount: 9999, timestamp: JAN_15 }],
      )

      const flows = await mergeTransactions([active, closed])

      expect(flows).toHaveLength(1)
      expect(flows[0]!.amount).toBe(-1000)
    })

    it('returns empty array for no active platforms', async () => {
      const flows = await mergeTransactions([])
      expect(flows).toEqual([])
    })
  })

  describe('computePortfolioXIRR', () => {
    it('runs XIRR on aggregated DKK cash flows', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active', type: 'investment' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 11000, timestamp: APR_1 },
        ],
        [{ type: 'deposit', amount: 500, timestamp: FEB_1 }],
      )

      const result = await computePortfolioXIRR(
        [platform],
        new Date(JAN_1),
        new Date(APR_1),
      )

      // Should return a number (the specific XIRR value)
      expect(result).not.toBeNull()
      expect(typeof result).toBe('number')
    })

    it('includes cash platform values in XIRR', async () => {
      const investmentPlatform = makePlatformWithData(
        { currency: 'DKK', status: 'active', type: 'investment' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: APR_1 },
        ],
      )
      const cashPlatform = makePlatformWithData(
        { currency: 'DKK', status: 'active', type: 'cash' },
        [
          { value: 5000, timestamp: JAN_1 },
          { value: 5000, timestamp: APR_1 },
        ],
      )

      const result = await computePortfolioXIRR(
        [investmentPlatform, cashPlatform],
        new Date(JAN_1),
        new Date(APR_1),
      )

      // Cash dilutes return: portfolio gained 2000 on 15000 base, not 2000 on 10000
      expect(result).not.toBeNull()

      // Compare with investment-only XIRR
      const investmentOnly = await computePortfolioXIRR(
        [investmentPlatform],
        new Date(JAN_1),
        new Date(APR_1),
      )

      // Portfolio XIRR should be lower than investment-only (cash dilutes)
      expect(result!).toBeLessThan(investmentOnly!)
    })

    it('returns null for empty platforms', async () => {
      const result = await computePortfolioXIRR(
        [],
        new Date(JAN_1),
        new Date(APR_1),
      )
      expect(result).toBeNull()
    })

    it('returns null when all platforms are closed', async () => {
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: APR_1 },
        ],
      )

      const result = await computePortfolioXIRR(
        [closed],
        new Date(JAN_1),
        new Date(APR_1),
      )
      expect(result).toBeNull()
    })

    it('converts EUR platform values and transactions to DKK', async () => {
      const eurPlatform = makePlatformWithData(
        { currency: 'EUR', status: 'active', type: 'investment' },
        [
          { value: 1000, timestamp: JAN_1 },
          { value: 1200, timestamp: APR_1 },
        ],
        [{ type: 'deposit', amount: 100, timestamp: FEB_1 }],
      )

      const result = await computePortfolioXIRR(
        [eurPlatform],
        new Date(JAN_1),
        new Date(APR_1),
      )

      expect(result).not.toBeNull()
      expect(typeof result).toBe('number')
    })
  })

  describe('computePortfolioGainLoss', () => {
    it('computes gain/loss using DKK-converted values', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: MAR_1 },
        ],
        [{ type: 'deposit', amount: 1000, timestamp: FEB_1 }],
      )

      const result = await computePortfolioGainLoss(
        [platform],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(result).not.toBeNull()
      // gain = endingValue - startingValue - netDeposits = 12000 - 10000 - 1000 = 1000
      expect(result!.gain).toBe(1000)
      expect(result!.startingValue).toBe(10000)
      expect(result!.endingValue).toBe(12000)
      expect(result!.deposits).toBe(1000)
      expect(result!.withdrawals).toBe(0)
      expect(result!.netDeposits).toBe(1000)
    })

    it('converts EUR platform values to DKK', async () => {
      const eurPlatform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [
          { value: 1000, timestamp: JAN_1 },
          { value: 1200, timestamp: MAR_1 },
        ],
      )

      const result = await computePortfolioGainLoss(
        [eurPlatform],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(result).not.toBeNull()
      // startingValue = 1000 * 7.46 = 7460
      // endingValue = 1200 * 7.46 = 8952
      // gain = 8952 - 7460 - 0 = 1492
      expect(result!.startingValue).toBeCloseTo(7460)
      expect(result!.endingValue).toBeCloseTo(8952)
      expect(result!.gain).toBeCloseTo(1492)
    })

    it('aggregates multiple platforms', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 11000, timestamp: MAR_1 },
        ],
      )
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 5000, timestamp: JAN_1 },
          { value: 6000, timestamp: MAR_1 },
        ],
      )

      const result = await computePortfolioGainLoss(
        [platformA, platformB],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(result).not.toBeNull()
      expect(result!.startingValue).toBe(15000)
      expect(result!.endingValue).toBe(17000)
      expect(result!.gain).toBe(2000)
    })

    it('returns null when no start values exist', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 12000, timestamp: MAR_1 }],
      )

      const result = await computePortfolioGainLoss(
        [platform],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      // No data point at or before JAN_1 → null
      expect(result).toBeNull()
    })

    it('returns null for empty platforms', async () => {
      const result = await computePortfolioGainLoss(
        [],
        new Date(JAN_1),
        new Date(MAR_1),
      )
      expect(result).toBeNull()
    })

    it('excludes closed platforms', async () => {
      const active = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: MAR_1 },
        ],
      )
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [
          { value: 99999, timestamp: JAN_1 },
          { value: 99999, timestamp: MAR_1 },
        ],
      )

      const result = await computePortfolioGainLoss(
        [active, closed],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(result).not.toBeNull()
      expect(result!.startingValue).toBe(10000)
      expect(result!.endingValue).toBe(12000)
    })
  })

  describe('computePortfolioMonthlyEarnings', () => {
    it('returns portfolio monthly earnings in DKK', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_31 },
          { value: 11500, timestamp: FEB_28 },
        ],
        [{ type: 'deposit', amount: 500, timestamp: FEB_15 }],
      )

      // February earnings: 11500 - 10000 - 500 = 1000
      const result = await computePortfolioMonthlyEarnings([platform], 2026, 2)

      expect(result).toBe(1000)
    })

    it('converts EUR platform earnings to DKK', async () => {
      const eurPlatform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [
          { value: 1000, timestamp: JAN_31 },
          { value: 1100, timestamp: FEB_28 },
        ],
      )

      // Earnings: 1100 - 1000 = 100 EUR = 746 DKK
      const result = await computePortfolioMonthlyEarnings([eurPlatform], 2026, 2)

      expect(result).toBeCloseTo(746)
    })

    it('sums earnings across multiple platforms', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_31 },
          { value: 11000, timestamp: FEB_28 },
        ],
      )
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 5000, timestamp: JAN_31 },
          { value: 5500, timestamp: FEB_28 },
        ],
      )

      // A: 1000, B: 500 → total: 1500
      const result = await computePortfolioMonthlyEarnings(
        [platformA, platformB],
        2026,
        2,
      )

      expect(result).toBe(1500)
    })

    it('returns null if any platform lacks boundary values', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_31 },
          { value: 11000, timestamp: FEB_28 },
        ],
      )
      // Platform B has no data points at all
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
      )

      const result = await computePortfolioMonthlyEarnings(
        [platformA, platformB],
        2026,
        2,
      )

      expect(result).toBeNull()
    })

    it('returns null for empty platforms', async () => {
      const result = await computePortfolioMonthlyEarnings([], 2026, 2)
      expect(result).toBeNull()
    })

    it('excludes closed platforms', async () => {
      const active = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_31 },
          { value: 11000, timestamp: FEB_28 },
        ],
      )
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [
          { value: 99000, timestamp: JAN_31 },
          { value: 99999, timestamp: FEB_28 },
        ],
      )

      const result = await computePortfolioMonthlyEarnings(
        [active, closed],
        2026,
        2,
      )

      expect(result).toBe(1000)
    })
  })

  describe('computeTotalPortfolioValue', () => {
    it('sums latest active platform values in DKK', async () => {
      const platformA = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: FEB_1 },
        ],
      )
      const platformB = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 5000, timestamp: JAN_1 }],
      )

      const total = await computeTotalPortfolioValue([platformA, platformB])

      // A: 12000 (latest), B: 5000 (latest)
      expect(total).toBe(17000)
    })

    it('converts EUR platform values to DKK', async () => {
      const eurPlatform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [{ value: 1000, timestamp: JAN_1 }],
      )

      const total = await computeTotalPortfolioValue([eurPlatform])

      expect(total).toBeCloseTo(7460)
    })

    it('excludes closed platforms', async () => {
      const active = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [{ value: 99999, timestamp: JAN_1 }],
      )

      const total = await computeTotalPortfolioValue([active, closed])

      expect(total).toBe(10000)
    })

    it('returns 0 for empty platforms', async () => {
      const total = await computeTotalPortfolioValue([])
      expect(total).toBe(0)
    })

    it('returns 0 for all closed platforms', async () => {
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [{ value: 99999, timestamp: JAN_1 }],
      )

      const total = await computeTotalPortfolioValue([closed])

      expect(total).toBe(0)
    })

    it('skips platforms with no data points', async () => {
      const withData = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )
      const noData = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
      )

      const total = await computeTotalPortfolioValue([withData, noData])

      expect(total).toBe(10000)
    })
  })

  describe('closed platform handling', () => {
    it('excludes closed platforms from buildCompositeValueSeries', async () => {
      const active = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [{ value: 99999, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [active, closed],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(1)
      expect(series[0]!.totalValueDKK).toBe(10000)
    })

    it('returns empty for all closed platforms in buildCompositeValueSeries', async () => {
      const closed = makePlatformWithData(
        { currency: 'DKK', status: 'closed' },
        [{ value: 10000, timestamp: JAN_1 }],
      )

      const series = await buildCompositeValueSeries(
        [closed],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('single platform returns correct composite series', async () => {
      const platform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 12000, timestamp: FEB_1 },
        ],
      )

      const series = await buildCompositeValueSeries(
        [platform],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(2)
      expect(series[0]!.totalValueDKK).toBe(10000)
      expect(series[1]!.totalValueDKK).toBe(12000)
    })

    it('platform with no data points contributes nothing', async () => {
      const withData = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [{ value: 10000, timestamp: JAN_1 }],
      )
      const noData = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [],
      )

      const series = await buildCompositeValueSeries(
        [withData, noData],
        new Date(JAN_1),
        new Date(FEB_1),
      )

      expect(series).toHaveLength(1)
      expect(series[0]!.totalValueDKK).toBe(10000)
    })

    it('gain/loss with mixed DKK and EUR platforms', async () => {
      const dkkPlatform = makePlatformWithData(
        { currency: 'DKK', status: 'active' },
        [
          { value: 10000, timestamp: JAN_1 },
          { value: 11000, timestamp: MAR_1 },
        ],
      )
      const eurPlatform = makePlatformWithData(
        { currency: 'EUR', status: 'active' },
        [
          { value: 1000, timestamp: JAN_1 },
          { value: 1100, timestamp: MAR_1 },
        ],
      )

      const result = await computePortfolioGainLoss(
        [dkkPlatform, eurPlatform],
        new Date(JAN_1),
        new Date(MAR_1),
      )

      expect(result).not.toBeNull()
      // DKK: start=10000, end=11000
      // EUR: start=1000*7.46=7460, end=1100*7.46=8206
      // Total: start=17460, end=19206
      // Gain: 19206 - 17460 = 1746
      expect(result!.startingValue).toBeCloseTo(17460)
      expect(result!.endingValue).toBeCloseTo(19206)
      expect(result!.gain).toBeCloseTo(1746)
    })
  })
})
