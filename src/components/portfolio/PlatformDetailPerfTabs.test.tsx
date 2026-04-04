import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent, within } from '@/test/utils'
import {
  PlatformDetailPerfTabs,
  type YearlyPerfRow,
  type MonthlyPerfRow,
  type PlatformDetailPerfTabsProps,
} from './PlatformDetailPerfTabs'

// Mock Recharts — SVG rendering is unreliable in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey }: { children: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  Cell: () => <div data-testid="cell" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  LabelList: () => null,
}))

const sampleYearly: YearlyPerfRow[] = [
  {
    period: '2024',
    startingValue: 0,
    endingValue: 50000,
    netDeposits: 45000,
    earnings: 5000,
    earningsPercent: 11.11,
    xirr: 12.5,
  },
  {
    period: '2025',
    startingValue: 50000,
    endingValue: 62000,
    netDeposits: 5000,
    earnings: 7000,
    earningsPercent: 12.73,
    xirr: 14.2,
  },
  {
    period: '2026 (YTD)',
    startingValue: 62000,
    endingValue: 65000,
    netDeposits: 1000,
    earnings: 2000,
    earningsPercent: 3.17,
    xirr: null,
  },
]

const sampleYearlyTotals: YearlyPerfRow = {
  period: 'All Time',
  startingValue: 0,
  endingValue: 65000,
  netDeposits: 51000,
  earnings: 14000,
  earningsPercent: 27.45,
  xirr: 13.8,
}

const sampleMonthly: MonthlyPerfRow[] = [
  {
    period: 'Jan 2026',
    startingValue: 62000,
    endingValue: 63000,
    netDeposits: 500,
    earnings: 500,
    monthlyXirr: 9.6,
  },
  {
    period: 'Feb 2026',
    startingValue: 63000,
    endingValue: 64500,
    netDeposits: 500,
    earnings: 1000,
    monthlyXirr: 18.9,
  },
  {
    period: 'Mar 2026',
    startingValue: 64500,
    endingValue: 65000,
    netDeposits: 0,
    earnings: 500,
    monthlyXirr: 9.3,
  },
]

function defaultProps(overrides: Partial<PlatformDetailPerfTabsProps> = {}): PlatformDetailPerfTabsProps {
  return {
    yearlyData: sampleYearly,
    monthlyData: sampleMonthly,
    yearlyTotals: sampleYearlyTotals,
    currency: 'DKK',
    ...overrides,
  }
}

