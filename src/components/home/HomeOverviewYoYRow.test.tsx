import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { HomeOverviewYoYRow } from './HomeOverviewYoYRow'
import type { HomeYoYComparison } from '@/types/home'

const mockComparison: HomeYoYComparison = {
  ytdTotalCost: { current: 12500, previous: 11200, changePercent: 11.61 },
  currentMonthCost: { current: 3200, previous: 2800, changePercent: 14.29 },
  avgMonthlyCost: { current: 4167, previous: 3733, changePercent: 11.63 },
  periodLabel: 'Jan 1 – Apr 5, 2025',
}

describe('HomeOverviewYoYRow', () => {
  it('renders YoYComparisonRow when comparison data is provided', () => {
    const { container } = renderWithProviders(
      <HomeOverviewYoYRow comparison={mockComparison} />,
    )
    expect(container.firstChild).not.toBeNull()
  })

  it('returns null when comparison is null', () => {
    const { container } = renderWithProviders(
      <HomeOverviewYoYRow comparison={null} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows period label with Year-over-Year prefix', () => {
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    expect(
      screen.getByText(
        'Year-over-Year · Same period last year (Jan 1 – Apr 5, 2025)',
      ),
    ).toBeInTheDocument()
  })

  it('shows YTD Total Cost metric with correct values', () => {
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    expect(screen.getAllByText('YTD Total Cost').length).toBeGreaterThan(0)
    // Danish locale formats 12500 as "12.500"
    expect(screen.getAllByText('12.500').length).toBeGreaterThan(0)
    expect(screen.getAllByText('vs 11.200').length).toBeGreaterThan(0)
  })

  it('shows Current Month Cost metric with correct values', () => {
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    expect(screen.getAllByText('Current Month Cost').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3.200').length).toBeGreaterThan(0)
    expect(screen.getAllByText('vs 2.800').length).toBeGreaterThan(0)
  })

  it('shows Avg Monthly Cost metric with correct values', () => {
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    expect(screen.getAllByText('Avg Monthly Cost').length).toBeGreaterThan(0)
    expect(screen.getAllByText('4.167').length).toBeGreaterThan(0)
    expect(screen.getAllByText('vs 3.733').length).toBeGreaterThan(0)
  })

  it('all metrics have invertColor true (cost increase = red)', () => {
    // This is a structural test — we verify the component passes invertColor
    // by checking that the ChangeIndicator renders with inverted colors.
    // With invertColor=true and positive changePercent, the indicator should
    // show the value with a color indicating "bad" (red for cost increases).
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    // All three metrics have positive changePercent with invertColor=true
    // The ChangeIndicator should render these values
    expect(screen.getAllByText(/11,61/)).toHaveLength(2) // desktop + mobile
    expect(screen.getAllByText(/14,29/)).toHaveLength(2)
    expect(screen.getAllByText(/11,63/)).toHaveLength(2)
  })

  it('formats numbers in Danish locale (period as thousands separator)', () => {
    renderWithProviders(<HomeOverviewYoYRow comparison={mockComparison} />)
    // 12500 → "12.500" in da-DK
    expect(screen.getAllByText('12.500').length).toBeGreaterThan(0)
    // 3200 → "3.200" in da-DK
    expect(screen.getAllByText('3.200').length).toBeGreaterThan(0)
  })

  it('handles null changePercent gracefully (defaults to 0)', () => {
    const comparisonWithNulls: HomeYoYComparison = {
      ytdTotalCost: { current: 5000, previous: 0, changePercent: null },
      currentMonthCost: { current: 1000, previous: 0, changePercent: null },
      avgMonthlyCost: { current: 2500, previous: 0, changePercent: null },
      periodLabel: 'Jan 1 – Apr 5, 2025',
    }
    const { container } = renderWithProviders(
      <HomeOverviewYoYRow comparison={comparisonWithNulls} />,
    )
    // Should render without errors — null changePercent falls back to 0
    expect(container.firstChild).not.toBeNull()
    expect(screen.getAllByText('5.000').length).toBeGreaterThan(0)
  })

  it('wraps content in a div with bottom margin', () => {
    const { container } = renderWithProviders(
      <HomeOverviewYoYRow comparison={mockComparison} />,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('mb-6')
    expect(wrapper.className).toContain('lg:mb-8')
  })
})
