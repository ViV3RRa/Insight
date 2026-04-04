import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import {
  PlatformDetailPerfChart,
  type EarningsDataPoint,
  type XirrDataPoint,
  type PlatformDetailPerfChartProps,
} from './PlatformDetailPerfChart'
import type { TimeSpan } from '@/utils/timeSpan'

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
  LineChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <div data-testid="line-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Bar: ({ children, dataKey }: { children: ReactNode; dataKey: string }) => (
    <div data-testid="bar" data-key={dataKey}>
      {children}
    </div>
  ),
  Line: ({ dataKey, strokeDasharray }: { dataKey: string; strokeDasharray?: string }) => (
    <div data-testid="line" data-key={dataKey} data-dashed={strokeDasharray ? 'true' : 'false'} />
  ),
  Area: ({ dataKey }: { dataKey: string }) => <div data-testid="area" data-key={dataKey} />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

const sampleEarnings: EarningsDataPoint[] = [
  { month: 'Jan 2026', earnings: 2000 },
  { month: 'Feb 2026', earnings: -1500 },
  { month: 'Mar 2026', earnings: 3000 },
]

const sampleXirr: XirrDataPoint[] = [
  { month: 'Jan 2026', xirr: 5.2 },
  { month: 'Feb 2026', xirr: 3.1 },
  { month: 'Mar 2026', xirr: 7.8 },
]

const sampleYoyEarnings: EarningsDataPoint[] = [
  { month: 'Jan 2025', earnings: 1500 },
  { month: 'Feb 2025', earnings: 1000 },
  { month: 'Mar 2025', earnings: -500 },
]

const sampleYoyXirr: XirrDataPoint[] = [
  { month: 'Jan 2025', xirr: 4.0 },
  { month: 'Feb 2025', xirr: 2.5 },
  { month: 'Mar 2025', xirr: 6.0 },
]

function defaultProps(overrides: Partial<PlatformDetailPerfChartProps> = {}): PlatformDetailPerfChartProps {
  return {
    earningsData: sampleEarnings,
    xirrData: sampleXirr,
    currency: 'DKK',
    timeSpan: 'YTD' as TimeSpan,
    onTimeSpanChange: vi.fn(),
    yoyActive: false,
    onYoYChange: vi.fn(),
    ...overrides,
  }
}

describe('PlatformDetailPerfChart', () => {
  describe('rendering', () => {
    it('renders ChartCard with title "Performance Overview"', () => {
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      expect(screen.getByText('Performance Overview')).toBeInTheDocument()
    })

    it('renders Earnings and XIRR % mode toggle buttons', () => {
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      expect(screen.getByText('Earnings')).toBeInTheDocument()
      expect(screen.getByText('XIRR %')).toBeInTheDocument()
    })
  })

  describe('earnings mode (default)', () => {
    it('renders a BarChart by default', () => {
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    })

    it('passes correct number of data points to BarChart', () => {
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-points', '3')
    })

    it('renders earnings bar with cells for each data point', () => {
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      const bars = screen.getAllByTestId('bar')
      const earningsBar = bars.find((b) => b.getAttribute('data-key') === 'earnings')
      expect(earningsBar).toBeInTheDocument()
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(3)
    })
  })

  describe('XIRR mode', () => {
    it('renders a LineChart when XIRR % mode is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      await user.click(screen.getByText('XIRR %'))
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })

    it('passes correct number of data points to LineChart', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      await user.click(screen.getByText('XIRR %'))
      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', '3')
    })

    it('renders xirr line and area fill', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PlatformDetailPerfChart {...defaultProps()} />)
      await user.click(screen.getByText('XIRR %'))
      const lines = screen.getAllByTestId('line')
      const xirrLine = lines.find((l) => l.getAttribute('data-key') === 'xirr')
      expect(xirrLine).toBeInTheDocument()
      expect(screen.getByTestId('area')).toHaveAttribute('data-key', 'xirr')
    })
  })

  describe('empty state', () => {
    it('shows "No data available" when earnings data is empty', () => {
      renderWithProviders(
        <PlatformDetailPerfChart {...defaultProps({ earningsData: [], xirrData: [] })} />,
      )
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('shows "No data available" when in XIRR mode with empty xirr data', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PlatformDetailPerfChart {...defaultProps({ earningsData: sampleEarnings, xirrData: [] })} />,
      )
      await user.click(screen.getByText('XIRR %'))
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      const { container } = renderWithProviders(
        <PlatformDetailPerfChart {...defaultProps({ isLoading: true })} />,
      )
      const skeleton = container.querySelector('[aria-hidden="true"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('does not render chart card when loading', () => {
      renderWithProviders(
        <PlatformDetailPerfChart {...defaultProps({ isLoading: true })} />,
      )
      expect(screen.queryByText('Performance Overview')).not.toBeInTheDocument()
    })
  })

  describe('YoY overlay — earnings', () => {
    it('renders YoY bars when yoyActive is true and yoyEarningsData provided', () => {
      renderWithProviders(
        <PlatformDetailPerfChart
          {...defaultProps({
            yoyActive: true,
            yoyEarningsData: sampleYoyEarnings,
          })}
        />,
      )
      const bars = screen.getAllByTestId('bar')
      const yoyBar = bars.find((b) => b.getAttribute('data-key') === 'yoyEarnings')
      expect(yoyBar).toBeInTheDocument()
    })

    it('does not render YoY bars when yoyActive is false', () => {
      renderWithProviders(
        <PlatformDetailPerfChart
          {...defaultProps({
            yoyActive: false,
            yoyEarningsData: sampleYoyEarnings,
          })}
        />,
      )
      const bars = screen.getAllByTestId('bar')
      const yoyBar = bars.find((b) => b.getAttribute('data-key') === 'yoyEarnings')
      expect(yoyBar).toBeUndefined()
    })

    it('renders YoY cells with correct count', () => {
      renderWithProviders(
        <PlatformDetailPerfChart
          {...defaultProps({
            yoyActive: true,
            yoyEarningsData: sampleYoyEarnings,
          })}
        />,
      )
      // 3 cells for yoyEarnings + 3 cells for earnings = 6
      const cells = screen.getAllByTestId('cell')
      expect(cells).toHaveLength(6)
    })
  })

  describe('YoY overlay — XIRR', () => {
    it('renders dashed YoY line when yoyActive is true in XIRR mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PlatformDetailPerfChart
          {...defaultProps({
            yoyActive: true,
            yoyXirrData: sampleYoyXirr,
          })}
        />,
      )
      await user.click(screen.getByText('XIRR %'))
      const lines = screen.getAllByTestId('line')
      const yoyLine = lines.find((l) => l.getAttribute('data-key') === 'yoyXirr')
      expect(yoyLine).toBeInTheDocument()
      expect(yoyLine).toHaveAttribute('data-dashed', 'true')
    })

    it('does not render YoY line when yoyActive is false in XIRR mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PlatformDetailPerfChart
          {...defaultProps({
            yoyActive: false,
            yoyXirrData: sampleYoyXirr,
          })}
        />,
      )
      await user.click(screen.getByText('XIRR %'))
      const lines = screen.getAllByTestId('line')
      const yoyLine = lines.find((l) => l.getAttribute('data-key') === 'yoyXirr')
      expect(yoyLine).toBeUndefined()
    })
  })
})
