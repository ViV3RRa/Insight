import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildRefueling, buildMaintenanceEvent, buildVehicle } from '@/test/factories/vehicleFactory'
import type { Refueling, MaintenanceEvent } from '@/types/vehicles'
import {
  calculateTotalKmDriven,
  calculateYearlyKm,
  calculateYtdKm,
  calculateMonthlyKm,
  calculateFuelCost,
  calculateAvgFuelCostPerMonth,
  calculateAvgFuelCostPerDay,
  calculateAvgCostPerUnit,
  calculateMonthlyFuelCost,
  calculateMaintenanceCost,
  calculateYearlyMaintenanceCost,
  calculateMonthlyMaintenanceCost,
  calculateTotalVehicleCost,
  calculateTotalCostOfOwnership,
  calculateVehicleMetrics,
} from './vehicleMetrics'

const VEHICLE_ID = 'vehicle_001' as Refueling['vehicleId']

function refueling(date: string, odometerReading: number): Refueling {
  return buildRefueling({ vehicleId: VEHICLE_ID, date, odometerReading })
}

// --- calculateTotalKmDriven ---

describe('calculateTotalKmDriven', () => {
  it('returns difference between last and first odometer', () => {
    const result = calculateTotalKmDriven([
      refueling('2026-01-15', 10000),
      refueling('2026-06-15', 15000),
    ])
    expect(result).toBe(5000)
  })

  it('returns 0 for empty array', () => {
    expect(calculateTotalKmDriven([])).toBe(0)
  })

  it('returns 0 for single refueling', () => {
    expect(calculateTotalKmDriven([refueling('2026-01-15', 10000)])).toBe(0)
  })

  it('sorts non-chronological refuelings internally', () => {
    const result = calculateTotalKmDriven([
      refueling('2026-06-15', 15000),
      refueling('2026-01-15', 10000),
      refueling('2026-03-15', 12000),
    ])
    expect(result).toBe(5000)
  })

  it('handles multiple refuelings across years', () => {
    const result = calculateTotalKmDriven([
      refueling('2025-01-01', 5000),
      refueling('2025-06-01', 10000),
      refueling('2026-01-01', 15000),
      refueling('2026-06-01', 20000),
    ])
    expect(result).toBe(15000)
  })
})

// --- calculateYearlyKm ---

describe('calculateYearlyKm', () => {
  it('returns empty array for fewer than 2 refuelings', () => {
    expect(calculateYearlyKm([])).toEqual([])
    expect(calculateYearlyKm([refueling('2026-01-15', 10000)])).toEqual([])
  })

  it('computes km for a single year', () => {
    const result = calculateYearlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-06-15', 15000),
    ])
    expect(result).toEqual([{ year: 2026, km: 5000 }])
  })

  it('computes km across two years', () => {
    const result = calculateYearlyKm([
      refueling('2025-03-01', 10000),
      refueling('2025-12-01', 18000),
      refueling('2026-06-01', 25000),
    ])
    // 2025: 18000 - 10000 = 8000
    // 2026: 25000 - 18000 = 7000
    expect(result).toEqual([
      { year: 2025, km: 8000 },
      { year: 2026, km: 7000 },
    ])
  })

  it('computes km across three years', () => {
    const result = calculateYearlyKm([
      refueling('2024-06-01', 5000),
      refueling('2024-12-01', 10000),
      refueling('2025-06-01', 16000),
      refueling('2025-12-01', 22000),
      refueling('2026-06-01', 30000),
    ])
    // 2024: 10000 - 5000 = 5000
    // 2025: 22000 - 10000 = 12000
    // 2026: 30000 - 22000 = 8000
    expect(result).toEqual([
      { year: 2024, km: 5000 },
      { year: 2025, km: 12000 },
      { year: 2026, km: 8000 },
    ])
  })

  it('sorts internally regardless of input order', () => {
    const result = calculateYearlyKm([
      refueling('2026-06-01', 25000),
      refueling('2025-03-01', 10000),
      refueling('2025-12-01', 18000),
    ])
    expect(result).toEqual([
      { year: 2025, km: 8000 },
      { year: 2026, km: 7000 },
    ])
  })

  it('skips years with zero km', () => {
    // If the only refueling in a year has the same odometer as the last one in the prior year
    const result = calculateYearlyKm([
      refueling('2025-06-01', 10000),
      refueling('2025-12-31', 15000),
      refueling('2026-01-01', 15000), // same as end of 2025
      refueling('2026-06-01', 20000),
    ])
    // 2025: 15000 - 10000 = 5000
    // 2026: 20000 - 15000 = 5000
    expect(result).toEqual([
      { year: 2025, km: 5000 },
      { year: 2026, km: 5000 },
    ])
  })
})

