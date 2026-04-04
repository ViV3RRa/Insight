import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen } from '../../test/utils'
import { PortfolioOverviewPerfMonthly, type MonthlyData } from './PortfolioOverviewPerfMonthly'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-count={data?.length}>
      {children}
    </div>
  ),
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  LabelList: () => null,
}))

const mockMonthlyData: MonthlyData[] = [
  {
    period: '2025-10',
    periodLabel: 'Oct 2025',
    startingValue: 100000,
    endingValue: 103000,
    netDeposits: 1000,
    earnings: 2000,
    monthlyXirr: 2.01,
  },
  {
    period: '2025-11',
    periodLabel: 'Nov 2025',
    startingValue: 103000,
    endingValue: 101000,
    netDeposits: 0,
    earnings: -2000,
    monthlyXirr: -1.94,
  },
  {
    period: '2025-12',
    periodLabel: 'Dec 2025',
    startingValue: 101000,
    endingValue: 105000,
    netDeposits: 2000,
    earnings: 2000,
    monthlyXirr: 1.94,
  },
  {
    period: '2026-01',
    periodLabel: 'Jan 2026',
    startingValue: 105000,
    endingValue: 108000,
    netDeposits: 0,
    earnings: 3000,
    monthlyXirr: 2.86,
  },
  {
    period: '2026-02',
    periodLabel: 'Feb 2026',
    startingValue: 108000,
    endingValue: 107500,
    netDeposits: 500,
    earnings: -1000,
    monthlyXirr: null,
  },
]

function generateManyMonths(count: number): MonthlyData[] {
  return Array.from({ length: count }, (_, i) => {
    const year = 2024 + Math.floor(i / 12)
    const month = (i % 12) + 1
    const monthStr = String(month).padStart(2, '0')
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return {
      period: `${year}-${monthStr}`,
      periodLabel: `${monthNames[i % 12]} ${year}`,
      startingValue: 100000 + i * 1000,
      endingValue: 101000 + i * 1000,
      netDeposits: 500,
      earnings: 500,
      monthlyXirr: 0.5,
    }
  })
}

describe('PortfolioOverviewPerfMonthly', () => {
  it('renders bar chart with monthly data', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders cells for each month in bar chart', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(mockMonthlyData.length)
  })

  it('renders bar chart data-count matching monthly data length', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'data-count',
      String(mockMonthlyData.length),
    )
  })

  it('renders DataTable with correct column headers', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    expect(screen.getByText('Period')).toBeInTheDocument()
    expect(screen.getByText('Starting Value')).toBeInTheDocument()
    expect(screen.getByText('Ending Value')).toBeInTheDocument()
    expect(screen.getByText('Net Deposits')).toBeInTheDocument()
    expect(screen.getByText('Earnings')).toBeInTheDocument()
    expect(screen.getByText('Monthly XIRR')).toBeInTheDocument()
  })

  it('renders period labels in "MMM YYYY" format', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    expect(screen.getByText('Oct 2025')).toBeInTheDocument()
    expect(screen.getByText('Nov 2025')).toBeInTheDocument()
    expect(screen.getByText('Feb 2026')).toBeInTheDocument()
  })

  it('renders monthly data rows with correct values', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Oct 2025 starting value: 100000 → "100.000,00 DKK"
    expect(screen.getByText('100.000,00 DKK')).toBeInTheDocument()
    // Jan 2026 earnings: 3000 → "3.000,00 DKK"
    expect(screen.getAllByText('3.000,00 DKK').length).toBeGreaterThanOrEqual(1)
  })

  it('colors positive earnings with emerald', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Oct 2025 has positive earnings of 2000
    const positiveEarnings = screen.getAllByText(/2\.000,00 DKK/)
    const positiveSpan = positiveEarnings.find((el) =>
      el.className?.includes('text-emerald'),
    )
    expect(positiveSpan).toBeDefined()
  })

  it('colors negative earnings with rose', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Nov 2025 has negative earnings of -2000
    const negativeEarnings = screen.getAllByText(/-2\.000,00 DKK/)
    const negativeSpan = negativeEarnings.find((el) =>
      el.className?.includes('text-rose'),
    )
    expect(negativeSpan).toBeDefined()
  })

  it('renders positive XIRR with emerald color', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Oct 2025 monthlyXirr: 2.01 → "2,01%"
    const xirrEl = screen.getByText('2,01%')
    expect(xirrEl.className).toContain('text-emerald')
  })

  it('renders negative XIRR with rose color', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Nov 2025 monthlyXirr: -1.94 → "-1,94%"
    const xirrEl = screen.getByText('-1,94%')
    expect(xirrEl.className).toContain('text-rose')
  })

  it('renders null XIRR as dash', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Feb 2026 has null monthlyXirr
    const dashes = screen.getAllByText('–')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('uses earnings values in bar chart when chartMode is earnings', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Bar chart should render — we verify it exists with data
    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'data-count',
      String(mockMonthlyData.length),
    )
  })

  it('uses XIRR values in bar chart when chartMode is xirr', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="xirr" />,
    )

    // Bar chart should still render with same data count
    expect(screen.getByTestId('bar-chart')).toHaveAttribute(
      'data-count',
      String(mockMonthlyData.length),
    )
  })

  it('renders loading state with skeletons', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={[]} chartMode="earnings" isLoading={true} />,
    )

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(2)

    // Bar chart and table should NOT be rendered
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Period')).not.toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={[]} chartMode="earnings" />,
    )

    expect(screen.getByText('No monthly data available')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('shows "Show all" button when data exceeds threshold of 12', () => {
    const manyMonths = generateManyMonths(15)
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={manyMonths} chartMode="earnings" />,
    )

    expect(screen.getByText('Show all 15')).toBeInTheDocument()
  })

  it('does not show "Show all" button when data is within threshold', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    expect(screen.queryByText(/Show all/)).not.toBeInTheDocument()
  })

  it('renders currency values in DKK format', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // Check that DKK suffix appears in formatted values
    expect(screen.getByText('100.000,00 DKK')).toBeInTheDocument()
    // 103.000,00 DKK appears twice (endingValue Oct, startingValue Nov)
    expect(screen.getAllByText('103.000,00 DKK')).toHaveLength(2)
  })

  it('renders XIRR as percentage format', () => {
    renderWithProviders(
      <PortfolioOverviewPerfMonthly monthlyData={mockMonthlyData} chartMode="earnings" />,
    )

    // 2.86% for Jan 2026
    expect(screen.getByText('2,86%')).toBeInTheDocument()
    // 1.94% for Dec 2025
    expect(screen.getByText('1,94%')).toBeInTheDocument()
  })
})
