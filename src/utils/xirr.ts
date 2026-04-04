import type { DataPoint, Transaction } from '@/types/investment'

export type CashFlow = { amount: number; date: Date }

const MAX_ITERATIONS = 100
const CONVERGENCE_TOLERANCE = 1e-7
const RATE_CHANGE_TOLERANCE = 1e-10
const MIN_RATE = -0.999
const MAX_RATE = 1e10
const MS_PER_DAY = 86400000
const DAYS_PER_YEAR = 365

/**
 * Compute day fraction: (date - firstDate) / 365
 */
function dayFraction(date: Date, firstDate: Date): number {
  return (date.getTime() - firstDate.getTime()) / (DAYS_PER_YEAR * MS_PER_DAY)
}

/**
 * Evaluate the XIRR function: Σ(CFi / (1 + r)^ti)
 */
function xirrFunc(cashFlows: CashFlow[], rate: number, d0: Date): number {
  let sum = 0
  for (const cf of cashFlows) {
    const t = dayFraction(cf.date, d0)
    sum += cf.amount / Math.pow(1 + rate, t)
  }
  return sum
}

/**
 * Evaluate the derivative of the XIRR function: Σ(-ti * CFi / (1 + r)^(ti + 1))
 */
function xirrDerivative(cashFlows: CashFlow[], rate: number, d0: Date): number {
  let sum = 0
  for (const cf of cashFlows) {
    const t = dayFraction(cf.date, d0)
    sum += -t * cf.amount / Math.pow(1 + rate, t + 1)
  }
  return sum
}

/**
 * Newton-Raphson solver for a single initial guess.
 * Returns the converged rate or null.
 */
function newtonRaphson(cashFlows: CashFlow[], guess: number, d0: Date): number | null {
  let rate = guess

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (rate <= -1) {
      rate = -0.5 // reset to smaller step
    }

    const f = xirrFunc(cashFlows, rate, d0)
    if (Math.abs(f) < CONVERGENCE_TOLERANCE) {
      return clampRate(rate)
    }

    const fPrime = xirrDerivative(cashFlows, rate, d0)
    if (fPrime === 0) {
      return null
    }

    const newRate = rate - f / fPrime
    if (Math.abs(newRate - rate) < RATE_CHANGE_TOLERANCE) {
      return clampRate(newRate)
    }

    rate = clampRate(newRate)
  }

  return null
}

function clampRate(rate: number): number {
  return Math.max(MIN_RATE, Math.min(MAX_RATE, rate))
}

/**
 * Brent's method fallback for XIRR when Newton-Raphson fails.
 * Searches for a root in [a, b] where f(a) and f(b) have opposite signs.
 */
function brentMethod(cashFlows: CashFlow[], d0: Date): number | null {
  // Try to bracket the root
  let a = -0.99
  let b = 10.0
  let fa = xirrFunc(cashFlows, a, d0)
  let fb = xirrFunc(cashFlows, b, d0)

  // If we can't bracket, try wider range
  if (fa * fb > 0) {
    for (const [lo, hi] of [[-0.99, 100], [-0.99, 1000], [-0.5, 10], [-0.9, 5]] as const) {
      fa = xirrFunc(cashFlows, lo, d0)
      fb = xirrFunc(cashFlows, hi, d0)
      if (fa * fb <= 0) {
        a = lo
        b = hi
        break
      }
    }
    if (fa * fb > 0) return null
  }

  let c = a
  let fc = fa
  let d = b - a
  let e = d

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (fb * fc > 0) {
      c = a
      fc = fa
      d = b - a
      e = d
    }
    if (Math.abs(fc) < Math.abs(fb)) {
      a = b
      b = c
      c = a
      fa = fb
      fb = fc
      fc = fa
    }

    const tol = 2 * Number.EPSILON * Math.abs(b) + CONVERGENCE_TOLERANCE / 2
    const m = (c - b) / 2

    if (Math.abs(m) <= tol || Math.abs(fb) < CONVERGENCE_TOLERANCE) {
      return clampRate(b)
    }

    if (Math.abs(e) >= tol && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa
      let p: number
      let q: number
      if (a === c) {
        p = 2 * m * s
        q = 1 - s
      } else {
        const r = fb / fc
        const t = fa / fc
        p = s * (2 * m * t * (t - r) - (b - a) * (r - 1))
        q = (t - 1) * (r - 1) * (s - 1)
      }
      if (p > 0) q = -q
      else p = -p

      if (2 * p < Math.min(3 * m * q - Math.abs(tol * q), Math.abs(e * q))) {
        e = d
        d = p / q
      } else {
        d = m
        e = m
      }
    } else {
      d = m
      e = m
    }

    a = b
    fa = fb
    if (Math.abs(d) > tol) {
      b += d
    } else {
      b += m > 0 ? tol : -tol
    }
    fb = xirrFunc(cashFlows, b, d0)
  }

  return null
}

