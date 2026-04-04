import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { PortfolioOverview, type PortfolioOverviewProps } from './PortfolioOverview'

// Mock all child components to keep tests focused on page assembly
vi.mock('./PortfolioSwitcher', () => ({
  PortfolioSwitcher: () => <div data-testid="mock-portfolio-switcher">Switcher</div>,
}))

vi.mock('./PortfolioOverviewSummary', () => ({
  PortfolioOverviewSummary: (props: Record<string, unknown>) => (
    <div data-testid="mock-summary" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewYoY', () => ({
  PortfolioOverviewYoY: (props: Record<string, unknown>) => (
    <div data-testid="mock-yoy" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewPerformanceAccordion', () => ({
  PortfolioOverviewPerformanceAccordion: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-performance-accordion">{children}</div>
  ),
}))

vi.mock('./PortfolioOverviewValueCharts', () => ({
  PortfolioOverviewValueCharts: (props: Record<string, unknown>) => (
    <div data-testid="mock-value-charts" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewPerfYearly', () => ({
  PortfolioOverviewPerfYearly: (props: Record<string, unknown>) => (
    <div data-testid="mock-perf-yearly" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewPerfMonthly', () => ({
  PortfolioOverviewPerfMonthly: (props: Record<string, unknown>) => (
    <div data-testid="mock-perf-monthly" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewPlatformsTable', () => ({
  PortfolioOverviewPlatformsTable: (props: Record<string, unknown>) => (
    <div data-testid="mock-platforms-table" data-loading={String(props.isLoading)}>
      <button data-testid="platform-row-click" onClick={() => (props.onRowClick as (id: string) => void)?.('plat_1')}>
        Click Platform
      </button>
      <button data-testid="platform-add-dp" onClick={() => (props.onAddDataPoint as () => void)?.()}>
        Add DP
      </button>
      <button data-testid="platform-add-tx" onClick={() => (props.onAddTransaction as () => void)?.()}>
        Add TX
      </button>
    </div>
  ),
}))

vi.mock('./PortfolioOverviewCashTable', () => ({
  PortfolioOverviewCashTable: (props: Record<string, unknown>) => (
    <div data-testid="mock-cash-table" data-loading={String(props.isLoading)}>
      <button data-testid="cash-row-click" onClick={() => (props.onRowClick as (id: string) => void)?.('cash_1')}>
        Click Cash
      </button>
    </div>
  ),
}))

vi.mock('./PortfolioOverviewClosed', () => ({
  PortfolioOverviewClosed: (props: Record<string, unknown>) => (
    <div data-testid="mock-closed" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('./PortfolioOverviewAllocation', () => ({
  PortfolioOverviewAllocation: (props: Record<string, unknown>) => (
    <div data-testid="mock-allocation" data-loading={String(props.isLoading)} />
  ),
}))

vi.mock('@/components/shared/Button', () => ({
  Button: ({ children, onClick, ...rest }: Record<string, unknown>) => (
    <button onClick={onClick as () => void} data-fullwidth={String(rest.fullWidth)}>
      {children as React.ReactNode}
    </button>
  ),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function buildDefaultProps(overrides: Partial<PortfolioOverviewProps> = {}): PortfolioOverviewProps {
  return {
    summaryData: {
      totalValue: 750000,
      latestDataPointDate: '2026-03-15',
      allTimeGain: 125000,
      allTimeGainPercent: 20,
      allTimeXirr: 12.5,
      ytdGain: 30000,
      ytdGainPercent: 4.2,
      ytdXirr: 8.1,
      monthEarnings: 5000,
      currentMonth: new Date(2026, 2, 1),
    },
    yoyData: {
      ytdEarnings: 30000,
      prevYtdEarnings: 25000,
      ytdXirr: 8.1,
      prevYtdXirr: 7.5,
      monthEarnings: 5000,
      prevMonthEarnings: 4200,
    },
    chartsData: {
      compositeData: [],
      platforms: [],
      monthlyPerformance: [],
    },
    yearlyData: {
      yearlyData: [],
      totals: {
        startingValue: 600000,
        endingValue: 750000,
        netDeposits: 25000,
        earnings: 125000,
        earningsPercent: 20,
        xirr: 12.5,
      },
    },
    monthlyTableData: [],
    investmentPlatforms: [],
    cashPlatforms: [],
    closedPlatforms: [],
    allocationSegments: [],
    platformCountSummary: '5 platforms across 3 currencies',
    ...overrides,
  }
}

describe('PortfolioOverview', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('section rendering', () => {
    it('renders all sections with correct data-testid attributes', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      expect(screen.getByTestId('section-header')).toBeInTheDocument()
      expect(screen.getByTestId('section-mobile-actions')).toBeInTheDocument()
      expect(screen.getByTestId('section-summary-cards')).toBeInTheDocument()
      expect(screen.getByTestId('section-yoy')).toBeInTheDocument()
      expect(screen.getByTestId('section-performance')).toBeInTheDocument()
      expect(screen.getByTestId('section-platforms')).toBeInTheDocument()
      expect(screen.getByTestId('section-cash')).toBeInTheDocument()
      expect(screen.getByTestId('section-closed')).toBeInTheDocument()
      expect(screen.getByTestId('section-allocation')).toBeInTheDocument()
      expect(screen.getByTestId('add-platform-button')).toBeInTheDocument()
    })

    it('renders sections in the correct DOM order', () => {
      const { container } = renderWithProviders(
        <PortfolioOverview {...buildDefaultProps()} />,
      )

      const sections = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(sections).map((el) => el.getAttribute('data-testid'))

      const expectedOrder = [
        'section-header',
        'section-mobile-actions',
        'section-summary-cards',
        'mock-summary',
        'section-yoy',
        'mock-yoy',
        'section-performance',
        'mock-performance-accordion',
        'mock-value-charts',
        'mock-perf-yearly',
        'mock-perf-monthly',
        'section-platforms',
        'mock-platforms-table',
        'platform-row-click',
        'platform-add-dp',
        'platform-add-tx',
        'section-cash',
        'mock-cash-table',
        'cash-row-click',
        'section-closed',
        'mock-closed',
        'section-allocation',
        'mock-allocation',
        'add-platform-button',
      ]

      // Verify relative order of key section wrappers
      const keySections = [
        'section-summary-cards',
        'section-yoy',
        'section-performance',
        'section-platforms',
        'section-cash',
        'section-closed',
        'section-allocation',
        'add-platform-button',
      ]

      const indices = keySections.map((id) => testIds.indexOf(id))
      for (let i = 1; i < indices.length; i++) {
        expect(indices[i]).toBeGreaterThan(indices[i - 1])
      }
    })

    it('renders child components inside their section wrappers', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const summarySection = screen.getByTestId('section-summary-cards')
      expect(summarySection.querySelector('[data-testid="mock-summary"]')).toBeInTheDocument()

      const yoySection = screen.getByTestId('section-yoy')
      expect(yoySection.querySelector('[data-testid="mock-yoy"]')).toBeInTheDocument()

      const perfSection = screen.getByTestId('section-performance')
      expect(perfSection.querySelector('[data-testid="mock-performance-accordion"]')).toBeInTheDocument()
      expect(perfSection.querySelector('[data-testid="mock-value-charts"]')).toBeInTheDocument()
      expect(perfSection.querySelector('[data-testid="mock-perf-yearly"]')).toBeInTheDocument()
      expect(perfSection.querySelector('[data-testid="mock-perf-monthly"]')).toBeInTheDocument()

      const platformsSection = screen.getByTestId('section-platforms')
      expect(platformsSection.querySelector('[data-testid="mock-platforms-table"]')).toBeInTheDocument()

      const cashSection = screen.getByTestId('section-cash')
      expect(cashSection.querySelector('[data-testid="mock-cash-table"]')).toBeInTheDocument()

      const closedSection = screen.getByTestId('section-closed')
      expect(closedSection.querySelector('[data-testid="mock-closed"]')).toBeInTheDocument()

      const allocationSection = screen.getByTestId('section-allocation')
      expect(allocationSection.querySelector('[data-testid="mock-allocation"]')).toBeInTheDocument()
    })
  })

  describe('desktop header', () => {
    it('shows "Investment Portfolio" heading', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      expect(screen.getByRole('heading', { level: 1, name: 'Investment Portfolio' })).toBeInTheDocument()
    })

    it('renders PortfolioSwitcher in the header', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const header = screen.getByTestId('section-header')
      expect(header.querySelector('[data-testid="mock-portfolio-switcher"]')).toBeInTheDocument()
    })

    it('shows platform count summary', () => {
      renderWithProviders(
        <PortfolioOverview
          {...buildDefaultProps({ platformCountSummary: '5 platforms across 3 currencies' })}
        />,
      )

      expect(screen.getByText('5 platforms across 3 currencies')).toBeInTheDocument()
    })

    it('does not render platform count summary when not provided', () => {
      renderWithProviders(
        <PortfolioOverview {...buildDefaultProps({ platformCountSummary: undefined })} />,
      )

      const header = screen.getByTestId('section-header')
      expect(header.querySelector('p')).not.toBeInTheDocument()
    })
  })

  describe('mobile action buttons', () => {
    it('renders "+ Add Data Point" button', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      expect(screen.getByText('+ Add Data Point')).toBeInTheDocument()
    })

    it('renders "+ Add Transaction" button', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      expect(screen.getByText('+ Add Transaction')).toBeInTheDocument()
    })

    it('mobile action buttons use fullWidth', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const addDpButton = screen.getByText('+ Add Data Point')
      expect(addDpButton).toHaveAttribute('data-fullwidth', 'true')

      const addTxButton = screen.getByText('+ Add Transaction')
      expect(addTxButton).toHaveAttribute('data-fullwidth', 'true')
    })

    it('clicking "+ Add Data Point" opens data point dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByText('+ Add Data Point'))

      expect(screen.getByTestId('data-point-dialog')).toBeInTheDocument()
    })

    it('clicking "+ Add Transaction" opens transaction dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByText('+ Add Transaction'))

      expect(screen.getByTestId('transaction-dialog')).toBeInTheDocument()
    })
  })

  describe('add platform button', () => {
    it('renders at the bottom of the page', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const button = screen.getByTestId('add-platform-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Add Platform')
    })

    it('clicking opens platform dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByTestId('add-platform-button'))

      expect(screen.getByTestId('platform-dialog')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('propagates isLoading to all child components', () => {
      renderWithProviders(
        <PortfolioOverview {...buildDefaultProps({ isLoading: true })} />,
      )

      expect(screen.getByTestId('mock-summary')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-yoy')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-value-charts')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-perf-yearly')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-perf-monthly')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-platforms-table')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-cash-table')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-closed')).toHaveAttribute('data-loading', 'true')
      expect(screen.getByTestId('mock-allocation')).toHaveAttribute('data-loading', 'true')
    })

    it('does not set loading on children when isLoading is false', () => {
      renderWithProviders(
        <PortfolioOverview {...buildDefaultProps({ isLoading: false })} />,
      )

      expect(screen.getByTestId('mock-summary')).toHaveAttribute('data-loading', 'false')
      expect(screen.getByTestId('mock-platforms-table')).toHaveAttribute('data-loading', 'false')
    })
  })

  describe('navigation', () => {
    it('navigates to platform detail on platform row click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByTestId('platform-row-click'))

      expect(mockNavigate).toHaveBeenCalledWith('/investment/platform/plat_1')
    })

    it('navigates to cash detail on cash row click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByTestId('cash-row-click'))

      expect(mockNavigate).toHaveBeenCalledWith('/investment/cash/cash_1')
    })
  })

  describe('platforms table action buttons', () => {
    it('opens data point dialog via platforms table header button', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByTestId('platform-add-dp'))

      expect(screen.getByTestId('data-point-dialog')).toBeInTheDocument()
    })

    it('opens transaction dialog via platforms table header button', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      await user.click(screen.getByTestId('platform-add-tx'))

      expect(screen.getByTestId('transaction-dialog')).toBeInTheDocument()
    })
  })

  describe('page layout', () => {
    it('has correct container classes', () => {
      const { container } = renderWithProviders(
        <PortfolioOverview {...buildDefaultProps()} />,
      )

      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('max-w-[1440px]')
      expect(wrapper.className).toContain('mx-auto')
      expect(wrapper.className).toContain('px-3')
      expect(wrapper.className).toContain('lg:px-8')
      expect(wrapper.className).toContain('py-6')
      expect(wrapper.className).toContain('lg:py-10')
      expect(wrapper.className).toContain('pb-24')
      expect(wrapper.className).toContain('lg:pb-10')
    })

    it('section wrappers have correct spacing classes', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      expect(screen.getByTestId('section-yoy').className).toContain('mt-6')
      expect(screen.getByTestId('section-yoy').className).toContain('lg:mt-8')
      expect(screen.getByTestId('section-performance').className).toContain('mt-6')
      expect(screen.getByTestId('section-platforms').className).toContain('mt-6')
      expect(screen.getByTestId('section-cash').className).toContain('mt-6')
      expect(screen.getByTestId('section-closed').className).toContain('mt-6')
      expect(screen.getByTestId('section-allocation').className).toContain('mt-6')
    })

    it('desktop header is hidden on mobile (has hidden lg:flex)', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const header = screen.getByTestId('section-header')
      expect(header.className).toContain('hidden')
      expect(header.className).toContain('lg:flex')
    })

    it('mobile actions are hidden on desktop (has lg:hidden)', () => {
      renderWithProviders(<PortfolioOverview {...buildDefaultProps()} />)

      const mobileActions = screen.getByTestId('section-mobile-actions')
      expect(mobileActions.className).toContain('lg:hidden')
    })
  })
})
