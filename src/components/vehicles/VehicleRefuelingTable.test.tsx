import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildRefueling } from '@/test/factories'
import { VehicleRefuelingTable } from './VehicleRefuelingTable'
import type { Refueling, FuelType } from '@/types/vehicles'

const vehicleId = 'vehicle_001' as Refueling['vehicleId']

function makeRefuelings(): Refueling[] {
  return [
    buildRefueling({
      vehicleId,
      date: '2026-01-10',
      fuelAmount: 40,
      costPerUnit: 12.5,
      totalCost: 500,
      odometerReading: 10000,
      station: 'Shell',
    }),
    buildRefueling({
      vehicleId,
      date: '2026-02-05',
      fuelAmount: 45,
      costPerUnit: 13.0,
      totalCost: 585,
      odometerReading: 10500,
      station: 'Q8',
    }),
    buildRefueling({
      vehicleId,
      date: '2026-03-01',
      fuelAmount: 38,
      costPerUnit: 12.8,
      totalCost: 486.4,
      odometerReading: 11000,
      station: null,
    }),
  ]
}

function renderTable(overrides?: { refuelings?: Refueling[]; fuelType?: FuelType }) {
  const props = {
    refuelings: overrides?.refuelings ?? makeRefuelings(),
    fuelType: (overrides?.fuelType ?? 'Petrol') as FuelType,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAdd: vi.fn(),
  }
  const result = renderWithProviders(<VehicleRefuelingTable {...props} />)
  return { ...result, ...props }
}

describe('VehicleRefuelingTable', () => {
  it('renders CollapsibleSection with "Refueling" title', () => {
    renderTable()
    expect(screen.getByText('Refueling')).toBeInTheDocument()
  })

  it('shows refueling count badge', () => {
    renderTable()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('is collapsed by default (table not visible initially)', () => {
    renderTable()
    const toggle = screen.getByRole('button', { name: /refueling log/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('+ Add Refueling')).not.toBeInTheDocument()
  })

  it('shows "Add Refueling" button when expanded', async () => {
    const { onAdd } = renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    const addBtn = screen.getByText('+ Add Refueling')
    expect(addBtn).toBeInTheDocument()
    await user.click(addBtn)
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders date column for each refueling', async () => {
    renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    expect(screen.getByText('Mar 1, 2026')).toBeInTheDocument()
    expect(screen.getByText('Feb 5, 2026')).toBeInTheDocument()
    expect(screen.getByText('Jan 10, 2026')).toBeInTheDocument()
  })

  it('shows fuel amount with L unit for Petrol', async () => {
    renderTable({ fuelType: 'Petrol' })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    expect(screen.getByText(/40,0 L/)).toBeInTheDocument()
    expect(screen.getByText(/45,0 L/)).toBeInTheDocument()
  })

  it('shows fuel amount with kWh unit for Electric', async () => {
    const evRefuelings = [
      buildRefueling({
        vehicleId,
        date: '2026-01-10',
        fuelAmount: 50,
        costPerUnit: 2.5,
        totalCost: 125,
        odometerReading: 10000,
        chargedAtHome: true,
      }),
    ]
    renderTable({ refuelings: evRefuelings, fuelType: 'Electric' })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    expect(screen.getByText(/50,0 kWh/)).toBeInTheDocument()
  })

  it('first refueling (oldest) shows "—" for efficiency', async () => {
    renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    // The oldest entry (Jan 10) should show "—" for efficiency
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('subsequent refuelings show computed efficiency', async () => {
    renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    // Feb 5: (10500 - 10000) / 45 = 11.111... → "11,1 km/L"
    expect(screen.getByText(/11,1 km\/L/)).toBeInTheDocument()
    // Mar 1: (11000 - 10500) / 38 = 13.157... → "13,2 km/L"
    expect(screen.getByText(/13,2 km\/L/)).toBeInTheDocument()
  })

  it('shows DKK/L for petrol and DKK/kWh for electric', async () => {
    renderTable({ fuelType: 'Petrol' })
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    expect(screen.getByText('DKK/L')).toBeInTheDocument()

    const evRefuelings = [
      buildRefueling({ vehicleId, date: '2026-01-10', fuelAmount: 50, costPerUnit: 2.5, totalCost: 125, odometerReading: 10000 }),
    ]
    const { unmount } = renderWithProviders(
      <VehicleRefuelingTable
        refuelings={evRefuelings}
        fuelType="Electric"
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAdd={vi.fn()}
      />,
    )
    await user.click(screen.getAllByRole('button', { name: /refueling log/i })[1]!)
    expect(screen.getByText('DKK/kWh')).toBeInTheDocument()
    unmount()
  })

  it('formats total cost correctly', async () => {
    renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    expect(screen.getByText('500 DKK')).toBeInTheDocument()
    expect(screen.getByText('585 DKK')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    const { onEdit } = renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button clicked', async () => {
    const { onDelete } = renderTable()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refueling log/i }))
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0]!)
    expect(onDelete).toHaveBeenCalledOnce()
  })
})
