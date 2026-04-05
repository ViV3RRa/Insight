import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/utils'
import { buildUtility, buildMeterReading } from '@/test/factories'
import { HomeOverview } from './HomeOverview'

// Mock services
vi.mock('@/services/utilities', () => ({
  getAll: vi.fn(),
}))
vi.mock('@/services/meterReadings', () => ({
  getByUtility: vi.fn(),
}))
vi.mock('@/services/utilityBills', () => ({
  getByUtility: vi.fn(),
}))

// Mock child components to isolate page assembly tests
vi.mock('@/components/home/UtilitySummaryCards', () => ({
  UtilitySummaryCards: () => (
    <div data-testid="utility-summary-cards">UtilitySummaryCards</div>
  ),
}))
vi.mock('@/components/home/HomeOverviewYoYRow', () => ({
  HomeOverviewYoYRow: () => (
    <div data-testid="home-overview-yoy-row">HomeOverviewYoYRow</div>
  ),
}))
vi.mock('@/components/home/HomeOverviewChart', () => ({
  HomeOverviewChart: () => (
    <div data-testid="home-overview-chart">HomeOverviewChart</div>
  ),
}))
vi.mock('@/components/home/AddUtilityLink', () => ({
  AddUtilityLink: ({ onAdd }: { onAdd: () => void }) => (
    <button data-testid="add-utility-link" onClick={onAdd}>
      Add Utility
    </button>
  ),
}))
vi.mock('@/components/home/HomeQuickActions', () => ({
  HomeQuickActionsDesktop: ({
    onAddReading,
    onAddBill,
  }: {
    onAddReading: () => void
    onAddBill: () => void
  }) => (
    <div data-testid="quick-actions-desktop">
      <button onClick={onAddReading}>+ Add Reading</button>
      <button onClick={onAddBill}>+ Add Bill</button>
    </div>
  ),
  HomeQuickActionsMobile: ({
    onAddReading,
    onAddBill,
  }: {
    onAddReading: () => void
    onAddBill: () => void
  }) => (
    <div data-testid="quick-actions-mobile">
      <button onClick={onAddReading}>+ Add Reading</button>
      <button onClick={onAddBill}>+ Add Bill</button>
    </div>
  ),
}))

import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'

const electricity = buildUtility({ name: 'Electricity', unit: 'kWh' })
const water = buildUtility({ name: 'Water', unit: 'm³' })

function mockServicesWithUtilities(utilities: ReturnType<typeof buildUtility>[]) {
  vi.mocked(utilityService.getAll).mockResolvedValue(utilities)
  vi.mocked(meterReadingService.getByUtility).mockResolvedValue([])
  vi.mocked(utilityBillService.getByUtility).mockResolvedValue([])
}

describe('HomeOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Home" heading', async () => {
    mockServicesWithUtilities([electricity, water])

    renderWithProviders(<HomeOverview />)

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('shows subtitle with utility count', async () => {
    mockServicesWithUtilities([electricity, water])

    renderWithProviders(<HomeOverview />)

    expect(await screen.findByText(/2 utilities tracked/)).toBeInTheDocument()
  })

  it('renders summary cards section', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('summary-cards-section')).toBeInTheDocument()
    })
  })

  it('renders YoY section', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('yoy-section')).toBeInTheDocument()
    })
  })

  it('renders chart section', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('chart-section')).toBeInTheDocument()
    })
  })

  it('renders add utility link section', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    await waitFor(() => {
      expect(screen.getByTestId('add-utility-section')).toBeInTheDocument()
    })
  })

  it('shows loading state while data is fetching', () => {
    // Never resolve — keeps loading state
    vi.mocked(utilityService.getAll).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<HomeOverview />)

    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument()
    // Loading skeleton has animate-pulse
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders empty grid when no utilities', async () => {
    mockServicesWithUtilities([])

    renderWithProviders(<HomeOverview />)

    expect(await screen.findByText(/0 utilities tracked/)).toBeInTheDocument()
  })

  it('page uses max-w-[1440px] container', async () => {
    mockServicesWithUtilities([electricity])

    const { container } = renderWithProviders(<HomeOverview />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
    })

    const pageContainer = container.querySelector('.max-w-\\[1440px\\]')
    expect(pageContainer).toBeInTheDocument()
  })

  it('"+ Add Reading" button is present', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    const buttons = await screen.findAllByRole('button', { name: '+ Add Reading' })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('"+ Add Bill" button is present', async () => {
    mockServicesWithUtilities([electricity])

    renderWithProviders(<HomeOverview />)

    const buttons = await screen.findAllByRole('button', { name: '+ Add Bill' })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows updated date in subtitle when readings exist', async () => {
    const reading = buildMeterReading({
      utilityId: electricity.id,
      timestamp: '2026-03-15T10:00:00.000Z',
    })

    vi.mocked(utilityService.getAll).mockResolvedValue([electricity])
    vi.mocked(meterReadingService.getByUtility).mockResolvedValue([reading])
    vi.mocked(utilityBillService.getByUtility).mockResolvedValue([])

    renderWithProviders(<HomeOverview />)

    expect(await screen.findByText(/Updated Mar 15/)).toBeInTheDocument()
  })
})
