import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories/homeFactory'
import { UtilityDetailHeader } from './UtilityDetailHeader'
import type { Utility, UtilityMetrics } from '@/types/home'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function buildMetrics(overrides?: Partial<UtilityMetrics>): UtilityMetrics {
  return {
    monthlyConsumption: [
      { month: '2026-03', year: 2026, consumption: 312, isInterpolated: false },
      { month: '2026-04', year: 2026, consumption: 285, isInterpolated: false },
    ],
    monthlyCost: [
      { month: '2026-03', year: 2026, cost: 976 },
      { month: '2026-04', year: 2026, cost: 892 },
    ],
    monthlyCostPerUnit: [
      { month: '2026-03', year: 2026, costPerUnit: 3.13 },
      { month: '2026-04', year: 2026, costPerUnit: 3.13 },
    ],
    ytdConsumption: 597,
    ytdCost: 1870,
    currentMonthConsumption: 285,
    currentMonthCost: 892,
    currentMonthCostPerUnit: 3.13,
    avgMonthlyCost: 935,
    costTrend: 'down',
    ...overrides,
  }
}

function renderHeader(overrides?: {
  utility?: Utility
  allUtilities?: Utility[]
  metrics?: UtilityMetrics | null
  latestReadingDate?: Date | null
  onSelectUtility?: (id: string) => void
  onAddReading?: () => void
  onAddBill?: () => void
  onEdit?: () => void
}) {
  const utility = overrides?.utility ?? buildUtility({ name: 'Electricity', unit: 'kWh' })
  const allUtilities = overrides?.allUtilities ?? [
    utility,
    buildUtility({ name: 'Water', unit: 'm³', icon: 'droplet', color: 'blue' }),
  ]
  const metrics = overrides?.metrics !== undefined ? overrides.metrics : buildMetrics()
  const latestReadingDate =
    overrides?.latestReadingDate !== undefined
      ? overrides.latestReadingDate
      : new Date('2026-04-04')

  return renderWithProviders(
    <UtilityDetailHeader
      utility={utility}
      allUtilities={allUtilities}
      metrics={metrics}
      latestReadingDate={latestReadingDate}
      onSelectUtility={overrides?.onSelectUtility ?? vi.fn()}
      onAddReading={overrides?.onAddReading ?? vi.fn()}
      onAddBill={overrides?.onAddBill ?? vi.fn()}
      onEdit={overrides?.onEdit ?? vi.fn()}
    />,
  )
}

describe('UtilityDetailHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    mockNavigate.mockReset()
  })

  it('renders utility name in DropdownSwitcher', () => {
    renderHeader()
    expect(screen.getByText('Electricity')).toBeInTheDocument()
  })

  it('renders utility icon', () => {
    renderHeader()
    // UtilityIcon renders a container div with the icon inside
    const iconContainers = document.querySelectorAll('.bg-amber-50')
    expect(iconContainers.length).toBeGreaterThan(0)
  })

  it('shows critical staleness badge when >7 days stale', () => {
    renderHeader({ latestReadingDate: new Date('2026-03-20') })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows warning staleness badge when >2 days stale', () => {
    renderHeader({ latestReadingDate: new Date('2026-04-02') })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('does not show staleness badge when fresh (<=2 days)', () => {
    renderHeader({ latestReadingDate: new Date('2026-04-04') })
    expect(screen.queryByText('Stale')).not.toBeInTheDocument()
  })

  it('shows critical staleness badge when latestReadingDate is null', () => {
    renderHeader({ latestReadingDate: null })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('renders 6 stat cards with correct labels', () => {
    renderHeader()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText('This Month Cost')).toBeInTheDocument()
    expect(screen.getByText('vs Last Month')).toBeInTheDocument()
    expect(screen.getByText('YTD Consumption')).toBeInTheDocument()
    expect(screen.getByText('YTD Cost')).toBeInTheDocument()
    expect(screen.getByText('Cost per Unit')).toBeInTheDocument()
  })

  it('shows current consumption value in "This Month" card', () => {
    renderHeader()
    // formatNumber(285, 0) in da-DK = "285"
    expect(screen.getByText('285')).toBeInTheDocument()
  })

  it('shows colored change percent for "vs Last Month" (green for decrease)', () => {
    renderHeader()
    // (285 - 312) / 312 * 100 = -8.653... -> formatNumber(-8.7, 1) + "%"
    const vsCard = screen.getByText('vs Last Month').closest('div')!
    const valueEl = vsCard.querySelector('.text-emerald-600')
    expect(valueEl).toBeInTheDocument()
  })

  it('shows "prev -> current unit" sublabel for "vs Last Month"', () => {
    renderHeader()
    // "312 → 285 kWh"
    expect(screen.getByText(/312 → 285 kWh/)).toBeInTheDocument()
  })

  it('shows DKK/unit suffix for "Cost per Unit"', () => {
    renderHeader()
    expect(screen.getByText('DKK/kWh')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderHeader()
    expect(screen.getByText('+ Add Reading')).toBeInTheDocument()
    expect(screen.getByText('+ Add Bill')).toBeInTheDocument()
  })

  it('fires onAddReading callback when clicking "+ Add Reading"', () => {
    const onAddReading = vi.fn()
    renderHeader({ onAddReading })
    fireEvent.click(screen.getByText('+ Add Reading'))
    expect(onAddReading).toHaveBeenCalledOnce()
  })

  it('fires onAddBill callback when clicking "+ Add Bill"', () => {
    const onAddBill = vi.fn()
    renderHeader({ onAddBill })
    fireEvent.click(screen.getByText('+ Add Bill'))
    expect(onAddBill).toHaveBeenCalledOnce()
  })

  it('has responsive grid classes on stat cards container', () => {
    renderHeader()
    const grid = screen.getByText('This Month').closest('.grid')
    expect(grid?.className).toContain('grid-cols-2')
    expect(grid?.className).toContain('sm:grid-cols-3')
    expect(grid?.className).toContain('lg:grid-cols-6')
  })

  it('shows dash for null metrics', () => {
    renderHeader({ metrics: null })
    const dashes = screen.getAllByText('\u2014')
    // 5 stat cards show "—" (This Month, This Month Cost, vs Last Month, Cost per Unit have null values;
    // YTD Consumption and YTD Cost also null)
    expect(dashes.length).toBeGreaterThanOrEqual(5)
  })

  it('navigates to /home when back button is clicked', () => {
    renderHeader()
    fireEvent.click(screen.getByTitle('Back to Home'))
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('shows updated date text with formatted date', () => {
    renderHeader({ latestReadingDate: new Date('2026-04-04') })
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
    expect(screen.getByText(/Apr 4/)).toBeInTheDocument()
  })

  it('shows dash for updated text when latestReadingDate is null', () => {
    renderHeader({ latestReadingDate: null })
    // "Updated —"
    expect(screen.getByText(/Updated \u2014/)).toBeInTheDocument()
  })
})
