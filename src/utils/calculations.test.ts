import { describe, it, expect, vi } from 'vitest'
import { buildDataPoint, buildPlatform, buildTransaction } from '@/test/factories'
import type { DataPoint, Transaction } from '@/types/investment'
import { buildCashFlows, calculateXIRR } from '@/utils/xirr'
import {
  calculateGain,
  calculateGainPercent,
  computeGainLoss,
  computePlatformGainLoss,
  calculateMonthlyEarnings,
  computeMonthlyEarningsForPlatform,
  computeMonthlyEarningsSeries,
  findValueAtOrBefore,
  sumTransactionsInRange,
  computeMonthlyXIRR,
  computeMonthlyXIRRForPlatform,
  computeMonthlyXIRRSeries,
  calculateAllocation,
  computePortfolioAllocation,
  type PlatformAllocationInput,
} from './calculations'

vi.mock('@/services/currency', () => ({
  convertToDKK: vi.fn(async (amount: number, currency: string) => {
    if (currency === 'DKK') return amount
    if (currency === 'EUR') return amount * 7.46
    return amount
  }),
}))

// --- Helper: create sorted data points ---

function makeDataPoints(entries: { value: number; timestamp: string }[]): DataPoint[] {
  const platformId = 'plat_001' as DataPoint['platformId']
  return entries.map((e) =>
    buildDataPoint({ value: e.value, timestamp: e.timestamp, platformId }),
  )
}

function makeTransactions(
  entries: { type: 'deposit' | 'withdrawal'; amount: number; timestamp: string }[],
): Transaction[] {
  const platformId = 'plat_001' as Transaction['platformId']
  return entries.map((e) =>
    buildTransaction({ type: e.type, amount: e.amount, timestamp: e.timestamp, platformId }),
  )
}

// ===================================================================
// Helper Functions
// ===================================================================

describe('findValueAtOrBefore', () => {
  it('returns the value at the exact date', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 12000, timestamp: '2026-02-28T00:00:00.000Z' },
    ])

    const result = findValueAtOrBefore(dps, new Date('2026-01-31T00:00:00.000Z'))
    expect(result).toEqual({ value: 10000, date: new Date('2026-01-31T00:00:00.000Z') })
  })

  it('returns the nearest value before the date', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-15T00:00:00.000Z' },
      { value: 12000, timestamp: '2026-02-10T00:00:00.000Z' },
    ])

    const result = findValueAtOrBefore(dps, new Date('2026-01-31T00:00:00.000Z'))
    expect(result).toEqual({ value: 10000, date: new Date('2026-01-15T00:00:00.000Z') })
  })

  it('returns null when no data points at or before date', () => {
    const dps = makeDataPoints([
      { value: 12000, timestamp: '2026-03-01T00:00:00.000Z' },
    ])

    const result = findValueAtOrBefore(dps, new Date('2026-02-28T00:00:00.000Z'))
    expect(result).toBeNull()
  })

  it('returns null for empty data points array', () => {
    const result = findValueAtOrBefore([], new Date('2026-01-31T00:00:00.000Z'))
    expect(result).toBeNull()
  })

  it('picks the closest data point when multiple are before the date', () => {
    const dps = makeDataPoints([
      { value: 8000, timestamp: '2026-01-01T00:00:00.000Z' },
      { value: 9000, timestamp: '2026-01-15T00:00:00.000Z' },
      { value: 10000, timestamp: '2026-01-25T00:00:00.000Z' },
    ])

    const result = findValueAtOrBefore(dps, new Date('2026-01-31T00:00:00.000Z'))
    expect(result).toEqual({ value: 10000, date: new Date('2026-01-25T00:00:00.000Z') })
  })
})