// --- calculateYtdKm ---

describe('calculateYtdKm', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for empty array', () => {
    expect(calculateYtdKm([])).toBe(0)
  })

  it('returns 0 when no refuelings in current year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    expect(calculateYtdKm([refueling('2025-06-01', 10000)])).toBe(0)
  })

  it('returns 0 when only one refueling in current year and none before', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    expect(calculateYtdKm([refueling('2026-03-01', 10000)])).toBe(0)
  })

  it('uses first refueling as start when all in current year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    const result = calculateYtdKm([
      refueling('2026-01-15', 10000),
      refueling('2026-06-01', 15000),
    ])
    expect(result).toBe(5000)
  })

  it('interpolates odometer at Jan 1 using surrounding refuelings', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    // Dec 1 2025 → Jan 31 2026 = 61 days
    // Dec 1 → Jan 1 = 31 days → fraction = 31/61
    // Interpolated odometer = 10000 + (31/61) * (12000 - 10000) = 10000 + 1016.39... ≈ 11016.39
    // YTD = 15000 - 11016.39... ≈ 3983.61
    const result = calculateYtdKm([
      refueling('2025-12-01', 10000),
      refueling('2026-01-31', 12000),
      refueling('2026-06-01', 15000),
    ])
    expect(result).toBeCloseTo(15000 - (10000 + (31 / 61) * 2000), 2)
  })

  it('handles refueling exactly on Jan 1 without interpolation', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    const result = calculateYtdKm([
      refueling('2025-06-01', 8000),
      refueling('2026-01-01', 12000),
      refueling('2026-06-01', 18000),
    ])
    // Jan 1 is both last before and first on/after (it's on/after)
    // lastBefore = 2025-06-01 (8000), firstOnOrAfter = 2026-01-01 (12000)
    // daysToJan1 from 2025-06-01 to 2026-01-01 = 214 days
    // totalDays from 2025-06-01 to 2026-01-01 = 214 days
    // fraction = 1, interpolated = 8000 + 1 * 4000 = 12000
    // YTD = 18000 - 12000 = 6000
    expect(result).toBe(6000)
  })

  it('handles zero-day gap between last-before and first-after Jan 1', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    // Dec 31 and Jan 1 are 1 calendar day apart normally, but if we have
    // two refuelings on the same date straddling the boundary (edge case),
    // use lastBefore's odometer directly. Simulate with same-date entries.
    const result = calculateYtdKm([
      refueling('2025-12-31', 14000),
      refueling('2025-12-31', 14500), // same date, sorted after
      refueling('2026-06-01', 20000),
    ])
    // lastBefore = second Dec 31 entry (14500), no current year entries before Jun
    // Actually both are before Jan 1, so firstOnOrAfter = 2026-06-01
    // totalDays = Dec 31 → Jun 1 = 152, daysToJan1 = 1
    // interpolated = 14500 + (1/152) * 5500 ≈ 14536.18
    // YTD = 20000 - 14536.18 ≈ 5463.82
    expect(result).toBeCloseTo(20000 - (14500 + (1 / 152) * 5500), 2)
  })

  it('handles multiple previous-year refuelings (uses last one before Jan 1)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    const result = calculateYtdKm([
      refueling('2025-01-01', 5000),
      refueling('2025-06-01', 8000),
      refueling('2025-12-15', 14000),
      refueling('2026-02-15', 16000),
      refueling('2026-06-01', 20000),
    ])
    // lastBefore = 2025-12-15 (14000), firstOnOrAfter = 2026-02-15 (16000)
    // Dec 15 → Feb 15 = 62 days, Dec 15 → Jan 1 = 17 days
    // interpolated = 14000 + (17/62) * 2000 ≈ 14548.39
    // YTD = 20000 - 14548.39 ≈ 5451.61
    expect(result).toBeCloseTo(20000 - (14000 + (17 / 62) * 2000), 2)
  })
})

