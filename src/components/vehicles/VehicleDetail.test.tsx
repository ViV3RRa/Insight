import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders, screen, waitFor, userEvent } from '@/test/utils'
import { buildVehicle, buildRefueling, buildMaintenanceEvent } from '@/test/factories'
import { VehicleDetail } from './VehicleDetail'
import type { Refueling, MaintenanceEvent } from '@/types/vehicles'

// Mock services
vi.mock('@/services/vehicles', () => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@/services/refuelings', () => ({
  getByVehicle: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@/services/maintenanceEvents', () => ({
  getByVehicle: vi.fn(),
  remove: vi.fn(),
}))

// Mock sub-components to isolate page assembly
vi.mock('@/components/vehicles/VehicleDetailHeader', () => ({
  VehicleDetailHeader: (props: Record<string, unknown>) => (
    <div data-testid="vehicle-detail-header">
      <span data-testid="vehicle-name">
        {(props.vehicle as { name: string })?.name}
      </span>
      <button onClick={props.onAddRefueling as () => void}>+ Add Refueling</button>
      <button onClick={props.onAddMaintenance as () => void}>+ Add Maintenance</button>
      <button onClick={props.onEditVehicle as () => void}>Edit Vehicle</button>
    </div>
  ),
}))
vi.mock('@/components/vehicles/VehicleStatCards', () => ({
  VehicleStatCards: () => <div data-testid="vehicle-stat-cards">StatCards</div>,
}))
vi.mock('@/components/vehicles/VehicleYoYRow', () => ({
  VehicleYoYRow: ({ data }: { data: unknown }) => (
    <div data-testid="vehicle-yoy-row">{data ? 'YoY data' : 'No YoY'}</div>
  ),
}))
vi.mock('@/components/vehicles/VehicleEfficiencyChart', () => ({
  VehicleEfficiencyChart: () => <div data-testid="vehicle-efficiency-chart">EffChart</div>,
}))
vi.mock('@/components/vehicles/VehicleFuelCostChart', () => ({
  VehicleFuelCostChart: () => <div data-testid="vehicle-fuel-cost-chart">FuelCostChart</div>,
}))
vi.mock('@/components/vehicles/VehicleKmChart', () => ({
  VehicleKmChart: () => <div data-testid="vehicle-km-chart">KmChart</div>,
}))
vi.mock('@/components/vehicles/VehicleMaintenanceChart', () => ({
  VehicleMaintenanceChart: () => (
    <div data-testid="vehicle-maintenance-chart">MaintChart</div>
  ),
}))
vi.mock('@/components/vehicles/VehicleRefuelingTable', () => ({
  VehicleRefuelingTable: (props: Record<string, unknown>) => (
    <div data-testid="vehicle-refueling-table">
      Refuelings: {(props.refuelings as unknown[])?.length ?? 0}
      <button onClick={props.onAdd as () => void}>+ Add Refueling</button>
    </div>
  ),
}))
vi.mock('@/components/vehicles/VehicleMaintenanceTable', () => ({
  VehicleMaintenanceTable: (props: Record<string, unknown>) => (
    <div data-testid="vehicle-maintenance-table">
      Events: {(props.events as unknown[])?.length ?? 0}
      <button onClick={props.onAdd as () => void}>+ Add Maintenance</button>
    </div>
  ),
}))
vi.mock('@/components/vehicles/dialogs/VehicleDialog', () => ({
  VehicleDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="vehicle-dialog">VehicleDialog</div> : null,
}))
vi.mock('@/components/vehicles/dialogs/RefuelingDialog', () => ({
  RefuelingDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="refueling-dialog">RefuelingDialog</div> : null,
}))
vi.mock('@/components/vehicles/dialogs/MaintenanceDialog', () => ({
  MaintenanceDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="maintenance-dialog">MaintenanceDialog</div> : null,
}))
vi.mock('@/components/shared/DeleteConfirmDialog', () => ({
  DeleteConfirmDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="delete-confirm-dialog">DeleteConfirmDialog</div> : null,
}))
vi.mock('@/components/shared/CollapsibleSection', () => ({
  CollapsibleSection: ({
    children,
    title,
  }: {
    children: React.ReactNode
    title: string
  }) => (
    <div data-testid="collapsible-section">
      <span>{title}</span>
      {children}
    </div>
  ),
}))

import * as vehicleService from '@/services/vehicles'
import * as refuelingService from '@/services/refuelings'
import * as maintenanceEventService from '@/services/maintenanceEvents'

const mockVehicle = buildVehicle({
  name: 'Family Car',
  fuelType: 'Petrol',
  status: 'active',
})

const vehicleId = mockVehicle.id as string

