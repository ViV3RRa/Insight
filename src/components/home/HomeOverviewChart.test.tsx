import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories'
import { HomeOverviewChart } from './HomeOverviewChart'
import type { UtilityMetrics, Utility } from '@/types/home'

function buildMetrics(overrides?: Partial<UtilityMetrics>): UtilityMetrics {
  return {
    monthlyConsumption: [
      { month: '2026-01', year: 2026, consumption: 200, isInterpolated: false },
      { month: '2026-02', year: 2026, consumption: 250, isInterpolated: false },
    ],
    monthlyCost: [
      { month: '2026-01', year: 2026, cost: 400 },
      { month: '2026-02', year: 2026, cost: 500 },
    ],
    monthlyCostPerUnit: [],
    ytdConsumption: 450,
    ytdCost: 900,
    currentMonthConsumption: 250,
    currentMonthCost: 500,
    currentMonthCostPerUnit: 2.0,
    avgMonthlyCost: 450,
    costTrend: 'up' as const,
    ...overrides,
  }
}

function setup(
  utilities: Utility[] = [],
  metricsMap?: Map<string, UtilityMetrics>,
  priorYearMetricsMap?: Map<string, UtilityMetrics>,
) {
  const map = metricsMap ?? new Map<string, UtilityMetrics>()
  return renderWithProviders(
    <HomeOverviewChart
      utilities={utilities}
      metricsMap={map}
      priorYearMetricsMap={priorYearMetricsMap}
    />,
  )
}

describe('HomeOverviewChart', () => {
  it('renders chart card with "Monthly Overview" title', () => {
    setup()
    expect(
      screen.getByText('Monthly Overview'),
    ).toBeInTheDocument()
  })

  it('renders consumption mode by default', () => {
    setup()
    const tabs = screen.getAllByRole('tab')
    const consumptionTab = tabs.find((t) => t.textContent === 'Consumption')
    expect(consumptionTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches between Consumption and Cost modes', async () => {
    const user = userEvent.setup()
    const utility = buildUtility({ name: 'Electricity' })
    const map = new Map([[utility.id, buildMetrics()]])
    setup([utility], map)

    const costTab = screen.getByRole('tab', { name: 'Cost' })
    await user.click(costTab)
    expect(costTab).toHaveAttribute('aria-selected', 'true')

    const consumptionTab = screen.getByRole('tab', { name: 'Consumption' })
    expect(consumptionTab).toHaveAttribute('aria-selected', 'false')
  })

  it('switches between Grouped and Stacked layouts', async () => {
    const user = userEvent.setup()
    setup()

    const groupedTab = screen.getByRole('tab', { name: 'Grouped' })
    expect(groupedTab).toHaveAttribute('aria-selected', 'true')

    const stackedTab = screen.getByRole('tab', { name: 'Stacked' })
    await user.click(stackedTab)
    expect(stackedTab).toHaveAttribute('aria-selected', 'true')
    expect(groupedTab).toHaveAttribute('aria-selected', 'false')
  })

  it('renders YoY toggle', () => {
    setup()
    expect(
      screen.getByRole('button', { name: /yoy/i }),
    ).toBeInTheDocument()
  })

  it('renders TimeSpanSelector', () => {
    setup()
    // TimeSpanSelector renders as a tablist with time span options
    const tabLists = screen.getAllByRole('tablist')
    // Should have at least 3 tablists: layout modes, chart modes, time span
    expect(tabLists.length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('tab', { name: 'YTD' })).toBeInTheDocument()
  })

  it('renders legend with utility names and color dots', () => {
    const electricity = buildUtility({ name: 'Electricity', color: 'amber' })
    const water = buildUtility({ name: 'Water', color: 'blue' })
    const map = new Map([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
    ])
    setup([electricity, water], map)

    expect(screen.getByText('Electricity')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
  })

  it('renders empty state when no utilities', () => {
    setup([])
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders with multiple utilities', () => {
    const electricity = buildUtility({ name: 'Electricity', color: 'amber' })
    const water = buildUtility({ name: 'Water', color: 'blue' })
    const gas = buildUtility({ name: 'Gas', color: 'orange' })
    const map = new Map([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
      [gas.id, buildMetrics()],
    ])
    setup([electricity, water, gas], map)

    expect(screen.getByText('Electricity')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
    expect(screen.getByText('Gas')).toBeInTheDocument()
  })

  it('legend colors match assigned utility colors', () => {
    const electricity = buildUtility({ name: 'Electricity', color: 'amber' })
    const water = buildUtility({ name: 'Water', color: 'blue' })
    const map = new Map([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
    ])
    setup([electricity, water], map)

    const electricityLabel = screen.getByText('Electricity')
    const electricityDot = electricityLabel.previousElementSibling as HTMLElement
    expect(electricityDot.style.backgroundColor).toBe('rgb(245, 158, 11)')

    const waterLabel = screen.getByText('Water')
    const waterDot = waterLabel.previousElementSibling as HTMLElement
    expect(waterDot.style.backgroundColor).toBe('rgb(59, 130, 246)')
  })

  it('shows no data message when utilities have no metrics in time range', () => {
    const utility = buildUtility({ name: 'Electricity' })
    const emptyMap = new Map<string, UtilityMetrics>()
    setup([utility], emptyMap)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('does not render legend when no utilities', () => {
    setup([])
    expect(screen.queryByText('Electricity')).not.toBeInTheDocument()
  })
})