// --- calculateMonthlyKm ---

describe('calculateMonthlyKm', () => {
  it('returns empty array for fewer than 2 refuelings', () => {
    expect(calculateMonthlyKm([])).toEqual([])
    expect(calculateMonthlyKm([refueling('2026-01-15', 10000)])).toEqual([])
  })

  it('assigns all km to one month when both refuelings are in the same month', () => {
    const result = calculateMonthlyKm([
      refueling('2026-01-05', 10000),
      refueling('2026-01-20', 10500),
    ])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ month: '01', year: 2026, km: 500 })
  })

  it('distributes km proportionally across two months', () => {
    // Jan 15 → Feb 15 = 31 days
    // Jan portion: Jan 15 → Jan 31 = 16 days
    // Feb portion: Jan 31 → Feb 15 = 15 days
    const result = calculateMonthlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-02-15', 10310),
    ])
    expect(result).toHaveLength(2)
    expect(result[0]!.month).toBe('01')
    expect(result[0]!.year).toBe(2026)
    expect(result[0]!.km).toBeCloseTo(310 * (16 / 31), 1)
    expect(result[1]!.month).toBe('02')
    expect(result[1]!.km).toBeCloseTo(310 * (15 / 31), 1)
  })

  it('distributes km across multiple months', () => {
    // Jan 15 → Apr 15 spans 4 months
    const result = calculateMonthlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-04-15', 13000),
    ])
    expect(result).toHaveLength(4)
    expect(result.map((e) => `${e.year}-${e.month}`)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
    ])
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(3000, 5)
  })

  it('accumulates km from multiple consecutive pairs', () => {
    const result = calculateMonthlyKm([
      refueling('2026-01-01', 10000),
      refueling('2026-01-15', 10500),
      refueling('2026-02-15', 11000),
    ])
    // Pair 1: Jan 1→Jan 15, all 500 in Jan
    // Pair 2: Jan 15→Feb 15, 500 distributed across Jan & Feb
    expect(result).toHaveLength(2)
    // Jan should have 500 + portion of second pair
    expect(result[0]!.month).toBe('01')
    expect(result[1]!.month).toBe('02')
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(1000, 5)
  })

  it('uses zero-padded month strings', () => {
    const result = calculateMonthlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-12-15', 20000),
    ])
    // Should have months from 01 to 12
    for (const entry of result) {
      expect(entry.month).toMatch(/^\d{2}$/)
    }
    expect(result[0]!.month).toBe('01')
    expect(result[result.length - 1]!.month).toBe('12')
  })

  it('sorts internally regardless of input order', () => {
    const result = calculateMonthlyKm([
      refueling('2026-03-15', 12000),
      refueling('2026-01-15', 10000),
    ])
    expect(result).toHaveLength(3)
    expect(result[0]!.month).toBe('01')
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(2000, 5)
  })

  it('handles year boundary correctly', () => {
    const result = calculateMonthlyKm([
      refueling('2025-12-15', 10000),
      refueling('2026-01-15', 11000),
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ month: '12', year: 2025 })
    expect(result[1]).toMatchObject({ month: '01', year: 2026 })
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(1000, 5)
  })

  it('skips pairs with zero or negative km delta', () => {
    const result = calculateMonthlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-02-15', 10000), // zero delta — skipped
      refueling('2026-03-15', 11000),
    ])
    // Only the Feb→Mar pair contributes
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(1000, 5)
  })

  it('skips pairs with same date', () => {
    const result = calculateMonthlyKm([
      refueling('2026-01-15', 10000),
      refueling('2026-01-15', 10500), // same date — 0 days
      refueling('2026-02-15', 11000),
    ])
    // First pair: same date, skipped. Second pair: 500 km distributed.
    const totalKm = result.reduce((sum, e) => sum + e.km, 0)
    expect(totalKm).toBeCloseTo(500, 5)
  })
})

