import { describe, it, expect } from 'vitest'
import { buildRefueling } from '@/test/factories'
import type { Refueling } from '@/types/vehicles'
import {
  calculateWeightedEfficiency,
  calculateYearEfficiency,
  calculateRolling5Efficiency,
  calculatePerRefuelingEfficiency,
} from './fuelEfficiency'

// --- Helpers ---

const vehicleId = 'vehicle_001' as Refueling['vehicleId']

function makeRefueling(overrides: Partial<Refueling>): Refueling {
  return buildRefueling({ vehicleId, ...overrides })
}

// ===================================================================
// calculateWeightedEfficiency
// ===================================================================

describe('calculateWeightedEfficiency', () => {
  it('returns null for empty array', () => {
    expect(calculateWeightedEfficiency([])).toBeNull()
  })

  it('returns null for single refueling (no prior baseline)', () => {
    const refuelings = [makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 })]
    expect(calculateWeightedEfficiency(refuelings)).toBeNull()
  })

  it('computes weighted average correctly (NOT arithmetic mean)', () => {
    // 3 intervals: 300km/30L, 200km/25L, 500km/45L
    // Weighted: (300+200+500) / (30+25+45) = 1000/100 = 10.0 km/l
    // Arithmetic mean would be: (10 + 8 + 11.11)/3 ≈ 9.7
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 50 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10300, fuelAmount: 30 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 10500, fuelAmount: 25 }),
      makeRefueling({ date: '2026-04-01', odometerReading: 11000, fuelAmount: 45 }),
    ]

    const result = calculateWeightedEfficiency(refuelings)
    expect(result).toBe(10.0)

    // Explicit rejection: arithmetic mean would be ≈ 9.7
    const arithmeticMean = (300 / 30 + 200 / 25 + 500 / 45) / 3
    expect(result).not.toBeCloseTo(arithmeticMean, 1)
  })

  it('handles two refuelings', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 5000, fuelAmount: 30 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 5500, fuelAmount: 50 }),
    ]
    // 500 km / 50 L = 10.0
    expect(calculateWeightedEfficiency(refuelings)).toBe(10.0)
  })

  it('sorts refuelings by date internally (unsorted input)', () => {
    const refuelings = [
      makeRefueling({ date: '2026-04-01', odometerReading: 11000, fuelAmount: 45 }),
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 50 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 10500, fuelAmount: 25 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10300, fuelAmount: 30 }),
    ]
    expect(calculateWeightedEfficiency(refuelings)).toBe(10.0)
  })

  it('breaks date ties using odometer reading', () => {
    // Two refuelings on the same date — sorted by odometer
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10800, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10500, fuelAmount: 50 }),
    ]
    // Sorted: 10000, 10500 (50L), 10800 (40L)
    // Intervals: 500/50 + 300/40 = 800/90 ≈ 8.889
    expect(calculateWeightedEfficiency(refuelings)).toBeCloseTo(8.889, 2)
  })

  it('skips pairs with negative distance (odometer rollover/correction)', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 9500, fuelAmount: 30 }), // rollover
      makeRefueling({ date: '2026-03-01', odometerReading: 10200, fuelAmount: 35 }),
    ]
    // Only the pair (9500 → 10200) is valid: 700 km / 35 L = 20.0
    expect(calculateWeightedEfficiency(refuelings)).toBe(20.0)
  })

  it('skips pairs with zero distance', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10000, fuelAmount: 30 }), // same reading
      makeRefueling({ date: '2026-03-01', odometerReading: 10500, fuelAmount: 50 }),
    ]
    // Only (10000 → 10500) valid: 500 / 50 = 10.0
    expect(calculateWeightedEfficiency(refuelings)).toBe(10.0)
  })

  it('skips refuelings with zero fuel amount', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10500, fuelAmount: 0 }), // zero fuel
      makeRefueling({ date: '2026-03-01', odometerReading: 11000, fuelAmount: 50 }),
    ]
    // Only (10500 → 11000) valid: 500 / 50 = 10.0
    expect(calculateWeightedEfficiency(refuelings)).toBe(10.0)
  })

  it('returns null if all pairs are invalid', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 9000, fuelAmount: 30 }), // negative
    ]
    expect(calculateWeightedEfficiency(refuelings)).toBeNull()
  })
})

// ===================================================================
// calculateYearEfficiency
// ===================================================================

describe('calculateYearEfficiency', () => {
  it('returns null for < 2 refuelings', () => {
    expect(calculateYearEfficiency([], 2026)).toBeNull()
    expect(
      calculateYearEfficiency([makeRefueling({ date: '2026-03-01', odometerReading: 10000 })], 2026),
    ).toBeNull()
  })

  it('calculates efficiency scoped to a specific year', () => {
    const refuelings = [
      makeRefueling({ date: '2025-11-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2025-12-01', odometerReading: 10500, fuelAmount: 50 }),
      makeRefueling({ date: '2026-01-15', odometerReading: 11000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 11800, fuelAmount: 80 }),
    ]
    // 2026 intervals: (10500→11000, 40L) and (11000→11800, 80L)
    // Total: 1300 km / 120 L ≈ 10.833
    expect(calculateYearEfficiency(refuelings, 2026)).toBeCloseTo(10.833, 2)
  })

  it('uses baseline from prior year', () => {
    const refuelings = [
      makeRefueling({ date: '2025-12-15', odometerReading: 20000, fuelAmount: 45 }),
      makeRefueling({ date: '2026-01-10', odometerReading: 20600, fuelAmount: 60 }),
    ]
    // 2026 interval: 600 km / 60 L = 10.0
    expect(calculateYearEfficiency(refuelings, 2026)).toBe(10.0)
  })

  it('returns null when no intervals fall in the year', () => {
    const refuelings = [
      makeRefueling({ date: '2025-06-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2025-07-01', odometerReading: 10500, fuelAmount: 50 }),
    ]
    expect(calculateYearEfficiency(refuelings, 2026)).toBeNull()
  })

  it('handles year with only invalid pairs', () => {
    const refuelings = [
      makeRefueling({ date: '2025-12-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-01-01', odometerReading: 9000, fuelAmount: 30 }), // negative
    ]
    expect(calculateYearEfficiency(refuelings, 2026)).toBeNull()
  })
})

