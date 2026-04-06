import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { VehicleDialog } from './VehicleDialog'
import { buildVehicle } from '@/test/factories'

// Mock vehicle service
vi.mock('@/services/vehicles', () => ({
  create: vi.fn(),
  update: vi.fn(),
  markAsSold: vi.fn(),
  reactivateVehicle: vi.fn(),
  getVehiclePhotoUrl: vi.fn(() => 'http://example.com/photo.jpg'),
}))

const onClose = vi.fn()

describe('VehicleDialog', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add Vehicle" title in create mode', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    // Dialog renders both desktop and mobile views
    expect(screen.getAllByText('Add Vehicle').length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Edit Vehicle" title in edit mode', () => {
    const vehicle = buildVehicle()
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} vehicle={vehicle} />,
    )
    expect(screen.getAllByText('Edit Vehicle').length).toBeGreaterThanOrEqual(1)
  })

  it('shows error when name is empty on submit', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )

    // Click the save button (first "Add Vehicle" button in the footer)
    const buttons = screen.getAllByRole('button', { name: /Add Vehicle/i })
    await user.click(buttons[0]!)

    expect(screen.getAllByText('Name is required').length).toBeGreaterThanOrEqual(1)
  })

  it('Type select has Car and Motorcycle options', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    const typeSelects = screen.getAllByLabelText('Type')
    const options = typeSelects[0]!.querySelectorAll('option')
    const values = Array.from(options).map((o) => o.textContent)
    expect(values).toContain('Car')
    expect(values).toContain('Motorcycle')
  })

  it('Fuel Type select has all 4 options', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    const fuelSelects = screen.getAllByLabelText('Fuel Type')
    const options = fuelSelects[0]!.querySelectorAll('option')
    const values = Array.from(options).map((o) => o.textContent)
    expect(values).toEqual(['Petrol', 'Diesel', 'Electric', 'Hybrid'])
  })

  it('pre-populates fields in edit mode', () => {
    const vehicle = buildVehicle({
      name: 'My Tesla',
      type: 'Car',
      fuelType: 'Electric',
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      licensePlate: 'EL 99 999',
    })

    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} vehicle={vehicle} />,
    )

    // Fields appear in both desktop and mobile, check at least one exists
    expect(screen.getAllByDisplayValue('My Tesla').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('Tesla').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('Model 3').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('2023').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByDisplayValue('EL 99 999').length).toBeGreaterThanOrEqual(1)
  })

  it('"Mark as Sold" button visible only in edit mode for active vehicles', () => {
    const vehicle = buildVehicle({ status: 'active' })
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} vehicle={vehicle} />,
    )
    expect(screen.getAllByTestId('mark-as-sold-button').length).toBeGreaterThanOrEqual(1)
  })

  it('"Mark as Sold" section NOT visible in create mode', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    expect(screen.queryByTestId('mark-as-sold-button')).not.toBeInTheDocument()
  })

  it('photo upload area is rendered', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    expect(screen.getAllByTestId('photo-upload').length).toBeGreaterThanOrEqual(1)
  })

  it('cancel button closes dialog', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i })
    await user.click(cancelButtons[0]!)
    expect(onClose).toHaveBeenCalled()
  })

  it('Make, Model, Year fields in 3-col grid', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    const grids = screen.getAllByTestId('make-model-year-grid')
    expect(grids[0]).toHaveClass('grid-cols-3')
    expect(screen.getAllByLabelText('Make').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByLabelText('Model').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByLabelText('Year').length).toBeGreaterThanOrEqual(1)
  })

  it('license plate field is rendered', () => {
    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} />,
    )
    expect(screen.getAllByLabelText('License Plate').length).toBeGreaterThanOrEqual(1)
  })

  it('shows sold vehicle info and reactivate button for sold vehicles', () => {
    const vehicle = buildVehicle({
      status: 'sold',
      saleDate: '2026-03-01',
      salePrice: 180000,
      saleNote: 'Sold to dealer',
    })

    renderWithProviders(
      <VehicleDialog isOpen={true} onClose={onClose} vehicle={vehicle} />,
    )

    expect(screen.getAllByText('Sale Information').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('2026-03-01').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Reactivate Vehicle').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId('mark-as-sold-button')).not.toBeInTheDocument()
  })
})