// --- Cost Calculations (US-113) ---

const VEHICLE_ID_COST = 'vehicle_002' as Refueling['vehicleId']

function costRefueling(date: string, totalCost: number, fuelAmount = 40, odometerReading = 10000): Refueling {
  return buildRefueling({ vehicleId: VEHICLE_ID_COST, date, totalCost, fuelAmount, odometerReading })
}

function maint(date: string, cost: number): MaintenanceEvent {
  return buildMaintenanceEvent({ vehicleId: VEHICLE_ID_COST as MaintenanceEvent['vehicleId'], date, cost })
}

// --- calculateFuelCost ---

describe('calculateFuelCost', () => {
  it('sums all refueling costs when no date range given', () => {
    const refs = [
      costRefueling('2026-01-15', 500),
      costRefueling('2026-02-15', 600),
      costRefueling('2026-03-15', 700),
    ]
    expect(calculateFuelCost(refs)).toBe(1800)
  })

  it('returns 0 for empty array', () => {
    expect(calculateFuelCost([])).toBe(0)
  })

  it('filters by start date', () => {
    const refs = [
      costRefueling('2026-01-15', 500),
      costRefueling('2026-02-15', 600),
      costRefueling('2026-03-15', 700),
    ]
    expect(calculateFuelCost(refs, new Date('2026-02-01'))).toBe(1300)
  })

  it('filters by end date', () => {
    const refs = [
      costRefueling('2026-01-15', 500),
      costRefueling('2026-02-15', 600),
      costRefueling('2026-03-15', 700),
    ]
    expect(calculateFuelCost(refs, undefined, new Date('2026-02-28'))).toBe(1100)
  })

  it('filters by both start and end date', () => {
    const refs = [
      costRefueling('2026-01-15', 500),
      costRefueling('2026-02-15', 600),
      costRefueling('2026-03-15', 700),
    ]
    expect(calculateFuelCost(refs, new Date('2026-02-01'), new Date('2026-02-28'))).toBe(600)
  })
})

// --- calculateAvgFuelCostPerMonth ---

describe('calculateAvgFuelCostPerMonth', () => {
  it('returns null for fewer than 2 refuelings', () => {
    expect(calculateAvgFuelCostPerMonth([])).toBeNull()
    expect(calculateAvgFuelCostPerMonth([costRefueling('2026-01-15', 500)])).toBeNull()
  })

  it('returns null when all refuelings are on the same date', () => {
    expect(
      calculateAvgFuelCostPerMonth([
        costRefueling('2026-01-15', 500),
        costRefueling('2026-01-15', 600),
      ]),
    ).toBeNull()
  })

  it('computes total cost / months between first and last', () => {
    // Jan 15 → Jul 15 = 181 days → 181 / 30.4375 ≈ 5.947 months
    const refs = [
      costRefueling('2026-01-15', 500),
      costRefueling('2026-04-15', 600),
      costRefueling('2026-07-15', 700),
    ]
    const totalCost = 1800
    const days = 181 // Jan 15 → Jul 15
    const months = days / 30.4375
    expect(calculateAvgFuelCostPerMonth(refs)).toBeCloseTo(totalCost / months, 2)
  })
})

// --- calculateAvgFuelCostPerDay ---

describe('calculateAvgFuelCostPerDay', () => {
  it('returns null for fewer than 2 refuelings', () => {
    expect(calculateAvgFuelCostPerDay([])).toBeNull()
    expect(calculateAvgFuelCostPerDay([costRefueling('2026-01-15', 500)])).toBeNull()
  })

  it('returns null when 0 days span', () => {
    expect(
      calculateAvgFuelCostPerDay([
        costRefueling('2026-01-15', 500),
        costRefueling('2026-01-15', 600),
      ]),
    ).toBeNull()
  })

  it('computes total cost / days between first and last', () => {
    // Jan 15 → Feb 15 = 31 days
    const refs = [
      costRefueling('2026-01-15', 310),
      costRefueling('2026-02-15', 620),
    ]
    expect(calculateAvgFuelCostPerDay(refs)).toBeCloseTo(930 / 31, 2)
  })
})

