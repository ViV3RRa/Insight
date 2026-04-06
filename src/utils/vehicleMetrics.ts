import { parseISO, differenceInCalendarDays, startOfYear, endOfMonth, addMonths, startOfMonth } from 'date-fns'
import type { Refueling, MaintenanceEvent, Vehicle, VehicleMetrics, TotalCostOfOwnership } from '@/types/vehicles'
import { calculateWeightedEfficiency, calculateYearEfficiency, calculateRolling5Efficiency } from './fuelEfficiency'

// --- Distance Calculations (US-112) ---

function sortByDate(refuelings: Refueling[]): Refueling[] {
  return [...refuelings].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
}

export function calculateTotalKmDriven(refuelings: Refueling[]): number {
  if (refuelings.length < 2) return 0
  const sorted = sortByDate(refuelings)
  return sorted[sorted.length - 1]!.odometerReading - sorted[0]!.odometerReading
}

export function calculateYearlyKm(refuelings: Refueling[]): { year: number; km: number }[] {
  if (refuelings.length < 2) return []
  const sorted = sortByDate(refuelings)

  // Group refuelings by calendar year
  const byYear = new Map<number, Refueling[]>()
  for (const r of sorted) {
    const year = parseISO(r.date).getFullYear()
    const list = byYear.get(year) ?? []
    list.push(r)
    byYear.set(year, list)
  }

  const years = [...byYear.keys()].sort((a, b) => a - b)
  const results: { year: number; km: number }[] = []

  for (let i = 0; i < years.length; i++) {
    const year = years[i]!
    const yearRefuelings = byYear.get(year)!
    const lastInYear = yearRefuelings[yearRefuelings.length - 1]!

    let startOdometer: number
    if (i === 0) {
      // First year: use first overall reading as baseline
      startOdometer = sorted[0]!.odometerReading
    } else {
      // Subsequent years: use last reading from previous year
      const prevYear = years[i - 1]!
      const prevYearRefuelings = byYear.get(prevYear)!
      startOdometer = prevYearRefuelings[prevYearRefuelings.length - 1]!.odometerReading
    }

    const km = lastInYear.odometerReading - startOdometer
    if (km > 0) {
      results.push({ year, km })
    }
  }

  return results
}

export function calculateYtdKm(refuelings: Refueling[]): number {
  if (refuelings.length === 0) return 0

  const sorted = sortByDate(refuelings)
  const now = new Date()
  const currentYear = now.getFullYear()
  const jan1 = startOfYear(now)

  const currentYearRefuelings = sorted.filter(
    (r) => parseISO(r.date).getFullYear() === currentYear,
  )

  if (currentYearRefuelings.length === 0) return 0

  const lastCurrentYear = currentYearRefuelings[currentYearRefuelings.length - 1]!

  // Find reference odometer at start of year
  const beforeJan1 = sorted.filter((r) => parseISO(r.date) < jan1)

  if (beforeJan1.length === 0) {
    // All refuelings are in current year — need at least 2 to compute distance
    if (currentYearRefuelings.length < 2) return 0
    return lastCurrentYear.odometerReading - currentYearRefuelings[0]!.odometerReading
  }

  // We have a refueling before Jan 1 — interpolate odometer at Jan 1
  const lastBefore = beforeJan1[beforeJan1.length - 1]!
  const firstOnOrAfter = currentYearRefuelings[0]!

  const dateBefore = parseISO(lastBefore.date)
  const dateAfter = parseISO(firstOnOrAfter.date)
  const totalDays = differenceInCalendarDays(dateAfter, dateBefore)

  let jan1Odometer: number
  if (totalDays === 0) {
    jan1Odometer = lastBefore.odometerReading
  } else {
    const daysToJan1 = differenceInCalendarDays(jan1, dateBefore)
    const fraction = daysToJan1 / totalDays
    jan1Odometer =
      lastBefore.odometerReading +
      fraction * (firstOnOrAfter.odometerReading - lastBefore.odometerReading)
  }

  return lastCurrentYear.odometerReading - jan1Odometer
}

