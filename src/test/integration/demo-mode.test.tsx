import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils'
import { useSettingsStore } from '@/stores/settingsStore'
import AppShell from '@/components/layout/AppShell'
import {
  getDemoPortfolios,
  getDemoPlatforms,
  getDemoDataPoints,
  getDemoTransactions,
  getDemoUtilities,
  getDemoMeterReadings,
  getDemoUtilityBills,
  getDemoVehicles,
  getDemoRefuelings,
  getDemoMaintenanceEvents,
} from '@/utils/demoData'

beforeEach(() => {
  useSettingsStore.setState({ demoMode: false })
})

// --- Banner tests ---

describe('Demo mode banner', () => {
  it('renders when demoMode is true', () => {
    useSettingsStore.setState({ demoMode: true })
    renderWithProviders(<AppShell />)
    expect(screen.getByText('Demo Mode — Showing sample data')).toBeInTheDocument()
  })

  it('does not render when demoMode is false', () => {
    useSettingsStore.setState({ demoMode: false })
    renderWithProviders(<AppShell />)
    expect(screen.queryByText('Demo Mode — Showing sample data')).not.toBeInTheDocument()
  })
})

// --- Investment demo data tests ---

describe('Demo investment data', () => {
  it('returns at least 1 portfolio', () => {
    const portfolios = getDemoPortfolios()
    expect(portfolios.length).toBeGreaterThanOrEqual(1)
    expect(portfolios[0]!.name).toBe('Main Portfolio')
  })

  it('returns at least 4 platforms (2 investment + 1 cash + 1 closed)', () => {
    const platforms = getDemoPlatforms()
    expect(platforms.length).toBeGreaterThanOrEqual(4)

    const investments = platforms.filter((p) => p.type === 'investment')
    const cash = platforms.filter((p) => p.type === 'cash')
    const closed = platforms.filter((p) => p.status === 'closed')

    expect(investments.length).toBeGreaterThanOrEqual(2)
    expect(cash.length).toBeGreaterThanOrEqual(1)
    expect(closed.length).toBeGreaterThanOrEqual(1)
  })

  it('data points span 24+ months', () => {
    const platforms = getDemoPlatforms()
    const nordnet = platforms.find((p) => p.name === 'Nordnet')!
    const points = getDemoDataPoints(nordnet.id)
    expect(points.length).toBeGreaterThanOrEqual(24)

    const dates = points.map((p) => new Date(p.timestamp))
    const earliest = Math.min(...dates.map((d) => d.getTime()))
    const latest = Math.max(...dates.map((d) => d.getTime()))
    const monthSpan = (latest - earliest) / (1000 * 60 * 60 * 24 * 30)
    expect(monthSpan).toBeGreaterThanOrEqual(23)
  })

  it('includes isInterpolated data points', () => {
    const platforms = getDemoPlatforms()
    const nordnet = platforms.find((p) => p.name === 'Nordnet')!
    const points = getDemoDataPoints(nordnet.id)
    const interpolated = points.filter((p) => p.isInterpolated)
    expect(interpolated.length).toBeGreaterThan(0)
  })

  it('returns transactions with deposits and withdrawals', () => {
    const platforms = getDemoPlatforms()
    const nordnet = platforms.find((p) => p.name === 'Nordnet')!
    const txns = getDemoTransactions(nordnet.id)
    expect(txns.length).toBeGreaterThan(2)

    const deposits = txns.filter((t) => t.type === 'deposit')
    const withdrawals = txns.filter((t) => t.type === 'withdrawal')
    expect(deposits.length).toBeGreaterThan(0)
    expect(withdrawals.length).toBeGreaterThan(0)
  })
})

// --- Home demo data tests ---