// --- calculateAvgCostPerUnit ---

describe('calculateAvgCostPerUnit', () => {
  it('returns null for empty array', () => {
    expect(calculateAvgCostPerUnit([])).toBeNull()
  })

  it('returns null when total fuel is 0', () => {
    expect(calculateAvgCostPerUnit([costRefueling('2026-01-15', 500, 0)])).toBeNull()
  })

  it('computes weighted average cost per unit', () => {
    const refs = [
      costRefueling('2026-01-15', 500, 40), // 12.50/unit
      costRefueling('2026-02-15', 660, 60), // 11.00/unit
    ]
    // weighted: (500 + 660) / (40 + 60) = 1160 / 100 = 11.60
    expect(calculateAvgCostPerUnit(refs)).toBeCloseTo(11.60, 2)
  })

  it('works with a single refueling', () => {
    expect(calculateAvgCostPerUnit([costRefueling('2026-01-15', 500, 40)])).toBeCloseTo(12.5, 2)
  })
})

// --- calculateMonthlyFuelCost ---

describe('calculateMonthlyFuelCost', () => {
  it('returns empty array for no refuelings', () => {
    expect(calculateMonthlyFuelCost([])).toEqual([])
  })

  it('groups refueling costs by month', () => {
    const refs = [
      costRefueling('2026-01-10', 300),
      costRefueling('2026-01-25', 200),
      costRefueling('2026-02-15', 500),
    ]
    const result = calculateMonthlyFuelCost(refs)
    expect(result).toEqual([
      { month: '01', year: 2026, cost: 500 },
      { month: '02', year: 2026, cost: 500 },
    ])
  })

  it('sorts by year then month ascending', () => {
    const refs = [
      costRefueling('2026-03-15', 100),
      costRefueling('2025-12-15', 200),
      costRefueling('2026-01-15', 300),
    ]
    const result = calculateMonthlyFuelCost(refs)
    expect(result.map((e) => `${e.year}-${e.month}`)).toEqual(['2025-12', '2026-01', '2026-03'])
  })

  it('uses zero-padded month strings', () => {
    const refs = [costRefueling('2026-01-15', 100), costRefueling('2026-12-15', 200)]
    const result = calculateMonthlyFuelCost(refs)
    expect(result[0]!.month).toBe('01')
    expect(result[1]!.month).toBe('12')
  })
})

// --- calculateMaintenanceCost ---

describe('calculateMaintenanceCost', () => {
  it('sums all maintenance costs when no date range', () => {
    const events = [maint('2026-01-15', 800), maint('2026-06-15', 1200)]
    expect(calculateMaintenanceCost(events)).toBe(2000)
  })

  it('returns 0 for empty array', () => {
    expect(calculateMaintenanceCost([])).toBe(0)
  })

  it('filters by date range', () => {
    const events = [
      maint('2026-01-15', 800),
      maint('2026-03-15', 500),
      maint('2026-06-15', 1200),
    ]
    expect(calculateMaintenanceCost(events, new Date('2026-02-01'), new Date('2026-04-30'))).toBe(500)
  })
})

// --- calculateYearlyMaintenanceCost ---

describe('calculateYearlyMaintenanceCost', () => {
  it('returns empty array for no events', () => {
    expect(calculateYearlyMaintenanceCost([])).toEqual([])
  })

  it('groups costs by year ascending', () => {
    const events = [
      maint('2025-03-15', 500),
      maint('2025-09-15', 300),
      maint('2026-02-15', 1000),
    ]
    expect(calculateYearlyMaintenanceCost(events)).toEqual([
      { year: 2025, cost: 800 },
      { year: 2026, cost: 1000 },
    ])
  })
})

// --- calculateMonthlyMaintenanceCost ---

