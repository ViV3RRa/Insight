import { endOfMonth, startOfMonth, parseISO, subMonths } from 'date-fns'
import type { DataPoint, Platform, PlatformType, Transaction } from '@/types/investment'
import { buildCashFlows, calculateXIRR } from '@/utils/xirr'
import { getMonthEndDate } from '@/utils/interpolation'
import { convertToDKK } from '@/services/currency'

// --- Gain/Loss Types (US-050) ---

export type GainLossResult = {
  gain: number
  gainPercent: number | null
  startingValue: number
  endingValue: number
  deposits: number
  withdrawals: number
  netDeposits: number
}

// --- Monthly Earnings Types (US-049) ---

export type MonthlyEarningsEntry = {
  year: number
  month: number
  earnings: number
  startingValue: number
  endingValue: number
  netDeposits: number
}

// --- Monthly XIRR Types (US-052) ---

export type MonthlyXIRREntry = { year: number; month: number; xirr: number | null }

// --- Portfolio Allocation Types (US-054) ---

export type PlatformAllocationInput = { platform: Platform; currentValue: number }

export type AllocationResult = {
  platformId: string
  platformName: string
  type: PlatformType
  currency: string
  valueDKK: number
  allocationPercent: number | null
}

// --- Helper Functions ---

export function findValueAtOrBefore(
  dataPoints: DataPoint[],
  date: Date,
): { value: number; date: Date } | null {
  const sorted = [...dataPoints]
    .map((dp) => ({ value: dp.value, date: parseISO(dp.timestamp) }))
    .filter((dp) => dp.date <= date)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return sorted[0] ?? null
}

export function sumTransactionsInRange(
  transactions: Transaction[],
  start: Date,
  end: Date,
): { deposits: number; withdrawals: number } {
  let deposits = 0
  let withdrawals = 0

  for (const tx of transactions) {
    const txDate = parseISO(tx.timestamp)
    if (txDate >= start && txDate <= end) {
      if (tx.type === 'deposit') {
        deposits += tx.amount
      } else {
        withdrawals += tx.amount
      }
    }
  }

  return { deposits, withdrawals }
}

// --- Gain/Loss Functions (US-050) ---

export function calculateGain(
  startingValue: number,
  endingValue: number,
  deposits: number,
  withdrawals: number,
): number {
  return endingValue - startingValue - (deposits - withdrawals)
}

export function calculateGainPercent(
  startingValue: number,
  endingValue: number,
  deposits: number,
  withdrawals: number,
): number | null {
  const denominator = startingValue + deposits
  if (denominator === 0) return null
  const gain = calculateGain(startingValue, endingValue, deposits, withdrawals)
  return (gain / denominator) * 100
}

export function computeGainLoss(
  startingValue: number,
  endingValue: number,
  deposits: number,
  withdrawals: number,
): GainLossResult {
  const netDeposits = deposits - withdrawals
  return {
    gain: calculateGain(startingValue, endingValue, deposits, withdrawals),
    gainPercent: calculateGainPercent(startingValue, endingValue, deposits, withdrawals),
    startingValue,
    endingValue,
    deposits,
    withdrawals,
    netDeposits,
  }
}

export function computePlatformGainLoss(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  start: Date,
  end: Date,
): GainLossResult | null {
  const startResult = findValueAtOrBefore(dataPoints, start)
  const endResult = findValueAtOrBefore(dataPoints, end)

  if (!startResult || !endResult) return null

  const { deposits, withdrawals } = sumTransactionsInRange(transactions, start, end)

  return computeGainLoss(startResult.value, endResult.value, deposits, withdrawals)
}

// --- Monthly Earnings Functions (US-049) ---

export function calculateMonthlyEarnings(
  startingValue: number,
  endingValue: number,
  deposits: number,
  withdrawals: number,
): number {
  return endingValue - startingValue - (deposits - withdrawals)
}