/**
 * Calculate XIRR (Extended Internal Rate of Return) using Newton-Raphson iteration.
 *
 * Solves: Σ(CFi / (1 + r)^((di - d0) / 365)) = 0
 *
 * Returns annualized rate as decimal (0.12 = 12%), or null if:
 * - Fewer than 2 cash flows
 * - All cash flows on the same date
 * - All cash flows have the same sign
 * - Solver does not converge
 * - Time period is less than 1 day
 */
export function calculateXIRR(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length < 2) return null

  // Check all same date
  const firstTime = cashFlows[0]!.date.getTime()
  if (cashFlows.every(cf => cf.date.getTime() === firstTime)) return null

  // Check all same sign
  const hasPositive = cashFlows.some(cf => cf.amount > 0)
  const hasNegative = cashFlows.some(cf => cf.amount < 0)
  if (!hasPositive || !hasNegative) return null

  // Check time period >= 1 day
  const times = cashFlows.map(cf => cf.date.getTime())
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  if (maxTime - minTime < MS_PER_DAY) return null

  const d0 = cashFlows[0]!.date

  // Try Newton-Raphson with multiple initial guesses
  const guesses = [0.1, 1.0, -0.5]
  const results: number[] = []

  for (const guess of guesses) {
    const result = newtonRaphson(cashFlows, guess, d0)
    if (result !== null) {
      results.push(result)
    }
  }

  // If Newton-Raphson found results, return the one closest to 0
  if (results.length > 0) {
    return results.reduce((best, r) => Math.abs(r) < Math.abs(best) ? r : best)
  }

  // Fallback to Brent's method
  return brentMethod(cashFlows, d0)
}

/**
 * Build cash flows from investment data for XIRR calculation.
 *
 * - startValue becomes a negative cash flow (money invested)
 * - Deposits become negative cash flows
 * - Withdrawals become positive cash flows
 * - endValue becomes a positive cash flow (money returned)
 * - Zero-amount cash flows are filtered out
 */
export function buildCashFlows(
  startValue: number,
  startDate: Date,
  endValue: number,
  endDate: Date,
  transactions: Transaction[],
): CashFlow[] {
  const flows: CashFlow[] = []

  if (startValue !== 0) {
    flows.push({ amount: -startValue, date: startDate })
  }

  for (const tx of transactions) {
    if (tx.amount === 0) continue
    const date = new Date(tx.timestamp)
    if (tx.type === 'deposit') {
      flows.push({ amount: -tx.amount, date })
    } else {
      flows.push({ amount: tx.amount, date })
    }
  }

  if (endValue !== 0) {
    flows.push({ amount: endValue, date: endDate })
  }

  return flows
}

/**
 * Compute XIRR for a platform over a date range using native currency values.
 *
 * - Finds starting data point (at or nearest before `start`)
 * - Finds ending data point (at or nearest before `end`)
 * - Filters transactions within the date range
 * - Builds cash flows and runs the XIRR solver
 *
 * Returns null if insufficient data points exist.
 */
export function computePlatformXIRR(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  start: Date,
  end: Date,
): number | null {
  if (dataPoints.length === 0) return null

  const startMs = start.getTime()
  const endMs = end.getTime()

  // Find starting data point: at or nearest before `start`
  let startDP: DataPoint | null = null
  for (const dp of dataPoints) {
    const dpTime = new Date(dp.timestamp).getTime()
    if (dpTime <= startMs) {
      if (!startDP || dpTime > new Date(startDP.timestamp).getTime()) {
        startDP = dp
      }
    }
  }

  // Find ending data point: at or nearest before `end`
  let endDP: DataPoint | null = null
  for (const dp of dataPoints) {
    const dpTime = new Date(dp.timestamp).getTime()
    if (dpTime <= endMs) {
      if (!endDP || dpTime > new Date(endDP.timestamp).getTime()) {
        endDP = dp
      }
    }
  }

  if (!startDP || !endDP) return null
  if (startDP === endDP) return null

  const startDate = new Date(startDP.timestamp)
  const endDate = new Date(endDP.timestamp)

  // Filter transactions within the date range (exclusive of start, inclusive of end)
  const filteredTx = transactions.filter(tx => {
    const txTime = new Date(tx.timestamp).getTime()
    return txTime > startDate.getTime() && txTime <= endDate.getTime()
  })

  const cashFlows = buildCashFlows(
    startDP.value,
    startDate,
    endDP.value,
    endDate,
    filteredTx,
  )

  return calculateXIRR(cashFlows)
}

/** @internal Exposed for unit testing only. Do not use in application code. */
export const _testing = { newtonRaphson, brentMethod, xirrFunc, xirrDerivative }
