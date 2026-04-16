import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { VehicleMaintenanceTable } from './VehicleMaintenanceTable'
import { buildMaintenanceEvent } from '@/test/factories'

const baseEvents = [
  buildMaintenanceEvent({
    id: 'me-1' as MaintenanceEvent['id'],
    vehicleId: 'v-1' as MaintenanceEvent['vehicleId'],
    date: '2026-02-05',
    description: 'Annual service',
    cost: 275,
    note: 'VW dealership',
    ownerId: 'user-1' as MaintenanceEvent['ownerId'],
  }),
  buildMaintenanceEvent({
    id: 'me-2' as MaintenanceEvent['id'],
    vehicleId: 'v-1' as MaintenanceEvent['vehicleId'],
    date: '2025-11-15',
    description: 'Brake pads replaced',
    cost: 1850,
    note: null,
    ownerId: 'user-1' as MaintenanceEvent['ownerId'],
  }),
]

import type { MaintenanceEvent } from '@/types/vehicles'

describe('VehicleMaintenanceTable', () => {
  const defaultProps = {
    events: baseEvents,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAdd: vi.fn(),
  }

  it('renders CollapsibleSection with "Maintenance" title', () => {
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('shows event count badge', () => {
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    const toggle = screen.getByRole('button', { name: /maintenance log/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows "Add Maintenance" button when expanded', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    expect(screen.getByText('+ Add Maintenance')).toBeInTheDocument()
  })

  it('renders date column for each event', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    expect(screen.getByText('Feb 5, 2026')).toBeInTheDocument()
    expect(screen.getByText('Nov 15, 2025')).toBeInTheDocument()
  })

  it('renders description column', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    expect(screen.getByText('Annual service')).toBeInTheDocument()
    expect(screen.getByText('Brake pads replaced')).toBeInTheDocument()
  })

  it('formats cost with DKK suffix', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    expect(screen.getByText('275 DKK')).toBeInTheDocument()
    expect(screen.getByText('1.850 DKK')).toBeInTheDocument()
  })

  it('renders note as italic muted text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    const noteEl = screen.getByText('VW dealership')
    expect(noteEl).toHaveClass('italic', 'text-base-400', 'text-xs')
  })

  it('calls onAdd when Add Maintenance button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} onAdd={onAdd} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    await user.click(screen.getByText('+ Add Maintenance'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} onEdit={onEdit} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0]!)
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0]!)
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('shows records count in header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehicleMaintenanceTable {...defaultProps} />)
    await user.click(screen.getByRole('button', { name: /maintenance log/i }))
    expect(screen.getByText('2 records')).toBeInTheDocument()
  })
})
