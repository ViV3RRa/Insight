import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildPortfolio } from '@/test/factories/investmentFactory'
import { PortfolioDialog } from './PortfolioDialog'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
}

function renderDialog(overrides: Partial<Parameters<typeof PortfolioDialog>[0]> = {}) {
  const props = { ...defaultProps, ...overrides }
  return renderWithProviders(<PortfolioDialog {...props} />)
}

/**
 * The Dialog component renders both desktop and mobile layouts.
 * Helper to get the first (desktop) instance of duplicated elements.
 */
function getNameInput() {
  return screen.getAllByPlaceholderText('e.g. My Portfolio')[0]!
}

function getOwnerInput() {
  return screen.getAllByPlaceholderText('e.g. Me, Erik')[0]!
}

function getSaveButton() {
  return screen.getAllByRole('button', { name: 'Save' })[0]!
}

function getCancelButton() {
  return screen.getAllByRole('button', { name: 'Cancel' })[0]!
}

function getCheckbox() {
  return screen.getAllByLabelText('Set as default portfolio')[0]!
}

describe('PortfolioDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders "Add Portfolio" title with empty fields', () => {
      renderDialog()

      expect(screen.getAllByText('Add Portfolio').length).toBeGreaterThan(0)
      expect(getNameInput()).toHaveValue('')
      expect(getOwnerInput()).toHaveValue('')
    })

    it('does not show "Is default" checkbox', () => {
      renderDialog()

      expect(screen.queryByLabelText('Set as default portfolio')).not.toBeInTheDocument()
    })
  })

  describe('Edit mode', () => {
    const portfolio = buildPortfolio({ name: 'My Portfolio', ownerName: 'Erik', isDefault: true })

    it('renders "Edit Portfolio" title with pre-filled fields', () => {
      renderDialog({ portfolio })

      expect(screen.getAllByText('Edit Portfolio').length).toBeGreaterThan(0)
      expect(getNameInput()).toHaveValue('My Portfolio')
      expect(getOwnerInput()).toHaveValue('Erik')
    })

    it('shows "Is default" checkbox', () => {
      renderDialog({ portfolio })

      expect(getCheckbox()).toBeInTheDocument()
    })

    it('pre-fills isDefault from portfolio.isDefault', () => {
      renderDialog({ portfolio })

      expect(getCheckbox()).toBeChecked()
    })

    it('pre-fills isDefault as unchecked when portfolio.isDefault is false', () => {
      const nonDefaultPortfolio = buildPortfolio({ isDefault: false })
      renderDialog({ portfolio: nonDefaultPortfolio })

      expect(getCheckbox()).not.toBeChecked()
    })

    it('disables "Is default" checkbox when isOnlyDefault is true', () => {
      renderDialog({ portfolio, isOnlyDefault: true })

      expect(getCheckbox()).toBeDisabled()
    })

    it('allows toggling "Is default" checkbox when isOnlyDefault is false', async () => {
      const user = userEvent.setup()
      const nonDefaultPortfolio = buildPortfolio({ isDefault: false })
      renderDialog({ portfolio: nonDefaultPortfolio, isOnlyDefault: false })

      const checkbox = getCheckbox()
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('Validation', () => {
    it('shows error when saving with empty name', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getOwnerInput(), 'Erik')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows error when saving with empty owner', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getNameInput(), 'Test Portfolio')
      await user.click(getSaveButton())

      expect(screen.getAllByText('Owner name is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('shows both errors when saving with all fields empty', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.click(getSaveButton())

      expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Owner name is required').length).toBeGreaterThan(0)
      expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    it('clears name error when user starts typing', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.click(getSaveButton())
      expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0)

      await user.type(getNameInput(), 'T')
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })

    it('clears owner error when user starts typing', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.click(getSaveButton())
      expect(screen.getAllByText('Owner name is required').length).toBeGreaterThan(0)

      await user.type(getOwnerInput(), 'E')
      expect(screen.queryByText('Owner name is required')).not.toBeInTheDocument()
    })
  })

  describe('Save', () => {
    it('calls onSave with correct data in create mode', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getNameInput(), 'New Portfolio')
      await user.type(getOwnerInput(), 'Erik')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'New Portfolio',
        ownerName: 'Erik',
        isDefault: false,
      })
    })

    it('calls onSave with correct data in edit mode', async () => {
      const user = userEvent.setup()
      const portfolio = buildPortfolio({ name: 'Old Name', ownerName: 'Old Owner', isDefault: false })
      renderDialog({ portfolio })

      const nameInput = getNameInput()
      const ownerInput = getOwnerInput()

      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Portfolio')
      await user.clear(ownerInput)
      await user.type(ownerInput, 'New Owner')
      await user.click(getCheckbox())
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'Updated Portfolio',
        ownerName: 'New Owner',
        isDefault: true,
      })
    })

    it('trims whitespace from name and owner', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.type(getNameInput(), '  Trimmed Name  ')
      await user.type(getOwnerInput(), '  Trimmed Owner  ')
      await user.click(getSaveButton())

      expect(defaultProps.onSave).toHaveBeenCalledWith({
        name: 'Trimmed Name',
        ownerName: 'Trimmed Owner',
        isDefault: false,
      })
    })
  })

  describe('Cancel', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderDialog()

      await user.click(getCancelButton())

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

      expect(screen.queryByText('Add Portfolio')).not.toBeInTheDocument()
    })
  })
})
