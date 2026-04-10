import { parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import type { Refueling } from '@/types/vehicles'
import type { MonthlyConsumption } from '@/types/home'

/**
 * Sum fuelAmount for refuelings where chargedAtHome === true.
 * Optionally filter to a date range (inclusive on both ends).
 */
export function getHomeChargingKwh(
  refuelings: Refueling[],
  startDate?: Date,
  endDate?: Date,
): number {
  return refuelings
    .filter((r) => {
      if (!r.chargedAtHome) return false
      if (startDate && endDate) {
        const d = parseISO(r.date)
        return isWithinInterval(d, {
          start: startOfDay(startDate),
          end: endOfDay(endDate),
        })
      }
      return true
    })
    .reduce((sum, r) => sum + r.fuelAmount, 0)
}

/**
 * Group home-charging refuelings by month/year,
 * returning sorted array of { month, year, kwh }.
 */
export function getMonthlyHomeChargingKwh(
  refuelings: Refueling[],
): { month: string; year: number; kwh: number }[] {
  const map = new Map<string, { month: string; year: number; kwh: number }>()

  for (const r of refuelings) {
    if (!r.chargedAtHome) continue
    const d = parseISO(r.date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const key = `${year}-${month}`
    const existing = map.get(key)
    if (existing) {
      existing.kwh += r.fuelAmount
    } else {
      map.set(key, { month, year, kwh: r.fuelAmount })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.year - b.year || a.month.localeCompare(b.month),
  )
}

/**
 * Subtract EV home-charging kWh from monthly electricity consumption.
 * Consumption never goes below 0. Returns a new array (no mutation).
 */
export function adjustConsumptionForEvCharging(
  monthlyConsumption: MonthlyConsumption[],
  homeChargingKwh: { month: string; year: number; kwh: number }[],
): MonthlyConsumption[] {
  const chargingMap = new Map<string, number>()
  for (const entry of homeChargingKwh) {
    chargingMap.set(`${entry.year}-${entry.month}`, entry.kwh)
  }

  return monthlyConsumption.map((mc) => {
    const key = mc.month
    const kwh = chargingMap.get(key) ?? 0
    return {
      ...mc,
      consumption: Math.max(0, mc.consumption - kwh),
    }
  })
}
