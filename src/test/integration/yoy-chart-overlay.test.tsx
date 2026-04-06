import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories/homeFactory'
import { PlatformDetailPerfChart } from '@/components/portfolio/PlatformDetailPerfChart'
import { PortfolioOverviewValueCharts } from '@/components/portfolio/PortfolioOverviewValueCharts'
import { HomeOverviewChart } from '@/components/home/HomeOverviewChart'
import { UtilityDetailChart } from '@/components/home/UtilityDetailChart'
import { VehicleEfficiencyChart } from '@/components/vehicles/VehicleEfficiencyChart'
import { VehicleFuelCostChart } from '@/components/vehicles/VehicleFuelCostChart'
import { VehicleKmChart } from '@/components/vehicles/VehicleKmChart'
import { VehicleMaintenanceChart } from '@/components/vehicles/VehicleMaintenanceChart'
import type { UtilityMetrics } from '@/types/home'

// --- Shared test helpers ---

function getYoYToggle(): HTMLElement | null {
  return screen.queryByRole('button', { name: /yoy/i })
}

function buildMetrics(overrides?: Partial<UtilityMetrics>): UtilityMetrics {
  return {
    monthlyConsumption: [
      { month: '2026-01', year: 2026, consumption: 300, isInterpolated: false },
      { month: '2026-02', year: 2026, consumption: 280, isInterpolated: false },
    ],
    monthlyCost: [
      { month: '2026-01', year: 2026, cost: 450 },
      { month: '2026-02', year: 2026, cost: 420 },
    ],
    monthlyCostPerUnit: [
      { month: '2026-01', year: 2026, costPerUnit: 1.5 },
      { month: '2026-02', year: 2026, costPerUnit: 1.5 },
    ],
    ytdConsumption: 580,
    ytdCost: 870,
    currentMonthConsumption: 280,
    currentMonthCost: 420,
    currentMonthCostPerUnit: 1.5,
    avgMonthlyCost: 435,
    costTrend: 'down',
    ...overrides,
  }
}

function buildPriorYearMetrics(): UtilityMetrics {
  return buildMetrics({
    monthlyConsumption: [
      { month: '2025-01', year: 2025, consumption: 320, isInterpolated: false },
      { month: '2025-02', year: 2025, consumption: 310, isInterpolated: false },
    ],
    monthlyCost: [
      { month: '2025-01', year: 2025, cost: 480 },
      { month: '2025-02', year: 2025, cost: 465 },
    ],
    monthlyCostPerUnit: [
      { month: '2025-01', year: 2025, costPerUnit: 1.5 },
      { month: '2025-02', year: 2025, costPerUnit: 1.5 },
    ],
    ytdConsumption: 630,
    ytdCost: 945,
  })
}

// ============================================================
// PlatformDetailPerfChart
// ============================================================