export function calculateMonthlyKm(
  refuelings: Refueling[],
): { month: string; year: number; km: number }[] {
  if (refuelings.length < 2) return []

  const sorted = sortByDate(refuelings)
  const results: { month: string; year: number; km: number }[] = []

  // Walk consecutive pairs and distribute km across months
  const monthMap = new Map<string, number>()

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!
    const b = sorted[i + 1]!
    const dateA = parseISO(a.date)
    const dateB = parseISO(b.date)
    const deltaKm = b.odometerReading - a.odometerReading
    const totalDays = differenceInCalendarDays(dateB, dateA)

    if (totalDays <= 0 || deltaKm <= 0) continue

    // Distribute km proportionally across months between dateA and dateB
    const boundaries: Date[] = [dateA]
    let current = dateA
    while (endOfMonth(current) < dateB) {
      boundaries.push(endOfMonth(current))
      current = startOfMonth(addMonths(current, 1))
    }
    boundaries.push(dateB)

    for (let j = 0; j < boundaries.length - 1; j++) {
      const segStart = boundaries[j]!
      const segEnd = boundaries[j + 1]!
      const days = differenceInCalendarDays(segEnd, segStart)
      if (days <= 0) continue

      const km = deltaKm * (days / totalDays)

      // Determine which month this segment belongs to
      // First segment belongs to dateA's month; subsequent segments belong to
      // the month after the endOfMonth boundary they start from
      const monthDate = j === 0 ? segStart : addMonths(startOfMonth(segStart), 1)
      const year = monthDate.getFullYear()
      const monthStr = String(monthDate.getMonth() + 1).padStart(2, '0')
      const key = `${year}-${monthStr}`

      monthMap.set(key, (monthMap.get(key) ?? 0) + km)
    }
  }

  // Sort by key (YYYY-MM) and convert to output format
  const sortedKeys = [...monthMap.keys()].sort()
  for (const key of sortedKeys) {
    const [yearStr, monthStr] = key.split('-')
    results.push({
      month: monthStr!,
      year: Number(yearStr),
      km: monthMap.get(key)!,
    })
  }

  return results
}

// --- Cost Calculations (US-113) ---

export function calculateFuelCost(
  refuelings: Refueling[],
  startDate?: Date,
  endDate?: Date,
): number {
  return refuelings.reduce((sum, r) => {
    if (startDate || endDate) {
      const d = parseISO(r.date)
      if (startDate && d < startDate) return sum
      if (endDate && d > endDate) return sum
    }
    return sum + r.totalCost
  }, 0)
}

export function calculateAvgFuelCostPerMonth(refuelings: Refueling[]): number | null {
  if (refuelings.length < 2) return null
  const sorted = sortByDate(refuelings)
  const first = parseISO(sorted[0]!.date)
  const last = parseISO(sorted[sorted.length - 1]!.date)
  const days = differenceInCalendarDays(last, first)
  if (days === 0) return null
  const months = days / 30.4375
  const totalCost = refuelings.reduce((sum, r) => sum + r.totalCost, 0)
  return totalCost / months
}

export function calculateAvgFuelCostPerDay(refuelings: Refueling[]): number | null {
  if (refuelings.length < 2) return null
  const sorted = sortByDate(refuelings)
  const first = parseISO(sorted[0]!.date)
  const last = parseISO(sorted[sorted.length - 1]!.date)
  const days = differenceInCalendarDays(last, first)
  if (days === 0) return null
  const totalCost = refuelings.reduce((sum, r) => sum + r.totalCost, 0)
  return totalCost / days
}

export function calculateAvgCostPerUnit(refuelings: Refueling[]): number | null {
  if (refuelings.length === 0) return null
  let totalCost = 0
  let totalFuel = 0
  for (const r of refuelings) {
    totalCost += r.totalCost
    totalFuel += r.fuelAmount
  }
  if (totalFuel === 0) return null
  return totalCost / totalFuel
}