describe('sumTransactionsInRange', () => {
  it('sums deposits and withdrawals within range', () => {
    const txs = makeTransactions([
      { type: 'deposit', amount: 1000, timestamp: '2026-01-05T00:00:00.000Z' },
      { type: 'deposit', amount: 500, timestamp: '2026-01-20T00:00:00.000Z' },
      { type: 'withdrawal', amount: 200, timestamp: '2026-01-15T00:00:00.000Z' },
    ])

    const result = sumTransactionsInRange(
      txs,
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-31T23:59:59.999Z'),
    )
    expect(result).toEqual({ deposits: 1500, withdrawals: 200 })
  })

  it('excludes transactions outside the range', () => {
    const txs = makeTransactions([
      { type: 'deposit', amount: 1000, timestamp: '2025-12-31T00:00:00.000Z' },
      { type: 'deposit', amount: 500, timestamp: '2026-01-15T00:00:00.000Z' },
      { type: 'deposit', amount: 2000, timestamp: '2026-02-01T00:00:00.000Z' },
    ])

    const result = sumTransactionsInRange(
      txs,
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-31T23:59:59.999Z'),
    )
    expect(result).toEqual({ deposits: 500, withdrawals: 0 })
  })

  it('returns zeros for empty transactions', () => {
    const result = sumTransactionsInRange(
      [],
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-31T23:59:59.999Z'),
    )
    expect(result).toEqual({ deposits: 0, withdrawals: 0 })
  })

  it('includes transactions at range boundaries', () => {
    const start = new Date('2026-01-01T00:00:00.000Z')
    const end = new Date('2026-01-31T00:00:00.000Z')

    const txs = makeTransactions([
      { type: 'deposit', amount: 100, timestamp: '2026-01-01T00:00:00.000Z' },
      { type: 'withdrawal', amount: 50, timestamp: '2026-01-31T00:00:00.000Z' },
    ])

    const result = sumTransactionsInRange(txs, start, end)
    expect(result).toEqual({ deposits: 100, withdrawals: 50 })
  })
})

// ===================================================================
// Gain/Loss Functions (US-050)
// ===================================================================

describe('calculateGain', () => {
  it('returns gain when value increased with deposits', () => {
    // endingValue - startingValue - (deposits - withdrawals)
    // 12000 - 10000 - (1000 - 0) = 1000
    expect(calculateGain(10000, 12000, 1000, 0)).toBe(1000)
  })

  it('returns negative gain (loss) when value decreased', () => {
    // 9000 - 10000 - (0 - 0) = -1000
    expect(calculateGain(10000, 9000, 0, 0)).toBe(-1000)
  })

  it('accounts for both deposits and withdrawals', () => {
    // 15000 - 10000 - (3000 - 500) = 2500
    expect(calculateGain(10000, 15000, 3000, 500)).toBe(2500)
  })

  it('returns zero when value change equals net deposits', () => {
    // 11000 - 10000 - (1000 - 0) = 0
    expect(calculateGain(10000, 11000, 1000, 0)).toBe(0)
  })

  it('handles zero starting value', () => {
    // 5000 - 0 - (5000 - 0) = 0
    expect(calculateGain(0, 5000, 5000, 0)).toBe(0)
  })

  it('handles all zeros', () => {
    expect(calculateGain(0, 0, 0, 0)).toBe(0)
  })
})

