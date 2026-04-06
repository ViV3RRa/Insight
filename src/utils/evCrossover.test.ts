import { describe, it, expect } from 'vitest'
import { buildRefueling } from '@/test/factories'
import type { MonthlyConsumption } from '@/types/home'
import {
  getHomeChargingKwh,
  getMonthlyHomeChargingKwh,
  adjustConsumptionForEvCharging,
} from './evCrossover'

describe('getHomeChargingKwh', () => {
  it('sums fuelAmount for chargedAtHome=true refuelings', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 30 }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 25 }),
    ]
    expect(getHomeChargingKwh(refuelings)).toBe(55)
  })

  it('ignores chargedAtHome=false refuelings', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 30 }),
      buildRefueling({ chargedAtHome: false, fuelAmount: 50 }),
    ]
    expect(getHomeChargingKwh(refuelings)).toBe(30)
  })

  it('returns 0 for empty array', () => {
    expect(getHomeChargingKwh([])).toBe(0)
  })

  it('returns 0 when no refuelings are chargedAtHome', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: false, fuelAmount: 50 }),
    ]
    expect(getHomeChargingKwh(refuelings)).toBe(0)
  })

  it('filters by date range (inclusive)', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2026-01-01' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 20, date: '2026-01-15' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 30, date: '2026-02-01' }),
    ]
    const start = new Date(2026, 0, 1) // Jan 1
    const end = new Date(2026, 0, 31) // Jan 31
    expect(getHomeChargingKwh(refuelings, start, end)).toBe(30)
  })

  it('includes refuelings on the boundary dates', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 15, date: '2026-03-01' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 25, date: '2026-03-31' }),
    ]
    const start = new Date(2026, 2, 1)
    const end = new Date(2026, 2, 31)
    expect(getHomeChargingKwh(refuelings, start, end)).toBe(40)
  })

  it('excludes chargedAtHome=false even within date range', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2026-01-10' }),
      buildRefueling({ chargedAtHome: false, fuelAmount: 50, date: '2026-01-15' }),
    ]
    const start = new Date(2026, 0, 1)
    const end = new Date(2026, 0, 31)
    expect(getHomeChargingKwh(refuelings, start, end)).toBe(10)
  })
})

describe('getMonthlyHomeChargingKwh', () => {
  it('groups home-charging refuelings by month/year', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2026-01-05' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 20, date: '2026-01-20' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 15, date: '2026-02-10' }),
    ]
    const result = getMonthlyHomeChargingKwh(refuelings)
    expect(result).toEqual([
      { month: '01', year: 2026, kwh: 30 },
      { month: '02', year: 2026, kwh: 15 },
    ])
  })

  it('returns results sorted chronologically', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 5, date: '2026-03-01' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2025-12-15' }),
      buildRefueling({ chargedAtHome: true, fuelAmount: 20, date: '2026-01-10' }),
    ]
    const result = getMonthlyHomeChargingKwh(refuelings)
    expect(result).toEqual([
      { month: '12', year: 2025, kwh: 10 },
      { month: '01', year: 2026, kwh: 20 },
      { month: '03', year: 2026, kwh: 5 },
    ])
  })

  it('ignores non-home-charging refuelings', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2026-01-05' }),
      buildRefueling({ chargedAtHome: false, fuelAmount: 50, date: '2026-01-10' }),
    ]
    const result = getMonthlyHomeChargingKwh(refuelings)
    expect(result).toEqual([{ month: '01', year: 2026, kwh: 10 }])
  })

  it('returns empty array when no home-charging refuelings', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: false, fuelAmount: 50 }),
    ]
    expect(getMonthlyHomeChargingKwh(refuelings)).toEqual([])
  })

  it('returns empty array for empty input', () => {
    expect(getMonthlyHomeChargingKwh([])).toEqual([])
  })

  it('uses zero-padded month strings', () => {
    const refuelings = [
      buildRefueling({ chargedAtHome: true, fuelAmount: 10, date: '2026-03-05' }),
    ]
    const result = getMonthlyHomeChargingKwh(refuelings)
    expect(result[0]!.month).toBe('03')
  })
})

describe('adjustConsumptionForEvCharging', () => {
  const baseConsumption: MonthlyConsumption[] = [
    { month: '01', year: 2026, consumption: 300, isInterpolated: false },
    { month: '02', year: 2026, consumption: 280, isInterpolated: true },
    { month: '03', year: 2026, consumption: 250, isInterpolated: false },
  ]

  it('subtracts home-charging kWh from matching months', () => {
    const charging = [
      { month: '01', year: 2026, kwh: 50 },
      { month: '02', year: 2026, kwh: 30 },
    ]
    const result = adjustConsumptionForEvCharging(baseConsumption, charging)
    expect(result[0]!.consumption).toBe(250) // 300 - 50
    expect(result[1]!.consumption).toBe(250) // 280 - 30
    expect(result[2]!.consumption).toBe(250) // unchanged
  })

  it('floors consumption at 0 (never negative)', () => {
    const charging = [{ month: '01', year: 2026, kwh: 500 }]
    const result = adjustConsumptionForEvCharging(baseConsumption, charging)
    expect(result[0]!.consumption).toBe(0)
  })

  it('returns unchanged consumption when no EV data', () => {
    const result = adjustConsumptionForEvCharging(baseConsumption, [])
    expect(result).toEqual(baseConsumption)
  })

  it('preserves isInterpolated flag from original', () => {
    const charging = [
      { month: '01', year: 2026, kwh: 10 },
      { month: '02', year: 2026, kwh: 10 },
    ]
    const result = adjustConsumptionForEvCharging(baseConsumption, charging)
    expect(result[0]!.isInterpolated).toBe(false)
    expect(result[1]!.isInterpolated).toBe(true)
    expect(result[2]!.isInterpolated).toBe(false)
  })

  it('does not mutate input arrays', () => {
    const original: MonthlyConsumption[] = [
      { month: '01', year: 2026, consumption: 300, isInterpolated: false },
    ]
    const charging = [{ month: '01', year: 2026, kwh: 50 }]
    const result = adjustConsumptionForEvCharging(original, charging)
    expect(original[0]!.consumption).toBe(300) // unchanged
    expect(result[0]!.consumption).toBe(250)
    expect(result).not.toBe(original)
  })

  it('handles months with no matching EV data gracefully', () => {
    const charging = [{ month: '06', year: 2026, kwh: 100 }]
    const result = adjustConsumptionForEvCharging(baseConsumption, charging)
    expect(result).toEqual(baseConsumption)
  })

  it('handles empty consumption array', () => {
    const charging = [{ month: '01', year: 2026, kwh: 50 }]
    const result = adjustConsumptionForEvCharging([], charging)
    expect(result).toEqual([])
  })
})
