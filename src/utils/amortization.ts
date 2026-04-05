import { parseISO, startOfMonth, addMonths, isBefore, format, isWithinInterval } from 'date-fns'
import type { UtilityBill, MonthlyCost } from '@/types/home'

/**
 * Count the number of distinct calendar months touched between two dates (inclusive).
 */
function countCalendarMonths(start: Date, end: Date): number {
  let count = 0
  let current = startOfMonth(start)
  const endMonth = startOfMonth(end)

  while (!isBefore(endMonth, current)) {
    count++
    current = addMonths(current, 1)
  }

  return count
}

/**
 * Distribute a bill's amount equally across all calendar months it covers.
 */
export function amortizeBill(bill: UtilityBill): MonthlyCost[] {
  const start = parseISO(bill.periodStart)
  const end = parseISO(bill.periodEnd)
  const monthCount = countCalendarMonths(start, end)
  const amortizedAmount = bill.amount / monthCount

  const results: MonthlyCost[] = []
  let current = startOfMonth(start)

  for (let i = 0; i < monthCount; i++) {
    const monthKey = format(current, 'yyyy-MM')
    results.push({
      month: monthKey,
      year: current.getFullYear(),
      cost: amortizedAmount,
    })
    current = addMonths(current, 1)
  }

  return results
}

/**
 * Amortize all bills and aggregate costs per month, sorted chronologically.
 */
export function amortizeAllBills(bills: UtilityBill[]): MonthlyCost[] {
  const monthMap = new Map<string, number>()

  for (const bill of bills) {
    const entries = amortizeBill(bill)
    for (const entry of entries) {
      monthMap.set(entry.month, (monthMap.get(entry.month) ?? 0) + entry.cost)
    }
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cost]) => ({
      month,
      year: parseInt(month.substring(0, 4), 10),
      cost,
    }))
}

/**
 * Get the total amortized cost for a specific month.
 */
export function getMonthlyCost(bills: UtilityBill[], month: string, year: number): number {
  const allAmortized = amortizeAllBills(bills)
  const target = month
  const entry = allAmortized.find((e) => e.month === target && e.year === year)
  return entry?.cost ?? 0
}

/**
 * Sum amortized costs for all months within [startDate, endDate].
 */
export function getCostForPeriod(bills: UtilityBill[], startDate: Date, endDate: Date): number {
  const allAmortized = amortizeAllBills(bills)

  return allAmortized.reduce((sum, entry) => {
    const entryDate = parseISO(`${entry.month}-01`)
    if (
      isWithinInterval(entryDate, {
        start: startOfMonth(startDate),
        end: startOfMonth(endDate),
      })
    ) {
      return sum + entry.cost
    }
    return sum
  }, 0)
}
