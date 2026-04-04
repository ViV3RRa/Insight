import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import {
  PortfolioOverviewPlatformsTable,
  type PlatformRow,
} from './PortfolioOverviewPlatformsTable'

function buildPlatformRow(overrides: Partial<PlatformRow> = {}): PlatformRow {
  return {
    id: 'plat_1',
    name: 'Nordnet',
    currency: 'DKK',
    currentValue: 500000,
    monthEarnings: 12300,
    allTimeGainLoss: 75000,
    allTimeGainLossPercent: 17.65,
    allTimeXirr: 12.45,
    lastUpdated: '2026-03-15',
    ...overrides,
  }
}

const platformA = buildPlatformRow()

const platformB = buildPlatformRow({
  id: 'plat_2',
  name: 'Saxo Bank',
  currency: 'EUR',
  currentValue: 25000,
  currentValueDkk: 186250,
  monthEarnings: -1500,
  allTimeGainLoss: -3200,
  allTimeGainLossPercent: -11.32,
  allTimeXirr: -5.8,
  lastUpdated: '2026-02-28',
  staleness: 'warning',
})

const platformC = buildPlatformRow({
  id: 'plat_3',
  name: 'Lunar',
  currency: 'DKK',
  currentValue: 100000,
  monthEarnings: 0,
  allTimeGainLoss: 0,
  allTimeGainLossPercent: 0,
  allTimeXirr: null,
  lastUpdated: '2026-03-01',
  staleness: 'critical',
})

const allPlatforms = [platformA, platformB, platformC]

const defaultProps = {
  platforms: allPlatforms,
}

describe('PortfolioOverviewPlatformsTable', () => {
  describe('card header', () => {
    it('shows "Investment Platforms" title', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('Investment Platforms')).toBeInTheDocument()
    })

    it('shows count badge matching number of platforms', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows 0 count badge when platforms is empty', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable platforms={[]} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders desktop action buttons', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('+ Add Data Point')).toBeInTheDocument()
      expect(screen.getByText('+ Add Transaction')).toBeInTheDocument()
    })

    it('calls onAddDataPoint when button clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PortfolioOverviewPlatformsTable {...defaultProps} onAddDataPoint={handler} />,
      )
      await user.click(screen.getByText('+ Add Data Point'))
      expect(handler).toHaveBeenCalledOnce()
    })

    it('calls onAddTransaction when button clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PortfolioOverviewPlatformsTable {...defaultProps} onAddTransaction={handler} />,
      )
      await user.click(screen.getByText('+ Add Transaction'))
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('platform rows', () => {
    it('renders platform names', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('Nordnet')).toBeInTheDocument()
      expect(screen.getByText('Saxo Bank')).toBeInTheDocument()
      expect(screen.getByText('Lunar')).toBeInTheDocument()
    })

    it('renders platform icons with name fallback', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      // PlatformIcon renders first letter as fallback when no imageUrl
      expect(screen.getByText('N')).toBeInTheDocument() // Nordnet
      expect(screen.getByText('S')).toBeInTheDocument() // Saxo Bank
      expect(screen.getByText('L')).toBeInTheDocument() // Lunar
    })

    it('renders currency badges', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      // DKK appears in currency badges and in formatted values — check badge elements specifically
      const dkkBadges = screen.getAllByText('DKK').filter(
        (el) => el.tagName === 'SPAN' && el.className.includes('rounded'),
      )
      expect(dkkBadges.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('EUR')).toBeInTheDocument()
    })
  })

  describe('current value', () => {
    it('shows formatted current value', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText(/500\.000,00 DKK/)).toBeInTheDocument()
    })

    it('shows DKK equivalent for non-DKK platforms', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      // CurrencyDisplay shows "25.000,00 EUR" with "≈ 186.250,00 DKK"
      expect(screen.getByText(/25\.000,00 EUR/)).toBeInTheDocument()
      expect(screen.getByText(/186\.250,00 DKK/)).toBeInTheDocument()
    })
  })

  describe('month earnings', () => {
    it('shows positive earnings with emerald coloring', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const earnings = screen.getByText(/12\.300,00 DKK/)
      expect(earnings.className).toContain('text-emerald')
    })

    it('shows negative earnings with rose coloring', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const loss = screen.getByText(/-1\.500,00 DKK/)
      expect(loss.className).toContain('text-rose')
    })
  })

  describe('all-time gain/loss', () => {
    it('shows positive gain with emerald coloring and percentage', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const gain = screen.getByText(/75\.000,00 DKK/)
      expect(gain.className).toContain('text-emerald')
      expect(screen.getByText('17,65%')).toBeInTheDocument()
    })

    it('shows negative loss with rose coloring and percentage', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const loss = screen.getByText(/-3\.200,00 DKK/)
      expect(loss.className).toContain('text-rose')
      expect(screen.getByText('-11,32%')).toBeInTheDocument()
    })
  })

  describe('all-time XIRR', () => {
    it('shows XIRR as formatted percentage', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('12,45%')).toBeInTheDocument()
    })

    it('shows en-dash when XIRR is null', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('–')).toBeInTheDocument()
    })

    it('shows negative XIRR with rose coloring', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const negXirr = screen.getByText('-5,80%')
      expect(negXirr.className).toContain('text-rose')
    })
  })

  describe('updated date', () => {
    it('formats date as "MMM d"', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      expect(screen.getByText('Mar 15')).toBeInTheDocument()
      expect(screen.getByText('Feb 28')).toBeInTheDocument()
      expect(screen.getByText('Mar 1')).toBeInTheDocument()
    })
  })

  describe('staleness indicator', () => {
    it('shows staleness badges when applicable', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable {...defaultProps} />)
      const staleBadges = screen.getAllByText('Stale')
      expect(staleBadges).toHaveLength(2) // platformB (warning) + platformC (critical)
    })

    it('does not show staleness for platforms without it', () => {
      renderWithProviders(
        <PortfolioOverviewPlatformsTable platforms={[platformA]} />,
      )
      expect(screen.queryByText('Stale')).not.toBeInTheDocument()
    })
  })

  describe('row click', () => {
    it('calls onRowClick with platform id when row is clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PortfolioOverviewPlatformsTable {...defaultProps} onRowClick={handler} />,
      )
      await user.click(screen.getByText('Nordnet'))
      expect(handler).toHaveBeenCalledWith('plat_1')
    })
  })

  describe('loading state', () => {
    it('renders skeleton rows when loading', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewPlatformsTable platforms={[]} isLoading />,
      )
      const skeleton = container.querySelector('[aria-hidden="true"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('does not render table rows when loading', () => {
      renderWithProviders(
        <PortfolioOverviewPlatformsTable {...defaultProps} isLoading />,
      )
      expect(screen.queryByText('Nordnet')).not.toBeInTheDocument()
    })

    it('still shows card header when loading', () => {
      renderWithProviders(
        <PortfolioOverviewPlatformsTable {...defaultProps} isLoading />,
      )
      expect(screen.getByText('Investment Platforms')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty state when no platforms', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable platforms={[]} />)
      expect(
        screen.getByText(/No investment platforms yet/),
      ).toBeInTheDocument()
    })

    it('still shows card header when empty', () => {
      renderWithProviders(<PortfolioOverviewPlatformsTable platforms={[]} />)
      expect(screen.getByText('Investment Platforms')).toBeInTheDocument()
    })
  })
})