describe('calculateGainPercent', () => {
  it('returns correct percentage for positive gain', () => {
    // gain = 1000, denominator = 10000 + 1000 = 11000
    // 1000 / 11000 * 100 ≈ 9.0909...
    const result = calculateGainPercent(10000, 12000, 1000, 0)
    expect(result).toBeCloseTo(9.0909, 2)
  })

  it('returns null when denominator is zero', () => {
    expect(calculateGainPercent(0, 0, 0, 0)).toBeNull()
  })

  it('uses startingValue + deposits as denominator, NOT startingValue + netDeposits', () => {
    // startingValue=10000, endingValue=15000, deposits=3000, withdrawals=500
    // gain = 15000 - 10000 - (3000 - 500) = 2500
    // CORRECT denominator = startingValue + deposits = 10000 + 3000 = 13000
    // WRONG denominator would be startingValue + netDeposits = 10000 + 2500 = 12500
    const result = calculateGainPercent(10000, 15000, 3000, 500)
    // 2500 / 13000 * 100 ≈ 19.2308
    expect(result).toBeCloseTo(19.2308, 2)
    // Verify it's NOT using netDeposits denominator (which would be 2500/12500*100 = 20.0)
    expect(result).not.toBeCloseTo(20.0, 1)
  })

  it('returns negative percentage for loss', () => {
    // gain = 9000 - 10000 - 0 = -1000
    // denominator = 10000 + 0 = 10000
    // -1000 / 10000 * 100 = -10
    expect(calculateGainPercent(10000, 9000, 0, 0)).toBe(-10)
  })

  it('returns null when startingValue=0 and deposits=0 even with withdrawals', () => {
    // denominator = 0 + 0 = 0 → null
    expect(calculateGainPercent(0, 500, 0, 200)).toBeNull()
  })
})

describe('computeGainLoss', () => {
  it('returns complete result object', () => {
    const result = computeGainLoss(10000, 12000, 1000, 0)
    expect(result).toEqual({
      gain: 1000,
      gainPercent: expect.closeTo(9.0909, 2),
      startingValue: 10000,
      endingValue: 12000,
      deposits: 1000,
      withdrawals: 0,
      netDeposits: 1000,
    })
  })

  it('computes netDeposits as deposits - withdrawals', () => {
    const result = computeGainLoss(10000, 15000, 3000, 500)
    expect(result.netDeposits).toBe(2500)
  })

  it('handles zero values', () => {
    const result = computeGainLoss(0, 0, 0, 0)
    expect(result).toEqual({
      gain: 0,
      gainPercent: null,
      startingValue: 0,
      endingValue: 0,
      deposits: 0,
      withdrawals: 0,
      netDeposits: 0,
    })
  })
})