describe('PlatformDetailPerfChart — YoY overlay', () => {
  const earningsData = [
    { month: 'Jan', earnings: 100 },
    { month: 'Feb', earnings: 150 },
  ]
  const xirrData = [
    { month: 'Jan', xirr: 5 },
    { month: 'Feb', xirr: 6 },
  ]
  const yoyEarnings = [
    { month: 'Jan', earnings: 80 },
    { month: 'Feb', earnings: 120 },
  ]
  const yoyXirr = [
    { month: 'Jan', xirr: 4 },
    { month: 'Feb', xirr: 5 },
  ]

  it('renders YoY toggle button', () => {
    renderWithProviders(
      <PlatformDetailPerfChart
        earningsData={earningsData}
        xirrData={xirrData}
        currency="DKK"
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={false}
        onYoYChange={vi.fn()}
      />,
    )
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default (aria-pressed=false)', () => {
    renderWithProviders(
      <PlatformDetailPerfChart
        earningsData={earningsData}
        xirrData={xirrData}
        currency="DKK"
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={false}
        onYoYChange={vi.fn()}
      />,
    )
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onYoYChange when toggle is clicked', async () => {
    const onYoYChange = vi.fn()
    renderWithProviders(
      <PlatformDetailPerfChart
        earningsData={earningsData}
        xirrData={xirrData}
        currency="DKK"
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={false}
        onYoYChange={onYoYChange}
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(onYoYChange).toHaveBeenCalledWith(true)
  })

  it('renders without crash when yoyActive=true and prior year data provided', () => {
    renderWithProviders(
      <PlatformDetailPerfChart
        earningsData={earningsData}
        xirrData={xirrData}
        yoyEarningsData={yoyEarnings}
        yoyXirrData={yoyXirr}
        currency="DKK"
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={true}
        onYoYChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
  })

  it('renders without crash when yoyActive=true but no prior year data', () => {
    renderWithProviders(
      <PlatformDetailPerfChart
        earningsData={earningsData}
        xirrData={xirrData}
        currency="DKK"
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={true}
        onYoYChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
  })
})

// ============================================================
// PortfolioOverviewValueCharts (YoY toggle hidden — controlled externally)
// ============================================================

describe('PortfolioOverviewValueCharts — YoY overlay', () => {
  const monthlyPerf = [
    { month: 'Jan', earnings: 200, xirr: 8 },
    { month: 'Feb', earnings: -50, xirr: -2 },
  ]
  const yoyMonthlyPerf = [
    { month: 'Jan', earnings: 150, xirr: 6 },
    { month: 'Feb', earnings: 100, xirr: 4 },
  ]

  it('hides YoY toggle (parent controls it)', () => {
    renderWithProviders(
      <PortfolioOverviewValueCharts
        compositeData={[]}
        platforms={[]}
        monthlyPerformance={monthlyPerf}
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={false}
        onYoYChange={vi.fn()}
      />,
    )
    expect(getYoYToggle()).not.toBeInTheDocument()
  })

  it('renders without crash when yoyActive=true with prior year data', () => {
    renderWithProviders(
      <PortfolioOverviewValueCharts
        compositeData={[]}
        platforms={[]}
        monthlyPerformance={monthlyPerf}
        yoyMonthlyPerformance={yoyMonthlyPerf}
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={true}
        onYoYChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Monthly Performance')).toBeInTheDocument()
  })

  it('renders without crash when yoyActive=true but no prior year data', () => {
    renderWithProviders(
      <PortfolioOverviewValueCharts
        compositeData={[]}
        platforms={[]}
        monthlyPerformance={monthlyPerf}
        timeSpan="YTD"
        onTimeSpanChange={vi.fn()}
        yoyActive={true}
        onYoYChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Monthly Performance')).toBeInTheDocument()
  })
})

// ============================================================
// HomeOverviewChart (manages YoY state internally)
// ============================================================

describe('HomeOverviewChart — YoY overlay', () => {
  const utility = buildUtility({ name: 'Electricity', color: 'amber' })
  const metricsMap = new Map([[utility.id, buildMetrics()]])
  const priorYearMetricsMap = new Map([[utility.id, buildPriorYearMetrics()]])

  it('renders YoY toggle button', () => {
    renderWithProviders(
      <HomeOverviewChart
        utilities={[utility]}
        metricsMap={metricsMap}
      />,
    )
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default (aria-pressed=false)', () => {
    renderWithProviders(
      <HomeOverviewChart
        utilities={[utility]}
        metricsMap={metricsMap}
      />,
    )
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking toggle activates YoY (aria-pressed=true)', async () => {
    renderWithProviders(
      <HomeOverviewChart
        utilities={[utility]}
        metricsMap={metricsMap}
        priorYearMetricsMap={priorYearMetricsMap}
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking toggle twice deactivates YoY', async () => {
    renderWithProviders(
      <HomeOverviewChart
        utilities={[utility]}
        metricsMap={metricsMap}
        priorYearMetricsMap={priorYearMetricsMap}
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders without crash when YoY active but no prior year data', async () => {
    renderWithProviders(
      <HomeOverviewChart
        utilities={[utility]}
        metricsMap={metricsMap}
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(screen.getByText('Monthly Overview')).toBeInTheDocument()
  })
})

// ============================================================
// UtilityDetailChart (manages YoY state internally via ChartCard)
// ============================================================

describe('UtilityDetailChart — YoY overlay', () => {
  const utility = buildUtility({ name: 'Water', color: 'blue', unit: 'm³' })
  const metrics = buildMetrics()
  const priorYearMetrics = buildPriorYearMetrics()

  it('renders YoY toggle button', () => {
    renderWithProviders(
      <UtilityDetailChart utility={utility} metrics={metrics} />,
    )
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default', () => {
    renderWithProviders(
      <UtilityDetailChart utility={utility} metrics={metrics} />,
    )
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking toggle activates YoY', async () => {
    renderWithProviders(
      <UtilityDetailChart
        utility={utility}
        metrics={metrics}
        priorYearMetrics={priorYearMetrics}
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders without crash when YoY active but no prior year metrics', async () => {
    renderWithProviders(
      <UtilityDetailChart utility={utility} metrics={metrics} />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(screen.getByText('Consumption & Cost')).toBeInTheDocument()
  })
})

// ============================================================
// VehicleEfficiencyChart (line chart — dashed ghost line)
// ============================================================

describe('VehicleEfficiencyChart — YoY overlay', () => {
  const data = [
    { date: '2026-01-15', efficiency: 15.2, fuelAmount: 40 },
    { date: '2026-02-10', efficiency: 14.8, fuelAmount: 42 },
  ]
  const priorYearData = [
    { date: '2025-01-20', efficiency: 14.0, fuelAmount: 38 },
    { date: '2025-02-15', efficiency: 13.5, fuelAmount: 41 },
  ]

  it('renders YoY toggle button', () => {
    renderWithProviders(
      <VehicleEfficiencyChart data={data} unit="km/l" />,
    )
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default', () => {
    renderWithProviders(
      <VehicleEfficiencyChart data={data} unit="km/l" />,
    )
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking toggle activates YoY', async () => {
    renderWithProviders(
      <VehicleEfficiencyChart
        data={data}
        priorYearData={priorYearData}
        unit="km/l"
      />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders without crash when YoY active but no prior year data', async () => {
    renderWithProviders(
      <VehicleEfficiencyChart data={data} unit="km/l" />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(screen.getByText('Fuel Efficiency')).toBeInTheDocument()
  })
})

// ============================================================
// VehicleFuelCostChart (bar chart — ghost bars)
// ============================================================

describe('VehicleFuelCostChart — YoY overlay', () => {
  const data = [
    { month: '2026-01', cost: 800 },
    { month: '2026-02', cost: 750 },
  ]
  const priorYearData = [
    { month: '2025-01', cost: 700 },
    { month: '2025-02', cost: 680 },
  ]

  it('renders YoY toggle button', () => {
    renderWithProviders(<VehicleFuelCostChart data={data} />)
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default', () => {
    renderWithProviders(<VehicleFuelCostChart data={data} />)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking toggle activates YoY', async () => {
    renderWithProviders(
      <VehicleFuelCostChart data={data} priorYearData={priorYearData} />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders without crash when YoY active but no prior year data', async () => {
    renderWithProviders(<VehicleFuelCostChart data={data} />)
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(screen.getByText('Monthly Fuel Cost')).toBeInTheDocument()
  })
})

// ============================================================
// VehicleKmChart (bar chart — ghost bars)
// ============================================================

describe('VehicleKmChart — YoY overlay', () => {
  const data = [
    { month: '2026-01', km: 1200 },
    { month: '2026-02', km: 1100 },
  ]
  const priorYearData = [
    { month: '2025-01', km: 1000 },
    { month: '2025-02', km: 950 },
  ]

  it('renders YoY toggle button', () => {
    renderWithProviders(<VehicleKmChart data={data} />)
    expect(getYoYToggle()).toBeInTheDocument()
  })

  it('toggle is OFF by default', () => {
    renderWithProviders(<VehicleKmChart data={data} />)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking toggle activates YoY', async () => {
    renderWithProviders(
      <VehicleKmChart data={data} priorYearData={priorYearData} />,
    )
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(getYoYToggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders without crash when YoY active but no prior year data', async () => {
    renderWithProviders(<VehicleKmChart data={data} />)
    const user = userEvent.setup()
    await user.click(getYoYToggle()!)
    expect(screen.getByText('Monthly Km Driven')).toBeInTheDocument()
  })
})

// ============================================================
// VehicleMaintenanceChart (YoY intentionally hidden)
// ============================================================

describe('VehicleMaintenanceChart — YoY not applicable', () => {
  const data = [
    { month: '2026-01', cost: 2500 },
    { month: '2026-02', cost: 300 },
  ]

  it('does NOT render YoY toggle (hideYoY=true)', () => {
    renderWithProviders(<VehicleMaintenanceChart data={data} />)
    expect(getYoYToggle()).not.toBeInTheDocument()
  })

  it('renders chart without YoY support', () => {
    renderWithProviders(<VehicleMaintenanceChart data={data} />)
    expect(screen.getByText('Maintenance Cost')).toBeInTheDocument()
  })
})