// ===================================================================
// calculateRolling5Efficiency
// ===================================================================

describe('calculateRolling5Efficiency', () => {
  it('returns null for < 6 refuelings', () => {
    expect(calculateRolling5Efficiency([])).toBeNull()
    expect(calculateRolling5Efficiency([makeRefueling({})])).toBeNull()

    const five = Array.from({ length: 5 }, (_, i) =>
      makeRefueling({
        date: `2026-0${i + 1}-01`,
        odometerReading: 10000 + i * 500,
        fuelAmount: 40,
      }),
    )
    expect(calculateRolling5Efficiency(five)).toBeNull()
  })

  it('calculates from last 6 refuelings (5 intervals)', () => {
    const refuelings = Array.from({ length: 8 }, (_, i) =>
      makeRefueling({
        date: `2026-0${i + 1}-01`,
        odometerReading: 10000 + i * 500,
        fuelAmount: 50,
      }),
    )
    // Last 6: indices 2–7, odometers 11000..13500, each interval 500km / 50L
    // Total: 2500 / 250 = 10.0
    expect(calculateRolling5Efficiency(refuelings)).toBe(10.0)
  })

  it('calculates exactly 6 refuelings', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10400, fuelAmount: 40 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 10800, fuelAmount: 40 }),
      makeRefueling({ date: '2026-04-01', odometerReading: 11300, fuelAmount: 50 }),
      makeRefueling({ date: '2026-05-01', odometerReading: 11600, fuelAmount: 30 }),
      makeRefueling({ date: '2026-06-01', odometerReading: 12100, fuelAmount: 50 }),
    ]
    // Intervals: 400/40 + 400/40 + 500/50 + 300/30 + 500/50
    // Total: 2100 km / 210 L = 10.0
    expect(calculateRolling5Efficiency(refuelings)).toBe(10.0)
  })

  it('sorts before taking last 6', () => {
    // Provide unsorted, should still work
    const refuelings = [
      makeRefueling({ date: '2026-06-01', odometerReading: 12500, fuelAmount: 50 }),
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-04-01', odometerReading: 11500, fuelAmount: 50 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10500, fuelAmount: 50 }),
      makeRefueling({ date: '2026-05-01', odometerReading: 12000, fuelAmount: 50 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 11000, fuelAmount: 50 }),
    ]
    // Sorted: 10000, 10500, 11000, 11500, 12000, 12500 — all 500km intervals, 50L each
    // Total: 2500 / 250 = 10.0
    expect(calculateRolling5Efficiency(refuelings)).toBe(10.0)
  })
})

// ===================================================================
// calculatePerRefuelingEfficiency
// ===================================================================

describe('calculatePerRefuelingEfficiency', () => {
  it('returns empty array for < 2 refuelings', () => {
    expect(calculatePerRefuelingEfficiency([])).toEqual([])
    expect(
      calculatePerRefuelingEfficiency([makeRefueling({ date: '2026-01-01', odometerReading: 10000 })]),
    ).toEqual([])
  })

  it('returns per-refueling efficiency entries', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 50 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10300, fuelAmount: 30 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 10500, fuelAmount: 25 }),
      makeRefueling({ date: '2026-04-01', odometerReading: 11000, fuelAmount: 45 }),
    ]

    const result = calculatePerRefuelingEfficiency(refuelings)
    expect(result).toHaveLength(3)

    expect(result[0]).toEqual({ date: '2026-02-01', efficiency: 10, fuelAmount: 30 })
    expect(result[1]).toEqual({ date: '2026-03-01', efficiency: 8, fuelAmount: 25 })
    expect(result[2]).toEqual({
      date: '2026-04-01',
      efficiency: expect.closeTo(11.111, 2),
      fuelAmount: 45,
    })
  })

  it('skips entries with negative distance', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 9500, fuelAmount: 30 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 10200, fuelAmount: 35 }),
    ]
    const result = calculatePerRefuelingEfficiency(refuelings)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ date: '2026-03-01', efficiency: 20, fuelAmount: 35 })
  })

  it('skips entries with zero fuel', () => {
    const refuelings = [
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10500, fuelAmount: 0 }),
      makeRefueling({ date: '2026-03-01', odometerReading: 11000, fuelAmount: 50 }),
    ]
    const result = calculatePerRefuelingEfficiency(refuelings)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ date: '2026-03-01', efficiency: 10, fuelAmount: 50 })
  })

  it('sorts internally before computing', () => {
    const refuelings = [
      makeRefueling({ date: '2026-03-01', odometerReading: 10600, fuelAmount: 30 }),
      makeRefueling({ date: '2026-01-01', odometerReading: 10000, fuelAmount: 40 }),
      makeRefueling({ date: '2026-02-01', odometerReading: 10300, fuelAmount: 30 }),
    ]
    const result = calculatePerRefuelingEfficiency(refuelings)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ date: '2026-02-01', efficiency: 10, fuelAmount: 30 })
    expect(result[1]).toEqual({ date: '2026-03-01', efficiency: 10, fuelAmount: 30 })
  })
})