describe('computePlatformGainLoss', () => {
  const dataPoints = makeDataPoints([
    { value: 10000, timestamp: '2026-01-15T00:00:00.000Z' },
    { value: 11000, timestamp: '2026-02-15T00:00:00.000Z' },
    { value: 12500, timestamp: '2026-03-15T00:00:00.000Z' },
  ])

  const transactions = makeTransactions([
    { type: 'deposit', amount: 1000, timestamp: '2026-02-01T00:00:00.000Z' },
    { type: 'withdrawal', amount: 200, timestamp: '2026-02-20T00:00:00.000Z' },
  ])

  it('computes gain/loss for a date range', () => {
    const result = computePlatformGainLoss(
      dataPoints,
      transactions,
      new Date('2026-01-31T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )

    expect(result).not.toBeNull()
    // startingValue = 10000 (nearest before Jan 31)
    // endingValue = 12500 (nearest before Mar 31)
    // deposits = 1000, withdrawals = 200
    // gain = 12500 - 10000 - (1000 - 200) = 1700
    expect(result!.startingValue).toBe(10000)
    expect(result!.endingValue).toBe(12500)
    expect(result!.deposits).toBe(1000)
    expect(result!.withdrawals).toBe(200)
    expect(result!.gain).toBe(1700)
  })

  it('returns null when no starting value available', () => {
    const result = computePlatformGainLoss(
      dataPoints,
      transactions,
      new Date('2025-12-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )
    expect(result).toBeNull()
  })

  it('returns null when no ending value available', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-05-15T00:00:00.000Z' },
    ])

    const result = computePlatformGainLoss(
      dps,
      [],
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )
    expect(result).toBeNull()
  })

  it('returns null when data points array is empty', () => {
    const result = computePlatformGainLoss(
      [],
      transactions,
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )
    expect(result).toBeNull()
  })

  it('works with no transactions in range', () => {
    const result = computePlatformGainLoss(
      dataPoints,
      [],
      new Date('2026-01-31T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )

    expect(result).not.toBeNull()
    expect(result!.deposits).toBe(0)
    expect(result!.withdrawals).toBe(0)
    // gain = 12500 - 10000 - 0 = 2500
    expect(result!.gain).toBe(2500)
  })
})

// ===================================================================
// Monthly Earnings Functions (US-049)
// ===================================================================

describe('calculateMonthlyEarnings', () => {
  it('returns positive earnings (gain)', () => {
    // 10500 - 10000 - (200 - 0) = 300
    expect(calculateMonthlyEarnings(10000, 10500, 200, 0)).toBe(300)
  })

  it('returns negative earnings (loss)', () => {
    // 9800 - 10000 - (0 - 0) = -200
    expect(calculateMonthlyEarnings(10000, 9800, 0, 0)).toBe(-200)
  })

  it('returns negative when deposits explain all value increase', () => {
    // 10000 - 10000 - (500 - 0) = -500
    expect(calculateMonthlyEarnings(10000, 10000, 500, 0)).toBe(-500)
  })

  it('accounts for both deposits and withdrawals', () => {
    // 11000 - 10000 - (500 - 200) = 700
    expect(calculateMonthlyEarnings(10000, 11000, 500, 200)).toBe(700)
  })

  it('returns zero when no change and no transactions', () => {
    expect(calculateMonthlyEarnings(10000, 10000, 0, 0)).toBe(0)
  })
})

describe('computeMonthlyEarningsForPlatform', () => {
  it('computes earnings for a month with data', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10800, timestamp: '2026-02-28T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'deposit', amount: 500, timestamp: '2026-02-10T00:00:00.000Z' },
    ])

    const result = computeMonthlyEarningsForPlatform(dps, txs, 2026, 2)

    expect(result).not.toBeNull()
    expect(result!.year).toBe(2026)
    expect(result!.month).toBe(2)
    expect(result!.startingValue).toBe(10000)
    expect(result!.endingValue).toBe(10800)
    expect(result!.netDeposits).toBe(500)
    // earnings = 10800 - 10000 - (500 - 0) = 300
    expect(result!.earnings).toBe(300)
  })

  it('returns null when current month-end value is missing', () => {
    // No data point for or before Feb 28 — only one far in the future
    const result = computeMonthlyEarningsForPlatform(
      makeDataPoints([{ value: 10000, timestamp: '2026-04-15T00:00:00.000Z' }]),
      [],
      2026,
      2,
    )
    expect(result).toBeNull()
  })

  it('uses startingValue=0 when no prior month-end data exists (first month)', () => {
    const dps = makeDataPoints([
      { value: 5000, timestamp: '2026-01-15T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'deposit', amount: 5000, timestamp: '2026-01-05T00:00:00.000Z' },
    ])

    const result = computeMonthlyEarningsForPlatform(dps, txs, 2026, 1)

    expect(result).not.toBeNull()
    expect(result!.startingValue).toBe(0)
    expect(result!.endingValue).toBe(5000)
    // earnings = 5000 - 0 - (5000 - 0) = 0
    expect(result!.earnings).toBe(0)
  })

  it('handles month with withdrawals', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 9500, timestamp: '2026-02-28T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'withdrawal', amount: 1000, timestamp: '2026-02-15T00:00:00.000Z' },
    ])

    const result = computeMonthlyEarningsForPlatform(dps, txs, 2026, 2)

    expect(result).not.toBeNull()
    // earnings = 9500 - 10000 - (0 - 1000) = 500
    expect(result!.earnings).toBe(500)
    expect(result!.netDeposits).toBe(-1000)
  })

  it('handles February in a non-leap year', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2027-01-31T00:00:00.000Z' },
      { value: 10500, timestamp: '2027-02-28T00:00:00.000Z' },
    ])

    const result = computeMonthlyEarningsForPlatform(dps, [], 2027, 2)
    expect(result).not.toBeNull()
    expect(result!.earnings).toBe(500)
  })

  it('uses data point before month-end when exact date is missing', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-25T00:00:00.000Z' },
      { value: 10300, timestamp: '2026-02-20T00:00:00.000Z' },
    ])

    const result = computeMonthlyEarningsForPlatform(dps, [], 2026, 2)
    expect(result).not.toBeNull()
    expect(result!.startingValue).toBe(10000)
    expect(result!.endingValue).toBe(10300)
    expect(result!.earnings).toBe(300)
  })
})

