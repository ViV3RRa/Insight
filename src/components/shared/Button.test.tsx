import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { Button } from './Button'

describe('Button', () => {
  // --- Variant rendering ---

  it('renders primary variant with correct classes', () => {
    renderWithProviders(<Button variant="primary">Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn.className).toContain('bg-base-900')
    expect(btn.className).toContain('text-white')
    expect(btn.className).toContain('dark:bg-accent-600')
  })

  it('renders secondary variant with correct classes', () => {
    renderWithProviders(<Button variant="secondary">Cancel</Button>)
    const btn = screen.getByRole('button', { name: 'Cancel' })
    expect(btn.className).toContain('bg-white')
    expect(btn.className).toContain('text-base-700')
    expect(btn.className).toContain('border')
    expect(btn.className).toContain('border-base-200')
    expect(btn.className).toContain('dark:bg-base-800')
  })

  it('renders ghost variant with correct classes', () => {
    renderWithProviders(<Button variant="ghost">View all</Button>)
    const btn = screen.getByRole('button', { name: 'View all' })
    expect(btn.className).toContain('text-base-500')
    expect(btn.className).toContain('hover:bg-base-100')
    expect(btn.className).toContain('dark:text-base-400')
  })

  it('renders destructive variant with correct classes', () => {
    renderWithProviders(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn.className).toContain('bg-rose-500')
    expect(btn.className).toContain('text-white')
  })

  // --- Size rendering ---

  it('renders sm size with correct classes', () => {
    renderWithProviders(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button', { name: 'Small' })
    expect(btn.className).toContain('px-3')
    expect(btn.className).toContain('py-1.5')
    expect(btn.className).toContain('text-xs')
  })

  it('renders md size (default) with correct classes', () => {
    renderWithProviders(<Button>Medium</Button>)
    const btn = screen.getByRole('button', { name: 'Medium' })
    expect(btn.className).toContain('px-4')
    expect(btn.className).toContain('py-2.5')
    expect(btn.className).toContain('text-sm')
  })

  it('renders lg size with correct classes', () => {
    renderWithProviders(<Button size="lg">Large</Button>)
    const btn = screen.getByRole('button', { name: 'Large' })
    expect(btn.className).toContain('px-5')
    expect(btn.className).toContain('py-3')
    expect(btn.className).toContain('text-base')
  })

  // --- Disabled state ---

  it('applies disabled state with opacity-50 and pointer-events-none', () => {
    renderWithProviders(<Button disabled>Disabled</Button>)
    const btn = screen.getByRole('button', { name: 'Disabled' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-disabled', 'true')
    expect(btn.className).toContain('opacity-50')
    expect(btn.className).toContain('pointer-events-none')
  })

  it('does not fire onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Disabled' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // --- Loading state ---

  it('shows spinner SVG with animate-spin in loading state', () => {
    renderWithProviders(<Button loading>Saving...</Button>)
    const btn = screen.getByRole('button', { name: 'Saving...' })
    const spinner = btn.querySelector('svg.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies opacity-75 and pointer-events-none in loading state', () => {
    renderWithProviders(<Button loading>Saving...</Button>)
    const btn = screen.getByRole('button', { name: 'Saving...' })
    expect(btn.className).toContain('opacity-75')
    expect(btn.className).toContain('pointer-events-none')
  })

  it('disables the button in loading state', () => {
    renderWithProviders(<Button loading>Saving...</Button>)
    const btn = screen.getByRole('button', { name: 'Saving...' })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not fire onClick when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <Button loading onClick={handleClick}>
        Saving...
      </Button>,
    )
    await user.click(screen.getByRole('button', { name: 'Saving...' }))
    expect(handleClick).not.toHaveBeenCalled()
  })

  // --- fullWidth ---

  it('applies w-full class when fullWidth is true', () => {
    renderWithProviders(<Button fullWidth>Full Width</Button>)
    const btn = screen.getByRole('button', { name: 'Full Width' })
    expect(btn.className).toContain('w-full')
  })

  it('does not apply w-full class by default', () => {
    renderWithProviders(<Button>Normal</Button>)
    const btn = screen.getByRole('button', { name: 'Normal' })
    expect(btn.className).not.toContain('w-full')
  })

  // --- Click & keyboard ---

  it('fires onClick on click', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<Button onClick={handleClick}>Click Me</Button>)
    await user.click(screen.getByRole('button', { name: 'Click Me' }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('fires onClick on Enter key', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<Button onClick={handleClick}>Press Enter</Button>)
    screen.getByRole('button', { name: 'Press Enter' }).focus()
    await user.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('fires onClick on Space key', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<Button onClick={handleClick}>Press Space</Button>)
    screen.getByRole('button', { name: 'Press Space' }).focus()
    await user.keyboard(' ')
    expect(handleClick).toHaveBeenCalledOnce()
  })

  // --- HTML attributes ---

  it('forwards standard button HTML attributes', () => {
    renderWithProviders(
      <Button type="submit" name="submit-btn" data-testid="my-btn">
        Submit
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Submit' })
    expect(btn).toHaveAttribute('type', 'submit')
    expect(btn).toHaveAttribute('name', 'submit-btn')
    expect(btn).toHaveAttribute('data-testid', 'my-btn')
  })

  // --- Base styles ---

  it('has rounded-lg and transition-colors classes', () => {
    renderWithProviders(<Button>Styled</Button>)
    const btn = screen.getByRole('button', { name: 'Styled' })
    expect(btn.className).toContain('rounded-lg')
    expect(btn.className).toContain('transition-colors')
    expect(btn.className).toContain('duration-150')
  })

  it('uses inline-flex items-center justify-center layout', () => {
    renderWithProviders(<Button>Layout</Button>)
    const btn = screen.getByRole('button', { name: 'Layout' })
    expect(btn.className).toContain('inline-flex')
    expect(btn.className).toContain('items-center')
    expect(btn.className).toContain('justify-center')
  })

  // --- Default variant is primary ---

  it('defaults to primary variant when no variant specified', () => {
    renderWithProviders(<Button>Default</Button>)
    const btn = screen.getByRole('button', { name: 'Default' })
    expect(btn.className).toContain('bg-base-900')
  })
})
