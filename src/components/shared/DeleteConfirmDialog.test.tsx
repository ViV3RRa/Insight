import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

const defaultProps = {
  isOpen: true,
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Delete Platform',
  description: 'This action cannot be undone. All data will be permanently removed.',
}

function renderDeleteDialog(overrides = {}) {
  return renderWithProviders(
    <DeleteConfirmDialog {...defaultProps} {...overrides} />,
  )
}

describe('DeleteConfirmDialog', () => {
  // --- Visibility ---

  it('renders when isOpen is true', () => {
    renderDeleteDialog()
    expect(screen.getByText('Delete Platform')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderDeleteDialog({ isOpen: false })
    expect(screen.queryByText('Delete Platform')).not.toBeInTheDocument()
  })

  // --- Title and description ---

  it('renders title from props', () => {
    renderDeleteDialog({ title: 'Remove Transaction' })
    expect(screen.getByText('Remove Transaction')).toBeInTheDocument()
  })

  it('renders description from props', () => {
    renderDeleteDialog()
    expect(screen.getByText('This action cannot be undone. All data will be permanently removed.')).toBeInTheDocument()
  })

  // --- Trash icon ---

  it('trash icon (rose circle) is present', () => {
    renderDeleteDialog()
    const icon = document.querySelector('.text-rose-500')
    expect(icon).toBeInTheDocument()
    const circle = icon?.closest('.bg-rose-50')
    expect(circle).toBeInTheDocument()
  })

  // --- Cancel button ---

  it('Cancel button calls onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderDeleteDialog({ onCancel })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  // --- Delete button ---

  it('Delete button calls onConfirm', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderDeleteDialog({ onConfirm })
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  // --- Backdrop ---

  it('backdrop click calls onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderDeleteDialog({ onCancel })
    await user.click(screen.getByTestId('delete-dialog-backdrop'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  // --- Escape key ---

  it('Escape key calls onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    renderDeleteDialog({ onCancel })
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  // --- Delete button destructive styling ---

  it('Delete button has destructive styling', () => {
    renderDeleteDialog()
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    expect(deleteBtn.className).toContain('bg-rose-500')
  })

  // --- z-[60] stacking ---

  it('z-[60] stacking on backdrop and dialog container', () => {
    renderDeleteDialog()
    const backdrop = screen.getByTestId('delete-dialog-backdrop')
    expect(backdrop.className).toContain('z-[60]')
    // The outer wrapper and centering container also have z-[60]
    const wrapper = backdrop.parentElement
    expect(wrapper?.className).toContain('z-[60]')
  })

  // --- Loading state ---

  it('loading disables buttons', () => {
    renderDeleteDialog({ loading: true })
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Delete/i })).toBeDisabled()
  })

  // --- Centered layout ---

  it('dialog is centered (flex items-center justify-center)', () => {
    renderDeleteDialog()
    const backdrop = screen.getByTestId('delete-dialog-backdrop')
    // The centering container is a sibling of the backdrop
    const centerContainer = backdrop.nextElementSibling
    expect(centerContainer?.className).toContain('flex')
    expect(centerContainer?.className).toContain('items-center')
    expect(centerContainer?.className).toContain('justify-center')
  })

  // --- Dark mode classes ---

  it('has dark mode classes', () => {
    renderDeleteDialog()
    const title = screen.getByText('Delete Platform')
    expect(title.className).toContain('dark:text-white')
    const desc = screen.getByText('This action cannot be undone. All data will be permanently removed.')
    expect(desc.className).toContain('dark:text-base-400')
  })
})
