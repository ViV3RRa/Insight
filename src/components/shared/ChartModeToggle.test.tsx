import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { ChartModeToggle } from './ChartModeToggle'

const twoOptions = [
  { label: 'Earnings', value: 'earnings' },
  { label: 'XIRR', value: 'xirr' },
]

const threeOptions = [
  { label: 'Consumption', value: 'consumption' },
  { label: 'Cost', value: 'cost' },
  { label: 'Cost/Unit', value: 'costPerUnit' },
]

describe('ChartModeToggle', () => {
  // --- 2-option configuration ---

  it('renders 2-option configuration with correct labels', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(2)
    expect(tabs.map((t) => t.textContent)).toEqual(['Earnings', 'XIRR'])
  })

  // --- 3-option configuration ---

  it('renders 3-option configuration with correct labels', () => {
    renderWithProviders(
      <ChartModeToggle options={threeOptions} value="consumption" onChange={vi.fn()} />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs.map((t) => t.textContent)).toEqual(['Consumption', 'Cost', 'Cost/Unit'])
  })

  // --- Active segment styling ---

  it('active segment has correct classes', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const active = screen.getByRole('tab', { name: 'Earnings' })
    expect(active).toHaveAttribute('aria-selected', 'true')
    expect(active.className).toContain('bg-white')
    expect(active.className).toContain('dark:bg-base-600')
    expect(active.className).toContain('shadow-sm')
    expect(active.className).toContain('text-base-900')
  })

  // --- Inactive segment styling ---

  it('inactive segment has correct classes', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const inactive = screen.getByRole('tab', { name: 'XIRR' })
    expect(inactive).toHaveAttribute('aria-selected', 'false')
    expect(inactive.className).toContain('text-base-400')
    expect(inactive.className).not.toContain('bg-white')
    expect(inactive.className).not.toContain('shadow-sm')
  })

  // --- onClick inactive ---

  it('calls onChange with new value when clicking inactive segment', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={handleChange} />,
    )

    await user.click(screen.getByRole('tab', { name: 'XIRR' }))
    expect(handleChange).toHaveBeenCalledWith('xirr')
  })

  // --- onClick active (should NOT trigger) ---

  it('does not call onChange when clicking the active segment', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={handleChange} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Earnings' }))
    expect(handleChange).not.toHaveBeenCalled()
  })

  // --- Container styling ---

  it('container has correct styling classes', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const tablist = screen.getByRole('tablist')
    expect(tablist.className).toContain('bg-base-100')
    expect(tablist.className).toContain('dark:bg-base-700')
    expect(tablist.className).toContain('rounded-lg')
    expect(tablist.className).toContain('p-0.5')
    expect(tablist.className).toContain('gap-0.5')
  })

  // --- ARIA ---

  it('has role="tablist" on container and role="tab" on segments', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('aria-selected reflects the active segment', () => {
    renderWithProviders(
      <ChartModeToggle options={threeOptions} value="cost" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('tab', { name: 'Consumption' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tab', { name: 'Cost' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Cost/Unit' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  // --- Keyboard navigation ---

  it('navigates with ArrowRight key', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )

    screen.getByRole('tab', { name: 'Earnings' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'XIRR' }))
  })

  it('navigates with ArrowLeft key and wraps around', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )

    screen.getByRole('tab', { name: 'Earnings' }).focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'XIRR' }))
  })

  it('selects focused segment on Enter key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={handleChange} />,
    )

    screen.getByRole('tab', { name: 'Earnings' }).focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Enter}')

    expect(handleChange).toHaveBeenCalledWith('xirr')
  })

  it('selects focused segment on Space key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={handleChange} />,
    )

    screen.getByRole('tab', { name: 'Earnings' }).focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')

    expect(handleChange).toHaveBeenCalledWith('xirr')
  })

  // --- Roving tabindex ---

  it('only active tab has tabIndex 0, others have -1', () => {
    renderWithProviders(
      <ChartModeToggle options={threeOptions} value="cost" onChange={vi.fn()} />,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('tabindex', '-1')
    expect(tabs[1]).toHaveAttribute('tabindex', '0')
    expect(tabs[2]).toHaveAttribute('tabindex', '-1')
  })

  // --- Transition classes ---

  it('active segment has transition-all duration-150', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const active = screen.getByRole('tab', { name: 'Earnings' })
    expect(active.className).toContain('transition-all')
    expect(active.className).toContain('duration-150')
  })

  it('inactive segment has transition-colors duration-150', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const inactive = screen.getByRole('tab', { name: 'XIRR' })
    expect(inactive.className).toContain('transition-colors')
    expect(inactive.className).toContain('duration-150')
  })

  // --- Dark mode ---

  it('active segment has dark mode classes', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const active = screen.getByRole('tab', { name: 'Earnings' })
    expect(active.className).toContain('dark:bg-base-600')
    expect(active.className).toContain('dark:text-white')
  })

  it('inactive segment has dark hover classes', () => {
    renderWithProviders(
      <ChartModeToggle options={twoOptions} value="earnings" onChange={vi.fn()} />,
    )
    const inactive = screen.getByRole('tab', { name: 'XIRR' })
    expect(inactive.className).toContain('dark:text-base-400')
    expect(inactive.className).toContain('dark:hover:text-base-300')
  })
})
