import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { buildVehicle } from '@/test/factories'
import { VehicleCard } from './VehicleCard'
import type { VehicleMetrics } from '@/types/vehicles'

function buildMetrics(overrides?: Partial<VehicleMetrics>): VehicleMetrics {
  return {
    allTimeEfficiency: 15.2,
    currentYearEfficiency: 14.8,
    rolling5Efficiency: 15.0,
    ytdKmDriven: 8500,
    ytdFuelCost: 12300,
    avgFuelCostPerMonth: 2050,
    avgFuelCostPerDay: 68,
    totalMaintenanceCost: 3200,
    totalVehicleCost: 15500,
    totalCostOfOwnership: null,
    ...overrides,
  }
}

describe('VehicleCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders vehicle name and make/model/year subtitle', () => {
    const vehicle = buildVehicle({ name: 'Daily Driver', make: 'Honda', model: 'Civic', year: 2023, licensePlate: 'XY 98 765' })
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.getByText('Daily Driver')).toBeInTheDocument()
    expect(screen.getByText(/Honda Civic · 2023 · XY 98 765/)).toBeInTheDocument()
  })

  it('renders FuelTypeBadge with correct fuel type', () => {
    const vehicle = buildVehicle({ fuelType: 'Diesel' })
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.getByText('Diesel')).toBeInTheDocument()
  })

  it('shows current year efficiency with km/l unit for petrol', () => {
    const vehicle = buildVehicle({ fuelType: 'Petrol' })
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics({ currentYearEfficiency: 14.8 })} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.getByText('2026 Efficiency')).toBeInTheDocument()
    expect(screen.getByText('14,8')).toBeInTheDocument()
    expect(screen.getByText('km/l')).toBeInTheDocument()
  })

  it('shows km/kWh unit for electric vehicles', () => {
    const vehicle = buildVehicle({ fuelType: 'Electric' })
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics({ currentYearEfficiency: 5.4 })} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.getByText('5,4')).toBeInTheDocument()
    expect(screen.getByText('km/kWh')).toBeInTheDocument()
  })

  it('shows YTD km driven', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics({ ytdKmDriven: 8500 })} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.getByText('YTD Km')).toBeInTheDocument()
    expect(screen.getByText('8.500')).toBeInTheDocument()
    expect(screen.getByText('km driven')).toBeInTheDocument()
  })

  it('shows footer stats (YTD Fuel, YTD Total, Last fill)', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard
        vehicle={vehicle}
        metrics={buildMetrics({ ytdFuelCost: 12300, totalVehicleCost: 15500 })}
        priorYearEfficiency={null}
        lastRefuelingDate="2026-05-20"
      />,
    )

    expect(screen.getByText('YTD Fuel')).toBeInTheDocument()
    expect(screen.getByText('12.300 kr')).toBeInTheDocument()
    expect(screen.getByText('YTD Total')).toBeInTheDocument()
    expect(screen.getByText('15.500 kr')).toBeInTheDocument()
    expect(screen.getByText('Last fill')).toBeInTheDocument()
    expect(screen.getByText('May 20')).toBeInTheDocument()
  })

  it('card links to /vehicles/{id}', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/vehicles/${vehicle.id}`)
  })

  it('shows car silhouette when vehicle type is Car', () => {
    const vehicle = buildVehicle({ type: 'Car' })
    const { container } = renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    const svg = container.querySelector('svg.w-24')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelector('path')?.getAttribute('d')).toContain('M19 17H5v-7')
  })

  it('shows motorcycle silhouette when vehicle type is Motorcycle', () => {
    const vehicle = buildVehicle({ type: 'Motorcycle' })
    const { container } = renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    const svg = container.querySelector('svg.w-24')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelector('path')?.getAttribute('d')).toContain('M5 17a2 2 0 100-4')
  })

  it('shows change indicator when prior year efficiency available', () => {
    const vehicle = buildVehicle({ fuelType: 'Petrol' })
    renderWithProviders(
      <VehicleCard
        vehicle={vehicle}
        metrics={buildMetrics({ currentYearEfficiency: 15.5 })}
        priorYearEfficiency={14.0}
        lastRefuelingDate={null}
      />,
    )

    expect(screen.getByText(/\+1,5 km\/l vs 2025/)).toBeInTheDocument()
  })

  it('shows dash for metrics when values are null', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard
        vehicle={vehicle}
        metrics={buildMetrics({ currentYearEfficiency: null })}
        priorYearEfficiency={null}
        lastRefuelingDate={null}
      />,
    )

    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('shows dash for last fill when no refueling date', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    const lastFillLabel = screen.getByText('Last fill')
    const lastFillContainer = lastFillLabel.parentElement
    expect(lastFillContainer?.querySelector('.font-mono-data')?.textContent).toBe('—')
  })

  it('does not show change indicator when prior year efficiency is null', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} lastRefuelingDate={null} />,
    )

    expect(screen.queryByText(/vs 2025/)).not.toBeInTheDocument()
  })

  it('does not show change indicator when current year efficiency is null', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleCard
        vehicle={vehicle}
        metrics={buildMetrics({ currentYearEfficiency: null })}
        priorYearEfficiency={14.0}
        lastRefuelingDate={null}
      />,
    )

    expect(screen.queryByText(/vs 2025/)).not.toBeInTheDocument()
  })
})