describe('PlatformDetailPerfTabs', () => {
  describe('tabs', () => {
    it('renders Yearly and Monthly tabs', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByRole('tab', { name: 'Yearly' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Monthly' })).toBeInTheDocument()
    })

    it('defaults to Yearly tab active', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByRole('tab', { name: 'Yearly' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'Monthly' })).toHaveAttribute('aria-selected', 'false')
    })

    it('switches to Monthly tab when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      expect(screen.getByRole('tab', { name: 'Monthly' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: 'Yearly' })).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('ChartModeToggle', () => {
    it('renders Earnings and XIRR mode buttons in TabBar right slot', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByRole('tab', { name: 'Earnings' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'XIRR' })).toBeInTheDocument()
    })

    it('switches chart mode when XIRR is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)

      await user.click(screen.getByRole('tab', { name: 'XIRR' }))

      expect(screen.getByRole('tab', { name: 'XIRR' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  describe('yearly tab', () => {
    it('renders bar chart with correct number of data points', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-points', '3')
    })

    it('renders a table with 7 columns', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(7)
      expect(columnHeaders[0]).toHaveTextContent('Period')
      expect(columnHeaders[1]).toHaveTextContent('Starting Value')
      expect(columnHeaders[2]).toHaveTextContent('Ending Value')
      expect(columnHeaders[3]).toHaveTextContent('Net Deposits')
      expect(columnHeaders[4]).toHaveTextContent('Earnings')
      expect(columnHeaders[5]).toHaveTextContent('Earnings %')
      expect(columnHeaders[6]).toHaveTextContent('XIRR')
    })

    it('renders all yearly data rows', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByText('2024')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
      expect(screen.getByText('2026 (YTD)')).toBeInTheDocument()
    })

    it('shows current year with (YTD) label', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      expect(screen.getByText('2026 (YTD)')).toBeInTheDocument()
    })

    it('renders totals row when yearlyTotals provided', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      const tfoot = document.querySelector('tfoot')
      expect(tfoot).toBeInTheDocument()
      expect(within(tfoot!).getByText('All Time')).toBeInTheDocument()
    })

    it('does not render totals row when yearlyTotals is undefined', () => {
      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ yearlyTotals: undefined })} />,
      )
      expect(document.querySelector('tfoot')).not.toBeInTheDocument()
    })

    it('uses colored text for earnings (positive green)', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)
      // Find the earnings cell that has the formatted currency value
      const earningsCells = document.querySelectorAll('.text-emerald-600')
      expect(earningsCells.length).toBeGreaterThan(0)
    })

    it('uses colored text for negative earnings', () => {
      const negativeData: YearlyPerfRow[] = [
        {
          period: '2025',
          startingValue: 50000,
          endingValue: 45000,
          netDeposits: 0,
          earnings: -5000,
          earningsPercent: -10,
          xirr: -8.5,
        },
      ]
      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ yearlyData: negativeData })} />,
      )
      const roseCells = document.querySelectorAll('.text-rose-600')
      expect(roseCells.length).toBeGreaterThan(0)
    })
  })

  describe('monthly tab', () => {
    it('renders a table with 6 columns', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(6)
      expect(columnHeaders[0]).toHaveTextContent('Period')
      expect(columnHeaders[1]).toHaveTextContent('Starting Value')
      expect(columnHeaders[2]).toHaveTextContent('Ending Value')
      expect(columnHeaders[3]).toHaveTextContent('Net Deposits')
      expect(columnHeaders[4]).toHaveTextContent('Earnings')
      expect(columnHeaders[5]).toHaveTextContent('Monthly XIRR')
    })

    it('renders all monthly data rows', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      expect(screen.getByText('Jan 2026')).toBeInTheDocument()
      expect(screen.getByText('Feb 2026')).toBeInTheDocument()
      expect(screen.getByText('Mar 2026')).toBeInTheDocument()
    })

    it('uses showMoreThreshold=12 for monthly data', async () => {
      const user = userEvent.setup()
      // Create 15 months of data to exceed threshold
      const manyMonths: MonthlyPerfRow[] = Array.from({ length: 15 }, (_, i) => ({
        period: `Month ${i + 1}`,
        startingValue: 50000 + i * 1000,
        endingValue: 51000 + i * 1000,
        netDeposits: 500,
        earnings: 500,
        monthlyXirr: 5.0,
      }))

      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ monthlyData: manyMonths })} />,
      )

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      // Should show "Show all 15" button since 15 > 12
      expect(screen.getByText('Show all 15')).toBeInTheDocument()
    })

    it('renders bar chart with monthly data points', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps()} />)

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-points', '3')
    })
  })

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps({ isLoading: true })} />)
      expect(screen.getByTestId('perf-tabs-loading')).toBeInTheDocument()
    })

    it('does not render tabs when loading', () => {
      renderWithProviders(<PlatformDetailPerfTabs {...defaultProps({ isLoading: true })} />)
      expect(screen.queryByRole('tab', { name: 'Yearly' })).not.toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: 'Monthly' })).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when yearly data is empty and yearly tab active', () => {
      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ yearlyData: [] })} />,
      )
      expect(screen.getByText('No performance data available')).toBeInTheDocument()
    })

    it('shows empty message when monthly data is empty and monthly tab active', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ monthlyData: [] })} />,
      )

      await user.click(screen.getByRole('tab', { name: 'Monthly' }))

      expect(screen.getByText('No performance data available')).toBeInTheDocument()
    })
  })

  describe('currency', () => {
    it('formats values in the specified currency', () => {
      renderWithProviders(
        <PlatformDetailPerfTabs {...defaultProps({ currency: 'EUR' })} />,
      )
      // Check that EUR appears in the rendered output
      const cells = document.querySelectorAll('td')
      const hasEur = Array.from(cells).some((cell) => cell.textContent?.includes('EUR'))
      expect(hasEur).toBe(true)
    })
  })
})
