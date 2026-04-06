import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { buildVehicle } from '@/test/factories'
import { VehicleDetailHeader } from './VehicleDetailHeader'
import type { Vehicle } from '@/types/vehicles'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderHeader(overrides?: Partial<Vehicle>, allVehicles?: Vehicle[]) {
  const vehicle = buildVehicle(overrides)
  const vehicles = allVehicles ?? [vehicle]
  const handlers = {
    onSelectVehicle: vi.fn(),
    onAddRefueling: vi.fn(),
    onAddMaintenance: vi.fn(),
    onEditVehicle: vi.fn(),
  }

  const result = renderWithProviders(
    <VehicleDetailHeader
      vehicle={vehicle}
      allVehicles={vehicles}
      {...handlers}
    />,
  )

  return { vehicle, handlers, ...result }
}

describe('VehicleDetailHeader', () => {
  it('renders vehicle name and make/model/year', () => {
    renderHeader({ name: 'My Tesla', make: 'Tesla', model: 'Model 3', year: 2023 })

    expect(screen.getByRole('heading', { name: 'My Tesla' })).toBeInTheDocument()
    expect(screen.getByText('Tesla Model 3 · 2023')).toBeInTheDocument()
  })

  it('renders FuelTypeBadge with correct fuel type', () => {
    renderHeader({ fuelType: 'Electric' })

    expect(screen.getByText('Electric')).toBeInTheDocument()
  })

  it('renders metadata chips: license plate, vehicle type, status', () => {
    renderHeader({ licensePlate: 'XY 99 888', type: 'Car', status: 'active' })

    expect(screen.getByText('XY 99 888')).toBeInTheDocument()
    expect(screen.getByText('Car')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows "Active" status with green dot for active vehicles', () => {
    renderHeader({ status: 'active' })

    const activeChip = screen.getByText('Active').closest('span')
    expect(activeChip).toHaveClass('text-accent-700')
    // Green dot
    const dot = activeChip?.querySelector('span.rounded-full')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveClass('bg-accent-500')
  })

  it('shows "Sold" status and sale info for sold vehicles', () => {
    renderHeader({
      status: 'sold',
      saleDate: '2025-06-15',
      salePrice: 180000,
      saleNote: 'Good condition',
    })

    expect(screen.getByText('Sold')).toBeInTheDocument()
    expect(screen.getByText(/Sold Jun 15, 2025/)).toBeInTheDocument()
    expect(screen.getByText(/180\.000 DKK/)).toBeInTheDocument()
    expect(screen.getByText(/Good condition/)).toBeInTheDocument()
  })

  it('renders action buttons (+ Add Refueling, + Add Maintenance)', () => {
    renderHeader()

    // Both desktop and mobile versions exist
    const refuelingButtons = screen.getAllByText('+ Add Refueling')
    const maintenanceButtons = screen.getAllByText('+ Add Maintenance')
    expect(refuelingButtons).toHaveLength(2) // desktop + mobile
    expect(maintenanceButtons).toHaveLength(2)
  })

  it('renders Edit button', () => {
    renderHeader()

    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('back button navigates to /vehicles', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderHeader()

    const backButton = screen.getByTitle('Back')
    await user.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/vehicles')
  })

  it('renders car silhouette when no photo for car type', () => {
    const { container } = renderHeader({ type: 'Car', photo: null })

    const svgs = container.querySelectorAll('svg')
    // Find the car silhouette SVG (has the specific car path)
    const carSvg = Array.from(svgs).find((svg) =>
      svg.querySelector('path[d*="M19 17H5v-7l3-6h8l3 6v7z"]'),
    )
    expect(carSvg).toBeInTheDocument()
  })

  it('renders motorcycle silhouette for motorcycle type', () => {
    const { container } = renderHeader({ type: 'Motorcycle', photo: null })

    const svgs = container.querySelectorAll('svg')
    const motorcycleSvg = Array.from(svgs).find((svg) =>
      svg.querySelector('path[d*="M5 17a2 2 0 100-4"]'),
    )
    expect(motorcycleSvg).toBeInTheDocument()
  })

  it('calls onAddRefueling when refueling button clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const { handlers } = renderHeader()

    const buttons = screen.getAllByText('+ Add Refueling')
    await user.click(buttons[0]!)

    expect(handlers.onAddRefueling).toHaveBeenCalledOnce()
  })

  it('calls onAddMaintenance when maintenance button clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const { handlers } = renderHeader()

    const buttons = screen.getAllByText('+ Add Maintenance')
    await user.click(buttons[0]!)

    expect(handlers.onAddMaintenance).toHaveBeenCalledOnce()
  })

  it('calls onEditVehicle when edit button clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    const { handlers } = renderHeader()

    await user.click(screen.getByText('Edit'))

    expect(handlers.onEditVehicle).toHaveBeenCalledOnce()
  })

  it('does not render sold info when vehicle is active', () => {
    renderHeader({ status: 'active' })

    expect(screen.queryByText(/^Sold /)).not.toBeInTheDocument()
  })
})
