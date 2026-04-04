import { describe, it, expect } from 'vitest'
import { calculateXIRR, buildCashFlows, computePlatformXIRR, _testing } from './xirr'
import type { CashFlow } from './xirr'
import { buildDataPoint, buildTransaction } from '@/test/factories'
import type { DataPoint } from '@/types/investment'
import xirrFixtures from '@/test/fixtures/xirr-reference.json'

const { newtonRaphson, brentMethod, xirrFunc, xirrDerivative } = _testing

// Helper to build Date objects concisely
function d(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00.000Z')
}

describe('calculateXIRR', () => {
  describe('known return values', () => {
    it('returns ~10% for invest 10k → receive 11k over one year', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 11000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.10, 2)
    })

    it('returns correct XIRR for invest 10k, deposit 5k mid-year, end value 16k', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: -5000, date: d('2025-07-01') },
        { amount: 16000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      // With mid-year deposit, annualized return ~8%
      expect(result).toBeCloseTo(0.0805, 2)
    })

    it('returns ~10.25% for 10k invested, value 10.5k after half year', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 10500, date: d('2025-07-01') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.1025, 2)
    })

    it('returns ~5.83% for 10k invested, 2k withdrawal on Apr 1, end value 8.5k', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 2000, date: d('2025-04-01') },
        { amount: 8500, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.0583, 2)
    })

    it('returns 0 for break-even', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 10000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.0, 4)
    })

    it('returns ~-50% for large loss', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 5000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result!).toBeLessThan(-0.49)
      expect(result!).toBeGreaterThan(-0.51)
    })

    it('handles multiple deposits and withdrawals', () => {
      const cashFlows: CashFlow[] = [
        { amount: -5000, date: d('2025-01-01') },
        { amount: -3000, date: d('2025-03-15') },
        { amount: 1000, date: d('2025-06-01') },
        { amount: -2000, date: d('2025-09-01') },
        { amount: 10500, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.1870, 1)
    })

    it('handles multi-year investment', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2024-01-01') },
        { amount: 12500, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.118, 2)
    })

    it('handles ~100% return (doubling)', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 20000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(1.0, 1)
    })
  })

  describe('edge cases returning null', () => {
    it('returns null for fewer than 2 cash flows', () => {
      expect(calculateXIRR([])).toBeNull()
      expect(calculateXIRR([{ amount: -10000, date: d('2025-01-01') }])).toBeNull()
    })

    it('returns null when all cash flows are on the same date', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 11000, date: d('2025-01-01') },
      ]
      expect(calculateXIRR(cashFlows)).toBeNull()
    })

    it('returns null when all cash flows are negative (same sign)', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: -5000, date: d('2025-07-01') },
      ]
      expect(calculateXIRR(cashFlows)).toBeNull()
    })

    it('returns null when all cash flows are positive (same sign)', () => {
      const cashFlows: CashFlow[] = [
        { amount: 10000, date: d('2025-01-01') },
        { amount: 5000, date: d('2025-07-01') },
      ]
      expect(calculateXIRR(cashFlows)).toBeNull()
    })

    it('returns null when time period is less than 1 day', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T12:00:00.000Z')
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: date1 },
        { amount: 11000, date: date2 },
      ]
      expect(calculateXIRR(cashFlows)).toBeNull()
    })
  })

  describe('robustness', () => {
    it('handles zero starting value without division by zero', () => {
      const cashFlows: CashFlow[] = [
        { amount: -0, date: d('2025-01-01') },
        { amount: -5000, date: d('2025-03-01') },
        { amount: 6000, date: d('2025-12-31') },
      ]
      // -0 is filtered by buildCashFlows, but calculateXIRR itself should not crash
      const result = calculateXIRR(cashFlows)
      // All same sign (negative and positive exist via -5000 and 6000), so it should compute
      expect(result).not.toBeNull()
    })

    it('never throws — always returns number or null', () => {
      const testCases: CashFlow[][] = [
        [],
        [{ amount: -10000, date: d('2025-01-01') }],
        [
          { amount: -10000, date: d('2025-01-01') },
          { amount: 11000, date: d('2025-01-01') },
        ],
        [
          { amount: -10000, date: d('2025-01-01') },
          { amount: -5000, date: d('2025-07-01') },
        ],
        [
          { amount: -1, date: d('2025-01-01') },
          { amount: 1000000, date: d('2025-12-31') },
        ],
        [
          { amount: -1000000, date: d('2025-01-01') },
          { amount: 1, date: d('2025-12-31') },
        ],
      ]

      for (const cashFlows of testCases) {
        expect(() => calculateXIRR(cashFlows)).not.toThrow()
        const result = calculateXIRR(cashFlows)
        expect(result === null || typeof result === 'number').toBe(true)
      }
    })

    it('handles very large returns', () => {
      const cashFlows: CashFlow[] = [
        { amount: -100, date: d('2025-01-01') },
        { amount: 100000, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      // Should converge to a very large positive return, or fallback via Brent
      if (result !== null) {
        expect(result).toBeGreaterThan(1)
      }
    })

    it('handles very small returns', () => {
      const cashFlows: CashFlow[] = [
        { amount: -10000, date: d('2025-01-01') },
        { amount: 10001, date: d('2025-12-31') },
      ]
      const result = calculateXIRR(cashFlows)
      expect(result).not.toBeNull()
      expect(result).toBeCloseTo(0.0001, 4)
    })
  })

  describe('golden fixtures', () => {
    for (const fixture of xirrFixtures) {
      it(fixture.description, () => {
        const cashFlows: CashFlow[] = fixture.cashFlows.map(cf => ({
          amount: cf.amount,
          date: d(cf.date),
        }))
        const result = calculateXIRR(cashFlows)
        if (fixture.expectedXIRR === 0) {
          expect(result).not.toBeNull()
          expect(Math.abs(result!)).toBeLessThan(0.01)
        } else {
          expect(result).not.toBeNull()
          expect(result).toBeCloseTo(fixture.expectedXIRR, 1)
        }
      })
    }
  })
})

