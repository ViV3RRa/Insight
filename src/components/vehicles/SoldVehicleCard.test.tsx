import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { buildVehicle } from '@/test/factories'
import { SoldVehicleCard } from './SoldVehicleCard'
import type { TotalCostOfOwnership } from '@/types/vehicles'

function buildTCO(overrides?: Partial<TotalCostOfOwnership>): TotalCostOfOwnership {
  return {
    lifetimeFuelCost: 45000,
    lifetimeMaintenanceCost: 12000,
    totalOperatingCost: 57000,
    purchaseToSaleOffset: -30000,
    ...overrides,
  }
}

describe('SoldVehicleCard', () => {
  it('renders vehicle name and make/model/year with sale date', () => {
    const vehicle = buildVehicle({
      name: 'Old Faithful',
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      status: 'sold',
      saleDate: '2025-03-15',
    })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Old Faithful')).toBeInTheDocument()
    expect(screen.getByText(/Toyota Corolla · 2018 · Sold Mar 15, 2025/)).toBeInTheDocument()
  })

  it('shows muted opacity class (opacity-60)', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const link = screen.getByRole('link')
    expect(link.className).toContain('opacity-60')
  })

  it('shows "Sold" badge', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Sold')).toBeInTheDocument()
  })

  it('shows FuelTypeBadge', () => {
    const vehicle = buildVehicle({ fuelType: 'Diesel', status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Diesel')).toBeInTheDocument()
  })

  it('shows grayscale gradient', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    const { container } = renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const gradientDiv = container.querySelector('.from-base-100')
    expect(gradientDiv).toBeInTheDocument()
  })

  it('shows total cost of ownership when available', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO({ totalOperatingCost: 57000 })} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Total Cost')).toBeInTheDocument()
    expect(screen.getByText('57.000 DKK')).toBeInTheDocument()
  })

  it('shows lifetime fuel cost', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO({ lifetimeFuelCost: 45000 })} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Lifetime Fuel')).toBeInTheDocument()
    expect(screen.getByText('45.000 DKK')).toBeInTheDocument()
  })

  it('links to vehicle detail page', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/vehicles/${vehicle.id}`)
  })

  it('shows "—" when TCO is null', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={null} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const fuelLabel = screen.getByText('Lifetime Fuel')
    expect(fuelLabel.parentElement?.querySelector('.font-mono-data')?.textContent).toBe('—')

    const costLabel = screen.getByText('Total Cost')
    expect(costLabel.parentElement?.querySelector('.font-mono-data')?.textContent).toBe('—')
  })

  it('shows car silhouette for car type', () => {
    const vehicle = buildVehicle({ type: 'Car', status: 'sold', saleDate: '2025-01-01' })
    const { container } = renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const svg = container.querySelector('svg.w-24')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelector('path')?.getAttribute('d')).toContain('M19 17H5v-7')
  })

  it('shows motorcycle silhouette for motorcycle type', () => {
    const vehicle = buildVehicle({ type: 'Motorcycle', status: 'sold', saleDate: '2025-01-01' })
    const { container } = renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    const svg = container.querySelector('svg.w-24')
    expect(svg).toBeInTheDocument()
    expect(svg?.querySelector('path')?.getAttribute('d')).toContain('M5 17a2 2 0 100-4')
  })

  it('shows all-time efficiency with correct unit for petrol', () => {
    const vehicle = buildVehicle({ fuelType: 'Petrol', status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('All-Time Eff.')).toBeInTheDocument()
    expect(screen.getByText('14,2')).toBeInTheDocument()
    expect(screen.getByText('km/l')).toBeInTheDocument()
  })

  it('shows km/kWh unit for electric vehicles', () => {
    const vehicle = buildVehicle({ fuelType: 'Electric', status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={5.8} totalKmDriven={40000} />,
    )

    expect(screen.getByText('5,8')).toBeInTheDocument()
    expect(screen.getByText('km/kWh')).toBeInTheDocument()
  })

  it('shows "—" when allTimeEfficiency is null', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={null} totalKmDriven={85000} />,
    )

    const effLabel = screen.getByText('All-Time Eff.')
    expect(effLabel.parentElement?.querySelector('.font-mono-data')?.textContent).toBe('—')
  })

  it('shows total km driven', () => {
    const vehicle = buildVehicle({ status: 'sold', saleDate: '2025-01-01' })
    renderWithProviders(
      <SoldVehicleCard vehicle={vehicle} totalCostOfOwnership={buildTCO()} allTimeEfficiency={14.2} totalKmDriven={85000} />,
    )

    expect(screen.getByText('Km Driven')).toBeInTheDocument()
    expect(screen.getByText('85.000')).toBeInTheDocument()
    expect(screen.getByText('total km')).toBeInTheDocument()
  })
})
