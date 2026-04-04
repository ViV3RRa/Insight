import { parseISO } from 'date-fns'
import type { DataPoint } from '@/types/investment'

export type InterpolatedPoint = {
  platformId: string
  value: number
  timestamp: string // ISO datetime
  isInterpolated: true
}

/**
 * Linear interpolation between two data points for a target date.
 */
export function interpolateMonthEndValue(
  prevValue: number,
  prevDate: Date,
  nextValue: number,
  nextDate: Date,
  targetDate: Date,
): number {
  const totalMs = nextDate.getTime() - prevDate.getTime()
  const elapsedMs = targetDate.getTime() - prevDate.getTime()
  const ratio = elapsedMs / totalMs
  return prevValue + (nextValue - prevValue) * ratio
}

/**
 * Returns the last day of the given month as a UTC midnight date.
 * Month is 1-indexed (1 = January, 12 = December).
 */
export function getMonthEndDate(year: number, month: number): Date {
  // Date.UTC(year, month, 0) gives the last day of the previous month (0-indexed),
  // so month (1-indexed) maps correctly: month=1 → Date.UTC(year, 1, 0) → Jan 31
  return new Date(Date.UTC(year, month, 0))
}

/**
 * Returns true if a UTC date falls on the last day of its month.
 */
function isMonthEnd(date: Date): boolean {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth()
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return date.getUTCDate() === lastDay
}

/**
 * Given sorted data points, identify month-end dates that fall between
 * consecutive data points but have no actual data point recorded.
 * All dates are treated as UTC.
 */
export function findMissingMonthEnds(dataPoints: DataPoint[]): Date[] {
  if (dataPoints.length < 2) return []

  const dates = dataPoints.map((dp) => parseISO(dp.timestamp))
  const monthEndDates = new Set(
    dataPoints.filter((dp) => isMonthEnd(parseISO(dp.timestamp))).map((dp) => {
      const d = parseISO(dp.timestamp)
      return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    }),
  )

  const missing: Date[] = []
  const earliest = dates[0]
  const latest = dates[dates.length - 1]

  if (!earliest || !latest) return missing

  // Walk month-by-month from the month of earliest to the month of latest
  let year = earliest.getUTCFullYear()
  let month = earliest.getUTCMonth() // 0-indexed

  const latestYear = latest.getUTCFullYear()
  const latestMonth = latest.getUTCMonth()

  while (year < latestYear || (year === latestYear && month <= latestMonth)) {
    const monthEnd = getMonthEndDate(year, month + 1) // +1 because getMonthEndDate is 1-indexed

    // Only consider month-ends strictly between earliest and latest data points
    if (monthEnd.getTime() > earliest.getTime() && monthEnd.getTime() < latest.getTime()) {
      const key = `${monthEnd.getUTCFullYear()}-${monthEnd.getUTCMonth()}`
      if (!monthEndDates.has(key)) {
        missing.push(monthEnd)
      }
    }

    // Advance to next month
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return missing
}

/**
 * Finds surrounding data points and computes the interpolated value for a target date.
 * Returns null if interpolation is impossible (fewer than 2 data points, or target outside range).
 */
export function computeInterpolatedPoint(
  dataPoints: DataPoint[],
  targetDate: Date,
): InterpolatedPoint | null {
  if (dataPoints.length < 2) return null

  const targetMs = targetDate.getTime()

  // Find the bracketing data points
  let prev: DataPoint | null = null
  let next: DataPoint | null = null

  for (const dp of dataPoints) {
    const dpMs = parseISO(dp.timestamp).getTime()
    if (dpMs <= targetMs) {
      prev = dp
    } else if (dpMs > targetMs && next === null) {
      next = dp
    }
  }

  if (!prev || !next) return null

  const value = interpolateMonthEndValue(
    prev.value,
    parseISO(prev.timestamp),
    next.value,
    parseISO(next.timestamp),
    targetDate,
  )

  return {
    platformId: prev.platformId as string,
    value,
    timestamp: targetDate.toISOString(),
    isInterpolated: true,
  }
}

/**
 * Scans all data points for missing month-end boundaries and returns
 * interpolated points ready to save.
 */
export function generateInterpolatedPoints(
  dataPoints: DataPoint[],
  platformId: string,
): InterpolatedPoint[] {
  if (dataPoints.length < 2) return []

  // Work with only actual (non-interpolated) data points, sorted by timestamp
  const actual = dataPoints
    .filter((dp) => !dp.isInterpolated)
    .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime())

  if (actual.length < 2) return []

  const missingEnds = findMissingMonthEnds(actual)
  const results: InterpolatedPoint[] = []

  for (const targetDate of missingEnds) {
    const point = computeInterpolatedPoint(actual, targetDate)
    if (point) {
      results.push({ ...point, platformId })
    }
  }

  return results
}

/**
 * Called after a new data point is created.
 * Returns interpolated points that need to be saved.
 */
export function onDataPointCreated(
  dataPoints: DataPoint[],
  newPoint: DataPoint,
): InterpolatedPoint[] {
  // Include the new point in the full set, excluding old interpolated points
  const actual = [...dataPoints.filter((dp) => !dp.isInterpolated), newPoint]
    .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime())

  if (actual.length < 2) return []

  return generateInterpolatedPoints(actual, newPoint.platformId as string)
}

/**
 * Called after a data point is deleted.
 * Returns re-interpolated points that need to be saved (caller should delete old interpolated points first).
 */
export function onDataPointDeleted(
  dataPoints: DataPoint[],
  deletedPoint: DataPoint,
): InterpolatedPoint[] {
  // Remove the deleted point and all interpolated points, then regenerate
  const remaining = dataPoints.filter(
    (dp) => dp.id !== deletedPoint.id && !dp.isInterpolated,
  )
  return generateInterpolatedPoints(remaining, deletedPoint.platformId as string)
}

/**
 * Called after a data point is updated.
 * Returns updated interpolated points (caller should delete old interpolated points first).
 */
export function onDataPointUpdated(
  dataPoints: DataPoint[],
  updatedPoint: DataPoint,
): InterpolatedPoint[] {
  // Replace the old version with the updated one, exclude interpolated points
  const actual = dataPoints
    .filter((dp) => dp.id !== updatedPoint.id && !dp.isInterpolated)
    .concat(updatedPoint)
    .sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime())

  return generateInterpolatedPoints(actual, updatedPoint.platformId as string)
}
