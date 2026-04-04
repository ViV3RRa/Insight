import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildDataPoint } from '@/test/factories/investmentFactory'
import { DataPointDialog } from './DataPointDialog'
import type { PlatformOption } from './DataPointDialog'

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

function renderDialog(overrides: Partial<Parameters<typeof DataPointDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<DataPointDialog {...props} />)
}

// Dialog renders both desktop and mobile variants, so most elements appear twice.
// Helper to get the first match for form elements.
function getValueInput(): HTMLInputElement {
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
  const select = document.querySelector<HTMLSelectElement>('#dp-platform')
  if (!select) throw new Error('Platform select not found')
  return select
}

function getSaveButton(): HTMLButtonElement {
  return screen.getAllByRole('button', { name: 'Save' })[0] as HTMLButtonElement
}

describe('DataPointDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders "Add Data Point" title with empty fields', () => {
      renderDialog()

      expect(screen.getAllByText('Add Data Point').length).toBeGreaterThan(0)
      expect(getValueInput()).toHaveValue(null)
      expect(getNoteInput()).toHaveValue('')
    })

    it('defaults timestamp to current time', () => {
      renderDialog()

      // Should have a value (non-empty) representing "now"
      expect(getTimestampInput().value).toBeTruthy()
    })
  })

  describe('Edit mode', () => {
    const dataPoint = buildDataPoint({
      value: 12500,
      timestamp: '2026-03-15T10:30:00.000Z',
      note: 'Monthly snapshot',
      isInterpolated: false,
    })

    it('renders "Edit Data Point" title with pre-filled fields', () => {
      renderDialog({ dataPoint, platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.getAllByText('Edit Data Point').length).toBeGreaterThan(0)
      expect(getValueInput()).toHaveValue(12500)
      expect(getNoteInput()).toHaveValue('Monthly snapshot')
    })

    it('does not show "Save & Add Another" button', () => {
      renderDialog({ dataPoint, platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Platform select', () => {
    it('is shown when platformId prop is NOT provided', () => {
      renderDialog()

      const selects = document.querySelectorAll('#dp-platform')
      expect(selects.length).toBeGreaterThan(0)
    })

    it('is hidden when platformId prop IS provided', () => {
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      const selects = document.querySelectorAll('#dp-platform')
      expect(selects.length).toBe(0)
    })

    it('groups options by type (Investment / Cash)', () => {
      renderDialog()

      const select = getPlatformSelect()
      const optgroups = select.querySelectorAll('optgroup')
      expect(optgroups).toHaveLength(2)
      expect(optgroups[0]).toHaveAttribute('label', 'Investment')
      expect(optgroups[1]).toHaveAttribute('label', 'Cash')
    })
  })

  describe('Currency suffix', () => {
    it('shows currency matching selected platform', async () => {
      const user = userEvent.setup()
      renderDialog()

      // Default shows DKK (fallback)
      expect(screen.getAllByText('DKK').length).toBeGreaterThan(0)

      // Select Saxo Bank (EUR)
      await user.selectOptions(getPlatformSelect(), 'plat-2')
      expect(screen.getAllByText('EUR').length).toBeGreaterThan(0)
    })

    it('shows selectedCurrency when platformId is provided', () => {
      renderDialog({ platformId: 'plat-2', selectedCurrency: 'EUR' })

      expect(screen.getAllByText('EUR').length).toBeGreaterThan(0)
    })
  })

  describe('Validation', () => {
    it('shows error when value is empty', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Value is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when value is negative', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getValueInput(), '-5')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Value must be zero or greater').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when platform is not selected', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Platform is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when timestamp is cleared', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      // Clear the timestamp
      await user.clear(getTimestampInput())
      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Date and time is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('does not show error for empty note', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getValueInput(), '100')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalled()
    })

    it('clears value error when user types', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.click(getSaveButton())

      expect(screen.getAllByText('Value is required').length).toBeGreaterThan(0)

      await user.type(getValueInput(), '5')

      expect(screen.queryByText('Value is required')).not.toBeInTheDocument()
    })
  })

  describe('Save', () => {
    it('calls onSave with correct data', async () => {
      const user = userEvent.setup()
      renderDialog({ platformId: 'plat-1', selectedCurrency: 'DKK' })

      await user.type(getValueInput(), '15000')
      await user.type(getNoteInput(), 'Test note')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-1',
          value: 15000,
          note: 'Test note',
        }),
      )
    })

    it('calls onSave with selected platform from dropdown', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.selectOptions(getPlatformSelect(), 'plat-2')
      await user.type(getValueInput(), '8000')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-2',
          value: 8000,
        }),
      )
    })
  })

  describe('Save & Add Another', () => {
    it('calls onSaveAndAddAnother when provided', async () => {
      const user = userEvent.setup()
      const onSaveAndAddAnother = vi.fn()
      renderDialog({
        onSaveAndAddAnother,
        platformId: 'plat-1',
        selectedCurrency: 'DKK',
      })

      await user.type(getValueInput(), '5000')

      const saaButtons = screen.getAllByRole('button', { name: 'Save & Add Another' })
      await user.click(saaButtons[0]!)

      expect(onSaveAndAddAnother).toHaveBeenCalledWith(
        expect.objectContaining({
          platformId: 'plat-1',
          value: 5000,
        }),
      )
    })

    it('is not shown in edit mode', () => {
      const dataPoint = buildDataPoint()
      renderDialog({
        dataPoint,
        platformId: 'plat-1',
        selectedCurrency: 'DKK',
        onSaveAndAddAnother: vi.fn(),
      })

      expect(screen.queryByText('Save & Add Another')).not.toBeInTheDocument()
    })
  })

  describe('Interpolation banner', () => {
    it('is shown when editing an interpolated data point', () => {
      const dataPoint = buildDataPoint({ isInterpolated: true })
      renderDialog({ dataPoint, platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.getAllByText(/interpolated \(estimated\) value/).length).toBeGreaterThan(0)
    })

    it('is hidden for non-interpolated data point', () => {
      const dataPoint = buildDataPoint({ isInterpolated: false })
      renderDialog({ dataPoint, platformId: 'plat-1', selectedCurrency: 'DKK' })

      expect(screen.queryByText(/interpolated \(estimated\) value/)).not.toBeInTheDocument()
    })

    it('is hidden in create mode', () => {
      renderDialog()

      expect(screen.queryByText(/interpolated \(estimated\) value/)).not.toBeInTheDocument()
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

      expect(screen.queryByText('Add Data Point')).not.toBeInTheDocument()
    })
  })
})
