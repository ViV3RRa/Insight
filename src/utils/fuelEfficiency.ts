import type { Refueling } from '@/types/vehicles'

/**
 * Sort refuelings by date ascending, then by odometer as tiebreaker.
 */
function sortByDate(refuelings: Refueling[]): Refueling[] {
  return [...refuelings].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date)
    if (dateDiff !== 0) return dateDiff
    return a.odometerReading - b.odometerReading
  })
}

type Interval = { distance: number; fuel: number; date: string }

/**
 * Extract valid intervals from sorted refuelings.
 * Each interval is the distance and fuel between consecutive refuelings.
 * Skips pairs with distance <= 0 or fuel === 0.
 */
function extractIntervals(sorted: Refueling[]): Interval[] {
  const intervals: Interval[] = []
  for (let i = 1; i < sorted.length; i++) {
    const distance = sorted[i]!.odometerReading - sorted[i - 1]!.odometerReading
    const fuel = sorted[i]!.fuelAmount
    if (distance <= 0 || fuel === 0) continue
    intervals.push({ distance, fuel, date: sorted[i]!.date })
  }
  return intervals
}

/**
 * Compute weighted efficiency from intervals: totalDistance / totalFuel.
 */
function weightedFromIntervals(intervals: Interval[]): number | null {
  if (intervals.length === 0) return null
  let totalDistance = 0
  let totalFuel = 0
  for (const { distance, fuel } of intervals) {
    totalDistance += distance
    totalFuel += fuel
  }
  if (totalFuel === 0) return null
  return totalDistance / totalFuel
}

/**
 * All-time weighted fuel efficiency (km/l or km/kWh).
 *
 * CRITICAL: This is a weighted average (totalKm / totalFuel),
 * NOT an arithmetic mean of per-refueling ratios.
 *
 * Returns null if < 2 refuelings or no valid intervals.
 */
export function calculateWeightedEfficiency(refuelings: Refueling[]): number | null {
  if (refuelings.length < 2) return null
  const sorted = sortByDate(refuelings)
  return weightedFromIntervals(extractIntervals(sorted))
}

/**
 * Weighted fuel efficiency for a specific year.
 *
 * Includes intervals where the second refueling's date falls in the given year.
 * The first refueling of a pair may be from the prior year (baseline).
 *
 * Returns null if no valid intervals fall in the year.
 */
export function calculateYearEfficiency(refuelings: Refueling[], year: number): number | null {
  if (refuelings.length < 2) return null
  const sorted = sortByDate(refuelings)
  const intervals = extractIntervals(sorted)
  const yearIntervals = intervals.filter((iv) => {
    const ivYear = new Date(iv.date).getFullYear()
    return ivYear === year
  })
  return weightedFromIntervals(yearIntervals)
}

/**
 * Rolling 5-interval weighted efficiency (last 6 refuelings = 5 intervals).
 *
 * Returns null if < 6 refuelings.
 */
export function calculateRolling5Efficiency(refuelings: Refueling[]): number | null {
  if (refuelings.length < 6) return null
  const sorted = sortByDate(refuelings)
  const last6 = sorted.slice(-6)
  return weightedFromIntervals(extractIntervals(last6))
}

/**
 * Per-refueling efficiency for charting.
 *
 * Returns an array of { date, efficiency, fuelAmount } for each valid interval.
 * Skips first refueling (no prior baseline), negative distances, and zero fuel.
 */
export function calculatePerRefuelingEfficiency(
  refuelings: Refueling[],
): { date: string; efficiency: number; fuelAmount: number }[] {
  if (refuelings.length < 2) return []
  const sorted = sortByDate(refuelings)
  const results: { date: string; efficiency: number; fuelAmount: number }[] = []
  for (let i = 1; i < sorted.length; i++) {
    const distance = sorted[i]!.odometerReading - sorted[i - 1]!.odometerReading
    const fuel = sorted[i]!.fuelAmount
    if (distance <= 0 || fuel === 0) continue
    results.push({
      date: sorted[i]!.date,
      efficiency: distance / fuel,
      fuelAmount: fuel,
    })
  }
  return results
}
