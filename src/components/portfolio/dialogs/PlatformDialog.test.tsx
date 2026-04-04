import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, within, userEvent } from '@/test/utils'
import { PlatformDialog } from './PlatformDialog'
import { buildPlatform } from '@/test/factories/investmentFactory'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
}

function renderDialog(overrides: Partial<Parameters<typeof PlatformDialog>[0]> = {}) {
  return renderWithProviders(<PlatformDialog {...defaultProps} {...overrides} />)
}

/**
 * The Dialog component renders two copies of content (desktop + mobile).
 * Helper to get the desktop dialog container for querying.
 */
function getDesktopDialog() {
  const dialog = screen.getByRole('dialog')
  // Desktop container is the `hidden sm:flex` div
  const desktopContainer = dialog.querySelector('.sm\\:flex')
  if (!desktopContainer) throw new Error('Desktop dialog container not found')
  return within(desktopContainer as HTMLElement)
}

describe('PlatformDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders "Add Platform" title', () => {
      renderDialog()
      const desktop = getDesktopDialog()
      expect(desktop.getByText('Add Platform')).toBeInTheDocument()
    })

    it('renders icon upload area, name, type, and currency fields', () => {
      renderDialog()
      const desktop = getDesktopDialog()
      expect(desktop.getByLabelText('Upload icon')).toBeInTheDocument()
      expect(desktop.getByLabelText(/Name/)).toBeInTheDocument()
      expect(desktop.getByLabelText(/Type/)).toBeInTheDocument()
      expect(desktop.getByLabelText(/Currency/)).toBeInTheDocument()
    })

    it('shows name required validation on submit', async () => {
      const user = userEvent.setup()
      renderDialog()
      const desktop = getDesktopDialog()

      // Provide icon and fill type/currency to isolate name validation
      const fileInput = desktop.getByTestId('icon-file-input')
      const file = new File(['img'], 'icon.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      await user.selectOptions(desktop.getByLabelText(/Type/), 'investment')
      await user.selectOptions(desktop.getByLabelText(/Currency/), 'DKK')

      await user.click(desktop.getByRole('button', { name: 'Save' }))
      expect(desktop.getByText('Name is required')).toBeInTheDocument()
    })

    it('shows type required validation on submit', async () => {
      const user = userEvent.setup()
      renderDialog()
      const desktop = getDesktopDialog()

      const fileInput = desktop.getByTestId('icon-file-input')
      const file = new File(['img'], 'icon.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      await user.type(desktop.getByLabelText(/Name/), 'Nordnet')
      await user.selectOptions(desktop.getByLabelText(/Currency/), 'DKK')

      await user.click(desktop.getByRole('button', { name: 'Save' }))
      expect(desktop.getByText('Type is required')).toBeInTheDocument()
    })

    it('shows currency required validation on submit', async () => {
      const user = userEvent.setup()
      renderDialog()
      const desktop = getDesktopDialog()

      const fileInput = desktop.getByTestId('icon-file-input')
      const file = new File(['img'], 'icon.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      await user.type(desktop.getByLabelText(/Name/), 'Nordnet')
      await user.selectOptions(desktop.getByLabelText(/Type/), 'investment')

      await user.click(desktop.getByRole('button', { name: 'Save' }))
      expect(desktop.getByText('Currency is required')).toBeInTheDocument()
    })

    it('shows icon required validation on submit', async () => {
      const user = userEvent.setup()
      renderDialog()
      const desktop = getDesktopDialog()

      await user.type(desktop.getByLabelText(/Name/), 'Nordnet')
      await user.selectOptions(desktop.getByLabelText(/Type/), 'investment')
      await user.selectOptions(desktop.getByLabelText(/Currency/), 'DKK')

      await user.click(desktop.getByRole('button', { name: 'Save' }))
      expect(desktop.getByText('Icon is required')).toBeInTheDocument()
    })

    it('calls onSave with name, icon, type, and currency on successful create', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderDialog({ onSave })
      const desktop = getDesktopDialog()

      const fileInput = desktop.getByTestId('icon-file-input')
      const file = new File(['img'], 'icon.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      await user.type(desktop.getByLabelText(/Name/), 'Nordnet')
      await user.selectOptions(desktop.getByLabelText(/Type/), 'investment')
      await user.selectOptions(desktop.getByLabelText(/Currency/), 'EUR')

      await user.click(desktop.getByRole('button', { name: 'Save' }))

      expect(onSave).toHaveBeenCalledWith({
        name: 'Nordnet',
        icon: file,
        type: 'investment',
        currency: 'EUR',
      })
    })
  })

  describe('Edit mode', () => {
    const activePlatform = buildPlatform({
      name: 'Saxo Bank',
      type: 'investment',
      currency: 'DKK',
      status: 'active',
      icon: 'saxo-icon.png',
    })

    it('renders "Edit Platform" title and pre-filled name', () => {
      renderDialog({ platform: activePlatform })
      const desktop = getDesktopDialog()
      expect(desktop.getByText('Edit Platform')).toBeInTheDocument()
      expect(desktop.getByDisplayValue('Saxo Bank')).toBeInTheDocument()
    })

    it('renders read-only type and currency badges', () => {
      renderDialog({ platform: activePlatform })
      const desktop = getDesktopDialog()
      expect(desktop.getByText('investment')).toBeInTheDocument()
      expect(desktop.getByText('DKK')).toBeInTheDocument()
      // Should not have select elements for type/currency in desktop
      expect(desktop.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('calls onSave with name and icon (null if unchanged) on successful edit', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderDialog({ platform: activePlatform, onSave })
      const desktop = getDesktopDialog()

      const nameInput = desktop.getByDisplayValue('Saxo Bank')
      await user.clear(nameInput)
      await user.type(nameInput, 'Nordnet')

      await user.click(desktop.getByRole('button', { name: 'Save' }))

      expect(onSave).toHaveBeenCalledWith({
        name: 'Nordnet',
        icon: null,
      })
    })

    it('does not include type or currency in edit save payload', async () => {
      const onSave = vi.fn()
      const user = userEvent.setup()
      renderDialog({ platform: activePlatform, onSave })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Save' }))

      const payload = onSave.mock.calls[0]![0] as Record<string, unknown>
      expect(payload).not.toHaveProperty('type')
      expect(payload).not.toHaveProperty('currency')
    })
  })

  describe('Icon upload', () => {
    it('renders file input and upload button', () => {
      renderDialog()
      const desktop = getDesktopDialog()
      expect(desktop.getByLabelText('Upload icon')).toBeInTheDocument()
      expect(desktop.getByTestId('icon-file-input')).toBeInTheDocument()
    })

    it('selecting a file shows preview image', async () => {
      const user = userEvent.setup()
      renderDialog()
      const desktop = getDesktopDialog()

      const fileInput = desktop.getByTestId('icon-file-input')
      const file = new File(['img'], 'icon.png', { type: 'image/png' })
      await user.upload(fileInput, file)

      const img = desktop.getByAltText('Platform icon')
      expect(img).toBeInTheDocument()
    })
  })

  describe('Close Platform', () => {
    const activePlatform = buildPlatform({
      name: 'Saxo Bank',
      status: 'active',
    })

    it('shows Close Platform button for active platforms in edit mode', () => {
      renderDialog({ platform: activePlatform })
      const desktop = getDesktopDialog()
      expect(desktop.getByRole('button', { name: 'Close Platform' })).toBeInTheDocument()
    })

    it('does not show Close Platform for closed platforms', () => {
      const closedPlatform = buildPlatform({
        status: 'closed',
        closedDate: '2026-03-01',
      })
      renderDialog({ platform: closedPlatform })
      const desktop = getDesktopDialog()
      expect(desktop.queryByRole('button', { name: 'Close Platform' })).not.toBeInTheDocument()
    })

    it('does not show Close Platform in create mode', () => {
      renderDialog()
      const desktop = getDesktopDialog()
      expect(desktop.queryByRole('button', { name: 'Close Platform' })).not.toBeInTheDocument()
    })

    it('expands to show closure date and note fields', async () => {
      const user = userEvent.setup()
      renderDialog({ platform: activePlatform })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Close Platform' }))

      expect(desktop.getByText('Closure Date')).toBeInTheDocument()
      expect(desktop.getByText('Closure Note')).toBeInTheDocument()
      expect(desktop.getByRole('button', { name: 'Confirm Close' })).toBeInTheDocument()
    })

    it('shows closure date required error when confirming without date', async () => {
      const user = userEvent.setup()
      renderDialog({ platform: activePlatform, onClosePlatform: vi.fn() })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Close Platform' }))
      await user.click(desktop.getByRole('button', { name: 'Confirm Close' }))

      expect(desktop.getByText('Closure date is required')).toBeInTheDocument()
    })

    it('calls onClosePlatform with date and note', async () => {
      const onClosePlatform = vi.fn()
      const user = userEvent.setup()
      renderDialog({ platform: activePlatform, onClosePlatform })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Close Platform' }))

      // Fill date input — the date input in the closure section
      const dateInputs = desktop.getAllByDisplayValue('')
      // The date input is the last empty-value input (the closure date)
      const dateInput = dateInputs.find((el) => el.getAttribute('type') === 'date')
      if (!dateInput) throw new Error('Date input not found')
      await user.type(dateInput, '2026-04-01')

      // Fill note
      const noteInput = desktop.getByPlaceholderText('Reason for closing')
      await user.type(noteInput, 'Migrating to new platform')

      await user.click(desktop.getByRole('button', { name: 'Confirm Close' }))

      expect(onClosePlatform).toHaveBeenCalledWith({
        closedDate: '2026-04-01',
        closureNote: 'Migrating to new platform',
      })
    })
  })

  describe('Closed platform info', () => {
    const closedPlatform = buildPlatform({
      name: 'Old Platform',
      status: 'closed',
      closedDate: '2026-03-01',
      closureNote: 'No longer in use',
    })

    it('shows closure date and note for closed platforms', () => {
      renderDialog({ platform: closedPlatform })
      const desktop = getDesktopDialog()
      expect(desktop.getByText('Closed on 2026-03-01')).toBeInTheDocument()
      expect(desktop.getByText('No longer in use')).toBeInTheDocument()
    })

    it('shows Reopen Platform button for closed platforms', () => {
      renderDialog({ platform: closedPlatform })
      const desktop = getDesktopDialog()
      expect(desktop.getByRole('button', { name: 'Reopen Platform' })).toBeInTheDocument()
    })

    it('calls onReopenPlatform when Reopen is clicked', async () => {
      const onReopenPlatform = vi.fn()
      const user = userEvent.setup()
      renderDialog({ platform: closedPlatform, onReopenPlatform })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Reopen Platform' }))
      expect(onReopenPlatform).toHaveBeenCalledOnce()
    })

    it('does not show closure note when there is none', () => {
      const platformNoNote = buildPlatform({
        status: 'closed',
        closedDate: '2026-03-01',
        closureNote: null,
      })
      renderDialog({ platform: platformNoNote })
      const desktop = getDesktopDialog()
      expect(desktop.getByText('Closed on 2026-03-01')).toBeInTheDocument()
      expect(desktop.queryByText('No longer in use')).not.toBeInTheDocument()
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      renderDialog({ onClose })
      const desktop = getDesktopDialog()

      await user.click(desktop.getByRole('button', { name: 'Cancel' }))
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('when closed', () => {
    it('renders nothing when isOpen is false', () => {
      renderDialog({ isOpen: false })
      expect(screen.queryByText('Add Platform')).not.toBeInTheDocument()
    })
  })
})
