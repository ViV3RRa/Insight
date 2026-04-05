import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { HomeQuickActionsDesktop, HomeQuickActionsMobile } from './HomeQuickActions'

describe('HomeQuickActionsDesktop', () => {
  const defaultProps = {
    onAddReading: vi.fn(),
    onAddBill: vi.fn(),
  }

  it('renders "+ Add Reading" and "+ Add Bill" buttons', () => {
    renderWithProviders(<HomeQuickActionsDesktop {...defaultProps} />)

    const container = screen.getByTestId('quick-actions-desktop')
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByRole('button', { name: '+ Add Reading' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add Bill' })).toBeInTheDocument()
  })

  it('calls onAddReading when "+ Add Reading" is clicked', async () => {
    const onAddReading = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <HomeQuickActionsDesktop {...defaultProps} onAddReading={onAddReading} />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add Reading' }))
    expect(onAddReading).toHaveBeenCalledOnce()
  })

  it('calls onAddBill when "+ Add Bill" is clicked', async () => {
    const onAddBill = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <HomeQuickActionsDesktop {...defaultProps} onAddBill={onAddBill} />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add Bill' }))
    expect(onAddBill).toHaveBeenCalledOnce()
  })

  it('renders "+ Add Reading" with secondary variant', () => {
    renderWithProviders(<HomeQuickActionsDesktop {...defaultProps} />)

    const button = screen.getByRole('button', { name: '+ Add Reading' })
    expect(button.className).toContain('bg-white')
    expect(button.className).toContain('border')
  })

  it('renders "+ Add Bill" with primary variant', () => {
    renderWithProviders(<HomeQuickActionsDesktop {...defaultProps} />)

    const button = screen.getByRole('button', { name: '+ Add Bill' })
    expect(button.className).toContain('bg-base-900')
  })

  it('renders buttons with sm size', () => {
    renderWithProviders(<HomeQuickActionsDesktop {...defaultProps} />)

    const readingBtn = screen.getByRole('button', { name: '+ Add Reading' })
    const billBtn = screen.getByRole('button', { name: '+ Add Bill' })
    expect(readingBtn.className).toContain('px-3')
    expect(readingBtn.className).toContain('text-xs')
    expect(billBtn.className).toContain('px-3')
    expect(billBtn.className).toContain('text-xs')
  })
})

describe('HomeQuickActionsMobile', () => {
  const defaultProps = {
    onAddReading: vi.fn(),
    onAddBill: vi.fn(),
  }

  it('renders "+ Add Reading" and "+ Add Bill" buttons', () => {
    renderWithProviders(<HomeQuickActionsMobile {...defaultProps} />)

    const container = screen.getByTestId('quick-actions-mobile')
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByRole('button', { name: '+ Add Reading' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Add Bill' })).toBeInTheDocument()
  })

  it('renders buttons with fullWidth', () => {
    renderWithProviders(<HomeQuickActionsMobile {...defaultProps} />)

    const readingBtn = screen.getByRole('button', { name: '+ Add Reading' })
    const billBtn = screen.getByRole('button', { name: '+ Add Bill' })
    expect(readingBtn.className).toContain('w-full')
    expect(billBtn.className).toContain('w-full')
  })

  it('calls onAddReading when "+ Add Reading" is clicked', async () => {
    const onAddReading = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <HomeQuickActionsMobile {...defaultProps} onAddReading={onAddReading} />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add Reading' }))
    expect(onAddReading).toHaveBeenCalledOnce()
  })

  it('calls onAddBill when "+ Add Bill" is clicked', async () => {
    const onAddBill = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <HomeQuickActionsMobile {...defaultProps} onAddBill={onAddBill} />,
    )

    await user.click(screen.getByRole('button', { name: '+ Add Bill' }))
    expect(onAddBill).toHaveBeenCalledOnce()
  })
})
