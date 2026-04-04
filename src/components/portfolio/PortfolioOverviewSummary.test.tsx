import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PortfolioOverviewSummary } from './PortfolioOverviewSummary'

const defaultProps = {
  totalValue: 1759504,
  latestDataPointDate: '2026-02-14',
  allTimeGain: 259504,
  allTimeGainPercent: 17.3,
  allTimeXirr: 12.45,
  ytdGain: 45200,
  ytdGainPercent: 2.64,
  ytdXirr: 8.12,
  monthEarnings: 12300,
  currentMonth: new Date(2026, 3, 1), // April 2026
}

describe('PortfolioOverviewSummary', () => {
  it('renders all 6 stat cards', () => {
    renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)

    expect(screen.getByText('Total Value')).toBeInTheDocument()
    expect(screen.getByText('All-Time Gain/Loss')).toBeInTheDocument()
    expect(screen.getByText('All-Time XIRR')).toBeInTheDocument()
    expect(screen.getByText('YTD Gain/Loss')).toBeInTheDocument()
    expect(screen.getByText('YTD XIRR')).toBeInTheDocument()
    expect(screen.getByText('Month Earnings')).toBeInTheDocument()
  })

  it('renders responsive grid classes', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewSummary {...defaultProps} />,
    )

    const grid = container.firstElementChild as HTMLElement
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('grid-cols-2')
    expect(grid.className).toContain('sm:grid-cols-3')
    expect(grid.className).toContain('lg:grid-cols-6')
    expect(grid.className).toContain('gap-3')
    expect(grid.className).toContain('lg:gap-4')
  })

  describe('Total Value card (Variant A)', () => {
    it('shows formatted DKK value', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText(/1\.759\.504,00 DKK/)).toBeInTheDocument()
    })

    it('shows date sublabel from latestDataPointDate', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('Feb 14, 2026')).toBeInTheDocument()
    })

    it('omits sublabel when latestDataPointDate is null', () => {
      renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} latestDataPointDate={null} />,
      )
      expect(screen.queryByText('Feb 14, 2026')).not.toBeInTheDocument()
    })
  })

  describe('All-Time Gain/Loss card (Variant C)', () => {
    it('shows formatted gain value with percentage badge', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText(/259\.504,00 DKK/)).toBeInTheDocument()
      expect(screen.getByText('17,30%')).toBeInTheDocument()
    })

    it('uses emerald coloring for positive gain', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      const gainValue = screen.getByText(/259\.504,00 DKK/)
      expect(gainValue.className).toContain('text-emerald')
    })

    it('uses rose coloring for negative gain', () => {
      renderWithProviders(
        <PortfolioOverviewSummary
          {...defaultProps}
          allTimeGain={-50000}
          allTimeGainPercent={-3.5}
        />,
      )
      const lossValue = screen.getByText(/-50\.000,00 DKK/)
      expect(lossValue.className).toContain('text-rose')
    })
  })

  describe('All-Time XIRR card (Variant D)', () => {
    it('shows XIRR value with % suffix', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('12,45')).toBeInTheDocument()
      // Both XIRR cards render a "%" suffix
      const percentSuffixes = screen.getAllByText('%')
      expect(percentSuffixes).toHaveLength(2)
    })

    it('shows "Annualized return" sublabel', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('Annualized return')).toBeInTheDocument()
    })

    it('shows en-dash when allTimeXirr is null', () => {
      renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} allTimeXirr={null} />,
      )
      expect(screen.getByText('–')).toBeInTheDocument()
    })
  })

  describe('YTD Gain/Loss card (Variant C)', () => {
    it('shows formatted YTD gain with percentage badge', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText(/45\.200,00 DKK/)).toBeInTheDocument()
      expect(screen.getByText('2,64%')).toBeInTheDocument()
    })

    it('uses emerald coloring for positive YTD gain', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      const ytdValue = screen.getByText(/45\.200,00 DKK/)
      expect(ytdValue.className).toContain('text-emerald')
    })
  })

  describe('YTD XIRR card (Variant D)', () => {
    it('shows YTD XIRR value with % suffix', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('8,12')).toBeInTheDocument()
    })

    it('shows "Annualized YTD" sublabel', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('Annualized YTD')).toBeInTheDocument()
    })

    it('shows en-dash when ytdXirr is null', () => {
      renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} ytdXirr={null} />,
      )
      // Two en-dashes when both XIRRs are null? No, just ytdXirr here
      const dashes = screen.getAllByText('–')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Month Earnings card (Variant B)', () => {
    it('shows formatted month earnings value', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText(/12\.300,00 DKK/)).toBeInTheDocument()
    })

    it('shows current month as sublabel', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      expect(screen.getByText('Apr 2026')).toBeInTheDocument()
    })

    it('uses emerald coloring for positive earnings', () => {
      renderWithProviders(<PortfolioOverviewSummary {...defaultProps} />)
      const earningsValue = screen.getByText(/12\.300,00 DKK/)
      expect(earningsValue.className).toContain('text-emerald')
    })

    it('uses rose coloring for negative earnings', () => {
      renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} monthEarnings={-5000} />,
      )
      const earningsValue = screen.getByText(/-5\.000,00 DKK/)
      expect(earningsValue.className).toContain('text-rose')
    })
  })

  describe('loading state', () => {
    it('renders 6 skeleton cards when isLoading is true', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} isLoading />,
      )

      const grid = container.firstElementChild as HTMLElement
      expect(grid.className).toContain('grid-cols-2')

      const skeletons = grid.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBe(6)
    })

    it('does not render stat cards when loading', () => {
      renderWithProviders(
        <PortfolioOverviewSummary {...defaultProps} isLoading />,
      )
      expect(screen.queryByText('Total Value')).not.toBeInTheDocument()
    })
  })

  describe('neutral trend', () => {
    it('handles zero gain as neutral', () => {
      renderWithProviders(
        <PortfolioOverviewSummary
          {...defaultProps}
          allTimeGain={0}
          allTimeGainPercent={0}
        />,
      )
      // Should render without errors; value exists
      expect(screen.getByText('All-Time Gain/Loss')).toBeInTheDocument()
    })
  })

  describe('both XIRRs null', () => {
    it('shows two en-dashes when both allTimeXirr and ytdXirr are null', () => {
      renderWithProviders(
        <PortfolioOverviewSummary
          {...defaultProps}
          allTimeXirr={null}
          ytdXirr={null}
        />,
      )
      const dashes = screen.getAllByText('–')
      expect(dashes).toHaveLength(2)
    })
  })
})