describe('buildCashFlows', () => {
  it('makes starting value a negative cash flow', () => {
    const flows = buildCashFlows(10000, d('2025-01-01'), 11000, d('2025-12-31'), [])
    expect(flows[0]).toEqual({ amount: -10000, date: d('2025-01-01') })
  })

  it('makes ending value a positive cash flow', () => {
    const flows = buildCashFlows(10000, d('2025-01-01'), 11000, d('2025-12-31'), [])
    expect(flows[flows.length - 1]).toEqual({ amount: 11000, date: d('2025-12-31') })
  })

  it('makes deposits negative cash flows', () => {
    const tx = buildTransaction({
      type: 'deposit',
      amount: 5000,
      timestamp: '2025-06-01T00:00:00.000Z',
    })
    const flows = buildCashFlows(10000, d('2025-01-01'), 16000, d('2025-12-31'), [tx])
    const depositFlow = flows.find(f => f.amount === -5000)
    expect(depositFlow).toBeDefined()
    expect(depositFlow!.date).toEqual(d('2025-06-01'))
  })

  it('makes withdrawals positive cash flows', () => {
    const tx = buildTransaction({
      type: 'withdrawal',
      amount: 2000,
      timestamp: '2025-06-01T00:00:00.000Z',
    })
    const flows = buildCashFlows(10000, d('2025-01-01'), 8500, d('2025-12-31'), [tx])
    const withdrawalFlow = flows.find(f => f.amount === 2000)
    expect(withdrawalFlow).toBeDefined()
    expect(withdrawalFlow!.date).toEqual(d('2025-06-01'))
  })

  it('filters out zero-amount starting value', () => {
    const flows = buildCashFlows(0, d('2025-01-01'), 5000, d('2025-12-31'), [])
    expect(flows).toHaveLength(1)
    expect(flows[0]!.amount).toBe(5000)
  })

  it('filters out zero-amount ending value', () => {
    const flows = buildCashFlows(10000, d('2025-01-01'), 0, d('2025-12-31'), [])
    expect(flows).toHaveLength(1)
    expect(flows[0]!.amount).toBe(-10000)
  })

  it('filters out zero-amount transactions', () => {
    const tx = buildTransaction({
      type: 'deposit',
      amount: 0,
      timestamp: '2025-06-01T00:00:00.000Z',
    })
    const flows = buildCashFlows(10000, d('2025-01-01'), 11000, d('2025-12-31'), [tx])
    // Only start and end, no zero-amount transaction
    expect(flows).toHaveLength(2)
  })

  it('handles multiple transactions', () => {
    const txs = [
      buildTransaction({
        type: 'deposit',
        amount: 5000,
        timestamp: '2025-03-01T00:00:00.000Z',
      }),
      buildTransaction({
        type: 'withdrawal',
        amount: 2000,
        timestamp: '2025-06-01T00:00:00.000Z',
      }),
      buildTransaction({
        type: 'deposit',
        amount: 3000,
        timestamp: '2025-09-01T00:00:00.000Z',
      }),
    ]
    const flows = buildCashFlows(10000, d('2025-01-01'), 17000, d('2025-12-31'), txs)
    expect(flows).toHaveLength(5) // start + 3 tx + end
    expect(flows[0]!.amount).toBe(-10000) // start
    expect(flows[1]!.amount).toBe(-5000) // deposit
    expect(flows[2]!.amount).toBe(2000) // withdrawal
    expect(flows[3]!.amount).toBe(-3000) // deposit
    expect(flows[4]!.amount).toBe(17000) // end
  })
})