export function computeMonthlyEarningsForPlatform(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  year: number,
  month: number,
): MonthlyEarningsEntry | null {
  const currentMonthEnd = endOfMonth(new Date(year, month - 1))
  const previousMonthEnd = endOfMonth(subMonths(currentMonthEnd, 1))
  const currentMonthStart = startOfMonth(new Date(year, month - 1))

  const endResult = findValueAtOrBefore(dataPoints, currentMonthEnd)
  if (!endResult) return null

  const startResult = findValueAtOrBefore(dataPoints, previousMonthEnd)
  const startingValue = startResult ? startResult.value : 0

  const { deposits, withdrawals } = sumTransactionsInRange(
    transactions,
    currentMonthStart,
    currentMonthEnd,
  )

  const netDeposits = deposits - withdrawals
  const earnings = calculateMonthlyEarnings(startingValue, endResult.value, deposits, withdrawals)

  return {
    year,
    month,
    earnings,
    startingValue,
    endingValue: endResult.value,
    netDeposits,
  }
}

export function computeMonthlyEarningsSeries(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
): MonthlyEarningsEntry[] {
  const entries: MonthlyEarningsEntry[] = []
  let current = startOfMonth(startDate)
  const last = startOfMonth(endDate)

  while (current <= last) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1

    const entry = computeMonthlyEarningsForPlatform(dataPoints, transactions, year, month)
    if (entry) {
      entries.push(entry)
    }

    // Advance to next month
    current = new Date(year, current.getMonth() + 1, 1)
  }

  return entries
}

// --- Monthly XIRR Functions (US-052) ---

export function computeMonthlyXIRR(
  startingValue: number,
  startDate: Date,
  endingValue: number,
  endDate: Date,
  transactions: Transaction[],
): number | null {
  const cashFlows = buildCashFlows(startingValue, startDate, endingValue, endDate, transactions)
  return calculateXIRR(cashFlows)
}

export function computeMonthlyXIRRForPlatform(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  year: number,
  month: number,
): number | null {
  const prevMonthEnd = getMonthEndDate(year, month - 1)
  const currentMonthEnd = getMonthEndDate(year, month)
  const currentMonthStart = new Date(Date.UTC(year, month - 1, 1))

  const startResult = findValueAtOrBefore(dataPoints, prevMonthEnd)
  const endResult = findValueAtOrBefore(dataPoints, currentMonthEnd)

  if (!startResult || !endResult) return null
  if (startResult.value === 0 && endResult.value === 0) return null

  const monthTxs = transactions.filter((tx) => {
    const txDate = parseISO(tx.timestamp)
    return txDate >= currentMonthStart && txDate <= currentMonthEnd
  })

  return computeMonthlyXIRR(
    startResult.value,
    prevMonthEnd,
    endResult.value,
    currentMonthEnd,
    monthTxs,
  )
}

export function computeMonthlyXIRRSeries(
  dataPoints: DataPoint[],
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
): MonthlyXIRREntry[] {
  const entries: MonthlyXIRREntry[] = []
  let current = startOfMonth(startDate)
  const last = startOfMonth(endDate)

  while (current <= last) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1

    const xirr = computeMonthlyXIRRForPlatform(dataPoints, transactions, year, month)
    entries.push({ year, month, xirr })

    current = new Date(year, current.getMonth() + 1, 1)
  }

  return entries
}

// --- Portfolio Allocation Functions (US-054) ---

export function calculateAllocation(
  platformValueDKK: number,
  totalPortfolioValueDKK: number,
): number | null {
  if (totalPortfolioValueDKK === 0) return null
  return (platformValueDKK / totalPortfolioValueDKK) * 100
}

export async function computePortfolioAllocation(
  platforms: PlatformAllocationInput[],
): Promise<AllocationResult[]> {
  const activePlatforms = platforms.filter((p) => p.platform.status === 'active')
  if (activePlatforms.length === 0) return []

  const today = new Date().toISOString().split('T')[0]!

  const converted: Array<{ input: PlatformAllocationInput; valueDKK: number }> = []

  for (const item of activePlatforms) {
    if (item.platform.currency === 'DKK') {
      converted.push({ input: item, valueDKK: item.currentValue })
    } else {
      const dkkValue = await convertToDKK(item.currentValue, item.platform.currency, today)
      converted.push({ input: item, valueDKK: dkkValue ?? 0 })
    }
  }

  const total = converted.reduce((sum, c) => sum + c.valueDKK, 0)

  return converted
    .map((c) => ({
      platformId: c.input.platform.id as string,
      platformName: c.input.platform.name,
      type: c.input.platform.type,
      currency: c.input.platform.currency,
      valueDKK: c.valueDKK,
      allocationPercent: calculateAllocation(c.valueDKK, total),
    }))
    .sort((a, b) => (b.allocationPercent ?? 0) - (a.allocationPercent ?? 0))
}
