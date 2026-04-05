import {
  parseISO,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  format,
  isSameMonth,
  isWithinInterval,
} from 'date-fns'
import type { MeterReading, MonthlyConsumption } from '@/types/home'

type MonthEntry = { month: string; year: number; consumption: number }

/**
 * Distributes consumption between two consecutive readings across the months they span.
 * Uses linear interpolation proportional to calendar days.
 */
export function interpolateConsumption(
  readingA: MeterReading,
  readingB: MeterReading,
): MonthEntry[] {
  const dateA = parseISO(readingA.timestamp)
  const dateB = parseISO(readingB.timestamp)
  const delta = readingB.value - readingA.value

  if (delta <= 0) return []

  const totalDays = differenceInCalendarDays(dateB, dateA)
  if (totalDays <= 0) return []

  // If both readings fall in the same month, assign entire delta there
  if (isSameMonth(dateA, dateB)) {
    return [
      {
        month: format(dateA, 'yyyy-MM'),
        year: dateA.getFullYear(),
        consumption: delta,
      },
    ]
  }

  // Cross-month: split at endOfMonth boundaries and distribute proportionally.
  // Boundary points: [dateA, endOfMonth(m1), endOfMonth(m2), ..., dateB]
  // Each segment [boundary[i], boundary[i+1]] gets differenceInCalendarDays days.
  // The first segment belongs to dateA's month. Subsequent segments belong
  // to the month after the endOfMonth boundary they start from.
  const boundaries: Date[] = [dateA]
  let current = dateA
  while (endOfMonth(current) < dateB) {
    boundaries.push(endOfMonth(current))
    current = startOfMonth(addMonths(current, 1))
  }
  boundaries.push(dateB)

  const entries: MonthEntry[] = []
  for (let i = 0; i < boundaries.length - 1; i++) {
    const segStart = boundaries[i]!
    const segEnd = boundaries[i + 1]!
    const days = differenceInCalendarDays(segEnd, segStart)

    if (days <= 0) continue

    // First segment → month of dateA. Subsequent segments → next month after the endOfMonth boundary.
    const monthDate =
      i === 0 ? dateA : startOfMonth(addMonths(segStart!, 1))
    entries.push({
      month: format(monthDate, 'yyyy-MM'),
      year: monthDate.getFullYear(),
      consumption: delta * (days / totalDays),
    })
  }

  return entries
}

/**
 * Calculates monthly consumption from sorted meter readings.
 * - Consecutive reading pairs produce deltas distributed across months.
 * - Same-month pairs: isInterpolated = false.
 * - Cross-month pairs: isInterpolated = true.
 * - Negative deltas (meter resets) are skipped.
 * - Multiple readings per month: consumption values are summed.
 */
export function calculateMonthlyConsumption(
  readings: MeterReading[],
): MonthlyConsumption[] {
  if (readings.length < 2) return []

  // Accumulator: month key → { consumption, isInterpolated }
  const monthMap = new Map<
    string,
    { year: number; consumption: number; isInterpolated: boolean }
  >()

  for (let i = 0; i < readings.length - 1; i++) {
    const a = readings[i]!
    const b = readings[i + 1]!
    const delta = b.value - a.value

    // Skip negative deltas (meter reset)
    if (delta < 0) continue

    const dateA = parseISO(a.timestamp)
    const dateB = parseISO(b.timestamp)
    const sameMonth = isSameMonth(dateA, dateB)

    const entries = interpolateConsumption(a, b)

    for (const entry of entries) {
      const existing = monthMap.get(entry.month)
      if (existing) {
        existing.consumption += entry.consumption
        // If any interval contributing to this month is cross-month, mark interpolated
        if (!sameMonth) {
          existing.isInterpolated = true
        }
      } else {
        monthMap.set(entry.month, {
          year: entry.year,
          consumption: entry.consumption,
          isInterpolated: !sameMonth,
        })
      }
    }
  }

  // Convert to sorted array
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      year: data.year,
      consumption: data.consumption,
      isInterpolated: data.isInterpolated,
    }))
}

/**
 * Sums consumption for months within the given date range (inclusive).
 */
export function getConsumptionForPeriod(
  monthlyData: MonthlyConsumption[],
  startDate: Date,
  endDate: Date,
): number {
  return monthlyData
    .filter((entry) => {
      // Parse the "YYYY-MM" month key to a date representing the 1st of that month
      const monthDate = parseISO(`${entry.month}-01`)
      return isWithinInterval(monthDate, { start: startOfMonth(startDate), end: endOfMonth(endDate) })
    })
    .reduce((sum, entry) => sum + entry.consumption, 0)
}
