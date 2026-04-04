import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PortfolioOverviewYoY } from './PortfolioOverviewYoY'

// Fix the date to Apr 4, 2026 for deterministic period labels
const FIXED_NOW = new Date(2026, 3, 4) // Apr 4, 2026

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

const defaultProps = {
  ytdEarnings: 15000,
  prevYtdEarnings: 10000,
  ytdXirr: 8.5,
  prevYtdXirr: 6.2,
  monthEarnings: 3000,
  prevMonthEarnings: 2000,
}

describe('PortfolioOverviewYoY', () => {
  it('renders 3 comparison metrics with correct labels', () => {
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    // Labels appear twice: desktop + mobile layouts
    expect(screen.getAllByText('YTD Earnings').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('YTD XIRR').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Month Earnings').length).toBeGreaterThanOrEqual(1)
  })

  it('renders current and previous values for YTD Earnings', () => {
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    // Current value: 15.000,00 DKK (da-DK formatting)
    expect(screen.getAllByText('15.000,00 DKK').length).toBeGreaterThanOrEqual(1)
    // Previous value: "vs 10.000,00 DKK"
    expect(screen.getAllByText('vs 10.000,00 DKK').length).toBeGreaterThanOrEqual(1)
  })

  it('renders current and previous values for Month Earnings', () => {
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    expect(screen.getAllByText('3.000,00 DKK').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('vs 2.000,00 DKK').length).toBeGreaterThanOrEqual(1)
  })

  it('renders XIRR values as percentages', () => {
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    expect(screen.getAllByText('8,50%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('vs 6,20%').length).toBeGreaterThanOrEqual(1)
  })

  it('computes positive percentage change correctly', () => {
    // YTD Earnings: (15000 - 10000) / 10000 * 100 = 50%
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    // ChangeIndicator renders "+50,00%" for 50% change
    expect(screen.getAllByText('+50,00%').length).toBeGreaterThanOrEqual(1)
  })

  it('computes negative percentage change correctly', () => {
    renderWithProviders(
      <PortfolioOverviewYoY
        {...defaultProps}
        ytdEarnings={8000}
        prevYtdEarnings={10000}
      />,
    )

    // (8000 - 10000) / 10000 * 100 = -20%
    expect(screen.getAllByText('-20,00%').length).toBeGreaterThanOrEqual(1)
  })

  it('handles zero previous value (no division by zero)', () => {
    renderWithProviders(
      <PortfolioOverviewYoY
        {...defaultProps}
        prevYtdEarnings={0}
      />,
    )

    // Should render without crashing, changePercent = 0
    expect(screen.getAllByText('YTD Earnings').length).toBeGreaterThanOrEqual(1)
  })

  it('handles null ytdXirr by showing dash', () => {
    renderWithProviders(
      <PortfolioOverviewYoY
        {...defaultProps}
        ytdXirr={null}
      />,
    )

    // Null XIRR should display as "–"
    expect(screen.getAllByText('–').length).toBeGreaterThanOrEqual(1)
  })

  it('handles null prevYtdXirr by showing dash for previous', () => {
    renderWithProviders(
      <PortfolioOverviewYoY
        {...defaultProps}
        prevYtdXirr={null}
      />,
    )

    // Previous null XIRR should show "vs –"
    expect(screen.getAllByText('vs –').length).toBeGreaterThanOrEqual(1)
  })

  it('handles both XIRR values null', () => {
    renderWithProviders(
      <PortfolioOverviewYoY
        {...defaultProps}
        ytdXirr={null}
        prevYtdXirr={null}
      />,
    )

    // Both should show "–", changePercent should be 0
    const dashes = screen.getAllByText('–')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('computes XIRR change as percentage points difference', () => {
    // ytdXirr=8.5, prevYtdXirr=6.2 → change = 2.3pp
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    // ChangeIndicator will format the raw difference (2.3) as "+2,30%"
    expect(screen.getAllByText('+2,30%').length).toBeGreaterThanOrEqual(1)
  })

  it('renders period label with correct date range', () => {
    renderWithProviders(<PortfolioOverviewYoY {...defaultProps} />)

    // With fixed date Apr 4, 2026:
    // YTD range: Jan 1, 2026 – Apr 4, 2026
    // Prior year: Jan 1, 2025 – Apr 4, 2025
    expect(
      screen.getByText('Jan 1, 2026 – Apr 4, 2026 vs Jan 1, 2025 – Apr 4, 2025'),
    ).toBeInTheDocument()
  })

  it('is always visible (not wrapped in collapsible)', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewYoY {...defaultProps} />,
    )

    // Should not have any collapsible trigger buttons
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    // The component renders directly without disclosure/accordion
    expect(container.firstChild).toBeTruthy()
  })

  describe('loading state', () => {
    it('renders skeleton when isLoading is true', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewYoY {...defaultProps} isLoading />,
      )

      const skeletons = container.querySelectorAll('.skeleton')
      // 1 period label skeleton + 3 * 2 (label + value) = 7
      expect(skeletons.length).toBe(7)
    })

    it('does not render metrics when loading', () => {
      renderWithProviders(
        <PortfolioOverviewYoY {...defaultProps} isLoading />,
      )

      expect(screen.queryByText('YTD Earnings')).not.toBeInTheDocument()
      expect(screen.queryByText('YTD XIRR')).not.toBeInTheDocument()
      expect(screen.queryByText('Month Earnings')).not.toBeInTheDocument()
    })
  })
})
