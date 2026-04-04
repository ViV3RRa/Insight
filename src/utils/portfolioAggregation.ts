import { endOfMonth, parseISO, startOfMonth, subMonths } from 'date-fns'
import type { DataPoint, Transaction } from '@/types/investment'
import type { Platform } from '@/types/investment'
import type { CashFlow } from '@/utils/xirr'
import type { GainLossResult } from '@/utils/calculations'
import { calculateXIRR } from '@/utils/xirr'
import {
  calculateMonthlyEarnings,
  computeGainLoss,
  findValueAtOrBefore,
} from '@/utils/calculations'
import { convertToDKK } from '@/services/currency'

// --- Types ---

export type PlatformWithData = {
  platform: Platform
  dataPoints: DataPoint[]
  transactions: Transaction[]
}

export type CompositeDataPoint = {
  date: Date
  totalValueDKK: number
  platformBreakdown: Record<string, number>
}

// --- Internal helpers ---

function formatDateStr(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function filterActive(platforms: PlatformWithData[]): PlatformWithData[] {
  return platforms.filter((p) => p.platform.status === 'active')
}

function getLatestValue(dataPoints: DataPoint[]): { value: number; date: Date } | null {
  if (dataPoints.length === 0) return null
  const sorted = [...dataPoints]
    .map((dp) => ({ value: dp.value, date: parseISO(dp.timestamp) }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
  return sorted[0] ?? null
}

async function toDKK(value: number, currency: string, date: Date): Promise<number> {
  const result = await convertToDKK(value, currency, formatDateStr(date))
  return result ?? 0
}

// --- Public functions ---

/**
 * Build a composite value series across all active platforms in DKK.
 * For each timestamp where ANY platform has a data point within [start, end],
 * sums all platform values (carry-forward for missing platforms).
 */
export async function buildCompositeValueSeries(
  platforms: PlatformWithData[],
  start: Date,
  end: Date,
): Promise<CompositeDataPoint[]> {
  const active = filterActive(platforms)
  if (active.length === 0) return []

  // Collect all unique timestamps from active platform data points within range
  const timestampSet = new Set<number>()
  for (const { dataPoints } of active) {
    for (const dp of dataPoints) {
      const dpDate = parseISO(dp.timestamp)
      if (dpDate >= start && dpDate <= end) {
        timestampSet.add(dpDate.getTime())
      }
    }
  }

  const sortedTimestamps = [...timestampSet].sort((a, b) => a - b)
  const result: CompositeDataPoint[] = []

  for (const ts of sortedTimestamps) {
    const date = new Date(ts)
    let totalValueDKK = 0
    const platformBreakdown: Record<string, number> = {}

    for (const { platform, dataPoints } of active) {
      const valueResult = findValueAtOrBefore(dataPoints, date)
      if (!valueResult) continue

      const dkkValue = await toDKK(valueResult.value, platform.currency, date)
      platformBreakdown[platform.id as string] = dkkValue
      totalValueDKK += dkkValue
    }

    result.push({ date, totalValueDKK, platformBreakdown })
  }

  return result
}

/**
 * Merge all transactions across active platforms into DKK cash flows.
 * Deposits → negative; withdrawals → positive (XIRR convention).
 * Sorted by date.
 */
export async function mergeTransactions(
  platforms: PlatformWithData[],
): Promise<CashFlow[]> {
  const active = filterActive(platforms)
  const flows: CashFlow[] = []

  for (const { platform, transactions } of active) {
    for (const tx of transactions) {
      const date = parseISO(tx.timestamp)
      const dkkAmount = await toDKK(tx.amount, platform.currency, date)

      flows.push({
        amount: tx.type === 'deposit' ? -dkkAmount : dkkAmount,
        date,
      })
    }
  }

  return flows.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Compute portfolio-level XIRR across all active platforms in DKK.
 * Starting value → negative cash flow; ending value → positive cash flow.
 * Cash platforms included (idle cash dilutes return).
 */
export async function computePortfolioXIRR(
  platforms: PlatformWithData[],
  start: Date,
  end: Date,
): Promise<number | null> {
  const active = filterActive(platforms)
  if (active.length === 0) return null

  const cashFlows: CashFlow[] = []

  // Starting value: sum of all platform DKK values at or before start → negative
  let startingTotal = 0
  for (const { platform, dataPoints } of active) {
    const val = findValueAtOrBefore(dataPoints, start)
    if (val) {
      startingTotal += await toDKK(val.value, platform.currency, start)
    }
  }
  if (startingTotal !== 0) {
    cashFlows.push({ amount: -startingTotal, date: start })
  }

  // All transactions in (start, end] → converted to DKK cash flows
  for (const { platform, transactions } of active) {
    for (const tx of transactions) {
      const txDate = parseISO(tx.timestamp)
      if (txDate > start && txDate <= end) {
        const dkkAmount = await toDKK(tx.amount, platform.currency, txDate)
        cashFlows.push({
          amount: tx.type === 'deposit' ? -dkkAmount : dkkAmount,
          date: txDate,
        })
      }
    }
  }

  // Ending value: sum of all platform DKK values at or before end → positive
  let endingTotal = 0
  for (const { platform, dataPoints } of active) {
    const val = findValueAtOrBefore(dataPoints, end)
    if (val) {
      endingTotal += await toDKK(val.value, platform.currency, end)
    }
  }
  if (endingTotal !== 0) {
    cashFlows.push({ amount: endingTotal, date: end })
  }

  return calculateXIRR(cashFlows)
}

/**
 * Compute portfolio-level gain/loss across all active platforms in DKK.
 * Returns null if starting or ending values can't be determined.
 */
export async function computePortfolioGainLoss(
  platforms: PlatformWithData[],
  start: Date,
  end: Date,
): Promise<GainLossResult | null> {
  const active = filterActive(platforms)
  if (active.length === 0) return null

  let startingValue = 0
  let endingValue = 0
  let deposits = 0
  let withdrawals = 0
  let hasStart = false
  let hasEnd = false

  for (const { platform, dataPoints, transactions } of active) {
    const startVal = findValueAtOrBefore(dataPoints, start)
    const endVal = findValueAtOrBefore(dataPoints, end)

    if (startVal) {
      startingValue += await toDKK(startVal.value, platform.currency, start)
      hasStart = true
    }
    if (endVal) {
      endingValue += await toDKK(endVal.value, platform.currency, end)
      hasEnd = true
    }

    // Convert each transaction individually at its own date
    for (const tx of transactions) {
      const txDate = parseISO(tx.timestamp)
      if (txDate >= start && txDate <= end) {
        const dkkAmount = await toDKK(tx.amount, platform.currency, txDate)
        if (tx.type === 'deposit') {
          deposits += dkkAmount
        } else {
          withdrawals += dkkAmount
        }
      }
    }
  }

  if (!hasStart || !hasEnd) return null

  return computeGainLoss(startingValue, endingValue, deposits, withdrawals)
}

/**
 * Compute portfolio-level monthly earnings across all active platforms in DKK.
 * Returns null if any active platform lacks boundary values.
 */
export async function computePortfolioMonthlyEarnings(
  platforms: PlatformWithData[],
  year: number,
  month: number,
): Promise<number | null> {
  const active = filterActive(platforms)
  if (active.length === 0) return null

  const currentMonthEnd = endOfMonth(new Date(year, month - 1))
  const previousMonthEnd = endOfMonth(subMonths(currentMonthEnd, 1))
  const currentMonthStart = startOfMonth(new Date(year, month - 1))

  let totalEarnings = 0

  for (const { platform, dataPoints, transactions } of active) {
    const endResult = findValueAtOrBefore(dataPoints, currentMonthEnd)
    if (!endResult) return null

    const startResult = findValueAtOrBefore(dataPoints, previousMonthEnd)
    const startingValue = startResult ? startResult.value : 0

    let monthDeposits = 0
    let monthWithdrawals = 0
    for (const tx of transactions) {
      const txDate = parseISO(tx.timestamp)
      if (txDate >= currentMonthStart && txDate <= currentMonthEnd) {
        if (tx.type === 'deposit') {
          monthDeposits += tx.amount
        } else {
          monthWithdrawals += tx.amount
        }
      }
    }

    const earnings = calculateMonthlyEarnings(
      startingValue,
      endResult.value,
      monthDeposits,
      monthWithdrawals,
    )
    totalEarnings += await toDKK(earnings, platform.currency, currentMonthEnd)
  }

  return totalEarnings
}

/**
 * Compute total portfolio value: sum of latest value of each active platform in DKK.
 */
export async function computeTotalPortfolioValue(
  platforms: PlatformWithData[],
): Promise<number> {
  const active = filterActive(platforms)
  let total = 0

  for (const { platform, dataPoints } of active) {
    const latest = getLatestValue(dataPoints)
    if (!latest) continue

    total += await toDKK(latest.value, platform.currency, latest.date)
  }

  return total
}
