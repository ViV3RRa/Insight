import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { YoYToggle } from './YoYToggle'

describe('YoYToggle', () => {
  // --- Inactive state ---

  it('renders inactive state with correct classes', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /YoY/i })
    expect(btn.className).toContain('border-base-200')
    expect(btn.className).toContain('text-base-400')
    expect(btn.className).toContain('dark:border-base-600')
    expect(btn.className).not.toContain('bg-accent-50')
  })

  // --- Active state ---

  it('renders active state with correct classes', () => {
    renderWithProviders(<YoYToggle active={true} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /YoY/i })
    expect(btn.className).toContain('bg-accent-50')
    expect(btn.className).toContain('text-accent-600')
    expect(btn.className).toContain('border-accent-200')
    expect(btn.className).toContain('dark:bg-accent-900/30')
    expect(btn.className).toContain('dark:text-accent-400')
    expect(btn.className).toContain('dark:border-accent-700')
  })

  // --- ArrowLeftRight icon ---

  it('renders ArrowLeftRight icon at w-3.5 h-3.5', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /YoY/i })
    const svg = btn.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.classList.contains('w-3.5')).toBe(true)
    expect(svg?.classList.contains('h-3.5')).toBe(true)
  })

  // --- Label ---

  it('displays "YoY" label text', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    expect(screen.getByText('YoY')).toBeInTheDocument()
  })

  // --- Click handling ---

  it('calls onChange with true when clicking inactive toggle', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<YoYToggle active={false} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: /YoY/i }))
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when clicking active toggle', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<YoYToggle active={true} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: /YoY/i }))
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  // --- ARIA ---

  it('has aria-pressed="false" when inactive', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /YoY/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('has aria-pressed="true" when active', () => {
    renderWithProviders(<YoYToggle active={true} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /YoY/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  // --- Keyboard ---

  it('toggles on Enter key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<YoYToggle active={false} onChange={handleChange} />)

    screen.getByRole('button', { name: /YoY/i }).focus()
    await user.keyboard('{Enter}')
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('toggles on Space key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<YoYToggle active={false} onChange={handleChange} />)

    screen.getByRole('button', { name: /YoY/i }).focus()
    await user.keyboard(' ')
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  // --- Layout ---

  it('uses inline-flex items-center gap-1.5 layout', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /YoY/i })
    expect(btn.className).toContain('inline-flex')
    expect(btn.className).toContain('items-center')
    expect(btn.className).toContain('gap-1.5')
  })

  it('has transition-colors duration-150 for smooth animations', () => {
    renderWithProviders(<YoYToggle active={false} onChange={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /YoY/i })
    expect(btn.className).toContain('transition-colors')
    expect(btn.className).toContain('duration-150')
  })
})
