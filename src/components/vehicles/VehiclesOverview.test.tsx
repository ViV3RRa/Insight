import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { buildVehicle, buildRefueling } from '@/test/factories'
import { VehiclesOverview } from './VehiclesOverview'
import type { Vehicle } from '@/types/vehicles'

// Mock services
vi.mock('@/services/vehicles', () => ({
  getAll: vi.fn(),
}))
vi.mock('@/services/refuelings', () => ({
  getByVehicle: vi.fn(),
}))
vi.mock('@/services/maintenanceEvents', () => ({
  getByVehicle: vi.fn(),
}))

// Mock child components to isolate page assembly tests
vi.mock('@/components/vehicles/VehicleCard', () => ({
  VehicleCard: ({ vehicle }: { vehicle: Vehicle }) => (
    <div data-testid={`vehicle-card-${vehicle.id}`}>{vehicle.name}</div>
  ),
}))
vi.mock('@/components/vehicles/SoldVehicleCard', () => ({
  SoldVehicleCard: ({ vehicle }: { vehicle: Vehicle }) => (
    <div data-testid={`sold-vehicle-card-${vehicle.id}`}>{vehicle.name}</div>
  ),
}))

import * as vehicleService from '@/services/vehicles'
import * as refuelingService from '@/services/refuelings'
import * as maintenanceService from '@/services/maintenanceEvents'

const activeCar = buildVehicle({ name: 'Family Car', status: 'active' })
const activeBike = buildVehicle({ name: 'Commuter Bike', status: 'active', type: 'Motorcycle', fuelType: 'Petrol' })
const soldCar = buildVehicle({
  name: 'Old Sedan',
  status: 'sold',
  saleDate: '2025-06-01',
  salePrice: 120000,
})

function mockServicesWithVehicles(vehicles: Vehicle[]) {
  vi.mocked(vehicleService.getAll).mockResolvedValue(vehicles)
  vi.mocked(refuelingService.getByVehicle).mockResolvedValue([])
  vi.mocked(maintenanceService.getByVehicle).mockResolvedValue([])
}

describe('VehiclesOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title "Vehicles"', async () => {
    mockServicesWithVehicles([activeCar])

    renderWithProviders(<VehiclesOverview />)

    const headings = await screen.findAllByRole('heading', { name: 'Vehicles' })
    expect(headings.length).toBeGreaterThan(0)
  })

  it('renders action buttons', async () => {
    mockServicesWithVehicles([activeCar])

    renderWithProviders(<VehiclesOverview />)

    const refuelingButtons = await screen.findAllByRole('button', { name: '+ Add Refueling' })
    expect(refuelingButtons.length).toBeGreaterThan(0)

    const vehicleButtons = screen.getAllByRole('button', { name: '+ Add Vehicle' })
    expect(vehicleButtons.length).toBeGreaterThan(0)
  })

  it('renders active vehicles section with data-testid', async () => {
    mockServicesWithVehicles([activeCar, activeBike])

    renderWithProviders(<VehiclesOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('active-vehicles-section')).toBeInTheDocument()
    })

    expect(screen.getByTestId(`vehicle-card-${activeCar.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`vehicle-card-${activeBike.id}`)).toBeInTheDocument()
  })

  it('renders sold vehicles section in CollapsibleSection when sold vehicles exist', async () => {
    mockServicesWithVehicles([activeCar, soldCar])

    renderWithProviders(<VehiclesOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('sold-vehicles-section')).toBeInTheDocument()
    })

    // CollapsibleSection renders with the title
    expect(screen.getByText('Sold Vehicles')).toBeInTheDocument()
  })

  it('does not render sold section when no sold vehicles', async () => {
    mockServicesWithVehicles([activeCar, activeBike])

    renderWithProviders(<VehiclesOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('active-vehicles-section')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('sold-vehicles-section')).not.toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    // Never resolve — keeps loading state
    vi.mocked(vehicleService.getAll).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<VehiclesOverview />)

    expect(screen.queryByRole('heading', { name: 'Vehicles' })).not.toBeInTheDocument()
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('shows empty state when no vehicles', async () => {
    mockServicesWithVehicles([])

    renderWithProviders(<VehiclesOverview />)

    expect(await screen.findByText('No vehicles added yet')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add Vehicle' })).toBeInTheDocument()
  })

  it('shows correct subtitle with active/sold count', async () => {
    mockServicesWithVehicles([activeCar, activeBike, soldCar])

    renderWithProviders(<VehiclesOverview />)

    const subtitles = await screen.findAllByText(/2 active · 1 sold/)
    expect(subtitles.length).toBeGreaterThan(0)
  })

  it('shows last refueled date in subtitle when refuelings exist', async () => {
    const refueling = buildRefueling({
      vehicleId: activeCar.id,
      date: '2026-03-20',
      odometerReading: 16000,
    })

    vi.mocked(vehicleService.getAll).mockResolvedValue([activeCar])
    vi.mocked(refuelingService.getByVehicle).mockResolvedValue([refueling])
    vi.mocked(maintenanceService.getByVehicle).mockResolvedValue([])

    renderWithProviders(<VehiclesOverview />)

    const subtitles = await screen.findAllByText(/Last refueled Mar 20/)
    expect(subtitles.length).toBeGreaterThan(0)
  })

  it('page uses max-w-[1440px] container', async () => {
    mockServicesWithVehicles([activeCar])

    const { container } = renderWithProviders(<VehiclesOverview />)

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { name: 'Vehicles' })
      expect(headings.length).toBeGreaterThan(0)
    })

    const pageContainer = container.querySelector('.max-w-\\[1440px\\]')
    expect(pageContainer).toBeInTheDocument()
  })
})