describe('calculateMonthlyMaintenanceCost', () => {
  it('returns empty array for no events', () => {
    expect(calculateMonthlyMaintenanceCost([])).toEqual([])
  })

  it('groups costs by month sorted ascending', () => {
    const events = [
      maint('2026-01-10', 400),
      maint('2026-01-25', 100),
      maint('2026-03-15', 600),
    ]
    expect(calculateMonthlyMaintenanceCost(events)).toEqual([
      { month: '01', year: 2026, cost: 500 },
      { month: '03', year: 2026, cost: 600 },
    ])
  })

  it('handles cross-year events', () => {
    const events = [maint('2025-12-15', 300), maint('2026-01-15', 400)]
    const result = calculateMonthlyMaintenanceCost(events)
    expect(result).toEqual([
      { month: '12', year: 2025, cost: 300 },
      { month: '01', year: 2026, cost: 400 },
    ])
  })
})

// --- calculateTotalVehicleCost ---

describe('calculateTotalVehicleCost', () => {
  it('sums fuel and maintenance costs', () => {
    const refs = [costRefueling('2026-01-15', 500), costRefueling('2026-02-15', 600)]
    const events = [maint('2026-01-20', 800)]
    expect(calculateTotalVehicleCost(refs, events)).toBe(1900)
  })

  it('works with only refuelings', () => {
    expect(calculateTotalVehicleCost([costRefueling('2026-01-15', 500)], [])).toBe(500)
  })

  it('works with only maintenance', () => {
    expect(calculateTotalVehicleCost([], [maint('2026-01-20', 800)])).toBe(800)
  })

  it('returns 0 for empty inputs', () => {
    expect(calculateTotalVehicleCost([], [])).toBe(0)
  })

  it('respects date range', () => {
    const refs = [costRefueling('2026-01-15', 500), costRefueling('2026-03-15', 600)]
    const events = [maint('2026-01-20', 800), maint('2026-03-20', 400)]
    expect(
      calculateTotalVehicleCost(refs, events, new Date('2026-02-01'), new Date('2026-04-01')),
    ).toBe(1000)
  })
})

// --- calculateTotalCostOfOwnership ---

describe('calculateTotalCostOfOwnership', () => {
  it('returns null when no refuelings and no maintenance', () => {
    const vehicle = buildVehicle()
    expect(calculateTotalCostOfOwnership(vehicle, [], [])).toBeNull()
  })

  it('computes TCO with refuelings only', () => {
    const vehicle = buildVehicle({ purchasePrice: 250000, salePrice: null })
    const refs = [costRefueling('2026-01-15', 500), costRefueling('2026-02-15', 600)]
    const result = calculateTotalCostOfOwnership(vehicle, refs, [])!
    expect(result.lifetimeFuelCost).toBe(1100)
    expect(result.lifetimeMaintenanceCost).toBe(0)
    expect(result.totalOperatingCost).toBe(1100)
    expect(result.purchaseToSaleOffset).toBe(0 - 250000)
  })

  it('computes TCO with maintenance only', () => {
    const vehicle = buildVehicle({ purchasePrice: 250000, salePrice: null })
    const events = [maint('2026-01-20', 800)]
    const result = calculateTotalCostOfOwnership(vehicle, [], events)!
    expect(result.lifetimeFuelCost).toBe(0)
    expect(result.lifetimeMaintenanceCost).toBe(800)
    expect(result.totalOperatingCost).toBe(800)
  })

  it('computes TCO for sold vehicle', () => {
    const vehicle = buildVehicle({ purchasePrice: 250000, salePrice: 180000 })
    const refs = [costRefueling('2026-01-15', 500)]
    const events = [maint('2026-01-20', 800)]
    const result = calculateTotalCostOfOwnership(vehicle, refs, events)!
    expect(result.lifetimeFuelCost).toBe(500)
    expect(result.lifetimeMaintenanceCost).toBe(800)
    expect(result.totalOperatingCost).toBe(1300)
    expect(result.purchaseToSaleOffset).toBe(180000 - 250000)
  })

  it('handles null purchasePrice and salePrice', () => {
    const vehicle = buildVehicle({ purchasePrice: null, salePrice: null })
    const refs = [costRefueling('2026-01-15', 500)]
    const result = calculateTotalCostOfOwnership(vehicle, refs, [])!
    expect(result.purchaseToSaleOffset).toBe(0)
  })
})