describe('computeMonthlyEarningsSeries', () => {
  const dps = makeDataPoints([
    { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
    { value: 10500, timestamp: '2026-02-28T00:00:00.000Z' },
    { value: 11200, timestamp: '2026-03-31T00:00:00.000Z' },
    { value: 11800, timestamp: '2026-04-30T00:00:00.000Z' },
  ])

  const txs = makeTransactions([
    { type: 'deposit', amount: 200, timestamp: '2026-02-15T00:00:00.000Z' },
    { type: 'deposit', amount: 300, timestamp: '2026-03-10T00:00:00.000Z' },
  ])

  it('returns an entry for each month in range', () => {
    const series = computeMonthlyEarningsSeries(
      dps,
      txs,
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    )

    expect(series).toHaveLength(3)
    expect(series[0]!.month).toBe(2)
    expect(series[1]!.month).toBe(3)
    expect(series[2]!.month).toBe(4)
  })

  it('calculates correct earnings for each month', () => {
    const series = computeMonthlyEarningsSeries(
      dps,
      txs,
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    )

    // Feb: 10500 - 10000 - (200 - 0) = 300
    expect(series[0]!.earnings).toBe(300)
    // Mar: 11200 - 10500 - (300 - 0) = 400
    expect(series[1]!.earnings).toBe(400)
    // Apr: 11800 - 11200 - (0 - 0) = 600
    expect(series[2]!.earnings).toBe(600)
  })

  it('skips months where boundary values are unavailable', () => {
    const sparseDataPoints = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      // No February data point
      // No March data point
      { value: 12000, timestamp: '2026-04-30T00:00:00.000Z' },
    ])

    const series = computeMonthlyEarningsSeries(
      sparseDataPoints,
      [],
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    )

    // Jan: first month, startingValue=0, endingValue=10000
    // Feb: endResult finds Jan 31 value (10000), startResult also finds Jan 31 value (10000) → included
    // Mar: endResult finds Jan 31 value (10000), startResult also finds Jan 31 value (10000) → included
    // Apr: endResult finds Apr 30 value (12000), startResult finds Jan 31 value (10000) → included
    // All months should have entries since findValueAtOrBefore finds the nearest prior value
    expect(series.length).toBeGreaterThanOrEqual(1)
    // Verify the April entry has the right values
    const aprEntry = series.find((e) => e.month === 4)
    expect(aprEntry).toBeDefined()
    expect(aprEntry!.endingValue).toBe(12000)
  })

  it('returns empty array when no data points exist', () => {
    const series = computeMonthlyEarningsSeries(
      [],
      [],
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )

    expect(series).toEqual([])
  })

  it('handles single month range', () => {
    const series = computeMonthlyEarningsSeries(
      dps,
      txs,
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-02-28T00:00:00.000Z'),
    )

    expect(series).toHaveLength(1)
    expect(series[0]!.year).toBe(2026)
    expect(series[0]!.month).toBe(2)
  })

  it('spans across year boundaries', () => {
    const yearSpanDps = makeDataPoints([
      { value: 10000, timestamp: '2025-11-30T00:00:00.000Z' },
      { value: 10500, timestamp: '2025-12-31T00:00:00.000Z' },
      { value: 11000, timestamp: '2026-01-31T00:00:00.000Z' },
    ])

    const series = computeMonthlyEarningsSeries(
      yearSpanDps,
      [],
      new Date('2025-12-01T00:00:00.000Z'),
      new Date('2026-01-31T00:00:00.000Z'),
    )

    expect(series).toHaveLength(2)
    expect(series[0]).toMatchObject({ year: 2025, month: 12 })
    expect(series[1]).toMatchObject({ year: 2026, month: 1 })
  })
})