export function calculateMonthlyFuelCost(
  refuelings: Refueling[],
): { month: string; year: number; cost: number }[] {
  const monthMap = new Map<string, number>()

  for (const r of refuelings) {
    const d = parseISO(r.date)
    const year = d.getFullYear()
    const monthStr = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${monthStr}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + r.totalCost)
  }

  return [...monthMap.keys()]
    .sort()
    .map((key) => {
      const [yearStr, monthStr] = key.split('-')
      return { month: monthStr!, year: Number(yearStr), cost: monthMap.get(key)! }
    })
}

export function calculateMaintenanceCost(
  events: MaintenanceEvent[],
  startDate?: Date,
  endDate?: Date,
): number {
  return events.reduce((sum, e) => {
    if (startDate || endDate) {
      const d = parseISO(e.date)
      if (startDate && d < startDate) return sum
      if (endDate && d > endDate) return sum
    }
    return sum + e.cost
  }, 0)
}

export function calculateYearlyMaintenanceCost(
  events: MaintenanceEvent[],
): { year: number; cost: number }[] {
  const yearMap = new Map<number, number>()

  for (const e of events) {
    const year = parseISO(e.date).getFullYear()
    yearMap.set(year, (yearMap.get(year) ?? 0) + e.cost)
  }

  return [...yearMap.keys()]
    .sort((a, b) => a - b)
    .map((year) => ({ year, cost: yearMap.get(year)! }))
}

export function calculateMonthlyMaintenanceCost(
  events: MaintenanceEvent[],
): { month: string; year: number; cost: number }[] {
  const monthMap = new Map<string, number>()

  for (const e of events) {
    const d = parseISO(e.date)
    const year = d.getFullYear()
    const monthStr = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${monthStr}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + e.cost)
  }

  return [...monthMap.keys()]
    .sort()
    .map((key) => {
      const [yearStr, monthStr] = key.split('-')
      return { month: monthStr!, year: Number(yearStr), cost: monthMap.get(key)! }
    })
}

export function calculateTotalVehicleCost(
  refuelings: Refueling[],
  events: MaintenanceEvent[],
  startDate?: Date,
  endDate?: Date,
): number {
  return (
    calculateFuelCost(refuelings, startDate, endDate) +
    calculateMaintenanceCost(events, startDate, endDate)
  )
}

export function calculateTotalCostOfOwnership(
  vehicle: Vehicle,
  refuelings: Refueling[],
  events: MaintenanceEvent[],
): TotalCostOfOwnership | null {
  if (refuelings.length === 0 && events.length === 0) return null

  const lifetimeFuelCost = refuelings.reduce((sum, r) => sum + r.totalCost, 0)
  const lifetimeMaintenanceCost = events.reduce((sum, e) => sum + e.cost, 0)

  return {
    lifetimeFuelCost,
    lifetimeMaintenanceCost,
    totalOperatingCost: lifetimeFuelCost + lifetimeMaintenanceCost,
    purchaseToSaleOffset: (vehicle.salePrice ?? 0) - (vehicle.purchasePrice ?? 0),
  }
}

export function calculateVehicleMetrics(
  vehicle: Vehicle,
  refuelings: Refueling[],
  events: MaintenanceEvent[],
): VehicleMetrics {
  const now = new Date()
  const currentYear = now.getFullYear()

  return {
    allTimeEfficiency: calculateWeightedEfficiency(refuelings),
    currentYearEfficiency: calculateYearEfficiency(refuelings, currentYear),
    rolling5Efficiency: calculateRolling5Efficiency(refuelings),
    ytdKmDriven: calculateYtdKm(refuelings),
    ytdFuelCost: calculateFuelCost(refuelings, startOfYear(now), now),
    avgFuelCostPerMonth: calculateAvgFuelCostPerMonth(refuelings),
    avgFuelCostPerDay: calculateAvgFuelCostPerDay(refuelings),
    totalMaintenanceCost: calculateMaintenanceCost(events),
    totalVehicleCost: calculateTotalVehicleCost(refuelings, events),
    totalCostOfOwnership: calculateTotalCostOfOwnership(vehicle, refuelings, events),
  }
}
