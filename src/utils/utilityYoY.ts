import { format } from 'date-fns'
import type {
  MeterReading,
  UtilityBill,
  UtilityMetrics,
  UtilityYoYComparison,
  HomeYoYComparison,
  UtilityYearlySummary,
  UtilityMonthlySummary,
  MonthlyConsumption,
  MonthlyCost,
} from '@/types/home'
import { calculateMonthlyConsumption } from './consumption'
import { amortizeAllBills } from './amortization'

/**
 * Calculate percentage change between current and previous values.
 * Returns null when previous is 0 (avoiding division by zero / Infinity).
 */
export function calculateChangePercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * YoY comparison for a single utility: YTD cost, current month cost, avg monthly cost.
 */
export function calculateUtilityYoY(
  currentYearMetrics: UtilityMetrics,
  priorYearMetrics: UtilityMetrics,
): UtilityYoYComparison {
  return {
    ytdCost: {
      current: currentYearMetrics.ytdCost,
      previous: priorYearMetrics.ytdCost,
      changePercent: calculateChangePercent(currentYearMetrics.ytdCost, priorYearMetrics.ytdCost),
    },
    currentMonthCost: {
      current: currentYearMetrics.currentMonthCost ?? 0,
      previous: priorYearMetrics.currentMonthCost ?? 0,
      changePercent: calculateChangePercent(
        currentYearMetrics.currentMonthCost ?? 0,
        priorYearMetrics.currentMonthCost ?? 0,
      ),
    },
    avgMonthlyCost: {
      current: currentYearMetrics.avgMonthlyCost ?? 0,
      previous: priorYearMetrics.avgMonthlyCost ?? 0,
      changePercent: calculateChangePercent(
        currentYearMetrics.avgMonthlyCost ?? 0,
        priorYearMetrics.avgMonthlyCost ?? 0,
      ),
    },
  }
}

/**
 * Aggregate YoY comparison across ALL utilities for the Home overview.
 */
export function calculateHomeYoY(
  allCurrentYearMetrics: UtilityMetrics[],
  allPriorYearMetrics: UtilityMetrics[],
): HomeYoYComparison {
  const currentYtd = allCurrentYearMetrics.reduce((sum, m) => sum + m.ytdCost, 0)
  const priorYtd = allPriorYearMetrics.reduce((sum, m) => sum + m.ytdCost, 0)

  const currentMonth = allCurrentYearMetrics.reduce((sum, m) => sum + (m.currentMonthCost ?? 0), 0)
  const priorMonth = allPriorYearMetrics.reduce((sum, m) => sum + (m.currentMonthCost ?? 0), 0)

  const currentAvg = allCurrentYearMetrics.reduce((sum, m) => sum + (m.avgMonthlyCost ?? 0), 0)
  const priorAvg = allPriorYearMetrics.reduce((sum, m) => sum + (m.avgMonthlyCost ?? 0), 0)

  const now = new Date()
  const periodLabel = `Jan 1 – ${format(now, 'MMM d')}, ${now.getFullYear() - 1}`

  return {
    ytdTotalCost: {
      current: currentYtd,
      previous: priorYtd,
      changePercent: calculateChangePercent(currentYtd, priorYtd),
    },
    currentMonthCost: {
      current: currentMonth,
      previous: priorMonth,
      changePercent: calculateChangePercent(currentMonth, priorMonth),
    },
    avgMonthlyCost: {
      current: currentAvg,
      previous: priorAvg,
      changePercent: calculateChangePercent(currentAvg, priorAvg),
    },
    periodLabel,
  }
}

/**
 * Yearly summaries: consumption, cost, and change percentages per year.
 */
