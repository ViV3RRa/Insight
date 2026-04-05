import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders, screen, waitFor, userEvent } from '@/test/utils'
import { buildUtility, buildMeterReading, buildUtilityBill } from '@/test/factories'
import { UtilityDetail } from './UtilityDetail'

// Mock services
vi.mock('@/services/utilities', () => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
}))
vi.mock('@/services/meterReadings', () => ({
  getByUtility: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@/services/utilityBills', () => ({
  getByUtility: vi.fn(),
  remove: vi.fn(),
}))

// Mock sub-components to isolate page assembly
vi.mock('@/components/home/UtilityDetailHeader', () => ({
  UtilityDetailHeader: (props: Record<string, unknown>) => (
    <div data-testid="utility-detail-header">
      <span data-testid="utility-name">{(props.utility as { name: string })?.name}</span>
      <button onClick={props.onAddReading as () => void}>+ Add Reading</button>
      <button onClick={props.onAddBill as () => void}>+ Add Bill</button>
    </div>
  ),
}))
vi.mock('@/components/home/UtilityDetailChart', () => ({
  UtilityDetailChart: () => <div data-testid="utility-detail-chart">Chart</div>,
}))
vi.mock('@/components/home/UtilityYearlyTable', () => ({
  UtilityYearlyTable: () => <div data-testid="utility-yearly-table">Yearly</div>,
}))
vi.mock('@/components/home/UtilityReadingsTable', () => ({
  UtilityReadingsTable: (props: Record<string, unknown>) => (
    <div data-testid="utility-readings-table">
      Readings: {(props.readings as unknown[])?.length ?? 0}
      <button onClick={props.onAddReading as () => void}>+ Add Reading</button>
    </div>
  ),
}))
vi.mock('@/components/home/UtilityBillsTable', () => ({
  UtilityBillsTable: (props: Record<string, unknown>) => (
    <div data-testid="utility-bills-table">
      Bills: {(props.bills as unknown[])?.length ?? 0}
      <button onClick={props.onAddBill as () => void}>+ Add Bill</button>
    </div>
  ),
}))
vi.mock('@/components/home/dialogs/MeterReadingDialog', () => ({
  MeterReadingDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="meter-reading-dialog">MeterReadingDialog</div> : null,
}))
vi.mock('@/components/home/dialogs/BillDialog', () => ({
  BillDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="bill-dialog">BillDialog</div> : null,
}))
vi.mock('@/components/home/dialogs/UtilityDialog', () => ({
  UtilityDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="utility-dialog">UtilityDialog</div> : null,
}))
vi.mock('@/components/shared/DeleteConfirmDialog', () => ({
  DeleteConfirmDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="delete-confirm-dialog">DeleteConfirmDialog</div> : null,
}))

import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'

const mockUtility = buildUtility({ name: 'Electricity', unit: 'kWh', icon: 'bolt', color: 'amber' })
const mockReadings = [
  buildMeterReading({ utilityId: mockUtility.id as string as MeterReading['utilityId'], timestamp: '2026-04-01T10:00:00.000Z', value: 1000 }),
  buildMeterReading({ utilityId: mockUtility.id as string as MeterReading['utilityId'], timestamp: '2026-03-01T10:00:00.000Z', value: 800 }),
]
const mockBills = [
  buildUtilityBill({ utilityId: mockUtility.id as string as UtilityBill['utilityId'], amount: 500, periodStart: '2026-01-01', periodEnd: '2026-03-31' }),
]

// Need to import the types for the branded ID casts
import type { MeterReading, UtilityBill } from '@/types/home'

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/home/utility/:utilityId" element={<UtilityDetail />} />
    </Routes>,
    { initialEntries: [`/home/utility/${mockUtility.id}`] },
  )
}

function mockAllServices() {
  vi.mocked(utilityService.getAll).mockResolvedValue([mockUtility])
  vi.mocked(utilityService.getOne).mockResolvedValue(mockUtility)
  vi.mocked(meterReadingService.getByUtility).mockResolvedValue(mockReadings)
  vi.mocked(utilityBillService.getByUtility).mockResolvedValue(mockBills)
}

describe('UtilityDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sections in correct order', async () => {
    mockAllServices()
    const { container } = renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('utility-detail-header')).toBeInTheDocument()
    })

    expect(screen.getByTestId('chart-section')).toBeInTheDocument()
    expect(screen.getByTestId('yearly-section')).toBeInTheDocument()
    expect(screen.getByTestId('readings-section')).toBeInTheDocument()
    expect(screen.getByTestId('bills-section')).toBeInTheDocument()

    // Verify order by checking DOM positions
    const sections = container.querySelectorAll('[data-testid]')
    const order = Array.from(sections).map((el) => el.getAttribute('data-testid'))
    const headerIdx = order.indexOf('utility-detail-header')
    const chartIdx = order.indexOf('chart-section')
    const yearlyIdx = order.indexOf('yearly-section')
    const readingsIdx = order.indexOf('readings-section')
    const billsIdx = order.indexOf('bills-section')

    expect(headerIdx).toBeLessThan(chartIdx)
    expect(chartIdx).toBeLessThan(yearlyIdx)
    expect(yearlyIdx).toBeLessThan(readingsIdx)
    expect(readingsIdx).toBeLessThan(billsIdx)
  })

  it('shows loading skeleton while data loads', () => {
    vi.mocked(utilityService.getAll).mockReturnValue(new Promise(() => {}))
    vi.mocked(utilityService.getOne).mockReturnValue(new Promise(() => {}))
    vi.mocked(meterReadingService.getByUtility).mockReturnValue(new Promise(() => {}))
    vi.mocked(utilityBillService.getByUtility).mockReturnValue(new Promise(() => {}))

    renderPage()

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
    expect(screen.queryByTestId('utility-detail-header')).not.toBeInTheDocument()
  })

  it('renders utility name in header area', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByTestId('utility-name')).toHaveTextContent('Electricity')
  })

  it('shows "+ Add Reading" button that opens dialog', async () => {
    mockAllServices()
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('utility-detail-header')).toBeInTheDocument()
    })

    // Dialog should not be open initially
    expect(screen.queryByTestId('meter-reading-dialog')).not.toBeInTheDocument()

    // Click "+ Add Reading" in header
    const addReadingButtons = screen.getAllByRole('button', { name: '+ Add Reading' })
    await user.click(addReadingButtons[0]!)

    await waitFor(() => {
      expect(screen.getByTestId('meter-reading-dialog')).toBeInTheDocument()
    })
  })

  it('shows "+ Add Bill" button that opens dialog', async () => {
    mockAllServices()
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('utility-detail-header')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('bill-dialog')).not.toBeInTheDocument()

    const addBillButtons = screen.getAllByRole('button', { name: '+ Add Bill' })
    await user.click(addBillButtons[0]!)

    await waitFor(() => {
      expect(screen.getByTestId('bill-dialog')).toBeInTheDocument()
    })
  })

  it('readings table renders with correct data', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByText('Readings: 2')).toBeInTheDocument()
  })

  it('bills table renders with correct data', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByText('Bills: 1')).toBeInTheDocument()
  })

  it('page container uses max-w-[1440px] and correct padding', async () => {
    mockAllServices()
    const { container } = renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('utility-detail-header')).toBeInTheDocument()
    })

    const pageContainer = container.querySelector('.max-w-\\[1440px\\]')
    expect(pageContainer).toBeInTheDocument()
    expect(pageContainer).toHaveClass('px-3', 'py-6')
  })
})