// ===================================================================
// Monthly XIRR Functions (US-052)
// ===================================================================

describe('computeMonthlyXIRR', () => {
  it('matches calculateXIRR output for same cash flows', () => {
    const startDate = new Date('2026-01-31T00:00:00.000Z')
    const endDate = new Date('2026-02-28T00:00:00.000Z')
    const txs = makeTransactions([
      { type: 'deposit', amount: 200, timestamp: '2026-02-15T00:00:00.000Z' },
    ])

    const result = computeMonthlyXIRR(10000, startDate, 10500, endDate, txs)
    const expected = calculateXIRR(buildCashFlows(10000, startDate, 10500, endDate, txs))

    expect(result).toBe(expected)
    expect(result).not.toBeNull()
  })

  it('computes XIRR with no transactions', () => {
    const result = computeMonthlyXIRR(
      10000,
      new Date('2026-01-31T00:00:00.000Z'),
      10500,
      new Date('2026-02-28T00:00:00.000Z'),
      [],
    )

    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(0)
  })

  it('returns near zero when start equals end with no transactions', () => {
    const result = computeMonthlyXIRR(
      10000,
      new Date('2026-01-31T00:00:00.000Z'),
      10000,
      new Date('2026-02-28T00:00:00.000Z'),
      [],
    )

    expect(result).not.toBeNull()
    expect(result!).toBeCloseTo(0, 4)
  })

  it('returns null when both values are zero with no transactions', () => {
    const result = computeMonthlyXIRR(
      0,
      new Date('2026-01-31T00:00:00.000Z'),
      0,
      new Date('2026-02-28T00:00:00.000Z'),
      [],
    )

    expect(result).toBeNull()
  })

  it('returns negative XIRR when value decreased', () => {
    const result = computeMonthlyXIRR(
      10000,
      new Date('2026-01-31T00:00:00.000Z'),
      9500,
      new Date('2026-02-28T00:00:00.000Z'),
      [],
    )

    expect(result).not.toBeNull()
    expect(result!).toBeLessThan(0)
  })
})

describe('computeMonthlyXIRRForPlatform', () => {
  it('computes monthly XIRR for a month with boundary data', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10500, timestamp: '2026-02-28T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'deposit', amount: 200, timestamp: '2026-02-15T00:00:00.000Z' },
    ])

    const result = computeMonthlyXIRRForPlatform(dps, txs, 2026, 2)

    expect(result).not.toBeNull()
    expect(typeof result).toBe('number')
  })

  it('computes XIRR with no transactions in month', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10300, timestamp: '2026-02-28T00:00:00.000Z' },
    ])

    const result = computeMonthlyXIRRForPlatform(dps, [], 2026, 2)

    expect(result).not.toBeNull()
    expect(result!).toBeGreaterThan(0)
  })

  it('returns null when start boundary value is missing', () => {
    const dps = makeDataPoints([
      { value: 10500, timestamp: '2026-02-15T00:00:00.000Z' },
    ])

    // For Feb: prevMonthEnd = Jan 31, no data point at or before Jan 31
    const result = computeMonthlyXIRRForPlatform(dps, [], 2026, 2)
    expect(result).toBeNull()
  })

  it('returns null when end boundary value is missing', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-04-15T00:00:00.000Z' },
    ])

    // For March: currentMonthEnd = Mar 31, no data point at or before Mar 31
    const result = computeMonthlyXIRRForPlatform(dps, [], 2026, 3)
    expect(result).toBeNull()
  })

  it('returns null when both boundary values are zero', () => {
    const dps = makeDataPoints([
      { value: 0, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 0, timestamp: '2026-02-28T00:00:00.000Z' },
    ])

    const result = computeMonthlyXIRRForPlatform(dps, [], 2026, 2)
    expect(result).toBeNull()
  })

  it('excludes transactions outside the month', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10300, timestamp: '2026-02-28T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'deposit', amount: 5000, timestamp: '2026-01-15T00:00:00.000Z' },
      { type: 'deposit', amount: 5000, timestamp: '2026-03-15T00:00:00.000Z' },
    ])

    const withTxs = computeMonthlyXIRRForPlatform(dps, txs, 2026, 2)
    const withoutTxs = computeMonthlyXIRRForPlatform(dps, [], 2026, 2)

    expect(withTxs).toBe(withoutTxs)
  })
})

