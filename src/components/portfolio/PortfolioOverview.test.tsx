import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { PortfolioOverview } from './PortfolioOverview'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'

// Mock services
vi.mock('@/services/platforms', () => ({
  getByPortfolio: vi.fn().mockResolvedValue([]),
  getPlatformIconUrl: vi.fn().mockReturnValue('/icons/test.png'),
  create: vi.fn(),
}))

vi.mock('@/services/portfolios', () => ({
  getAll: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/services/dataPoints', () => ({
  getByPlatform: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
}))

vi.mock('@/services/transactions', () => ({
  getByPlatform: vi.fn().mockResolvedValue([]),
  create: vi.fn(),
}))

// Mock dialog components
vi.mock('./dialogs/PortfolioDialog', () => ({
  PortfolioDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="portfolio-dialog" /> : null,
}))
vi.mock('./dialogs/PlatformDialog', () => ({
  PlatformDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="platform-dialog" /> : null,
}))
vi.mock('./dialogs/DataPointDialog', () => ({
  DataPointDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="data-point-dialog" /> : null,
}))
vi.mock('./dialogs/TransactionDialog', () => ({
  TransactionDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="transaction-dialog" /> : null,
}))

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

describe('PortfolioOverview', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    // Set a selected portfolio so the query runs
    useInvestmentUIStore.setState({ selectedPortfolioId: 'port_1' as never })
  })

  describe('section rendering', () => {
    it('renders all sections with correct data-testid attributes', () => {
      renderWithProviders(<PortfolioOverview />)

      expect(screen.getByTestId('section-header')).toBeInTheDocument()
      expect(screen.getByTestId('section-mobile-switcher')).toBeInTheDocument()
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
      const { container } = renderWithProviders(<PortfolioOverview />)

      const sections = container.querySelectorAll('[data-testid]')
      const testIds = Array.from(sections).map((el) => el.getAttribute('data-testid'))

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
        expect(indices[i]!).toBeGreaterThan(indices[i - 1]!)
      }
    })

    it('renders child components inside their section wrappers', () => {
      renderWithProviders(<PortfolioOverview />)

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
      renderWithProviders(<PortfolioOverview />)

      expect(screen.getByRole('heading', { level: 1, name: 'Investment Portfolio' })).toBeInTheDocument()
    })

    it('renders PortfolioSwitcher in the header', () => {
      renderWithProviders(<PortfolioOverview />)

      const header = screen.getByTestId('section-header')
      expect(header.querySelector('[data-testid="mock-portfolio-switcher"]')).toBeInTheDocument()
    })
  })

  describe('mobile action buttons', () => {
    it('renders action buttons', () => {
      renderWithProviders(<PortfolioOverview />)

      expect(screen.getByText('+ Add Data Point')).toBeInTheDocument()
      expect(screen.getByText('+ Add Transaction')).toBeInTheDocument()
    })

    it('mobile action buttons use fullWidth', () => {
      renderWithProviders(<PortfolioOverview />)

      expect(screen.getByText('+ Add Data Point')).toHaveAttribute('data-fullwidth', 'true')
      expect(screen.getByText('+ Add Transaction')).toHaveAttribute('data-fullwidth', 'true')
    })

    it('clicking "+ Add Data Point" opens data point dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByText('+ Add Data Point'))

      expect(screen.getByTestId('data-point-dialog')).toBeInTheDocument()
    })

    it('clicking "+ Add Transaction" opens transaction dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByText('+ Add Transaction'))

      expect(screen.getByTestId('transaction-dialog')).toBeInTheDocument()
    })
  })

  describe('add platform button', () => {
    it('renders at the bottom of the page', () => {
      renderWithProviders(<PortfolioOverview />)

      const button = screen.getByTestId('add-platform-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Add Platform')
    })

    it('clicking opens platform dialog', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByTestId('add-platform-button'))

      expect(screen.getByTestId('platform-dialog')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('navigates to platform detail on platform row click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByTestId('platform-row-click'))

      expect(mockNavigate).toHaveBeenCalledWith('/investment/platform/plat_1')
    })

    it('navigates to cash detail on cash row click', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByTestId('cash-row-click'))

      expect(mockNavigate).toHaveBeenCalledWith('/investment/cash/cash_1')
    })
  })

  describe('platforms table action buttons', () => {
    it('opens data point dialog via platforms table header button', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByTestId('platform-add-dp'))

      expect(screen.getByTestId('data-point-dialog')).toBeInTheDocument()
    })

    it('opens transaction dialog via platforms table header button', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PortfolioOverview />)

      await user.click(screen.getByTestId('platform-add-tx'))

      expect(screen.getByTestId('transaction-dialog')).toBeInTheDocument()
    })
  })

  describe('page layout', () => {
    it('has correct container classes', () => {
      const { container } = renderWithProviders(<PortfolioOverview />)

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
      renderWithProviders(<PortfolioOverview />)

      expect(screen.getByTestId('section-yoy').className).toContain('mt-6')
      expect(screen.getByTestId('section-yoy').className).toContain('lg:mt-8')
      expect(screen.getByTestId('section-performance').className).toContain('mt-6')
      expect(screen.getByTestId('section-platforms').className).toContain('mt-6')
      expect(screen.getByTestId('section-cash').className).toContain('mt-6')
      expect(screen.getByTestId('section-closed').className).toContain('mt-6')
      expect(screen.getByTestId('section-allocation').className).toContain('mt-6')
    })

    it('desktop header is hidden on mobile (has hidden lg:flex)', () => {
      renderWithProviders(<PortfolioOverview />)

      const header = screen.getByTestId('section-header')
      expect(header.className).toContain('hidden')
      expect(header.className).toContain('lg:flex')
    })

    it('mobile actions are hidden on desktop (has lg:hidden)', () => {
      renderWithProviders(<PortfolioOverview />)

      const mobileActions = screen.getByTestId('section-mobile-actions')
      expect(mobileActions.className).toContain('lg:hidden')
    })

    it('mobile switcher is hidden on desktop (has lg:hidden)', () => {
      renderWithProviders(<PortfolioOverview />)

      const mobileSwitcher = screen.getByTestId('section-mobile-switcher')
      expect(mobileSwitcher.className).toContain('lg:hidden')
    })

    it('mobile switcher renders PortfolioSwitcher', () => {
      renderWithProviders(<PortfolioOverview />)

      const mobileSwitcher = screen.getByTestId('section-mobile-switcher')
      expect(mobileSwitcher.querySelector('[data-testid="mock-portfolio-switcher"]')).toBeInTheDocument()
    })

    it('container has relative z-0 for stacking below navbar', () => {
      const { container } = renderWithProviders(<PortfolioOverview />)

      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('relative')
      expect(wrapper.className).toContain('z-0')
    })
  })
})
