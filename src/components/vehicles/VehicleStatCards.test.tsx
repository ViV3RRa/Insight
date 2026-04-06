import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { buildVehicle } from '@/test/factories'
import { VehicleStatCards } from './VehicleStatCards'
import type { VehicleMetrics, TotalCostOfOwnership } from '@/types/vehicles'

function buildMetrics(overrides?: Partial<VehicleMetrics>): VehicleMetrics {
  return {
    allTimeEfficiency: 15.8,
    currentYearEfficiency: 16.2,
    rolling5Efficiency: 16.7,
    ytdKmDriven: 2840,
    ytdFuelCost: 1840,
    avgFuelCostPerMonth: 920,
    avgFuelCostPerDay: 30.5,
    totalMaintenanceCost: 3200,
    totalVehicleCost: 253200,
    totalCostOfOwnership: null,
    ...overrides,
  }
}

function buildTCO(overrides?: Partial<TotalCostOfOwnership>): TotalCostOfOwnership {
  return {
    lifetimeFuelCost: 45000,
    lifetimeMaintenanceCost: 12000,
    totalOperatingCost: 57000,
    purchaseToSaleOffset: -80000,
    ...overrides,
  }
}

describe('VehicleStatCards', () => {
  it('renders 7 stat cards for active vehicle', () => {
    const vehicle = buildVehicle({ status: 'active' })
    const { container } = renderWithProviders(
      <VehicleStatCards vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} />,
    )
    const grid = container.firstElementChild!
    expect(grid.children).toHaveLength(7)
  })

  it('shows efficiency unit km/l for Petrol', () => {
    const vehicle = buildVehicle({ fuelType: 'Petrol' })
    renderWithProviders(
      <VehicleStatCards vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} />,
    )
    expect(screen.getAllByText('km/l avg')).toHaveLength(2)
  })

  it('shows efficiency unit km/l for Diesel', () => {
    const vehicle = buildVehicle({ fuelType: 'Diesel' })
    renderWithProviders(
      <VehicleStatCards vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} />,
    )
    expect(screen.getAllByText('km/l avg')).toHaveLength(2)
  })

  it('shows efficiency unit km/kWh for Electric', () => {
    const vehicle = buildVehicle({ fuelType: 'Electric' })
    renderWithProviders(
      <VehicleStatCards vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} />,
    )
    expect(screen.getAllByText('km/kWh avg')).toHaveLength(2)
  })

  it('displays all-time, year, and rolling-5 efficiency values', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({
          allTimeEfficiency: 15.8,
          currentYearEfficiency: 16.2,
          rolling5Efficiency: 16.7,
        })}
        priorYearEfficiency={null}
      />,
    )
    expect(screen.getByText('15,8')).toBeInTheDocument()
    expect(screen.getByText('16,2')).toBeInTheDocument()
    expect(screen.getByText('16,7')).toBeInTheDocument()
  })

  it('shows YTD km, fuel cost, avg/month, avg/day values', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({
          ytdKmDriven: 2840,
          ytdFuelCost: 1840,
          avgFuelCostPerMonth: 920,
          avgFuelCostPerDay: 30.5,
        })}
        priorYearEfficiency={null}
      />,
    )
    expect(screen.getByText('2.840')).toBeInTheDocument()
    expect(screen.getByText('1.840')).toBeInTheDocument()
    expect(screen.getByText('920')).toBeInTheDocument()
    expect(screen.getByText('30,5')).toBeInTheDocument()
  })

  it('shows em-dash when metric value is null', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({
          allTimeEfficiency: null,
          currentYearEfficiency: null,
          rolling5Efficiency: null,
          avgFuelCostPerMonth: null,
          avgFuelCostPerDay: null,
        })}
        priorYearEfficiency={null}
      />,
    )
    const emDashes = screen.getAllByText('\u2014')
    expect(emDashes).toHaveLength(5)
  })

  it('year efficiency card shows badge with change vs prior year', () => {
    const vehicle = buildVehicle()
    const currentYear = new Date().getFullYear()
    renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({ currentYearEfficiency: 16.2 })}
        priorYearEfficiency={15.3}
      />,
    )
    expect(screen.getByText(`${currentYear} Efficiency`)).toBeInTheDocument()
    expect(screen.getByText('+0,9')).toBeInTheDocument()
  })

  it('year efficiency card shows negative badge when worse than prior year', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({ currentYearEfficiency: 14.0 })}
        priorYearEfficiency={15.3}
      />,
    )
    expect(screen.getByText('-1,3')).toBeInTheDocument()
  })

  it('sold vehicle shows Total Cost and Purchase→Sale instead of Avg/Month and Avg/Day', () => {
    const vehicle = buildVehicle({ status: 'sold' })
    const tco = buildTCO({ totalOperatingCost: 57000, purchaseToSaleOffset: -80000 })
    const { container } = renderWithProviders(
      <VehicleStatCards
        vehicle={vehicle}
        metrics={buildMetrics({ totalCostOfOwnership: tco })}
        priorYearEfficiency={null}
      />,
    )
    const grid = container.firstElementChild!
    expect(grid.children).toHaveLength(7)

    expect(screen.getByText('Total Cost')).toBeInTheDocument()
    expect(screen.getByText('57.000')).toBeInTheDocument()
    expect(screen.getByText('DKK lifetime')).toBeInTheDocument()

    expect(screen.getByText('Purchase→Sale')).toBeInTheDocument()
    expect(screen.getByText('-80.000')).toBeInTheDocument()
    expect(screen.getByText('DKK offset')).toBeInTheDocument()

    expect(screen.queryByText('Avg/Month')).not.toBeInTheDocument()
    expect(screen.queryByText('Avg/Day')).not.toBeInTheDocument()
  })

  it('grid has correct responsive classes for 2/4/7 columns', () => {
    const vehicle = buildVehicle()
    const { container } = renderWithProviders(
      <VehicleStatCards vehicle={vehicle} metrics={buildMetrics()} priorYearEfficiency={null} />,
    )
    const grid = container.firstElementChild!
    expect(grid.className).toContain('grid-cols-2')
    expect(grid.className).toContain('sm:grid-cols-4')
    expect(grid.className).toContain('lg:grid-cols-7')
  })
})