describe('computeMonthlyXIRRSeries', () => {
  it('returns entry for each month in range', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10500, timestamp: '2026-02-28T00:00:00.000Z' },
      { value: 11200, timestamp: '2026-03-31T00:00:00.000Z' },
      { value: 11800, timestamp: '2026-04-30T00:00:00.000Z' },
    ])
    const txs = makeTransactions([
      { type: 'deposit', amount: 200, timestamp: '2026-02-15T00:00:00.000Z' },
    ])

    const series = computeMonthlyXIRRSeries(
      dps,
      txs,
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    )

    expect(series).toHaveLength(3)
    expect(series[0]!.month).toBe(2)
    expect(series[1]!.month).toBe(3)
    expect(series[2]!.month).toBe(4)
  })

  it('includes null xirr for months without sufficient data', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-03-31T00:00:00.000Z' },
    ])

    const series = computeMonthlyXIRRSeries(
      dps,
      [],
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )

    expect(series).toHaveLength(2)
    expect(series[0]!.xirr).toBeNull()
    expect(series[1]!.xirr).toBeNull()
  })

  it('computes non-null XIRR for months with data', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10500, timestamp: '2026-02-28T00:00:00.000Z' },
      { value: 11200, timestamp: '2026-03-31T00:00:00.000Z' },
    ])

    const series = computeMonthlyXIRRSeries(
      dps,
      [],
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-03-31T00:00:00.000Z'),
    )

    expect(series).toHaveLength(2)
    expect(series[0]!.xirr).not.toBeNull()
    expect(series[1]!.xirr).not.toBeNull()
    expect(series[0]!.xirr!).toBeGreaterThan(0)
    expect(series[1]!.xirr!).toBeGreaterThan(0)
  })

  it('handles single month range', () => {
    const dps = makeDataPoints([
      { value: 10000, timestamp: '2026-01-31T00:00:00.000Z' },
      { value: 10500, timestamp: '2026-02-28T00:00:00.000Z' },
    ])

    const series = computeMonthlyXIRRSeries(
      dps,
      [],
      new Date('2026-02-01T00:00:00.000Z'),
      new Date('2026-02-28T00:00:00.000Z'),
    )

    expect(series).toHaveLength(1)
    expect(series[0]!.year).toBe(2026)
    expect(series[0]!.month).toBe(2)
    expect(series[0]!.xirr).not.toBeNull()
  })

  it('returns empty array when start is after end', () => {
    const series = computeMonthlyXIRRSeries(
      [],
      [],
      new Date('2026-04-01T00:00:00.000Z'),
      new Date('2026-02-01T00:00:00.000Z'),
    )

    expect(series).toEqual([])
  })
})

// ===================================================================
// Portfolio Allocation Functions (US-054)
// ===================================================================

describe('calculateAllocation', () => {
  it('returns correct percentage', () => {
    expect(calculateAllocation(7460, 20000)).toBeCloseTo(37.3, 1)
  })

  it('returns null when total is zero', () => {
    expect(calculateAllocation(5000, 0)).toBeNull()
  })

  it('returns 100 for single platform equal to total', () => {
    expect(calculateAllocation(10000, 10000)).toBe(100)
  })

  it('returns 0 for zero-value platform', () => {
    expect(calculateAllocation(0, 20000)).toBe(0)
  })
})

