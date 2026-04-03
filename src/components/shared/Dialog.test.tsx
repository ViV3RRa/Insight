import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { Dialog } from './Dialog'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Add Platform',
  onSave: vi.fn(),
  children: <div>Form content</div>,
}

function renderDialog(overrides = {}) {
  return renderWithProviders(
    <Dialog {...defaultProps} {...overrides} />,
  )
}

describe('Dialog', () => {
  // --- Visibility ---

  it('renders when isOpen is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // --- Title ---

  it('renders title with correct text', () => {
    renderDialog({ title: 'Edit Transaction' })
    // Both desktop and mobile titles render
    const titles = screen.getAllByText('Edit Transaction')
    expect(titles.length).toBeGreaterThanOrEqual(1)
  })

  // --- Close button ---

  it('close button (X) calls onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onClose })
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    await user.click(closeButtons[0]!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  // --- Backdrop ---

  it('backdrop click calls onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onClose })
    const backdrop = screen.getByTestId('dialog-backdrop')
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  // --- Escape key ---

  it('Escape key calls onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onClose })
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  // --- ARIA attributes ---

  it('has role="dialog" and aria-modal="true"', () => {
    renderDialog()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('aria-labelledby links to title', () => {
    renderDialog()
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBe('dialog-title')
    const title = document.getElementById('dialog-title')
    expect(title).toBeInTheDocument()
    expect(title?.textContent).toBe('Add Platform')
  })

  // --- Children ---

  it('renders children in body area', () => {
    renderDialog({ children: <p>Custom form fields</p> })
    // Both desktop and mobile bodies render children
    const elements = screen.getAllByText('Custom form fields')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  // --- Cancel button ---

  it('Cancel button calls onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onClose })
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
    await user.click(cancelButtons[0]!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  // --- Save button ---

  it('Save button calls onSave', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onSave })
    const saveButtons = screen.getAllByRole('button', { name: 'Save' })
    await user.click(saveButtons[0]!)
    expect(onSave).toHaveBeenCalledOnce()
  })

  // --- Save & Add Another ---

  it('Save & Add Another does not show by default', () => {
    renderDialog()
    expect(screen.queryByRole('button', { name: /Save & Add Another/i })).not.toBeInTheDocument()
  })

  it('Save & Add Another shows when showSaveAndAddAnother is true', () => {
    const onSaveAndAddAnother = vi.fn()
    renderDialog({ showSaveAndAddAnother: true, onSaveAndAddAnother })
    expect(screen.getAllByRole('button', { name: /Save & Add Another/i }).length).toBeGreaterThan(0)
  })

  it('Save & Add Another calls onSaveAndAddAnother', async () => {
    const onSaveAndAddAnother = vi.fn()
    const user = userEvent.setup()
    renderDialog({ showSaveAndAddAnother: true, onSaveAndAddAnother })
    const buttons = screen.getAllByRole('button', { name: /Save & Add Another/i })
    await user.click(buttons[0]!)
    expect(onSaveAndAddAnother).toHaveBeenCalledOnce()
  })

  // --- Loading state ---

  it('loading state disables buttons', () => {
    renderDialog({ loading: true })
    const saveButtons = screen.getAllByRole('button', { name: /Save/i })
    saveButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' })
    cancelButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  // --- Custom saveLabel ---

  it('custom saveLabel renders on save button', () => {
    renderDialog({ saveLabel: 'Update' })
    expect(screen.getAllByRole('button', { name: 'Update' }).length).toBeGreaterThan(0)
  })
})
