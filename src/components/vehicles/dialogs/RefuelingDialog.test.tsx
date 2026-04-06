import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildRefueling, buildVehicle } from '@/test/factories/vehicleFactory'
import { RefuelingDialog } from './RefuelingDialog'

vi.mock('@/services/refuelings', () => ({
  create: vi.fn().mockResolvedValue(buildRefueling()),
  update: vi.fn().mockResolvedValue(buildRefueling()),
  getReceiptUrl: vi.fn().mockReturnValue('http://example.com/receipt.jpg'),
  getTripCounterPhotoUrl: vi.fn().mockReturnValue('http://example.com/trip.jpg'),
}))

const petrolVehicle = buildVehicle({
  id: 'v-1' as ReturnType<typeof buildVehicle>['id'],
  name: 'Petrol Car',
  fuelType: 'Petrol',
})

const electricVehicle = buildVehicle({
  id: 'v-2' as ReturnType<typeof buildVehicle>['id'],
  name: 'Electric Car',
  fuelType: 'Electric',
})

const vehicles = [petrolVehicle, electricVehicle]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  vehicles,
}

function renderDialog(overrides: Partial<Parameters<typeof RefuelingDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<RefuelingDialog {...props} />)
}

// Dialog renders both desktop and mobile variants — helpers to get first match by ID.
function getDateInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#refueling-date')
  if (!input) throw new Error('Date input not found')
  return input
}

function getFuelAmountInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#refueling-fuelAmount')
  if (!input) throw new Error('Fuel amount input not found')
  return input
}

function getCostPerUnitInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#refueling-costPerUnit')
  if (!input) throw new Error('Cost per unit input not found')
  return input
}

function getTotalCostInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#refueling-totalCost')
  if (!input) throw new Error('Total cost input not found')
  return input
}

function getOdometerInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#refueling-odometer')
  if (!input) throw new Error('Odometer input not found')
  return input
}

function getVehicleSelect(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>('#refueling-vehicle')
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Add Refueling' })[0] as HTMLButtonElement
}

describe('RefuelingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add Refueling" title in create mode', () => {
    renderDialog()

    expect(screen.getAllByText('Add Refueling').length).toBeGreaterThan(0)
  })

  it('renders "Edit Refueling" title in edit mode', () => {
    const refueling = buildRefueling({
      vehicleId: petrolVehicle.id,
    })
    renderDialog({ refueling, vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(screen.getAllByText('Edit Refueling').length).toBeGreaterThan(0)
  })

  it('defaults date to today', () => {
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    expect(getDateInput().value).toBe(`${y}-${m}-${d}`)
  })

  it('shows "Fuel (L)" and "DKK / L" labels for Petrol', () => {
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(screen.getAllByText('Fuel (L)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DKK / L').length).toBeGreaterThan(0)
  })

  it('shows "Energy (kWh)" and "DKK / kWh" labels for Electric', () => {
    renderDialog({ vehicleId: 'v-2', vehicleFuelType: 'Electric' })

    expect(screen.getAllByText('Energy (kWh)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DKK / kWh').length).toBeGreaterThan(0)
  })

  it('auto-computes total cost from fuel × cost/unit', async () => {
    const user = userEvent.setup()
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    await user.type(getFuelAmountInput(), '40')
    await user.type(getCostPerUnitInput(), '12.50')

    expect(getTotalCostInput().value).toBe('500.00')
  })

  it('shows km suffix on odometer field', () => {
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(screen.getAllByText('km').length).toBeGreaterThan(0)
  })

  it('shows "Charged at home" checkbox only for Electric', () => {
    renderDialog({ vehicleId: 'v-2', vehicleFuelType: 'Electric' })

    expect(screen.getAllByText('Charged at home').length).toBeGreaterThan(0)
  })

  it('hides "Charged at home" checkbox for Petrol', () => {
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(screen.queryByText('Charged at home')).not.toBeInTheDocument()
  })

  it('shows vehicle select when no vehicleId prop', () => {
    renderDialog()

    expect(getVehicleSelect()).not.toBeNull()
  })

  it('hides vehicle select when vehicleId is provided', () => {
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(getVehicleSelect()).toBeNull()
  })

  it('shows "Save & Add Another" in create mode', () => {
    renderDialog()

    expect(screen.getAllByRole('button', { name: 'Save & Add Another' }).length).toBeGreaterThan(0)
  })

  it('hides "Save & Add Another" in edit mode', () => {
    const refueling = buildRefueling({ vehicleId: petrolVehicle.id })
    renderDialog({ refueling, vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
  })

  it('pre-populates fields in edit mode', () => {
    const refueling = buildRefueling({
      vehicleId: petrolVehicle.id,
      date: '2026-03-10',
      fuelAmount: 42.5,
      costPerUnit: 13.20,
      totalCost: 561,
      odometerReading: 25000,
      station: 'Shell',
      note: 'Highway trip',
    })
    renderDialog({ refueling, vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    expect(getDateInput().value).toBe('2026-03-10')
    expect(getFuelAmountInput()).toHaveValue(42.5)
    expect(getCostPerUnitInput()).toHaveValue(13.2)
    expect(getTotalCostInput()).toHaveValue(561)
    expect(getOdometerInput()).toHaveValue(25000)
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    renderDialog({ vehicleId: 'v-1', vehicleFuelType: 'Petrol' })

    // Clear the date to trigger all required errors
    await user.clear(getDateInput())
    await user.click(getSaveButton())

    expect(screen.getAllByText('Date is required').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Fuel amount is required').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cost per unit is required').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Odometer reading is required').length).toBeGreaterThan(0)
  })
})
