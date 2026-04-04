import { describe, it, expect, vi, type Mock } from 'vitest'
import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import {
  PortfolioOverviewValueCharts,
  type CompositeDataPoint,
  type PlatformSeries,
  type MonthlyPerformancePoint,
  type PortfolioOverviewValueChartsProps,
} from './PortfolioOverviewValueCharts'
import type { TimeSpan } from '@/utils/timeSpan'

// Mock Recharts — SVG rendering is unreliable in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-points={data.length}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <div data-testid="bar-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey }: { dataKey: string }) => <div data-testid="area" data-key={dataKey} />,
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
}))

const samplePlatforms: PlatformSeries[] = [
  { name: 'Nordnet', color: '#6366f1' },
  { name: 'Saxo', color: '#8b5cf6' },
]

const sampleCompositeData: CompositeDataPoint[] = [
  {
    timestamp: '2026-01-01',
    totalValue: 80000,
    platformValues: { Nordnet: 50000, Saxo: 30000 },
  },
  {
    timestamp: '2026-02-01',
    totalValue: 85000,
    platformValues: { Nordnet: 52000, Saxo: 33000 },
  },
  {
    timestamp: '2026-03-01',
    totalValue: 82000,
    platformValues: { Nordnet: 48000, Saxo: 34000 },
  },
]

const sampleMonthlyPerformance: MonthlyPerformancePoint[] = [
  { month: 'Jan 2026', earnings: 2000, xirr: 5.2 },
  { month: 'Feb 2026', earnings: -1500, xirr: -3.1 },
  { month: 'Mar 2026', earnings: 3000, xirr: 7.8 },
]

const sampleYoYPerformance: MonthlyPerformancePoint[] = [
  { month: 'Jan 2025', earnings: 1500, xirr: 4.0 },
  { month: 'Feb 2025', earnings: 1000, xirr: 2.5 },
  { month: 'Mar 2025', earnings: -500, xirr: -1.2 },
]

function defaultProps(overrides: Partial<PortfolioOverviewValueChartsProps> = {}): PortfolioOverviewValueChartsProps {
  return {
    compositeData: sampleCompositeData,
    platforms: samplePlatforms,
    monthlyPerformance: sampleMonthlyPerformance,
    timeSpan: 'YTD' as TimeSpan,
    onTimeSpanChange: vi.fn(),
    yoyActive: false,
    onYoYChange: vi.fn(),
    ...overrides,
  }
}

describe('PortfolioOverviewValueCharts', () => {
  describe('layout', () => {
    it('renders two chart cards in a responsive grid', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const grid = container.firstElementChild as HTMLElement
      expect(grid.className).toContain('grid')
      expect(grid.className).toContain('grid-cols-1')
      expect(grid.className).toContain('lg:grid-cols-2')
      expect(grid.className).toContain('gap-4')
      expect(grid.className).toContain('lg:gap-6')
    })

    it('renders "Portfolio Value" chart card', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument()
    })

    it('renders "Monthly Performance" chart card', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      expect(screen.getByText('Monthly Performance')).toBeInTheDocument()
    })
  })

  describe('Chart A — Stacked Area Chart', () => {
    it('renders a ResponsiveContainer and AreaChart', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const containers = screen.getAllByTestId('responsive-container')
      expect(containers.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('renders an Area element for each platform', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const areas = screen.getAllByTestId('area')
      expect(areas).toHaveLength(2)
      expect(areas[0]).toHaveAttribute('data-key', 'Nordnet')
      expect(areas[1]).toHaveAttribute('data-key', 'Saxo')
    })

    it('passes correct number of data points to AreaChart', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const areaChart = screen.getByTestId('area-chart')
      expect(areaChart).toHaveAttribute('data-points', '3')
    })
  })

  describe('Chart B — Performance Bar Chart', () => {
    it('renders a BarChart', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('defaults to earnings mode with a value bar', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const bars = screen.getAllByTestId('bar')
      const valueBar = bars.find((b) => b.getAttribute('data-key') === 'value')
      expect(valueBar).toBeInTheDocument()
    })

    it('renders cells for each data point', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      const cells = screen.getAllByTestId('cell')
      // 3 data points for the value bar
      expect(cells.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('mode toggle', () => {
    it('renders Earnings and XIRR mode buttons', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      expect(screen.getByText('Earnings')).toBeInTheDocument()
      expect(screen.getByText('XIRR')).toBeInTheDocument()
    })

    it('switches to XIRR mode when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      await user.click(screen.getByText('XIRR'))
      // The bar chart should still render (mode just changes displayed data)
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  describe('YoY overlay', () => {
    it('does not render YoY bars when yoyActive is false', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts
          {...defaultProps({
            yoyActive: false,
            yoyMonthlyPerformance: sampleYoYPerformance,
          })}
        />,
      )
      const bars = screen.getAllByTestId('bar')
      const yoyBar = bars.find((b) => b.getAttribute('data-key') === 'yoyValue')
      expect(yoyBar).toBeUndefined()
    })

    it('renders YoY bars when yoyActive is true and data is provided', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts
          {...defaultProps({
            yoyActive: true,
            yoyMonthlyPerformance: sampleYoYPerformance,
          })}
        />,
      )
      const bars = screen.getAllByTestId('bar')
      const yoyBar = bars.find((b) => b.getAttribute('data-key') === 'yoyValue')
      expect(yoyBar).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('renders skeleton charts when loading', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps({ isLoading: true })} />,
      )
      // SkeletonChart renders aria-hidden divs
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBe(2)
    })

    it('does not render chart cards when loading', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps({ isLoading: true })} />,
      )
      expect(screen.queryByText('Portfolio Value')).not.toBeInTheDocument()
      expect(screen.queryByText('Monthly Performance')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows "No data available" for area chart when compositeData is empty', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts
          {...defaultProps({ compositeData: [] })}
        />,
      )
      const noDataElements = screen.getAllByText('No data available')
      expect(noDataElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "No data available" for bar chart when monthlyPerformance is empty', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts
          {...defaultProps({ monthlyPerformance: [] })}
        />,
      )
      const noDataElements = screen.getAllByText('No data available')
      expect(noDataElements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows both empty messages when all data is empty', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts
          {...defaultProps({ compositeData: [], monthlyPerformance: [] })}
        />,
      )
      const noDataElements = screen.getAllByText('No data available')
      expect(noDataElements).toHaveLength(2)
    })
  })

  describe('prop callbacks', () => {
    it('does not render time span or YoY controls inside chart cards (hideTimeSpan/hideYoY)', () => {
      renderWithProviders(
        <PortfolioOverviewValueCharts {...defaultProps()} />,
      )
      // The chart cards have hideTimeSpan and hideYoY set, so no time span selector or YoY toggle
      // should render inside them. These controls are managed at the parent level.
      // Verifying no YoY toggle text appears (YoY toggle renders "YoY" text)
      expect(screen.queryByText('YoY')).not.toBeInTheDocument()
    })
  })
})
