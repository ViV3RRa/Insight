import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../../test/utils'
import { PortfolioOverviewPerfYearly } from './PortfolioOverviewPerfYearly'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  LabelList: () => null,
}))

const currentYear = new Date().getFullYear()

const mockYearlyData = [
  {
    year: 2023,
    startingValue: 0,
    endingValue: 50000,
    netDeposits: 45000,
    earnings: 5000,
    earningsPercent: 11.11,
    xirr: 12.5,
  },
  {
    year: 2024,
    startingValue: 50000,
    endingValue: 80000,
    netDeposits: 20000,
    earnings: 10000,
    earningsPercent: 14.29,
    xirr: 15.3,
  },
  {
    year: 2025,
    startingValue: 80000,
    endingValue: 75000,
    netDeposits: 0,
    earnings: -5000,
    earningsPercent: -6.25,
    xirr: -7.1,
  },
  {
    year: currentYear,
    startingValue: 75000,
    endingValue: 82000,
    netDeposits: 5000,
    earnings: 2000,
    earningsPercent: 2.5,
    xirr: null,
  },
]

const mockTotals = {
  startingValue: 0,
  endingValue: 82000,
  netDeposits: 70000,
  earnings: 12000,
  earningsPercent: 17.14,
  xirr: 10.2,
}

const negativeTotals = {
  startingValue: 100000,
  endingValue: 90000,
  netDeposits: 0,
  earnings: -10000,
  earningsPercent: -10.0,
  xirr: null,
}

describe('PortfolioOverviewPerfYearly', () => {
  it('renders TabBar with Yearly and Monthly tabs', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByRole('tab', { name: 'Yearly' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Monthly' })).toBeInTheDocument()
  })

  it('has Yearly tab active by default', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
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

  it('renders ChartModeToggle with Earnings and XIRR options', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByRole('tab', { name: 'Earnings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'XIRR' })).toBeInTheDocument()
  })

  it('switches to Monthly tab and shows placeholder', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Monthly' }))

    expect(screen.getByText('Monthly analysis coming soon')).toBeInTheDocument()
    // Chart and table should not be visible
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('renders bar chart on Yearly tab', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders DataTable with correct column headers', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Starting Value')).toBeInTheDocument()
    expect(screen.getByText('Ending Value')).toBeInTheDocument()
    expect(screen.getByText('Net Deposits')).toBeInTheDocument()
    // "Earnings" appears in the tab toggle AND as column header
    expect(screen.getAllByText('Earnings').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Earnings %')).toBeInTheDocument()
    // "XIRR" appears in the tab toggle AND as column header
    expect(screen.getAllByText('XIRR').length).toBeGreaterThanOrEqual(1)
  })

  it('renders yearly data rows with correct values', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('labels current year with (YTD)', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByText(`${currentYear} (YTD)`)).toBeInTheDocument()
  })

  it('renders totals row with "All Time"', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    expect(screen.getByText('All Time')).toBeInTheDocument()
  })

  it('colors positive earnings with emerald', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // Find a positive earnings cell — 5.000,00 DKK for 2023 row
    const positiveEarnings = screen.getAllByText(/5\.000,00 DKK/)
    const positiveSpan = positiveEarnings.find((el) =>
      el.className?.includes('text-emerald'),
    )
    expect(positiveSpan).toBeDefined()
  })

  it('colors negative earnings with rose', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // 2025 has -5000 earnings
    const negativeEarnings = screen.getAllByText(/-5\.000,00 DKK/)
    const negativeSpan = negativeEarnings.find((el) =>
      el.className?.includes('text-rose'),
    )
    expect(negativeSpan).toBeDefined()
  })

  it('renders null XIRR as dash', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // Current year has null xirr — should render "–"
    const dashes = screen.getAllByText('–')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders non-null XIRR with font-semibold', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // 2023 has xirr 12.5 → "12,50%"
    const xirrEl = screen.getByText('12,50%')
    expect(xirrEl.className).toContain('font-semibold')
  })

  it('renders totals XIRR with font-semibold when non-null', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // totals xirr is 10.2 → "10,20%"
    const totalsXirr = screen.getByText('10,20%')
    expect(totalsXirr.className).toContain('font-semibold')
  })

  it('renders totals XIRR as dash when null', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={negativeTotals} />,
    )

    // negativeTotals has null xirr
    const dashes = screen.getAllByText('–')
    // At least 2 dashes: one from the current year row (null xirr) and one from totals
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('colors negative totals earnings with rose', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={negativeTotals} />,
    )

    const negativeEarnings = screen.getAllByText(/-10\.000,00 DKK/)
    const roseSpan = negativeEarnings.find((el) =>
      el.className?.includes('text-rose'),
    )
    expect(roseSpan).toBeDefined()
  })

  it('renders loading state with skeletons', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewPerfYearly
        yearlyData={[]}
        totals={mockTotals}
        isLoading={true}
      />,
    )

    // Skeletons should be present
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)

    // TabBar should NOT be rendered in loading state
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('switches chart mode between Earnings and XIRR', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    // Earnings is default
    const earningsTab = screen.getByRole('tab', { name: 'Earnings' })
    expect(earningsTab).toHaveAttribute('aria-selected', 'true')

    // Switch to XIRR
    await user.click(screen.getByRole('tab', { name: 'XIRR' }))
    expect(screen.getByRole('tab', { name: 'XIRR' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('switches back to Yearly tab from Monthly', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    await user.click(screen.getByRole('tab', { name: 'Monthly' }))
    expect(screen.getByText('Monthly analysis coming soon')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Yearly' }))
    expect(screen.queryByText('Monthly analysis coming soon')).not.toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders cells for each year in bar chart', () => {
    renderWithProviders(
      <PortfolioOverviewPerfYearly yearlyData={mockYearlyData} totals={mockTotals} />,
    )

    const cells = screen.getAllByTestId('cell')
    expect(cells).toHaveLength(mockYearlyData.length)
  })
})