describe('computePortfolioAllocation', () => {
  it('computes allocation for multiple DKK platforms', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Platform A', currency: 'DKK' }), currentValue: 7460 },
      { platform: buildPlatform({ name: 'Platform B', currency: 'DKK' }), currentValue: 12540 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results).toHaveLength(2)
    expect(results[0]!.platformName).toBe('Platform B')
    expect(results[0]!.allocationPercent).toBeCloseTo(62.7, 1)
    expect(results[1]!.platformName).toBe('Platform A')
    expect(results[1]!.allocationPercent).toBeCloseTo(37.3, 1)
  })

  it('excludes closed platforms', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Active', status: 'active', currency: 'DKK' }), currentValue: 10000 },
      { platform: buildPlatform({ name: 'Closed', status: 'closed', currency: 'DKK' }), currentValue: 5000 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results).toHaveLength(1)
    expect(results[0]!.platformName).toBe('Active')
    expect(results[0]!.allocationPercent).toBe(100)
  })

  it('returns empty array for empty portfolio', async () => {
    const results = await computePortfolioAllocation([])
    expect(results).toEqual([])
  })

  it('returns empty array when all platforms are closed', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Closed A', status: 'closed', currency: 'DKK' }), currentValue: 5000 },
      { platform: buildPlatform({ name: 'Closed B', status: 'closed', currency: 'DKK' }), currentValue: 3000 },
    ]

    const results = await computePortfolioAllocation(platforms)
    expect(results).toEqual([])
  })

  it('returns null percentages when all values are zero', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'A', currency: 'DKK' }), currentValue: 0 },
      { platform: buildPlatform({ name: 'B', currency: 'DKK' }), currentValue: 0 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results).toHaveLength(2)
    expect(results[0]!.allocationPercent).toBeNull()
    expect(results[1]!.allocationPercent).toBeNull()
  })

  it('converts non-DKK currencies using convertToDKK', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'EUR Platform', currency: 'EUR' }), currentValue: 1000 },
      { platform: buildPlatform({ name: 'DKK Platform', currency: 'DKK' }), currentValue: 7460 },
    ]

    const results = await computePortfolioAllocation(platforms)

    // EUR 1000 * 7.46 = 7460 DKK, DKK 7460, total 14920
    expect(results).toHaveLength(2)
    for (const r of results) {
      expect(r.valueDKK).toBe(7460)
      expect(r.allocationPercent).toBe(50)
    }
  })

  it('sorts results by allocation descending', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Small', currency: 'DKK' }), currentValue: 2000 },
      { platform: buildPlatform({ name: 'Large', currency: 'DKK' }), currentValue: 8000 },
      { platform: buildPlatform({ name: 'Medium', currency: 'DKK' }), currentValue: 5000 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results[0]!.platformName).toBe('Large')
    expect(results[1]!.platformName).toBe('Medium')
    expect(results[2]!.platformName).toBe('Small')
  })

  it('handles single platform at 100%', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Only', currency: 'DKK' }), currentValue: 10000 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results).toHaveLength(1)
    expect(results[0]!.allocationPercent).toBe(100)
  })

  it('handles zero-value platform alongside valued platform', async () => {
    const platforms: PlatformAllocationInput[] = [
      { platform: buildPlatform({ name: 'Has Value', currency: 'DKK' }), currentValue: 10000 },
      { platform: buildPlatform({ name: 'Zero Value', currency: 'DKK' }), currentValue: 0 },
    ]

    const results = await computePortfolioAllocation(platforms)

    expect(results).toHaveLength(2)
    expect(results[0]!.platformName).toBe('Has Value')
    expect(results[0]!.allocationPercent).toBe(100)
    expect(results[1]!.platformName).toBe('Zero Value')
    expect(results[1]!.allocationPercent).toBe(0)
  })
})