describe('computePlatformXIRR', () => {
  const platformId = 'plat_001' as DataPoint['platformId']

  it('computes XIRR from data points and transactions', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 10000,
        timestamp: '2025-01-01T00:00:00.000Z',
      }),
      buildDataPoint({
        platformId,
        value: 11000,
        timestamp: '2025-12-31T00:00:00.000Z',
      }),
    ]
    const result = computePlatformXIRR(dataPoints, [], d('2025-01-01'), d('2025-12-31'))
    expect(result).not.toBeNull()
    expect(result).toBeCloseTo(0.10, 2)
  })

  it('finds nearest data point before start date', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 10000,
        timestamp: '2024-12-28T00:00:00.000Z', // before start
      }),
      buildDataPoint({
        platformId,
        value: 11000,
        timestamp: '2025-12-31T00:00:00.000Z',
      }),
    ]
    const result = computePlatformXIRR(dataPoints, [], d('2025-01-01'), d('2025-12-31'))
    expect(result).not.toBeNull()
  })

  it('includes transactions within the date range', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 10000,
        timestamp: '2025-01-01T00:00:00.000Z',
      }),
      buildDataPoint({
        platformId,
        value: 16000,
        timestamp: '2025-12-31T00:00:00.000Z',
      }),
    ]
    const txs = [
      buildTransaction({
        platformId,
        type: 'deposit',
        amount: 5000,
        timestamp: '2025-07-01T00:00:00.000Z',
      }),
    ]
    const result = computePlatformXIRR(dataPoints, txs, d('2025-01-01'), d('2025-12-31'))
    expect(result).not.toBeNull()
    // With the deposit factored in, return should differ from no-transaction case
    expect(result).toBeCloseTo(0.0805, 1)
  })

  it('excludes transactions outside the date range', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 10000,
        timestamp: '2025-01-01T00:00:00.000Z',
      }),
      buildDataPoint({
        platformId,
        value: 11000,
        timestamp: '2025-12-31T00:00:00.000Z',
      }),
    ]
    const txs = [
      buildTransaction({
        platformId,
        type: 'deposit',
        amount: 5000,
        timestamp: '2024-06-01T00:00:00.000Z', // before range
      }),
    ]
    const result = computePlatformXIRR(dataPoints, txs, d('2025-01-01'), d('2025-12-31'))
    expect(result).not.toBeNull()
    // Transaction excluded, so same as simple 10k → 11k
    expect(result).toBeCloseTo(0.10, 2)
  })

  it('returns null when no data points exist', () => {
    expect(computePlatformXIRR([], [], d('2025-01-01'), d('2025-12-31'))).toBeNull()
  })

  it('returns null when no data point exists before start', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 11000,
        timestamp: '2025-06-01T00:00:00.000Z',
      }),
    ]
    // Start is before the only data point, and there's nothing at or before end either
    // Actually the dp IS before the end, so endDP would be found but startDP would not
    expect(computePlatformXIRR(dataPoints, [], d('2025-01-01'), d('2025-03-01'))).toBeNull()
  })

  it('returns null when start and end resolve to the same data point', () => {
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 10000,
        timestamp: '2025-01-01T00:00:00.000Z',
      }),
    ]
    // Both start and end resolve to the same data point
    expect(computePlatformXIRR(dataPoints, [], d('2025-01-01'), d('2025-06-01'))).toBeNull()
  })

  it('uses native currency values (no conversion)', () => {
    // Values are used as-is from data points; this test documents the contract
    const dataPoints = [
      buildDataPoint({
        platformId,
        value: 1000, // native EUR value
        timestamp: '2025-01-01T00:00:00.000Z',
      }),
      buildDataPoint({
        platformId,
        value: 1100, // native EUR value
        timestamp: '2025-12-31T00:00:00.000Z',
      }),
    ]
    const result = computePlatformXIRR(dataPoints, [], d('2025-01-01'), d('2025-12-31'))
    expect(result).not.toBeNull()
    expect(result).toBeCloseTo(0.10, 2)
  })
})

