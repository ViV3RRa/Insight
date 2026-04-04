import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { PlatformDetailHeader, type PlatformDetailHeaderProps } from './PlatformDetailHeader'

const defaultProps: PlatformDetailHeaderProps = {
  platformName: 'Nordnet',
  currency: 'DKK',
  currentValue: 500000,
  monthEarnings: 12300,
  allTimeGainLoss: 75000,
  allTimeGainLossPercent: 17.65,
  allTimeXirr: 12.45,
  ytdGainLoss: 25000,
  ytdGainLossPercent: 8.5,
  ytdXirr: 9.2,
  onBack: vi.fn(),
  lastUpdated: 'Jan 31, 2026',
}

describe('PlatformDetailHeader', () => {
  describe('header elements', () => {
    it('renders back button with aria-label', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByLabelText('Back to portfolio overview')).toBeInTheDocument()
    })

    it('fires onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()
      renderWithProviders(<PlatformDetailHeader {...defaultProps} onBack={onBack} />)
      await user.click(screen.getByLabelText('Back to portfolio overview'))
      expect(onBack).toHaveBeenCalledOnce()
    })

    it('renders platform name as h1', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      const heading = screen.getByRole('heading', { level: 1, name: 'Nordnet' })
      expect(heading).toBeInTheDocument()
    })

    it('renders platform icon with name fallback', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText('N')).toBeInTheDocument()
    })

    it('renders currency badge', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      const badges = screen.getAllByText('DKK').filter(
        (el) => el.tagName === 'SPAN' && el.className.includes('rounded-full'),
      )
      expect(badges.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('staleness indicator', () => {
    it('shows staleness badge when staleness prop is provided', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} staleness="warning" />,
      )
      expect(screen.getByText('Stale')).toBeInTheDocument()
    })

    it('shows critical staleness badge', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} staleness="critical" />,
      )
      expect(screen.getByText('Stale')).toBeInTheDocument()
    })

    it('does not show staleness badge when not provided', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.queryByText('Stale')).not.toBeInTheDocument()
    })
  })

  describe('subtitle', () => {
    it('shows subtitle with currency and lastUpdated', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(
        screen.getByText('Investment · DKK · Updated Jan 31, 2026'),
      ).toBeInTheDocument()
    })

    it('does not show subtitle when lastUpdated is not provided', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} lastUpdated={undefined} />,
      )
      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
    })
  })

  describe('stat cards', () => {
    it('renders all 6 stat card labels', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText('Current Value')).toBeInTheDocument()
      expect(screen.getByText('Month Earnings')).toBeInTheDocument()
      expect(screen.getByText('All-Time Gain/Loss')).toBeInTheDocument()
      expect(screen.getByText('All-Time XIRR')).toBeInTheDocument()
      expect(screen.getByText('YTD Gain/Loss')).toBeInTheDocument()
      expect(screen.getByText('YTD XIRR')).toBeInTheDocument()
    })

    it('renders current value in native currency', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText(/500\.000,00 DKK/)).toBeInTheDocument()
    })

    it('renders month earnings', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText(/12\.300,00 DKK/)).toBeInTheDocument()
    })

    it('renders all-time gain/loss with percentage badge', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText(/75\.000,00 DKK/)).toBeInTheDocument()
      expect(screen.getByText('17,65%')).toBeInTheDocument()
    })

    it('renders all-time XIRR with % suffix', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText('12,45')).toBeInTheDocument()
      // % suffix is rendered as a separate span by StatCard withUnit variant
      const percentSuffixes = screen.getAllByText('%')
      expect(percentSuffixes.length).toBeGreaterThanOrEqual(1)
    })

    it('renders YTD gain/loss with percentage badge', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText(/25\.000,00 DKK/)).toBeInTheDocument()
      expect(screen.getByText('8,50%')).toBeInTheDocument()
    })

    it('renders YTD XIRR', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText('9,20')).toBeInTheDocument()
    })
  })

  describe('non-DKK platform', () => {
    const eurProps: PlatformDetailHeaderProps = {
      ...defaultProps,
      currency: 'EUR',
      currentValueDkk: 3725000,
    }

    it('shows DKK equivalent sublabel on current value', () => {
      renderWithProviders(<PlatformDetailHeader {...eurProps} />)
      expect(screen.getByText(/3\.725\.000,00 DKK/)).toBeInTheDocument()
    })

    it('formats values in native currency', () => {
      renderWithProviders(<PlatformDetailHeader {...eurProps} />)
      expect(screen.getByText(/500\.000,00 EUR/)).toBeInTheDocument()
    })

    it('shows EUR in subtitle', () => {
      renderWithProviders(<PlatformDetailHeader {...eurProps} />)
      expect(
        screen.getByText('Investment · EUR · Updated Jan 31, 2026'),
      ).toBeInTheDocument()
    })
  })

  describe('DKK platform', () => {
    it('does not show DKK sublabel when currency is DKK', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      // The sublabel with "≈" should not appear for DKK platforms
      expect(screen.queryByText(/≈/)).not.toBeInTheDocument()
    })
  })

  describe('null XIRR', () => {
    it('displays en-dash when allTimeXirr is null', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} allTimeXirr={null} />,
      )
      const dashes = screen.getAllByText('–')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })

    it('displays en-dash when ytdXirr is null', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} ytdXirr={null} />,
      )
      const dashes = screen.getAllByText('–')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })

    it('displays en-dash for both when both XIRR values are null', () => {
      renderWithProviders(
        <PlatformDetailHeader {...defaultProps} allTimeXirr={null} ytdXirr={null} />,
      )
      const dashes = screen.getAllByText('–')
      expect(dashes).toHaveLength(2)
    })
  })

  describe('loading state', () => {
    it('renders skeleton elements when loading', () => {
      const { container } = renderWithProviders(
        <PlatformDetailHeader {...defaultProps} isLoading />,
      )
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not render platform name when loading', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} isLoading />)
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('does not render stat card labels when loading', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} isLoading />)
      expect(screen.queryByText('Current Value')).not.toBeInTheDocument()
      expect(screen.queryByText('Month Earnings')).not.toBeInTheDocument()
    })

    it('does not render back button when loading', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} isLoading />)
      expect(
        screen.queryByLabelText('Back to portfolio overview'),
      ).not.toBeInTheDocument()
    })
  })
})
