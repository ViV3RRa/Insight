import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories'
import { UtilityDialog } from './UtilityDialog'

vi.mock('@/services/utilities', () => ({
  create: vi.fn().mockResolvedValue(buildUtility()),
  update: vi.fn().mockResolvedValue(buildUtility()),
}))

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
}

/**
 * The Dialog component renders both desktop and mobile layouts.
 * Helpers to get the first (desktop) instance of duplicated elements.
 */
function getNameInput() {
  return screen.getAllByPlaceholderText('e.g. Electricity')[0]!
}

function getUnitInput() {
  return screen.getAllByPlaceholderText('e.g. kWh, m³')[0]!
}

function getSaveButton() {
  return screen.getAllByRole('button', { name: 'Save' })[0]!
}

function getCancelButton() {
  return screen.getAllByRole('button', { name: 'Cancel' })[0]!
}

const ICON_LABELS = ['bolt', 'droplet', 'flame', 'sun', 'wind', 'thermometer', 'wifi', 'trash']
const COLOR_LABELS = ['amber', 'blue', 'orange', 'emerald', 'violet', 'rose', 'cyan', 'slate']

/** Get the first (desktop) icon button by label */
function getIconButton(label: string) {
  return screen.getAllByRole('button', { name: label }).find(
    (btn) => ICON_LABELS.includes(btn.getAttribute('aria-label') ?? ''),
  )!
}

/** Get the first (desktop) color button by label */
function getColorButton(label: string) {
  return screen.getAllByRole('button', { name: label }).find(
    (btn) => COLOR_LABELS.includes(btn.getAttribute('aria-label') ?? ''),
  )!
}

describe('UtilityDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens in create mode with empty fields', () => {
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    expect(screen.getAllByText('Add Utility').length).toBeGreaterThan(0)
    expect(getNameInput()).toHaveValue('')
    expect(getUnitInput()).toHaveValue('')

    // No icon should have the selected class
    ICON_LABELS.forEach((label) => {
      const buttons = screen.getAllByRole('button', { name: label })
      buttons.forEach((btn) => {
        expect(btn.className).not.toContain('border-accent-500')
      })
    })

    // No color should have the ring class
    COLOR_LABELS.forEach((label) => {
      const buttons = screen.getAllByRole('button', { name: label })
      buttons.forEach((btn) => {
        expect(btn.className).not.toContain('ring-2')
      })
    })
  })

  it('opens in edit mode pre-populated with existing utility values', () => {
    const utility = buildUtility({ name: 'Water', unit: 'm³', icon: 'droplet', color: 'blue' })
    renderWithProviders(<UtilityDialog {...defaultProps} utility={utility} />)

    expect(screen.getAllByText('Edit Utility').length).toBeGreaterThan(0)
    expect(getNameInput()).toHaveValue('Water')
    expect(getUnitInput()).toHaveValue('m³')

    // Droplet icon should be selected
    const dropletBtn = getIconButton('droplet')
    expect(dropletBtn.className).toContain('border-accent-500')

    // Blue color should be selected
    const blueBtn = getColorButton('blue')
    expect(blueBtn.className).toContain('ring-2')
  })

  it('shows 8 icon buttons and applies accent border on selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    // Each icon label appears in both desktop and mobile
    ICON_LABELS.forEach((label) => {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    })

    const flameBtn = getIconButton('flame')
    await user.click(flameBtn)

    expect(flameBtn.className).toContain('border-accent-500')
    expect(getIconButton('bolt').className).not.toContain('border-accent-500')
  })

  it('shows 8 color swatches and applies ring class on selection', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    COLOR_LABELS.forEach((label) => {
      expect(screen.getAllByRole('button', { name: label }).length).toBeGreaterThan(0)
    })

    const emeraldBtn = getColorButton('emerald')
    await user.click(emeraldBtn)

    expect(emeraldBtn.className).toContain('ring-2')
    expect(getColorButton('amber').className).not.toContain('ring-2')
  })

  it('shows validation error when name is empty on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    await user.click(getSaveButton())

    expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0)
  })

  it('shows validation error when unit is empty on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    await user.click(getSaveButton())

    expect(screen.getAllByText('Unit is required').length).toBeGreaterThan(0)
  })

  it('shows validation error when no icon is selected on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    await user.click(getSaveButton())

    expect(screen.getAllByText('Please select an icon').length).toBeGreaterThan(0)
  })

  it('shows validation error when no color is selected on save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    await user.click(getSaveButton())

    expect(screen.getAllByText('Please select a color').length).toBeGreaterThan(0)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(<UtilityDialog isOpen={true} onClose={onClose} />)

    await user.click(getCancelButton())

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('displays "Add Utility" title in create mode', () => {
    renderWithProviders(<UtilityDialog {...defaultProps} />)
    expect(screen.getAllByText('Add Utility').length).toBeGreaterThan(0)
  })

  it('displays "Edit Utility" title in edit mode', () => {
    const utility = buildUtility()
    renderWithProviders(<UtilityDialog {...defaultProps} utility={utility} />)
    expect(screen.getAllByText('Edit Utility').length).toBeGreaterThan(0)
  })

  it('does not render when isOpen is false', () => {
    renderWithProviders(<UtilityDialog isOpen={false} onClose={vi.fn()} />)
    expect(screen.queryByText('Add Utility')).not.toBeInTheDocument()
  })

  it('clears validation errors when fields are corrected', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UtilityDialog {...defaultProps} />)

    // Trigger validation
    await user.click(getSaveButton())
    expect(screen.getAllByText('Name is required').length).toBeGreaterThan(0)

    // Fix name error
    await user.type(getNameInput(), 'Gas')
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })
})
