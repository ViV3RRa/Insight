import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { MobileDrawer } from './MobileDrawer'

const defaultFields = [
  { label: 'Date', value: '2024-01-15' },
  { label: 'Amount', value: '1,500.00 DKK' },
  { label: 'Type', value: 'Deposit' },
]

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  title: 'Transaction Details',
  fields: defaultFields,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  hasPrev: true,
  hasNext: true,
}

function renderDrawer(overrides = {}) {
  return renderWithProviders(
    <MobileDrawer {...defaultProps} {...overrides} />,
  )
}

describe('MobileDrawer', () => {
  // --- Visibility ---

  it('drawer shows when isOpen is true (translateY(0))', () => {
    renderDrawer()
    const drawer = screen.getByTestId('mobile-drawer')
    expect(drawer.style.transform).toBe('translateY(0)')
  })

  it('drawer hidden when isOpen is false (translateY(100%))', () => {
    renderDrawer({ isOpen: false })
    const drawer = screen.getByTestId('mobile-drawer')
    expect(drawer.style.transform).toBe('translateY(100%)')
  })

  // --- Backdrop ---

  it('backdrop click calls onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderDrawer({ onClose })
    await user.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('backdrop not rendered when closed', () => {
    renderDrawer({ isOpen: false })
    expect(screen.queryByTestId('drawer-backdrop')).not.toBeInTheDocument()
  })

  // --- Fields ---

  it('fields render as label/value pairs', () => {
    renderDrawer()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('1,500.00 DKK')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Deposit')).toBeInTheDocument()
  })

  // --- Prev/Next ---

  it('Prev button calls onPrev', async () => {
    const onPrev = vi.fn()
    const user = userEvent.setup()
    renderDrawer({ onPrev })
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('Next button calls onNext', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    renderDrawer({ onNext })
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('Prev disabled (opacity-30) when hasPrev is false', () => {
    renderDrawer({ hasPrev: false })
    const prevBtn = screen.getByRole('button', { name: 'Previous' })
    expect(prevBtn).toBeDisabled()
    expect(prevBtn.className).toContain('disabled:opacity-30')
  })

  it('Next disabled when hasNext is false', () => {
    renderDrawer({ hasNext: false })
    const nextBtn = screen.getByRole('button', { name: 'Next' })
    expect(nextBtn).toBeDisabled()
    expect(nextBtn.className).toContain('disabled:opacity-30')
  })

  // --- Edit / Delete ---

  it('Edit button calls onEdit', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderDrawer({ onEdit })
    await user.click(screen.getByRole('button', { name: /Edit/i }))
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('Delete button calls onDelete', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    renderDrawer({ onDelete })
    await user.click(screen.getByRole('button', { name: /Delete/i }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  // --- Drag handle ---

  it('drag handle element is present', () => {
    renderDrawer()
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
  })

  // --- Title ---

  it('title renders correctly', () => {
    renderDrawer({ title: 'Refueling Details' })
    expect(screen.getByText('Refueling Details')).toBeInTheDocument()
  })

  // --- sm:hidden ---

  it('sm:hidden classes on drawer element', () => {
    renderDrawer()
    const drawer = screen.getByTestId('mobile-drawer')
    expect(drawer.className).toContain('sm:hidden')
  })

  it('sm:hidden classes on backdrop', () => {
    renderDrawer()
    const backdrop = screen.getByTestId('drawer-backdrop')
    expect(backdrop.className).toContain('sm:hidden')
  })

  // --- Dark mode classes ---

  it('has dark mode classes', () => {
    renderDrawer()
    const drawer = screen.getByTestId('mobile-drawer')
    expect(drawer.className).toContain('dark:bg-base-800')
    const title = screen.getByText('Transaction Details')
    expect(title.className).toContain('dark:text-white')
  })
})
