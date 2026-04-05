import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildUtilityBill, buildUtility } from '@/test/factories/homeFactory'
import { BillDialog } from './BillDialog'

vi.mock('@/services/utilityBills', () => ({
  create: vi.fn().mockResolvedValue(buildUtilityBill()),
  update: vi.fn().mockResolvedValue(buildUtilityBill()),
}))

const utilities = [
  buildUtility({ name: 'Electricity' }),
  buildUtility({ name: 'Water' }),
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

function renderDialog(overrides: Partial<Parameters<typeof BillDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<BillDialog {...props} />)
}

function getAmountInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#bill-amount')!
}

function getPeriodStartInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#bill-period-start')!
}

function getPeriodEndInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#bill-period-end')!
}

function getTimestampInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#bill-timestamp')!
}

function getNoteInput(): HTMLInputElement {
  return document.querySelector<HTMLInputElement>('#bill-note')!
}

function getUtilitySelect(): HTMLSelectElement | null {
  return document.querySelector<HTMLSelectElement>('#bill-utility')
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Save' })[0] as HTMLButtonElement
}

describe('BillDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('opens with empty form and timestamp defaults to now', () => {
      renderDialog({ utilityId: 'util-1' })

      expect(screen.getAllByText('Add Bill').length).toBeGreaterThan(0)
      expect(getAmountInput()).toHaveValue(null)
      expect(getPeriodStartInput()).toHaveValue('')
      expect(getPeriodEndInput()).toHaveValue('')
      expect(getNoteInput()).toHaveValue('')
      // Timestamp should have a non-empty default (current time)
      expect(getTimestampInput().value).toBeTruthy()
    })
  })

  describe('Edit mode', () => {
    const bill = buildUtilityBill({
      amount: 1250,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
      timestamp: '2026-04-01T12:00:00.000Z',
      note: 'Q1 settlement',
    })

    it('opens pre-populated with existing bill values', () => {
      renderDialog({ bill, utilityId: 'util-1' })

      expect(screen.getAllByText('Edit Bill').length).toBeGreaterThan(0)
      expect(getAmountInput()).toHaveValue(1250)
      expect(getPeriodStartInput()).toHaveValue('2026-01-01')
      expect(getPeriodEndInput()).toHaveValue('2026-03-31')
      expect(getNoteInput()).toHaveValue('Q1 settlement')
      expect(getTimestampInput().value).toBeTruthy()
    })

    it('does not show "Save & Add Another"', () => {
      renderDialog({ bill, utilityId: 'util-1' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Utility select', () => {
    it('is shown when no utilityId prop', () => {
      renderDialog({ utilities })

      expect(getUtilitySelect()).toBeInTheDocument()
      expect(screen.getAllByText('Electricity').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Water').length).toBeGreaterThan(0)
    })

    it('is hidden when utilityId prop is provided', () => {
      renderDialog({ utilityId: 'util-1' })

      expect(getUtilitySelect()).not.toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('shows error when amount is empty', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Amount is required').length).toBeGreaterThan(0)
    })

    it('shows error when amount is not positive', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getAmountInput(), '0')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Amount must be positive').length).toBeGreaterThan(0)
    })

    it('shows error when period start is empty', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getAmountInput(), '500')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Period start is required').length).toBeGreaterThan(0)
    })

    it('shows error when period end is empty', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getAmountInput(), '500')
      // Set period start but not end
      await user.type(getPeriodStartInput(), '2026-01-01')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Period end is required').length).toBeGreaterThan(0)
    })

    it('shows error when period end is before period start', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getAmountInput(), '500')
      await user.type(getPeriodStartInput(), '2026-03-01')
      await user.type(getPeriodEndInput(), '2026-01-01')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Period end must be on or after period start').length).toBeGreaterThan(0)
    })

    it('shows error when utility not selected and no utilityId', async () => {
      const user = userEvent.setup()
      renderDialog({ utilities })

      await user.type(getAmountInput(), '500')
      await user.type(getPeriodStartInput(), '2026-01-01')
      await user.type(getPeriodEndInput(), '2026-01-31')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Please select a utility').length).toBeGreaterThan(0)
    })
  })

  describe('DKK suffix', () => {
    it('shows DKK suffix on amount field', () => {
      renderDialog({ utilityId: 'util-1' })

      expect(screen.getAllByText('DKK').length).toBeGreaterThan(0)
    })
  })

  describe('Note field', () => {
    it('is optional — no error when empty', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      await user.type(getAmountInput(), '500')
      await user.type(getPeriodStartInput(), '2026-01-01')
      await user.type(getPeriodEndInput(), '2026-01-31')
      await user.click(getSaveButton())

      // No note-related error shown
      expect(screen.queryByText('Note is required')).not.toBeInTheDocument()
    })
  })

  describe('Save & Add Another', () => {
    it('is shown in create mode', () => {
      renderDialog({ utilityId: 'util-1' })

      expect(screen.getAllByText('Save & Add Another').length).toBeGreaterThan(0)
    })

    it('is hidden in edit mode', () => {
      const bill = buildUtilityBill()
      renderDialog({ bill, utilityId: 'util-1' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderDialog({ utilityId: 'util-1' })

      const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
      await user.click(cancelButtons[0]!)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Dialog title', () => {
    it('shows "Add Bill" in create mode', () => {
      renderDialog({ utilityId: 'util-1' })

      expect(screen.getAllByText('Add Bill').length).toBeGreaterThan(0)
    })

    it('shows "Edit Bill" in edit mode', () => {
      const bill = buildUtilityBill()
      renderDialog({ bill, utilityId: 'util-1' })

      expect(screen.getAllByText('Edit Bill').length).toBeGreaterThan(0)
    })
  })

  describe('Closed state', () => {
    it('does not render when isOpen is false', () => {
      renderDialog({ isOpen: false })

      expect(screen.queryByText('Add Bill')).not.toBeInTheDocument()
    })
  })
})
