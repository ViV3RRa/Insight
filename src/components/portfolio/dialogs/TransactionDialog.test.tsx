import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildTransaction } from '@/test/factories/investmentFactory'
import { TransactionDialog } from './TransactionDialog'
import type { PlatformOption } from './TransactionDialog'

const platforms: PlatformOption[] = [
  { id: 'plat-1', name: 'Nordnet', type: 'investment', currency: 'DKK', icon: 'nordnet.png' },
  { id: 'plat-2', name: 'Saxo Bank', type: 'investment', currency: 'EUR', icon: 'saxo.png' },
  { id: 'plat-3', name: 'Savings Account', type: 'cash', currency: 'DKK', icon: 'bank.png' },
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  platforms,
}

function renderDialog(overrides: Partial<Parameters<typeof TransactionDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<TransactionDialog {...props} />)
}

// Dialog renders both desktop and mobile variants, so most elements appear twice.
function getAmountInput(): HTMLInputElement {
  return screen.getAllByPlaceholderText('0.00')[0] as HTMLInputElement
}

function getNoteInput(): HTMLInputElement {
  return screen.getAllByPlaceholderText('Optional note')[0] as HTMLInputElement
}

function getTimestampInput(): HTMLInputElement {
  const input = document.querySelector<HTMLInputElement>('input[type="datetime-local"]')
  if (!input) throw new Error('Timestamp input not found')
  return input
}

function getPlatformSelect(): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>('#tx-platform')
  if (!select) throw new Error('Platform select not found')
  return select
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Save' })[0] as HTMLButtonElement
}

// Because Dialog renders desktop+mobile copies, there are duplicate radios with the same name.
// jsdom groups same-name radios, so `.checked` is unreliable. We check label styling instead.
function getDepositLabel(): HTMLLabelElement {
  return document.querySelector<HTMLInputElement>('input[name="txType"][value="deposit"]')!
    .closest('label') as HTMLLabelElement
}

function getWithdrawalLabel(): HTMLLabelElement {
  return document.querySelector<HTMLInputElement>('input[name="txType"][value="withdrawal"]')!
    .closest('label') as HTMLLabelElement
}

function isTypeSelected(label: HTMLLabelElement, variant: 'deposit' | 'withdrawal'): boolean {
  const activeClass = variant === 'deposit' ? 'border-emerald-500' : 'border-rose-500'
  return label.className.includes(activeClass)
}

