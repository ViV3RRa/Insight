import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildMeterReading, buildUtility } from '@/test/factories/homeFactory'
import { MeterReadingDialog } from './MeterReadingDialog'

vi.mock('@/services/meterReadings', () => ({
  create: vi.fn().mockResolvedValue(buildMeterReading()),
  update: vi.fn().mockResolvedValue(buildMeterReading()),
}))

const utilities = [
  buildUtility({ id: 'util-1' as ReturnType<typeof buildUtility>['id'], name: 'Electricity', unit: 'kWh' }),
  buildUtility({ id: 'util-2' as ReturnType<typeof buildUtility>['id'], name: 'Water', unit: 'm³' }),
  buildUtility({ id: 'util-3' as ReturnType<typeof buildUtility>['id'], name: 'Gas', unit: 'm³' }),
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  utilities,
}

function renderDialog(overrides: Partial<Parameters<typeof MeterReadingDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<MeterReadingDialog {...props} />)
}

// Dialog renders both desktop and mobile variants, so most elements appear twice.
// Helpers to get the first match.
function getValueInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#reading-value')
  if (!input) throw new Error('Value input not found')
  return input
}

function getNoteInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#reading-note')
  if (!input) throw new Error('Note input not found')
  return input
}

function getTimestampInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('#reading-timestamp')
  if (!input) throw new Error('Timestamp input not found')
  return input
}

function getUtilitySelect(): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>('#reading-utility')
  if (!select) throw new Error('Utility select not found')
  return select
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Save' })[0] as HTMLButtonElement
}

describe('MeterReadingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('opens with empty form except timestamp defaults to now', () => {
      renderDialog()

      expect(screen.getAllByText('Add Reading').length).toBeGreaterThan(0)
      expect(getValueInput()).toHaveValue(null)
      expect(getNoteInput()).toHaveValue('')
      expect(getTimestampInput().value).toBeTruthy()
    })

    it('defaults timestamp to current time', () => {
      renderDialog()

      expect(getTimestampInput().value).toBeTruthy()
    })
  })

  describe('Edit mode', () => {
    const reading = buildMeterReading({
      utilityId: 'util-1' as ReturnType<typeof buildMeterReading>['utilityId'],
      value: 5432,
      timestamp: '2026-03-15T10:30:00.000Z',
      note: 'Meter replaced',
    })

    it('opens pre-populated with existing reading values', () => {
      renderDialog({ reading, utilityId: 'util-1' })

      expect(screen.getAllByText('Edit Reading').length).toBeGreaterThan(0)
      expect(getValueInput()).toHaveValue(5432)
      expect(getNoteInput()).toHaveValue('Meter replaced')
    })

    it('does not show "Save & Add Another" button', () => {
      renderDialog({ reading, utilityId: 'util-1' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Utility select', () => {
    it('is shown when no utilityId prop provided', () => {
      renderDialog()

      const selects = document.querySelectorAll('#reading-utility')
      expect(selects.length).toBeGreaterThan(0)
    })

    it('is hidden when utilityId prop is provided', () => {
      renderDialog({ utilityId: 'util-1' })

      const selects = document.querySelectorAll('#reading-utility')
      expect(selects.length).toBe(0)
    })

    it('lists all utilities as options', () => {
      renderDialog()

      const select = getUtilitySelect()
      const options = select.querySelectorAll('option')
      // 1 placeholder + 3 utilities
      expect(options).toHaveLength(4)
      expect(options[1]).toHaveTextContent('Electricity')
      expect(options[2]).toHaveTextContent('Water')
      expect(options[3]).toHaveTextContent('Gas')
    })
  })

  describe('Unit suffix', () => {
    it('shows unit matching selected utility', async () => {
      const user = userEvent.setup()
      renderDialog()

      // Select Electricity (kWh)
      await user.selectOptions(getUtilitySelect(), 'util-1')
      expect(screen.getAllByText('kWh').length).toBeGreaterThan(0)
    })

    it('shows unit when utilityId is provided', () => {
      renderDialog({ utilityId: 'util-2' })

      expect(screen.getAllByText('m³').length).toBeGreaterThan(0)
    })

    it('does not show unit when no utility is selected', () => {
      renderDialog()

      // No unit suffix visible since no utility selected
      expect(screen.queryByText('kWh')).not.toBeInTheDocument()
      expect(screen.queryByText('m³')).not.toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('shows error when value is empty on save', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Reading value is required').length).toBeGreaterThan(0)
    })

    it('shows error when utility is not selected', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Please select a utility').length).toBeGreaterThan(0)
    })

    it('shows error when timestamp is cleared', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.clear(getTimestampInput())
      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Date is required').length).toBeGreaterThan(0)
    })
  })

  describe('Note field', () => {
    it('is optional — save succeeds without it', async () => {
      const meterReadingService = await import('@/services/meterReadings')
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(meterReadingService.create).toHaveBeenCalled()
    })
  })

  describe('Save & Add Another', () => {
    it('is shown in create mode', () => {
      renderDialog()

      expect(screen.getAllByRole('button', { name: 'Save & Add Another' }).length).toBeGreaterThan(0)
    })

    it('is hidden in edit mode', () => {
      const reading = buildMeterReading()
      renderDialog({ reading, utilityId: 'util-1' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderDialog()

      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
      await user.click(cancelButtons[0]!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Dialog title', () => {
    it('is "Add Reading" in create mode', () => {
      renderDialog()

      expect(screen.getAllByText('Add Reading').length).toBeGreaterThan(0)
    })

    it('is "Edit Reading" in edit mode', () => {
      const reading = buildMeterReading()
      renderDialog({ reading, utilityId: 'util-1' })

      expect(screen.getAllByText('Edit Reading').length).toBeGreaterThan(0)
    })
  })

  describe('Closed state', () => {
    it('does not render when isOpen is false', () => {
      renderDialog({ isOpen: false })

      expect(screen.queryByText('Add Reading')).not.toBeInTheDocument()
    })
  })
})
