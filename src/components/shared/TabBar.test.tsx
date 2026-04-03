import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { TabBar } from './TabBar'

const twoTabs = [
  { label: 'Yearly', value: 'yearly' },
  { label: 'Monthly', value: 'monthly' },
]

const threeTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Details', value: 'details' },
  { label: 'History', value: 'history' },
]

describe('TabBar', () => {
  // --- Rendering ---

  it('renders all tabs with correct labels', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(tabs.map((t) => t.textContent)).toEqual(['Yearly', 'Monthly'])
  })

  it('renders 3-tab configuration', () => {
    renderWithProviders(
      <TabBar tabs={threeTabs} activeTab="overview" onChange={vi.fn()} />,
    )
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  // --- Active tab styling ---

  it('active tab has accent color and tab-btn active classes', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const active = screen.getByRole('tab', { name: 'Yearly' })
    expect(active.className).toContain('text-accent-700')
    expect(active.className).toContain('dark:text-accent-400')
    expect(active.className).toContain('tab-btn')
    expect(active.className).toContain('active')
  })

  // --- Inactive tab styling ---

  it('inactive tab has text-base-400 and no active class', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const inactive = screen.getByRole('tab', { name: 'Monthly' })
    expect(inactive.className).toContain('text-base-400')
    expect(inactive.className).not.toContain('active')
  })

  // --- Click handling ---

  it('calls onChange when clicking inactive tab', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={handleChange} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Monthly' }))
    expect(handleChange).toHaveBeenCalledWith('monthly')
  })

  it('does not call onChange when clicking active tab', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={handleChange} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Yearly' }))
    expect(handleChange).not.toHaveBeenCalled()
  })

  // --- Container styling ---

  it('has full-width border-b separator', () => {
    const { container } = renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('border-b')
    expect(wrapper.className).toContain('border-base-150')
    expect(wrapper.className).toContain('dark:border-base-700')
  })

  // --- Tab button styling ---

  it('tab buttons use text-sm font-medium', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const tab = screen.getByRole('tab', { name: 'Yearly' })
    expect(tab.className).toContain('text-sm')
    expect(tab.className).toContain('font-medium')
  })

  // --- ARIA ---

  it('has role="tablist" on the tab container', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('each tab has role="tab"', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('active tab has aria-selected="true", inactive has "false"', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('tab', { name: 'Yearly' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Monthly' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  // --- Keyboard navigation ---

  it('navigates with ArrowRight key', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )

    screen.getByRole('tab', { name: 'Yearly' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Monthly' }))
  })

  it('navigates with ArrowLeft key and wraps around', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )

    screen.getByRole('tab', { name: 'Yearly' }).focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Monthly' }))
  })

  it('selects focused tab on Enter key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={handleChange} />,
    )

    screen.getByRole('tab', { name: 'Yearly' }).focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Enter}')

    expect(handleChange).toHaveBeenCalledWith('monthly')
  })

  // --- rightContent slot ---

  it('renders rightContent when provided', () => {
    renderWithProviders(
      <TabBar
        tabs={twoTabs}
        activeTab="yearly"
        onChange={vi.fn()}
        rightContent={<div data-testid="right-slot">Mode toggle</div>}
      />,
    )
    expect(screen.getByTestId('right-slot')).toBeInTheDocument()
    expect(screen.getByText('Mode toggle')).toBeInTheDocument()
  })

  it('does not render rightContent slot when prop is omitted', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    // Only the tablist container and its tabs
    expect(screen.queryByTestId('right-slot')).not.toBeInTheDocument()
  })

  // --- Roving tabindex ---

  it('active tab has tabIndex 0, inactive has -1', () => {
    renderWithProviders(
      <TabBar tabs={threeTabs} activeTab="details" onChange={vi.fn()} />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('tabindex', '-1') // Overview
    expect(tabs[1]).toHaveAttribute('tabindex', '0')  // Details (active)
    expect(tabs[2]).toHaveAttribute('tabindex', '-1') // History
  })

  // --- Transition ---

  it('tabs have transition-colors duration-150', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const tab = screen.getByRole('tab', { name: 'Yearly' })
    expect(tab.className).toContain('transition-colors')
    expect(tab.className).toContain('duration-150')
  })

  // --- Dark mode ---

  it('inactive tab has dark mode hover class', () => {
    renderWithProviders(
      <TabBar tabs={twoTabs} activeTab="yearly" onChange={vi.fn()} />,
    )
    const inactive = screen.getByRole('tab', { name: 'Monthly' })
    expect(inactive.className).toContain('dark:text-base-400')
    expect(inactive.className).toContain('dark:hover:text-base-300')
  })
})