describe('TransactionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders "Add Transaction" title', () => {
      renderDialog()

      expect(screen.getAllByText('Add Transaction').length).toBeGreaterThan(0)
    })

    it('defaults type to deposit', () => {
      renderDialog()

      expect(isTypeSelected(getDepositLabel(), 'deposit')).toBe(true)
      expect(isTypeSelected(getWithdrawalLabel(), 'withdrawal')).toBe(false)
    })

    it('defaults timestamp to current time', () => {
      renderDialog()

      expect(getTimestampInput().value).toBeTruthy()
    })

    it('has empty amount and note', () => {
      renderDialog()

      expect(getAmountInput()).toHaveValue(null)
      expect(getNoteInput()).toHaveValue('')
    })
  })

  describe('Edit mode', () => {
    const transaction = buildTransaction({
      type: 'withdrawal',
      amount: 2500,
      exchangeRate: 7.46,
      timestamp: '2026-03-15T10:30:00.000Z',
      note: 'Monthly withdrawal',
    })

    it('renders "Edit Transaction" title with pre-filled fields', () => {
      renderDialog({ transaction, platformId: 'plat-2', selectedCurrency: 'EUR' })

      expect(screen.getAllByText('Edit Transaction').length).toBeGreaterThan(0)
      expect(getAmountInput()).toHaveValue(2500)
      expect(getNoteInput()).toHaveValue('Monthly withdrawal')
    })

    it('pre-fills transaction type', () => {
      renderDialog({ transaction, platformId: 'plat-2', selectedCurrency: 'EUR' })

      expect(isTypeSelected(getWithdrawalLabel(), 'withdrawal')).toBe(true)
      expect(isTypeSelected(getDepositLabel(), 'deposit')).toBe(false)
    })

    it('does not show "Save & Add Another" button', () => {
      renderDialog({ transaction, platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Platform select', () => {
    it('is shown when platformId prop is NOT provided', () => {
      renderDialog()

      const selects = document.querySelectorAll('#tx-platform')
      expect(selects.length).toBeGreaterThan(0)
    })

    it('is hidden when platformId prop IS provided', () => {
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      const selects = document.querySelectorAll('#tx-platform')
      expect(selects.length).toBe(0)
    })
  })

  describe('Type radio buttons', () => {
    it('deposit has green styling when selected', () => {
      renderDialog()

      const depositLabel = getDepositLabel()
      expect(depositLabel.className).toContain('border-emerald-500')
      expect(depositLabel.className).toContain('bg-emerald-50')
    })

    it('withdrawal has default styling when not selected', () => {
      renderDialog()

      const withdrawalLabel = getWithdrawalLabel()
      expect(withdrawalLabel.className).toContain('border-base-200')
      expect(withdrawalLabel.className).not.toContain('border-rose-500')
    })

    it('clicking withdrawal changes type and styling', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.click(getWithdrawalLabel())

      expect(isTypeSelected(getWithdrawalLabel(), 'withdrawal')).toBe(true)
      expect(isTypeSelected(getDepositLabel(), 'deposit')).toBe(false)

      expect(getWithdrawalLabel().className).toContain('border-rose-500')
      expect(getWithdrawalLabel().className).toContain('bg-rose-50')

      expect(getDepositLabel().className).toContain('border-base-200')
      expect(getDepositLabel().className).not.toContain('border-emerald-500')
    })
  })

  describe('Validation', () => {
    it('shows error when amount is empty', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Amount is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when amount is zero', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getAmountInput(), '0')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Amount must be greater than zero').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when amount is negative', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getAmountInput(), '-5')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Amount must be greater than zero').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when platform is not selected', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getAmountInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Platform is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when timestamp is cleared', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.clear(getTimestampInput())
      await user.type(getAmountInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Date and time is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('clears amount error when user types', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.click(getSaveButton())
      expect(screen.getAllByText('Amount is required').length).toBeGreaterThan(0)

      await user.type(getAmountInput(), '5')
      expect(screen.queryByText('Amount is required')).not.toBeInTheDocument()
    })
  })

  describe('Exchange rate', () => {
    it('is hidden for DKK platforms', () => {
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(document.querySelector('#tx-exchange-rate')).not.toBeInTheDocument()
    })

    it('is shown for non-DKK platforms', () => {
      renderDialog({ platformId: 'plat-2', selectedCurrency: 'EUR' })

      expect(document.querySelector('#tx-exchange-rate')).toBeInTheDocument()
    })

    it('is pre-populated from defaultExchangeRate', () => {
      renderDialog({
        platformId: 'plat-2',
        selectedCurrency: 'EUR',
        defaultExchangeRate: 7.46,
      })

      const rateInput = document.querySelector<HTMLInputElement>('#tx-exchange-rate')!
      expect(rateInput).toHaveValue(7.46)
    })

    it('shows DKK equivalent preview when amount and rate are set', async () => {
      const user = userEvent.setup()
      renderDialog({
        platformId: 'plat-2',
        selectedCurrency: 'EUR',
        defaultExchangeRate: 7.46,
      })

      await user.type(getAmountInput(), '1000')

      // 1000 * 7.46 = 7460 → formatted as DKK
      expect(screen.getAllByText(/7\.460,00 DKK/).length).toBeGreaterThan(0)
    })
  })

  describe('Note and attachment', () => {
    it('note is optional — saves without it', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getAmountInput(), '100')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ note: '' }),
      )
    })

    it('renders FileUpload', () => {
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.getAllByText(/Drop file or click to upload/).length).toBeGreaterThan(0)
    })
  })

  describe('Save', () => {
    it('calls onSave with correct data for deposit', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getAmountInput(), '5000')
      await user.type(getNoteInput(), 'Test deposit')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-1',
          type: 'deposit',
          amount: 5000,
          exchangeRate: null,
          note: 'Test deposit',
          attachment: null,
        }),
      )
    })

    it('calls onSave with withdrawal type when selected', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.click(getWithdrawalLabel())
      await user.type(getAmountInput(), '1000')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'withdrawal',
          amount: 1000,
        }),
      )
    })

    it('calls onSave with selected platform from dropdown', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.selectOptions(getPlatformSelect(), 'plat-2')
      await user.type(getAmountInput(), '8000')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-2',
          amount: 8000,
        }),
      )
    })
  })

  describe('Save & Add Another', () => {
    it('is present in create mode', () => {
      renderDialog({ onSaveAndAddAnother: vi.fn(), platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.getAllByRole('button', { name: 'Save & Add Another' }).length).toBeGreaterThan(0)
    })

    it('is absent in edit mode', () => {
      const transaction = buildTransaction()
      renderDialog({
        transaction,
        platformId: 'plat-1',
        selectedCurrency: 'DKK',
        onSaveAndAddAnother: vi.fn(),
      })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })

    it('calls onSaveAndAddAnother and resets form', async () => {
      const user = userEvent.setup()
      const onSaveAndAddAnother = vi.fn()
      renderDialog({
        onSaveAndAddAnother,
        platformId: 'plat-1',
        selectedCurrency: 'DKK',
      })

      // Switch to withdrawal, fill amount and note
      await user.click(getWithdrawalLabel())
      await user.type(getAmountInput(), '3000')
      await user.type(getNoteInput(), 'Some note')

      const saaButton = screen.getAllByRole('button', { name: 'Save & Add Another' })[0]!
      await user.click(saaButton)

      expect(onSaveAndAddAnother).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-1',
          type: 'withdrawal',
          amount: 3000,
          note: 'Some note',
        }),
      )

      // Form should be reset: amount empty, note empty, type back to deposit
      expect(getAmountInput()).toHaveValue(null)
      expect(getNoteInput()).toHaveValue('')
      expect(isTypeSelected(getDepositLabel(), 'deposit')).toBe(true)
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderDialog()

      const cancelButton = screen.getAllByRole('button', { name: 'Cancel' })[0]!
      await user.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('disables save buttons when loading', () => {
      renderDialog({ loading: true })

      const saveButtons = screen.getAllByRole('button', { name: 'Save' })
      saveButtons.forEach((btn) => {
        expect(btn).toBeDisabled()
      })
    })
  })

  describe('Closed state', () => {
    it('renders nothing when isOpen is false', () => {
      renderDialog({ isOpen: false })

      expect(screen.queryByText('Add Transaction')).not.toBeInTheDocument()
    })
  })
})
