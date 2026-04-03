import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { ChartCard } from './ChartCard'

// Default to wide viewport (pills mode for TimeSpanSelector)
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 409px)' ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

const modes = [
  { label: 'Earnings', value: 'earnings' },
  { label: 'XIRR', value: 'xirr' },
]

describe('ChartCard', () => {
  // --- Card shell ---

  it('renders card shell with correct classes', () => {
    const { container } = renderWithProviders(
      <ChartCard title="Monthly Earnings">
        <div>Chart content</div>
      </ChartCard>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('dark:bg-base-800')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('shadow-card')
    expect(card.className).toContain('p-4')
    expect(card.className).toContain('sm:p-6')
  })

  // --- Title ---

  it('renders title with correct styling', () => {
    renderWithProviders(
      <ChartCard title="Monthly Earnings">
        <div>Chart content</div>
      </ChartCard>,
    )
    const heading = screen.getByText('Monthly Earnings')
    expect(heading.tagName).toBe('H3')
    expect(heading.className).toContain('text-sm')
    expect(heading.className).toContain('font-semibold')
  })

  // --- Children ---

  it('renders children in the chart content area', () => {
    renderWithProviders(
      <ChartCard title="Test">
        <div data-testid="chart">My chart</div>
      </ChartCard>,
    )
    expect(screen.getByTestId('chart')).toBeInTheDocument()
    expect(screen.getByText('My chart')).toBeInTheDocument()
  })

  // --- YoYToggle ---

  it('shows YoYToggle by default', () => {
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )
    expect(screen.getByRole('button', { name: /YoY/i })).toBeInTheDocument()
  })

  it('hides YoYToggle when hideYoY is true', () => {
    renderWithProviders(
      <ChartCard title="Test" hideYoY>
        <div>Chart</div>
      </ChartCard>,
    )
    expect(screen.queryByRole('button', { name: /YoY/i })).not.toBeInTheDocument()
  })

  it('fires onYoYChange when YoY toggle is clicked', async () => {
    const handleYoYChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartCard title="Test" yoyActive={false} onYoYChange={handleYoYChange}>
        <div>Chart</div>
      </ChartCard>,
    )

    await user.click(screen.getByRole('button', { name: /YoY/i }))
    expect(handleYoYChange).toHaveBeenCalledWith(true)
  })

  // --- TimeSpanSelector ---

  it('shows TimeSpanSelector with all 9 options by default', () => {
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(9)
  })

  it('defaults to YTD time span', () => {
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )
    const ytd = screen.getByRole('tab', { name: 'YTD' })
    expect(ytd).toHaveAttribute('aria-selected', 'true')
  })

  it('hides TimeSpanSelector when hideTimeSpan is true', () => {
    renderWithProviders(
      <ChartCard title="Test" hideTimeSpan>
        <div>Chart</div>
      </ChartCard>,
    )
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('fires onTimeSpanChange when a time span pill is clicked', async () => {
    const handleTimeSpanChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartCard title="Test" timeSpan="YTD" onTimeSpanChange={handleTimeSpanChange}>
        <div>Chart</div>
      </ChartCard>,
    )

    await user.click(screen.getByRole('tab', { name: '1Y' }))
    expect(handleTimeSpanChange).toHaveBeenCalledWith('1Y')
  })

  // --- ChartModeToggle ---

  it('does not render ChartModeToggle when modes prop is omitted', () => {
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )
    // Only tablist should be TimeSpanSelector, no mode toggle
    const tablists = screen.getAllByRole('tablist')
    expect(tablists).toHaveLength(1) // Only TimeSpanSelector
  })

  it('renders ChartModeToggle when modes prop is provided', () => {
    renderWithProviders(
      <ChartCard
        title="Test"
        modes={modes}
        activeMode="earnings"
        onModeChange={vi.fn()}
      >
        <div>Chart</div>
      </ChartCard>,
    )
    // Should have 2 tablists: ChartModeToggle + TimeSpanSelector
    const tablists = screen.getAllByRole('tablist')
    expect(tablists).toHaveLength(2)
    expect(screen.getByRole('tab', { name: 'Earnings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'XIRR' })).toBeInTheDocument()
  })

  it('fires onModeChange when a chart mode segment is clicked', async () => {
    const handleModeChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <ChartCard
        title="Test"
        modes={modes}
        activeMode="earnings"
        onModeChange={handleModeChange}
      >
        <div>Chart</div>
      </ChartCard>,
    )

    await user.click(screen.getByRole('tab', { name: 'XIRR' }))
    expect(handleModeChange).toHaveBeenCalledWith('xirr')
  })

  // --- Internal state management ---

  it('manages time span internally when controlled props not provided', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )

    // Default is YTD
    expect(screen.getByRole('tab', { name: 'YTD' })).toHaveAttribute('aria-selected', 'true')

    // Click 1Y
    await user.click(screen.getByRole('tab', { name: '1Y' }))
    expect(screen.getByRole('tab', { name: '1Y' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'YTD' })).toHaveAttribute('aria-selected', 'false')
  })

  it('manages YoY state internally when controlled props not provided', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )

    const yoyBtn = screen.getByRole('button', { name: /YoY/i })
    expect(yoyBtn).toHaveAttribute('aria-pressed', 'false')

    await user.click(yoyBtn)
    expect(yoyBtn).toHaveAttribute('aria-pressed', 'true')
  })

  // --- Dark mode ---

  it('has dark mode classes on card shell', () => {
    const { container } = renderWithProviders(
      <ChartCard title="Test">
        <div>Chart</div>
      </ChartCard>,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('dark:bg-base-800')
    expect(card.className).toContain('dark:shadow-card-dark')
  })
})