// --- calculateVehicleMetrics ---

describe('calculateVehicleMetrics', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('produces all fields for a vehicle with data', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))

    const vehicle = buildVehicle({ purchasePrice: 250000, salePrice: null })

    // Need >= 6 refuelings for rolling5, spread across years for year efficiency
    const refs = [
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2025-06-01', odometerReading: 10000, fuelAmount: 40, totalCost: 500 }),
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2025-09-01', odometerReading: 14000, fuelAmount: 45, totalCost: 560 }),
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2025-12-01', odometerReading: 18000, fuelAmount: 42, totalCost: 530 }),
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2026-02-01', odometerReading: 22000, fuelAmount: 38, totalCost: 475 }),
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2026-04-01', odometerReading: 26000, fuelAmount: 50, totalCost: 625 }),
      buildRefueling({ vehicleId: VEHICLE_ID_COST, date: '2026-06-01', odometerReading: 30000, fuelAmount: 44, totalCost: 550 }),
    ]

    const events = [
      buildMaintenanceEvent({ vehicleId: VEHICLE_ID_COST as MaintenanceEvent['vehicleId'], date: '2026-01-15', cost: 800 }),
      buildMaintenanceEvent({ vehicleId: VEHICLE_ID_COST as MaintenanceEvent['vehicleId'], date: '2026-05-15', cost: 1200 }),
    ]

    const metrics = calculateVehicleMetrics(vehicle, refs, events)

    expect(metrics.allTimeEfficiency).not.toBeNull()
    expect(metrics.currentYearEfficiency).not.toBeNull()
    expect(metrics.rolling5Efficiency).not.toBeNull()
    expect(metrics.ytdKmDriven).toBeGreaterThan(0)
    expect(metrics.ytdFuelCost).toBeGreaterThan(0)
    expect(metrics.avgFuelCostPerMonth).not.toBeNull()
    expect(metrics.avgFuelCostPerDay).not.toBeNull()
    expect(metrics.totalMaintenanceCost).toBe(2000)
    expect(metrics.totalVehicleCost).toBe(500 + 560 + 530 + 475 + 625 + 550 + 800 + 1200)
    expect(metrics.totalCostOfOwnership).not.toBeNull()
    expect(metrics.totalCostOfOwnership!.lifetimeFuelCost).toBe(3240)
    expect(metrics.totalCostOfOwnership!.lifetimeMaintenanceCost).toBe(2000)
    expect(metrics.totalCostOfOwnership!.totalOperatingCost).toBe(5240)
  })

  it('handles empty refuelings and events', () => {
    const vehicle = buildVehicle()
    const metrics = calculateVehicleMetrics(vehicle, [], [])

    expect(metrics.allTimeEfficiency).toBeNull()
    expect(metrics.currentYearEfficiency).toBeNull()
    expect(metrics.rolling5Efficiency).toBeNull()
    expect(metrics.ytdKmDriven).toBe(0)
    expect(metrics.ytdFuelCost).toBe(0)
    expect(metrics.avgFuelCostPerMonth).toBeNull()
    expect(metrics.avgFuelCostPerDay).toBeNull()
    expect(metrics.totalMaintenanceCost).toBe(0)
    expect(metrics.totalVehicleCost).toBe(0)
    expect(metrics.totalCostOfOwnership).toBeNull()
  })

  it('handles vehicle with only maintenance events', () => {
    const vehicle = buildVehicle()
    const events = [
      buildMaintenanceEvent({ vehicleId: VEHICLE_ID_COST as MaintenanceEvent['vehicleId'], date: '2026-03-15', cost: 500 }),
    ]
    const metrics = calculateVehicleMetrics(vehicle, [], events)

    expect(metrics.allTimeEfficiency).toBeNull()
    expect(metrics.totalMaintenanceCost).toBe(500)
    expect(metrics.totalVehicleCost).toBe(500)
    expect(metrics.totalCostOfOwnership).not.toBeNull()
    expect(metrics.totalCostOfOwnership!.lifetimeFuelCost).toBe(0)
    expect(metrics.totalCostOfOwnership!.lifetimeMaintenanceCost).toBe(500)
  })
})
