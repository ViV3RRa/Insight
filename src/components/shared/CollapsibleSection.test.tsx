import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { CollapsibleSection } from './CollapsibleSection'
import { Home } from 'lucide-react'

describe('CollapsibleSection', () => {
  it('default state is collapsed, content hidden, aria-expanded="false"', () => {
    renderWithProviders(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const button = screen.getByRole('button', { name: /test section/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('click expands, content visible, aria-expanded="true"', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>,
    )
    await user.click(screen.getByRole('button', { name: /test section/i }))
    expect(screen.getByRole('button', { name: /test section/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('click again collapses', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const button = screen.getByRole('button', { name: /test section/i })
    await user.click(button)
    expect(screen.getByText('Content')).toBeInTheDocument()

    await user.click(button)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('chevron has rotate-180 when expanded', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const chevron = container.querySelector('svg')!
    expect(chevron.className.baseVal || chevron.getAttribute('class')).not.toContain('rotate-180')

    await user.click(screen.getByRole('button', { name: /test section/i }))
    const chevronExpanded = container.querySelector('svg')!
    expect(
      chevronExpanded.className.baseVal || chevronExpanded.getAttribute('class'),
    ).toContain('rotate-180')
  })

  it('title renders with correct classes', () => {
    renderWithProviders(
      <CollapsibleSection title="My Title">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const title = screen.getByText('My Title')
    expect(title.className).toContain('text-sm')
    expect(title.className).toContain('font-semibold')
    expect(title.className).toContain('text-base-900')
    expect(title.className).toContain('dark:text-white')
    expect(title.className).toContain('flex-1')
  })

  it('optional icon renders when provided', () => {
    const { container } = renderWithProviders(
      <CollapsibleSection title="Test" icon={Home}>
        <p>Content</p>
      </CollapsibleSection>,
    )
    // Home icon + ChevronDown icon = 2 SVGs
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2)
  })

  it('icon is absent when not provided', () => {
    const { container } = renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    // Only ChevronDown icon
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(1)
  })

  it('count badge renders when provided', () => {
    renderWithProviders(
      <CollapsibleSection title="Test" count={5}>
        <p>Content</p>
      </CollapsibleSection>,
    )
    const badge = screen.getByText('5')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('bg-base-100')
    expect(badge.className).toContain('dark:bg-base-700')
    expect(badge.className).toContain('text-base-400')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-medium')
  })

  it('count badge is absent when not provided', () => {
    renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('defaultExpanded starts expanded', () => {
    renderWithProviders(
      <CollapsibleSection title="Test" defaultExpanded>
        <p>Content</p>
      </CollapsibleSection>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('controlled mode works (expanded + onToggle)', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    const { rerender } = renderWithProviders(
      <CollapsibleSection title="Test" expanded={false} onToggle={onToggle}>
        <p>Content</p>
      </CollapsibleSection>,
    )

    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(true)

    // Content still hidden until parent re-renders with expanded=true
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    rerender(
      <CollapsibleSection title="Test" expanded={true} onToggle={onToggle}>
        <p>Content</p>
      </CollapsibleSection>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('multiple instances are independent', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <CollapsibleSection title="Section A">
          <p>Content A</p>
        </CollapsibleSection>
        <CollapsibleSection title="Section B">
          <p>Content B</p>
        </CollapsibleSection>
      </>,
    )

    // Both collapsed initially
    expect(screen.queryByText('Content A')).not.toBeInTheDocument()
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()

    // Expand A only
    await user.click(screen.getByRole('button', { name: /section a/i }))
    expect(screen.getByText('Content A')).toBeInTheDocument()
    expect(screen.queryByText('Content B')).not.toBeInTheDocument()
  })

  it('Enter key activates toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('Space key activates toggle', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard(' ')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has correct dark mode classes on container', () => {
    const { container } = renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const outerDiv = container.firstElementChild!
    expect(outerDiv.className).toContain('dark:border-base-700')
    expect(outerDiv.className).toContain('border-base-150')
    expect(outerDiv.className).toContain('rounded-2xl')
  })

  it('toggle button has correct styling classes', () => {
    renderWithProviders(
      <CollapsibleSection title="Test">
        <p>Content</p>
      </CollapsibleSection>,
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('w-full')
    expect(button.className).toContain('bg-white')
    expect(button.className).toContain('dark:bg-base-800')
    expect(button.className).toContain('hover:bg-base-50')
    expect(button.className).toContain('dark:hover:bg-base-750')
    expect(button.className).toContain('transition-colors')
  })
})
