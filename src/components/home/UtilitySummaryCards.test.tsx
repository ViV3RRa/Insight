import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { buildUtility } from '@/test/factories'
import { UtilitySummaryCards } from './UtilitySummaryCards'
import type { Utility, UtilityMetrics } from '@/types/home'

function buildMetrics(overrides?: Partial<UtilityMetrics>): UtilityMetrics {
  return {
    monthlyConsumption: [
      { month: 'Feb', year: 2026, consumption: 200, isInterpolated: false },
      { month: 'Mar', year: 2026, consumption: 250, isInterpolated: false },
    ],
    monthlyCost: [
      { month: 'Feb', year: 2026, cost: 400 },
      { month: 'Mar', year: 2026, cost: 500 },
    ],
    monthlyCostPerUnit: [
      { month: 'Feb', year: 2026, costPerUnit: 2.0 },
      { month: 'Mar', year: 2026, costPerUnit: 2.0 },
    ],
    ytdConsumption: 450,
    ytdCost: 900,
    currentMonthConsumption: 250,
    currentMonthCost: 500,
    currentMonthCostPerUnit: 2.0,
    avgMonthlyCost: 450,
    costTrend: 'up',
    ...overrides,
  }
}

describe('UtilitySummaryCards', () => {
  let electricity: Utility
  let water: Utility
  let gas: Utility

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'))
    electricity = buildUtility({ name: 'Electricity', unit: 'kWh', icon: 'bolt', color: 'amber' })
    water = buildUtility({ name: 'Water', unit: 'm³', icon: 'droplet', color: 'blue' })
    gas = buildUtility({ name: 'Gas', unit: 'm³', icon: 'flame', color: 'orange' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders one card per utility', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
      [water.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity, water]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
  })

  it('shows utility name, unit, consumption, and cost', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics({ currentMonthConsumption: 312.5, currentMonthCost: 750 })],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('Electricity')).toBeInTheDocument()
    // Unit appears in header and under consumption
    const unitElements = screen.getAllByText('kWh')
    expect(unitElements.length).toBeGreaterThanOrEqual(1)
    // Consumption: 312,5 (da-DK formatting, 1 decimal)
    expect(screen.getByText('312,5')).toBeInTheDocument()
    // Cost: 750 (da-DK formatting, 0 decimals)
    expect(screen.getByText('750')).toBeInTheDocument()
  })

  it('shows footer with YTD Cost, Cost/Unit, and Updated date', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics({ ytdCost: 2500, currentMonthCostPerUnit: 1.85 })],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-03-15')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('YTD Cost')).toBeInTheDocument()
    expect(screen.getByText('2.500')).toBeInTheDocument()
    expect(screen.getByText('Cost/Unit')).toBeInTheDocument()
    expect(screen.getByText('1,85')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
    expect(screen.getByText('Mar 15')).toBeInTheDocument()
  })

  it('shows staleness badge for stale utility (critical: >7 days)', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
    ])
    // 10 days old → critical
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-03-26')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows staleness badge for warning (>2 days, ≤7 days)', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
    ])
    // 4 days old → warning
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-01')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows no staleness badge for fresh utility (≤2 days)', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
    ])
    // 1 day old → fresh
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.queryByText('Stale')).not.toBeInTheDocument()
  })

  it('shows critical staleness when latestReadingDate is null', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, null],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('links each card to the correct utility detail URL', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
      [water.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity, water]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', `/home/utility/${electricity.id}`)
    expect(links[1]).toHaveAttribute('href', `/home/utility/${water.id}`)
  })

  it('applies correct grid classes for responsive layout', () => {
    const metricsMap = new Map<string, UtilityMetrics>()
    const latestReadingDates = new Map<string, Date | null>()

    const { container } = renderWithProviders(
      <UtilitySummaryCards
        utilities={[]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('sm:grid-cols-3')
  })

  it('shows ChangeIndicator with consumption change when two months of data exist', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [
        electricity.id,
        buildMetrics({
          monthlyConsumption: [
            { month: 'Feb', year: 2026, consumption: 200, isInterpolated: false },
            { month: 'Mar', year: 2026, consumption: 250, isInterpolated: false },
          ],
        }),
      ],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    // 25% increase: (250-200)/200*100 = 25
    // ChangeIndicator renders the formatted value with suffix
    expect(screen.getByText(/25,00%/)).toBeInTheDocument()
  })

  it('does not show ChangeIndicator when only one month of data', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [
        electricity.id,
        buildMetrics({
          monthlyConsumption: [
            { month: 'Mar', year: 2026, consumption: 250, isInterpolated: false },
          ],
        }),
      ],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.queryByText(/vs last month/)).not.toBeInTheDocument()
  })

  it('renders empty grid when utilities array is empty', () => {
    const { container } = renderWithProviders(
      <UtilitySummaryCards
        utilities={[]}
        metricsMap={new Map()}
        latestReadingDates={new Map()}
      />,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.children).toHaveLength(0)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows dashes when metrics are missing for a utility', () => {
    const metricsMap = new Map<string, UtilityMetrics>()
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, null],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    // Consumption, Cost, Cost/Unit, Updated all show "—"
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })

  it('renders three utility cards in the grid', () => {
    const metricsMap = new Map<string, UtilityMetrics>([
      [electricity.id, buildMetrics()],
      [water.id, buildMetrics()],
      [gas.id, buildMetrics()],
    ])
    const latestReadingDates = new Map<string, Date | null>([
      [electricity.id, new Date('2026-04-04')],
      [water.id, new Date('2026-04-04')],
      [gas.id, new Date('2026-04-04')],
    ])

    renderWithProviders(
      <UtilitySummaryCards
        utilities={[electricity, water, gas]}
        metricsMap={metricsMap}
        latestReadingDates={latestReadingDates}
      />,
    )

    expect(screen.getByText('Electricity')).toBeInTheDocument()
    expect(screen.getByText('Water')).toBeInTheDocument()
    expect(screen.getByText('Gas')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})
