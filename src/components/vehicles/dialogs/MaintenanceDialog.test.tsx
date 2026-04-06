import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildMaintenanceEvent, buildVehicle } from '@/test/factories/vehicleFactory'
import { MaintenanceDialog } from './MaintenanceDialog'
import { format } from 'date-fns'

vi.mock('@/services/maintenanceEvents', () => ({
  create: vi.fn().mockResolvedValue(buildMaintenanceEvent()),
  update: vi.fn().mockResolvedValue(buildMaintenanceEvent()),
}))

const vehicles = [
  buildVehicle({ name: 'Family Car' }),
  buildVehicle({ name: 'Work Van' }),
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

function renderDialog(overrides: Partial<Parameters<typeof MaintenanceDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<MaintenanceDialog {...props} />)
}

function getDateInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#maintenance-date')!
}

function getDescriptionInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#maintenance-description')!
}

function getCostInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#maintenance-cost')!
}

function getNoteInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#maintenance-note')!
}

function getVehicleSelect(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>('#maintenance-vehicle')
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Add Maintenance' })[0] as HTMLButtonElement
}

describe('MaintenanceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dialog title', () => {
    it('shows "Add Maintenance" in create mode', () => {
      renderDialog({ vehicleId: 'v-1' })

      expect(screen.getAllByText('Add Maintenance').length).toBeGreaterThan(0)
    })

    it('shows "Edit Maintenance" in edit mode', () => {
      const event = buildMaintenanceEvent()
      renderDialog({ event, vehicleId: 'v-1' })

      expect(screen.getAllByText('Edit Maintenance').length).toBeGreaterThan(0)
    })
  })

  describe('Date default', () => {
    it('defaults to today in create mode', () => {
      renderDialog({ vehicleId: 'v-1' })

      const today = format(new Date(), 'yyyy-MM-dd')
      expect(getDateInput()).toHaveValue(today)
    })
  })

  describe('Validation', () => {
    it('shows error when description is empty on submit', async () => {
      const user = userEvent.setup()
      renderDialog({ vehicleId: 'v-1' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Description is required').length).toBeGreaterThan(0)
    })

    it('shows error when cost is empty on submit', async () => {
      const user = userEvent.setup()
      renderDialog({ vehicleId: 'v-1' })

      await user.type(getDescriptionInput(), 'Oil change')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Cost is required').length).toBeGreaterThan(0)
    })
  })

  describe('DKK suffix', () => {
    it('shows DKK suffix on cost field', () => {
      renderDialog({ vehicleId: 'v-1' })

      expect(screen.getAllByText('DKK').length).toBeGreaterThan(0)
    })
  })

  describe('Receipt upload', () => {
    it('renders receipt upload area', () => {
      renderDialog({ vehicleId: 'v-1' })

      expect(screen.getAllByText('Drop file or click to upload').length).toBeGreaterThan(0)
    })
  })

  describe('Vehicle select', () => {
    it('is shown when no vehicleId prop', () => {
      renderDialog({ vehicles })

      expect(getVehicleSelect()).toBeInTheDocument()
      expect(screen.getAllByText('Family Car').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Work Van').length).toBeGreaterThan(0)
    })

    it('is hidden when vehicleId is provided', () => {
      renderDialog({ vehicleId: 'v-1' })

      expect(getVehicleSelect()).not.toBeInTheDocument()
    })
  })

  describe('Save & Add Another', () => {
    it('is shown in create mode', () => {
      renderDialog({ vehicleId: 'v-1' })

      expect(screen.getAllByText('Save & Add Another').length).toBeGreaterThan(0)
    })

    it('is hidden in edit mode', () => {
      const event = buildMaintenanceEvent()
      renderDialog({ event, vehicleId: 'v-1' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Edit mode', () => {
    it('pre-populates fields from event', () => {
      const event = buildMaintenanceEvent({
        date: '2026-03-15',
        description: 'Brake pads replacement',
        cost: 2500,
        note: 'Front brakes only',
      })
      renderDialog({ event, vehicleId: 'v-1' })

      expect(getDateInput()).toHaveValue('2026-03-15')
      expect(getDescriptionInput()).toHaveValue('Brake pads replacement')
      expect(getCostInput()).toHaveValue(2500)
      expect(getNoteInput()).toHaveValue('Front brakes only')
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderDialog({ vehicleId: 'v-1' })

      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
      await user.click(cancelButtons[0]!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })
})
