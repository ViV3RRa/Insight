import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent, waitFor } from '@/test/utils'
import { Route, Routes } from 'react-router-dom'
import { UtilityDetail } from '@/components/home/UtilityDetail'
import { buildUtility, buildMeterReading } from '@/test/factories/homeFactory'
import { buildRefueling, buildVehicle } from '@/test/factories/vehicleFactory'
import type { Utility, MeterReading } from '@/types/home'
import type { Refueling } from '@/types/vehicles'

// Mock services
vi.mock('@/services/utilities', () => ({
  getAll: vi.fn(),
  getOne: vi.fn(),
}))
vi.mock('@/services/meterReadings', () => ({
  getByUtility: vi.fn(),
}))
vi.mock('@/services/utilityBills', () => ({
  getByUtility: vi.fn(),
  remove: vi.fn(),
}))
vi.mock('@/services/refuelings', () => ({
  getAll: vi.fn(),
}))

import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'
import * as refuelingService from '@/services/refuelings'

const mockedUtilityGetAll = vi.mocked(utilityService.getAll)
const mockedUtilityGetOne = vi.mocked(utilityService.getOne)
const mockedGetReadings = vi.mocked(meterReadingService.getByUtility)
const mockedGetBills = vi.mocked(utilityBillService.getByUtility)
const mockedGetAllRefuelings = vi.mocked(refuelingService.getAll)

// --- Test data ---

const electricityUtility = buildUtility({
  id: 'util_elec' as Utility['id'],
  name: 'Electricity',
  icon: 'bolt',
  unit: 'kWh',
  color: 'amber',
})

const waterUtility = buildUtility({
  id: 'util_water' as Utility['id'],
  name: 'Water',
  icon: 'droplet',
  unit: 'm³',
  color: 'blue',
})

const vehicleId = buildVehicle({ fuelType: 'Electric' }).id

const evRefuelings: Refueling[] = [
  buildRefueling({
    vehicleId,
    date: '2026-01-15',
    fuelAmount: 40,
    chargedAtHome: true,
  }),
  buildRefueling({
    vehicleId,
    date: '2026-02-10',
    fuelAmount: 35,
    chargedAtHome: true,
  }),
  buildRefueling({
    vehicleId,
    date: '2026-03-05',
    fuelAmount: 50,
    chargedAtHome: false, // Not home-charged
  }),
]

const readings: MeterReading[] = [
  buildMeterReading({
    utilityId: electricityUtility.id,
    value: 1500,
    timestamp: '2026-03-01T10:00:00.000Z',
  }),
  buildMeterReading({
    utilityId: electricityUtility.id,
    value: 1200,
    timestamp: '2026-02-01T10:00:00.000Z',
  }),
  buildMeterReading({
    utilityId: electricityUtility.id,
    value: 900,
    timestamp: '2026-01-01T10:00:00.000Z',
  }),
]

// --- Helper ---

function renderUtilityDetail(utilityId: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/home/utility/:utilityId" element={<UtilityDetail />} />
    </Routes>,
    { initialEntries: [`/home/utility/${utilityId}`] },
  )
}

function setupElectricityMocks(refuelings: Refueling[] = evRefuelings) {
  mockedUtilityGetAll.mockResolvedValue([electricityUtility, waterUtility])
  mockedUtilityGetOne.mockResolvedValue(electricityUtility)
  mockedGetReadings.mockResolvedValue(readings)
  mockedGetBills.mockResolvedValue([])
  mockedGetAllRefuelings.mockResolvedValue(refuelings)
}

function setupWaterMocks() {
  mockedUtilityGetAll.mockResolvedValue([electricityUtility, waterUtility])
  mockedUtilityGetOne.mockResolvedValue(waterUtility)
  mockedGetReadings.mockResolvedValue([])
  mockedGetBills.mockResolvedValue([])
  mockedGetAllRefuelings.mockResolvedValue([])
}

// --- Tests ---

describe('EV Home-Charging Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toggle only appears on electricity utility (icon=bolt), not on water', async () => {
    setupWaterMocks()
    renderUtilityDetail(waterUtility.id)

    // Wait for the page to load
    await waitFor(() => {
      expect(screen.getByText('Water')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('ev-toggle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ev-charging-metric')).not.toBeInTheDocument()
  })

  it('toggle only appears when EV charging data exists', async () => {
    // Electricity utility but no home-charging refuelings
    setupElectricityMocks([
      buildRefueling({ chargedAtHome: false }),
    ])
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByText('Electricity')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('ev-toggle')).not.toBeInTheDocument()
  })

  it('toggle is OFF by default — full consumption shown', async () => {
    setupElectricityMocks()
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByTestId('ev-toggle')).toBeInTheDocument()
    })

    const checkbox = screen.getByRole('checkbox', { name: /exclude ev charging/i })
    expect(checkbox).not.toBeChecked()
  })

  it('toggle ON: checkbox becomes checked', async () => {
    setupElectricityMocks()
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByTestId('ev-toggle')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const checkbox = screen.getByRole('checkbox', { name: /exclude ev charging/i })
    await user.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('total home-charging kWh metric shown when EV data exists', async () => {
    setupElectricityMocks()
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByTestId('ev-charging-metric')).toBeInTheDocument()
    })

    expect(screen.getByText(/kWh used for EV home charging/)).toBeInTheDocument()
  })

  it('metric is always shown regardless of toggle state', async () => {
    setupElectricityMocks()
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByTestId('ev-charging-metric')).toBeInTheDocument()
    })

    // Toggle ON
    const user = userEvent.setup()
    const checkbox = screen.getByRole('checkbox', { name: /exclude ev charging/i })
    await user.click(checkbox)

    // Metric still visible
    expect(screen.getByTestId('ev-charging-metric')).toBeInTheDocument()
  })

  it('toggle hidden when no EV charging data exists (empty refuelings)', async () => {
    setupElectricityMocks([])
    renderUtilityDetail(electricityUtility.id)

    await waitFor(() => {
      expect(screen.getByText('Electricity')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('ev-toggle')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ev-charging-metric')).not.toBeInTheDocument()
  })
})