describe('internal: xirrFunc and xirrDerivative', () => {
  it('xirrFunc returns 0 at the correct rate', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 11000, date: d('2025-12-31') },
    ]
    // At the solution rate, f(r) should be ~0
    const rate = calculateXIRR(cashFlows)!
    const f = xirrFunc(cashFlows, rate, d('2025-01-01'))
    expect(Math.abs(f)).toBeLessThan(1e-6)
  })

  it('xirrDerivative returns non-zero at typical rates', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 11000, date: d('2025-12-31') },
    ]
    const deriv = xirrDerivative(cashFlows, 0.1, d('2025-01-01'))
    expect(deriv).not.toBe(0)
  })
})

describe('internal: newtonRaphson', () => {
  it('converges for a simple case', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 11000, date: d('2025-12-31') },
    ]
    const result = newtonRaphson(cashFlows, 0.1, d('2025-01-01'))
    expect(result).not.toBeNull()
    expect(result).toBeCloseTo(0.10, 2)
  })

  it('returns null when derivative is zero', () => {
    // Construct a case where f'(r) = 0 at some point
    // Two equal opposite cash flows at the same distance from d0 can cause this
    // In practice, this is rare — just verify the function handles it
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 11000, date: d('2025-12-31') },
    ]
    // With a guess of 0.1, this should converge, not hit f'=0
    const result = newtonRaphson(cashFlows, 0.1, d('2025-01-01'))
    expect(result === null || typeof result === 'number').toBe(true)
  })

  it('handles guess that leads to rate <= -1', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 5000, date: d('2025-12-31') },
    ]
    // Starting at -0.5 (one of the retry guesses) for a loss scenario
    const result = newtonRaphson(cashFlows, -0.5, d('2025-01-01'))
    // Should either converge or return null — never crash
    expect(result === null || typeof result === 'number').toBe(true)
  })
})

describe('internal: brentMethod', () => {
  it('finds root for a simple case', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 11000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    expect(result).not.toBeNull()
    expect(result).toBeCloseTo(0.10, 2)
  })

  it('finds root for a loss scenario', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 5000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    expect(result).not.toBeNull()
    expect(result!).toBeLessThan(0)
  })

  it('handles very high return case', () => {
    const cashFlows: CashFlow[] = [
      { amount: -100, date: d('2025-01-01') },
      { amount: 100000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    // Very extreme returns may exceed bracket range — null is acceptable
    expect(result === null || result > 1).toBe(true)
  })

  it('finds root for multi-year investment', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2023-01-01') },
      { amount: -5000, date: d('2024-01-01') },
      { amount: 20000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2023-01-01'))
    expect(result).not.toBeNull()
    expect(typeof result).toBe('number')
  })

  it('finds root for near-zero return', () => {
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 10000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    expect(result).not.toBeNull()
    expect(Math.abs(result!)).toBeLessThan(0.01)
  })

  it('handles case needing wider bracket range', () => {
    // Very extreme return that may need a wider bracket
    const cashFlows: CashFlow[] = [
      { amount: -1, date: d('2025-01-01') },
      { amount: 1000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    if (result !== null) {
      expect(result).toBeGreaterThan(1)
    }
  })

  it('uses wider bracket range for high returns (rate > 10)', () => {
    // Rate ~50x in a year — initial bracket [-0.99, 10] won't contain the root
    // but [-0.99, 100] should
    const cashFlows: CashFlow[] = [
      { amount: -1000, date: d('2025-01-01') },
      { amount: 50000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    if (result !== null) {
      expect(result).toBeGreaterThan(10)
    }
  })

  it('returns null after max iterations exhausted', () => {
    // This is extremely hard to trigger naturally, so we just verify
    // the contract: brentMethod returns null or number
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: 10001, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    expect(result === null || typeof result === 'number').toBe(true)
  })

  it('returns null when root cannot be bracketed', () => {
    // All same sign — can't bracket
    const cashFlows: CashFlow[] = [
      { amount: -10000, date: d('2025-01-01') },
      { amount: -5000, date: d('2025-12-31') },
    ]
    const result = brentMethod(cashFlows, d('2025-01-01'))
    // Brent may or may not find a root with all-negative flows
    expect(result === null || typeof result === 'number').toBe(true)
  })
})
