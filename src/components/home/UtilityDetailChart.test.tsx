import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories'
import { UtilityDetailChart } from './UtilityDetailChart'
import type { Utility, UtilityMetrics } from '@/types/home'

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
    monthlyCostPerUnit: [
      { month: '2026-01', year: 2026, costPerUnit: 2.0 },
      { month: '2026-02', year: 2026, costPerUnit: 2.0 },
    ],
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
  utility?: Utility,
  metrics?: UtilityMetrics | null,
  priorYearMetrics?: UtilityMetrics | null,
) {
  const u = utility ?? buildUtility({ name: 'Electricity', color: 'amber' })
  return renderWithProviders(
    <UtilityDetailChart
      utility={u}
      metrics={metrics ?? null}
      priorYearMetrics={priorYearMetrics}
    />,
  )
}

describe('UtilityDetailChart', () => {
  it('renders chart card with "Consumption & Cost" title', () => {
    setup()
    expect(screen.getByText('Consumption & Cost')).toBeInTheDocument()
  })

  it('shows three mode options: Consumption, Cost, Cost/Unit', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'Consumption' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cost' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cost/Unit' })).toBeInTheDocument()
  })

  it('defaults to Consumption mode', () => {
    setup()
    const consumptionTab = screen.getByRole('tab', { name: 'Consumption' })
    expect(consumptionTab).toHaveAttribute('aria-selected', 'true')
  })

  it('renders empty state when metrics is null', () => {
    setup(undefined, null)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders chart container when metrics provided', () => {
    const utility = buildUtility({ name: 'Electricity', color: 'amber' })
    const metrics = buildMetrics()
    setup(utility, metrics)
    // Chart should render (no "No data available" message)
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('renders YoY toggle', () => {
    setup()
    expect(screen.getByRole('button', { name: /yoy/i })).toBeInTheDocument()
  })

  it('renders TimeSpanSelector', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'YTD' })).toBeInTheDocument()
  })

  it('switches mode when Cost tab is clicked', async () => {
    const user = userEvent.setup()
    const utility = buildUtility({ name: 'Electricity', color: 'amber' })
    const metrics = buildMetrics()
    setup(utility, metrics)

    const costTab = screen.getByRole('tab', { name: 'Cost' })
    await user.click(costTab)
    expect(costTab).toHaveAttribute('aria-selected', 'true')

    const consumptionTab = screen.getByRole('tab', { name: 'Consumption' })
    expect(consumptionTab).toHaveAttribute('aria-selected', 'false')
  })

  it('renders with valid metrics data without crashing', () => {
    const utility = buildUtility({ name: 'Water', color: 'blue' })
    const metrics = buildMetrics()
    setup(utility, metrics)
    expect(screen.getByText('Consumption & Cost')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('renders empty state with empty monthly data arrays', () => {
    const utility = buildUtility({ name: 'Gas', color: 'orange' })
    const metrics = buildMetrics({
      monthlyConsumption: [],
      monthlyCost: [],
      monthlyCostPerUnit: [],
    })
    setup(utility, metrics)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})