const mockRefuelings: Refueling[] = [
  buildRefueling({
    vehicleId: mockVehicle.id as string as Refueling['vehicleId'],
    date: '2026-03-15',
    odometerReading: 16000,
    fuelAmount: 40,
    totalCost: 500,
  }),
  buildRefueling({
    vehicleId: mockVehicle.id as string as Refueling['vehicleId'],
    date: '2026-02-10',
    odometerReading: 15500,
    fuelAmount: 42,
    totalCost: 525,
  }),
]

const mockMaintenanceEvents: MaintenanceEvent[] = [
  buildMaintenanceEvent({
    vehicleId: mockVehicle.id as string as MaintenanceEvent['vehicleId'],
    date: '2026-01-20',
    description: 'Oil change',
    cost: 800,
  }),
]

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/vehicles/:vehicleId" element={<VehicleDetail />} />
    </Routes>,
    { initialEntries: [`/vehicles/${vehicleId}`] },
  )
}

function mockAllServices() {
  vi.mocked(vehicleService.getAll).mockResolvedValue([mockVehicle])
  vi.mocked(vehicleService.getOne).mockResolvedValue(mockVehicle)
  vi.mocked(refuelingService.getByVehicle).mockResolvedValue(mockRefuelings)
  vi.mocked(maintenanceEventService.getByVehicle).mockResolvedValue(mockMaintenanceEvents)
}

describe('VehicleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading skeleton while data loads', () => {
    vi.mocked(vehicleService.getAll).mockReturnValue(new Promise(() => {}))
    vi.mocked(vehicleService.getOne).mockReturnValue(new Promise(() => {}))
    vi.mocked(refuelingService.getByVehicle).mockReturnValue(new Promise(() => {}))
    vi.mocked(maintenanceEventService.getByVehicle).mockReturnValue(new Promise(() => {}))

    renderPage()

    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
    expect(screen.queryByTestId('vehicle-detail-header')).not.toBeInTheDocument()
  })

  it('renders all data-testid sections after loading', async () => {
    mockAllServices()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-detail-header')).toBeInTheDocument()
    })

    expect(screen.getByTestId('stat-cards-section')).toBeInTheDocument()
    expect(screen.getByTestId('yoy-section')).toBeInTheDocument()
    expect(screen.getByTestId('charts-section')).toBeInTheDocument()
    expect(screen.getByTestId('refueling-section')).toBeInTheDocument()
    expect(screen.getByTestId('maintenance-section')).toBeInTheDocument()
  })

  it('renders stat cards section', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByTestId('vehicle-stat-cards')).toBeInTheDocument()
  })

  it('renders YoY section', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByTestId('vehicle-yoy-row')).toBeInTheDocument()
  })

  it('renders charts section with all chart components', async () => {
    mockAllServices()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-detail-header')).toBeInTheDocument()
    })

    expect(screen.getByTestId('collapsible-section')).toBeInTheDocument()
    expect(screen.getByText('Performance Charts')).toBeInTheDocument()
    expect(screen.getByTestId('vehicle-efficiency-chart')).toBeInTheDocument()
    expect(screen.getByTestId('vehicle-fuel-cost-chart')).toBeInTheDocument()
    expect(screen.getByTestId('vehicle-km-chart')).toBeInTheDocument()
    expect(screen.getByTestId('vehicle-maintenance-chart')).toBeInTheDocument()
  })

  it('renders refueling table section with data', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByText('Refuelings: 2')).toBeInTheDocument()
  })

  it('renders maintenance table section with data', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByText('Events: 1')).toBeInTheDocument()
  })

  it('renders vehicle name in header', async () => {
    mockAllServices()
    renderPage()

    expect(await screen.findByTestId('vehicle-name')).toHaveTextContent('Family Car')
  })

  it('opens refueling dialog when add refueling clicked', async () => {
    mockAllServices()
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-detail-header')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('refueling-dialog')).not.toBeInTheDocument()

    const addButtons = screen.getAllByRole('button', { name: '+ Add Refueling' })
    await user.click(addButtons[0]!)

    await waitFor(() => {
      expect(screen.getByTestId('refueling-dialog')).toBeInTheDocument()
    })
  })

  it('opens maintenance dialog when add maintenance clicked', async () => {
    mockAllServices()
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-detail-header')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('maintenance-dialog')).not.toBeInTheDocument()

    const addButtons = screen.getAllByRole('button', { name: '+ Add Maintenance' })
    await user.click(addButtons[0]!)

    await waitFor(() => {
      expect(screen.getByTestId('maintenance-dialog')).toBeInTheDocument()
    })
  })

  it('page container uses max-w-[1440px] and correct padding', async () => {
    mockAllServices()
    const { container } = renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('vehicle-detail-header')).toBeInTheDocument()
    })

    const pageContainer = container.querySelector('.max-w-\\[1440px\\]')
    expect(pageContainer).toBeInTheDocument()
    expect(pageContainer).toHaveClass('px-3', 'py-6')
  })
})