describe('Demo home data', () => {
  it('returns at least 2 utilities', () => {
    const utilities = getDemoUtilities()
    expect(utilities.length).toBeGreaterThanOrEqual(2)
    expect(utilities.map((u) => u.name)).toContain('Electricity')
    expect(utilities.map((u) => u.name)).toContain('Water')
  })

  it('meter readings span 24+ months', () => {
    const utilities = getDemoUtilities()
    const elec = utilities.find((u) => u.name === 'Electricity')!
    const readings = getDemoMeterReadings(elec.id)
    expect(readings.length).toBeGreaterThanOrEqual(24)

    const dates = readings.map((r) => new Date(r.timestamp))
    const earliest = Math.min(...dates.map((d) => d.getTime()))
    const latest = Math.max(...dates.map((d) => d.getTime()))
    const monthSpan = (latest - earliest) / (1000 * 60 * 60 * 24 * 30)
    expect(monthSpan).toBeGreaterThanOrEqual(23)
  })

  it('has 6+ bills per utility', () => {
    const utilities = getDemoUtilities()
    for (const utility of utilities) {
      const bills = getDemoUtilityBills(utility.id)
      expect(bills.length).toBeGreaterThanOrEqual(4)
    }

    const elec = utilities.find((u) => u.name === 'Electricity')!
    const elecBills = getDemoUtilityBills(elec.id)
    expect(elecBills.length).toBeGreaterThanOrEqual(6)
  })
})

// --- Vehicles demo data tests ---

describe('Demo vehicles data', () => {
  it('returns at least 3 vehicles (2 active + 1 sold)', () => {
    const vehicles = getDemoVehicles()
    expect(vehicles.length).toBeGreaterThanOrEqual(3)

    const active = vehicles.filter((v) => v.status === 'active')
    const sold = vehicles.filter((v) => v.status === 'sold')
    expect(active.length).toBeGreaterThanOrEqual(2)
    expect(sold.length).toBeGreaterThanOrEqual(1)
  })

  it('sold vehicle has saleDate and salePrice', () => {
    const vehicles = getDemoVehicles()
    const sold = vehicles.find((v) => v.status === 'sold')!
    expect(sold.saleDate).toBeTruthy()
    expect(sold.salePrice).toBeGreaterThan(0)
  })

  it('refuelings include chargedAtHome=true records', () => {
    const vehicles = getDemoVehicles()
    const ev = vehicles.find((v) => v.fuelType === 'Electric')!
    const refuelings = getDemoRefuelings(ev.id)
    const homeCharged = refuelings.filter((r) => r.chargedAtHome)
    expect(homeCharged.length).toBeGreaterThan(0)
  })

  it('Family Car has 20+ refuelings and 5+ maintenance events', () => {
    const vehicles = getDemoVehicles()
    const familyCar = vehicles.find((v) => v.name === 'Family Car')!
    const refuelings = getDemoRefuelings(familyCar.id)
    const maintenance = getDemoMaintenanceEvents(familyCar.id)
    expect(refuelings.length).toBeGreaterThanOrEqual(20)
    expect(maintenance.length).toBeGreaterThanOrEqual(5)
  })

  it('City EV has 10+ refuelings', () => {
    const vehicles = getDemoVehicles()
    const ev = vehicles.find((v) => v.name === 'City EV')!
    const refuelings = getDemoRefuelings(ev.id)
    expect(refuelings.length).toBeGreaterThanOrEqual(10)
  })
})

// --- Determinism test ---

describe('Demo data determinism', () => {
  it('calling functions twice returns identical results', () => {
    expect(getDemoPortfolios()).toEqual(getDemoPortfolios())
    expect(getDemoPlatforms()).toEqual(getDemoPlatforms())
    expect(getDemoUtilities()).toEqual(getDemoUtilities())
    expect(getDemoVehicles()).toEqual(getDemoVehicles())

    const platforms = getDemoPlatforms()
    for (const platform of platforms) {
      expect(getDemoDataPoints(platform.id)).toEqual(getDemoDataPoints(platform.id))
      expect(getDemoTransactions(platform.id)).toEqual(getDemoTransactions(platform.id))
    }

    const utilities = getDemoUtilities()
    for (const utility of utilities) {
      expect(getDemoMeterReadings(utility.id)).toEqual(getDemoMeterReadings(utility.id))
      expect(getDemoUtilityBills(utility.id)).toEqual(getDemoUtilityBills(utility.id))
    }

    const vehicles = getDemoVehicles()
    for (const vehicle of vehicles) {
      expect(getDemoRefuelings(vehicle.id)).toEqual(getDemoRefuelings(vehicle.id))
      expect(getDemoMaintenanceEvents(vehicle.id)).toEqual(getDemoMaintenanceEvents(vehicle.id))
    }
  })
})
