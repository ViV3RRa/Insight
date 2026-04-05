import { format, startOfYear } from 'date-fns'
import type {
  MeterReading,
  UtilityBill,
  MonthlyConsumption,
  MonthlyCost,
  UtilityMetrics,
} from '@/types/home'
import { calculateMonthlyConsumption } from './consumption'
import { amortizeAllBills } from './amortization'

type MonthlyCostPerUnit = { month: string; year: number; costPerUnit: number | null }

/**
 * Join consumption and cost by month key. costPerUnit = cost / consumption.
 * Returns null when consumption is 0 or either side is missing.
 */
export function calculateMonthlyCostPerUnit(
  monthlyConsumption: MonthlyConsumption[],
  monthlyCosts: MonthlyCost[],
): MonthlyCostPerUnit[] {
  const costMap = new Map<string, number>()
  for (const c of monthlyCosts) {
    costMap.set(c.month, c.cost)
  }

  const consumptionMap = new Map<string, { year: number; consumption: number }>()
  for (const c of monthlyConsumption) {
    consumptionMap.set(c.month, { year: c.year, consumption: c.consumption })
  }

  // Union of all month keys
  const allMonths = new Set([...costMap.keys(), ...consumptionMap.keys()])
  const sorted = Array.from(allMonths).sort()

  return sorted.map((month) => {
    const cost = costMap.get(month)
    const cons = consumptionMap.get(month)
    const year = cons?.year ?? parseInt(month.substring(0, 4), 10)

    if (cost === undefined || cons === undefined || cons.consumption === 0) {
      return { month, year, costPerUnit: null }
    }

    return { month, year, costPerUnit: cost / cons.consumption }
  })
}

/**
 * Weighted average cost per unit: totalCost / totalConsumption for the period.
 * If startDate/endDate provided, filter to months within range.
 * Returns null if total consumption is 0.
 */
export function calculateAverageCostPerUnit(
  monthlyConsumption: MonthlyConsumption[],
  monthlyCosts: MonthlyCost[],
  startDate?: Date,
  endDate?: Date,
): number | null {
  let filteredConsumption = monthlyConsumption
  let filteredCosts = monthlyCosts

  if (startDate && endDate) {
    const startKey = format(startDate, 'yyyy-MM')
    const endKey = format(endDate, 'yyyy-MM')
    filteredConsumption = monthlyConsumption.filter(
      (c) => c.month >= startKey && c.month <= endKey,
    )
    filteredCosts = monthlyCosts.filter(
      (c) => c.month >= startKey && c.month <= endKey,
    )
  }

  const totalConsumption = filteredConsumption.reduce((sum, c) => sum + c.consumption, 0)
  const totalCost = filteredCosts.reduce((sum, c) => sum + c.cost, 0)

  if (totalConsumption === 0) return null

  return totalCost / totalConsumption
}

/**
 * Assembles all utility metrics from raw readings and bills.
 * Thin compositor — delegates to calculateMonthlyConsumption and amortizeAllBills.
 */
export function calculateUtilityMetrics(
  readings: MeterReading[],
  bills: UtilityBill[],
): UtilityMetrics {
  const now = new Date()
  const currentMonthKey = format(now, 'yyyy-MM')
  const ytdStartKey = format(startOfYear(now), 'yyyy-MM')

  const monthlyConsumption = calculateMonthlyConsumption(readings)
  const monthlyCost = amortizeAllBills(bills)
  const monthlyCostPerUnit = calculateMonthlyCostPerUnit(monthlyConsumption, monthlyCost)

  // YTD sums
  const ytdConsumption = monthlyConsumption
    .filter((c) => c.month >= ytdStartKey && c.month <= currentMonthKey)
    .reduce((sum, c) => sum + c.consumption, 0)

  const ytdCost = monthlyCost
    .filter((c) => c.month >= ytdStartKey && c.month <= currentMonthKey)
    .reduce((sum, c) => sum + c.cost, 0)

  // Current month
  const currentConsEntry = monthlyConsumption.find((c) => c.month === currentMonthKey)
  const currentCostEntry = monthlyCost.find((c) => c.month === currentMonthKey)
  const currentCpuEntry = monthlyCostPerUnit.find((c) => c.month === currentMonthKey)

  const currentMonthConsumption = currentConsEntry?.consumption ?? null
  const currentMonthCost = currentCostEntry?.cost ?? null
  const currentMonthCostPerUnit = currentCpuEntry?.costPerUnit ?? null

  // Average monthly cost for current year so far
  const ytdCostEntries = monthlyCost.filter(
    (c) => c.month >= ytdStartKey && c.month <= currentMonthKey,
  )
  const avgMonthlyCost =
    ytdCostEntries.length > 0
      ? ytdCostEntries.reduce((sum, c) => sum + c.cost, 0) / ytdCostEntries.length
      : null

  // Cost trend: compare avg of last 3 months vs same 3 months last year
  const costTrend = calculateCostTrend(monthlyCost, now)

  return {
    monthlyConsumption,
    monthlyCost,
    monthlyCostPerUnit,
    ytdConsumption,
    ytdCost,
    currentMonthConsumption,
    currentMonthCost,
    currentMonthCostPerUnit,
    avgMonthlyCost,
    costTrend,
  }
}

function calculateCostTrend(
  monthlyCost: MonthlyCost[],
  now: Date,
): 'up' | 'down' | 'flat' | null {
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1-based

  // Last 3 months (including current)
  const recentMonths: string[] = []
  const priorYearMonths: string[] = []

  for (let i = 0; i < 3; i++) {
    let m = currentMonth - i
    let y = currentYear
    if (m <= 0) {
      m += 12
      y -= 1
    }
    const key = `${y}-${String(m).padStart(2, '0')}`
    recentMonths.push(key)

    const pyKey = `${y - 1}-${String(m).padStart(2, '0')}`
    priorYearMonths.push(pyKey)
  }

  const costMap = new Map<string, number>()
  for (const c of monthlyCost) {
    costMap.set(c.month, c.cost)
  }

  const recentCosts = recentMonths.map((k) => costMap.get(k)).filter((v): v is number => v !== undefined)
  const priorCosts = priorYearMonths.map((k) => costMap.get(k)).filter((v): v is number => v !== undefined)

  if (recentCosts.length === 0 || priorCosts.length === 0) return null

  const recentAvg = recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length
  const priorAvg = priorCosts.reduce((a, b) => a + b, 0) / priorCosts.length

  if (priorAvg === 0) return null

  const changePercent = ((recentAvg - priorAvg) / priorAvg) * 100

  if (changePercent > 5) return 'up'
  if (changePercent < -5) return 'down'
  return 'flat'
}
