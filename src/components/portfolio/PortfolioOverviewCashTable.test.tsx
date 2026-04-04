import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { PortfolioOverviewCashTable, type CashPlatformRow } from './PortfolioOverviewCashTable'

const mockCashPlatforms: CashPlatformRow[] = [
  {
    id: 'cash-1',
    name: 'Savings Account',
    iconUrl: 'https://example.com/icon1.png',
    currency: 'DKK',
    currentBalance: 150000,
    lastUpdated: '2026-03-15',
  },
  {
    id: 'cash-2',
    name: 'USD Reserve',
    currency: 'USD',
    currentBalance: 5000,
    balanceDkk: 34500,
    lastUpdated: '2026-03-10',
  },
  {
    id: 'cash-3',
    name: 'EUR Buffer',
    iconUrl: 'https://example.com/icon3.png',
    currency: 'EUR',
    currentBalance: 2000,
    balanceDkk: 14900,
    lastUpdated: '2026-02-28',
  },
]

describe('PortfolioOverviewCashTable', () => {
  it('shows section header with "Cash Accounts" and count badge', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    expect(screen.getByText('Cash Accounts')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows count badge of 0 when no cash platforms', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={[]} />,
    )

    expect(screen.getByText('Cash Accounts')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders table with 3 columns: Account, Current Balance, Updated', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Current Balance')).toBeInTheDocument()
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })

  it('does not render XIRR, earnings, or gain/loss columns', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    expect(screen.queryByText('XIRR')).not.toBeInTheDocument()
    expect(screen.queryByText('Earnings')).not.toBeInTheDocument()
    expect(screen.queryByText('Gain/Loss')).not.toBeInTheDocument()
  })

  it('renders account column with icon and name', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    expect(screen.getByText('Savings Account')).toBeInTheDocument()
    expect(screen.getByText('USD Reserve')).toBeInTheDocument()
    expect(screen.getByText('EUR Buffer')).toBeInTheDocument()

    // Platform with image shows img element
    const icon = screen.getByAltText('Savings Account')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('src', 'https://example.com/icon1.png')

    // Platform without image shows initial fallback
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('renders balance with CurrencyDisplay including DKK equivalent for non-DKK', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    // DKK platform — shows DKK amount, no equivalent line
    expect(screen.getByText(/150\.000,00 DKK/)).toBeInTheDocument()

    // USD platform — shows USD amount
    expect(screen.getByText(/5\.000,00 USD/)).toBeInTheDocument()
    // And DKK equivalent
    expect(screen.getByText(/34\.500,00 DKK/)).toBeInTheDocument()

    // EUR platform — shows EUR amount
    expect(screen.getByText(/2\.000,00 EUR/)).toBeInTheDocument()
    // And DKK equivalent
    expect(screen.getByText(/14\.900,00 DKK/)).toBeInTheDocument()
  })

  it('renders formatted dates in Updated column', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    expect(screen.getByText('Mar 15')).toBeInTheDocument()
    expect(screen.getByText('Mar 10')).toBeInTheDocument()
    expect(screen.getByText('Feb 28')).toBeInTheDocument()
  })

  it('calls onRowClick with platform id when row is clicked', async () => {
    const user = userEvent.setup()
    const handleRowClick = vi.fn()

    renderWithProviders(
      <PortfolioOverviewCashTable
        cashPlatforms={mockCashPlatforms}
        onRowClick={handleRowClick}
      />,
    )

    const row = screen.getByText('Savings Account').closest('tr')!
    await user.click(row)

    expect(handleRowClick).toHaveBeenCalledWith('cash-1')
  })

  it('does not crash when onRowClick is not provided', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={mockCashPlatforms} />,
    )

    const row = screen.getByText('Savings Account').closest('tr')!
    await user.click(row)
    // No error thrown
  })

  describe('loading state', () => {
    it('renders skeleton rows when isLoading is true', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewCashTable cashPlatforms={[]} isLoading />,
      )

      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not render table or empty state when loading', () => {
      renderWithProviders(
        <PortfolioOverviewCashTable cashPlatforms={[]} isLoading />,
      )

      expect(screen.queryByText('Account')).not.toBeInTheDocument()
      expect(screen.queryByText('No cash accounts in this portfolio')).not.toBeInTheDocument()
    })

    it('still shows section header when loading', () => {
      renderWithProviders(
        <PortfolioOverviewCashTable cashPlatforms={[]} isLoading />,
      )

      expect(screen.getByText('Cash Accounts')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no cash platforms exist', () => {
      renderWithProviders(
        <PortfolioOverviewCashTable cashPlatforms={[]} />,
      )

      expect(screen.getByText('No cash accounts in this portfolio')).toBeInTheDocument()
    })

    it('does not render the table card when empty', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewCashTable cashPlatforms={[]} />,
      )

      expect(container.querySelector('table')).not.toBeInTheDocument()
    })
  })

  it('renders single cash platform correctly', () => {
    renderWithProviders(
      <PortfolioOverviewCashTable cashPlatforms={[mockCashPlatforms[0]!]} />,
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Savings Account')).toBeInTheDocument()
  })
})