export function calculateYearlySummaries(
  readings: MeterReading[],
  bills: UtilityBill[],
): UtilityYearlySummary[] {
  const monthlyConsumption = calculateMonthlyConsumption(readings)
  const monthlyCost = amortizeAllBills(bills)

  // Collect all years from both sources
  const years = new Set<number>()
  for (const c of monthlyConsumption) years.add(c.year)
  for (const c of monthlyCost) years.add(c.year)

  if (years.size === 0) return []

  const sortedYears = Array.from(years).sort((a, b) => a - b)

  const summaries: UtilityYearlySummary[] = []
  let previousSummary: UtilityYearlySummary | null = null

  for (const year of sortedYears) {
    const yearConsumption = monthlyConsumption.filter((c) => c.year === year)
    const yearCost = monthlyCost.filter((c) => c.year === year)

    const totalConsumption = yearConsumption.reduce((sum, c) => sum + c.consumption, 0)
    const totalCost = yearCost.reduce((sum, c) => sum + c.cost, 0)

    const consumptionMonthCount = yearConsumption.length || 1
    const costMonthCount = yearCost.length || 1

    const avgMonthlyConsumption = totalConsumption / consumptionMonthCount
    const avgMonthlyCost = totalCost / costMonthCount
    const avgCostPerUnit = totalConsumption === 0 ? 0 : totalCost / totalConsumption

    const consumptionChangePercent = previousSummary
      ? calculateChangePercent(totalConsumption, previousSummary.totalConsumption)
      : null

    const costChangePercent = previousSummary
      ? calculateChangePercent(totalCost, previousSummary.totalCost)
      : null

    const summary: UtilityYearlySummary = {
      year,
      totalConsumption,
      avgMonthlyConsumption,
      consumptionChangePercent,
      totalCost,
      avgMonthlyCost,
      avgCostPerUnit,
      costChangePercent,
    }

    summaries.push(summary)
    previousSummary = summary
  }

  return summaries
}

/**
 * Monthly summaries for a given year: consumption, cost, costPerUnit,
 * and change percentages vs same month in the prior year.
 */
export function calculateMonthlySummaries(
  readings: MeterReading[],
  bills: UtilityBill[],
  year: number,
): UtilityMonthlySummary[] {
  const monthlyConsumption = calculateMonthlyConsumption(readings)
  const monthlyCost = amortizeAllBills(bills)

  // Build maps for current year and prior year
  const consumptionMap = buildMonthMap(monthlyConsumption, (c) => c.consumption)
  const costMap = buildMonthlyCostMap(monthlyCost)

  // Get all months in the given year that have data
  const monthsWithData = new Set<string>()
  for (const c of monthlyConsumption) {
    if (c.year === year) monthsWithData.add(c.month)
  }
  for (const c of monthlyCost) {
    if (c.year === year) monthsWithData.add(c.month)
  }

  const sortedMonths = Array.from(monthsWithData).sort()
  const priorYear = year - 1

  return sortedMonths.map((month) => {
    const monthNum = month.substring(5, 7)
    const priorMonthKey = `${priorYear}-${monthNum}`

    const consumption = consumptionMap.get(month) ?? 0
    const cost = costMap.get(month) ?? 0
    const priorConsumption = consumptionMap.get(priorMonthKey)
    const priorCost = costMap.get(priorMonthKey)

    const costPerUnit = consumption > 0 ? cost / consumption : null

    const consumptionChangePercent =
      priorConsumption !== undefined ? calculateChangePercent(consumption, priorConsumption) : null

    const costChangePercent =
      priorCost !== undefined ? calculateChangePercent(cost, priorCost) : null

    return {
      month,
      year,
      consumption,
      consumptionChangePercent,
      cost,
      costPerUnit,
      costChangePercent,
    }
  })
}

function buildMonthMap(
  data: MonthlyConsumption[],
  getValue: (entry: MonthlyConsumption) => number,
): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of data) {
    map.set(entry.month, (map.get(entry.month) ?? 0) + getValue(entry))
  }
  return map
}

function buildMonthlyCostMap(data: MonthlyCost[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const entry of data) {
    map.set(entry.month, (map.get(entry.month) ?? 0) + entry.cost)
  }
  return map
}
