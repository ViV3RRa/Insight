import type { Portfolio, Platform, DataPoint, Transaction } from '@/types/investment'
import type { Utility, MeterReading, UtilityBill } from '@/types/home'
import type { Vehicle, Refueling, MaintenanceEvent } from '@/types/vehicles'

// --- Branded ID helpers ---

const OWNER_ID = 'demo-user' as Portfolio['ownerId']
const PORTFOLIO_ID = 'demo-portfolio-1' as Portfolio['id']

const PLATFORM_IDS = {
  nordnet: 'demo-platform-nordnet' as Platform['id'],
  saxo: 'demo-platform-saxo' as Platform['id'],
  nordnetCash: 'demo-platform-nordnet-cash' as Platform['id'],
  mintos: 'demo-platform-mintos' as Platform['id'],
} as const

const UTILITY_IDS = {
  electricity: 'demo-utility-electricity' as Utility['id'],
  water: 'demo-utility-water' as Utility['id'],
} as const

const VEHICLE_IDS = {
  familyCar: 'demo-vehicle-family-car' as Vehicle['id'],
  cityEv: 'demo-vehicle-city-ev' as Vehicle['id'],
  oldBike: 'demo-vehicle-old-bike' as Vehicle['id'],
} as const

// --- Date helpers ---

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`
}

// --- Investment data ---

export function getDemoPortfolios(): Portfolio[] {
  return [
    {
      id: PORTFOLIO_ID,
      name: 'Main Portfolio',
      ownerName: 'Demo User',
      isDefault: true,
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
  ]
}

export function getDemoPlatforms(): Platform[] {
  return [
    {
      id: PLATFORM_IDS.nordnet,
      portfolioId: PORTFOLIO_ID,
      name: 'Nordnet',
      icon: 'nordnet',
      type: 'investment',
      currency: 'DKK',
      status: 'active',
      closedDate: null,
      closureNote: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
    {
      id: PLATFORM_IDS.saxo,
      portfolioId: PORTFOLIO_ID,
      name: 'Saxo Bank',
      icon: 'saxo',
      type: 'investment',
      currency: 'EUR',
      status: 'active',
      closedDate: null,
      closureNote: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
    {
      id: PLATFORM_IDS.nordnetCash,
      portfolioId: PORTFOLIO_ID,
      name: 'Nordnet Cash',
      icon: 'nordnet',
      type: 'cash',
      currency: 'DKK',
      status: 'active',
      closedDate: null,
      closureNote: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
    {
      id: PLATFORM_IDS.mintos,
      portfolioId: PORTFOLIO_ID,
      name: 'Mintos',
      icon: 'mintos',
      type: 'investment',
      currency: 'EUR',
      status: 'closed',
      closedDate: isoDate(2025, 6, 30),
      closureNote: 'Consolidated into Saxo Bank',
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 6, 30),
    },
  ]
}

function generateNordnetDataPoints(): DataPoint[] {
  const points: DataPoint[] = []
  let value = 50000
  for (let month = 1; month <= 12; month++) {
    const growth = 800 + (month % 3) * 200 - (month % 5) * 100
    value += growth
    const isInterpolated = month === 3 || month === 7
    points.push({
      id: `demo-dp-nordnet-2024-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.nordnet,
      value,
      timestamp: isoDate(2024, month, 15),
      isInterpolated,
      note: isInterpolated ? 'Interpolated' : null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 15),
      updated: isoDate(2024, month, 15),
    })
  }
  for (let month = 1; month <= 12; month++) {
    const growth = 1000 + (month % 4) * 300 - (month % 6) * 150
    value += growth
    points.push({
      id: `demo-dp-nordnet-2025-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.nordnet,
      value,
      timestamp: isoDate(2025, month, 15),
      isInterpolated: false,
      note: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 15),
      updated: isoDate(2025, month, 15),
    })
  }
  return points
}

function generateSaxoDataPoints(): DataPoint[] {
  const points: DataPoint[] = []
  let value = 8000
  for (let month = 1; month <= 12; month++) {
    const growth = 150 + (month % 2) * 50
    value += growth
    const isInterpolated = month === 5
    points.push({
      id: `demo-dp-saxo-2024-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.saxo,
      value,
      timestamp: isoDate(2024, month, 15),
      isInterpolated,
      note: isInterpolated ? 'Interpolated' : null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 15),
      updated: isoDate(2024, month, 15),
    })
  }
  for (let month = 1; month <= 12; month++) {
    const growth = 200 + (month % 3) * 80
    value += growth
    points.push({
      id: `demo-dp-saxo-2025-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.saxo,
      value,
      timestamp: isoDate(2025, month, 15),
      isInterpolated: false,
      note: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 15),
      updated: isoDate(2025, month, 15),
    })
  }
  return points
}

function generateNordnetCashDataPoints(): DataPoint[] {
  const points: DataPoint[] = []
  let value = 25000
  for (let month = 1; month <= 12; month++) {
    const change = month % 4 === 0 ? -5000 : 50 + (month % 2) * 10
    value += change
    points.push({
      id: `demo-dp-cash-2024-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.nordnetCash,
      value,
      timestamp: isoDate(2024, month, 15),
      isInterpolated: false,
      note: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 15),
      updated: isoDate(2024, month, 15),
    })
  }
  for (let month = 1; month <= 12; month++) {
    const change = month % 3 === 0 ? -3000 : 60 + (month % 2) * 15
    value += change
    points.push({
      id: `demo-dp-cash-2025-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.nordnetCash,
      value,
      timestamp: isoDate(2025, month, 15),
      isInterpolated: false,
      note: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 15),
      updated: isoDate(2025, month, 15),
    })
  }
  return points
}

function generateMintosDataPoints(): DataPoint[] {
  const points: DataPoint[] = []
  let value = 3000
  for (let month = 1; month <= 12; month++) {
    const growth = 40 + (month % 2) * 20
    value += growth
    points.push({
      id: `demo-dp-mintos-2024-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.mintos,
      value,
      timestamp: isoDate(2024, month, 15),
      isInterpolated: false,
      note: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 15),
      updated: isoDate(2024, month, 15),
    })
  }
  // Mintos closed mid-2025
  for (let month = 1; month <= 6; month++) {
    const growth = month <= 3 ? 30 : -value / (7 - month) * 0.3
    value += growth
    points.push({
      id: `demo-dp-mintos-2025-${month}` as DataPoint['id'],
      platformId: PLATFORM_IDS.mintos,
      value: Math.round(value * 100) / 100,
      timestamp: isoDate(2025, month, 15),
      isInterpolated: false,
      note: month === 6 ? 'Final value before closure' : null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 15),
      updated: isoDate(2025, month, 15),
    })
  }
  return points
}

const dataPointsByPlatform: Record<string, () => DataPoint[]> = {
  [PLATFORM_IDS.nordnet]: generateNordnetDataPoints,
  [PLATFORM_IDS.saxo]: generateSaxoDataPoints,
  [PLATFORM_IDS.nordnetCash]: generateNordnetCashDataPoints,
  [PLATFORM_IDS.mintos]: generateMintosDataPoints,
}

export function getDemoDataPoints(platformId: string): DataPoint[] {
  const generator = dataPointsByPlatform[platformId]
  return generator ? generator() : []
}

function generatePlatformTransactions(
  platformId: Platform['id'],
  currency: string,
): Transaction[] {
  const txns: Transaction[] = []
  const isEur = currency === 'EUR'
  const baseAmount = isEur ? 2000 : 15000

  // Initial deposit
  txns.push({
    id: `demo-tx-${platformId}-init` as Transaction['id'],
    platformId,
    type: 'deposit',
    amount: isEur ? 8000 : 50000,
    exchangeRate: isEur ? 7.46 : null,
    timestamp: isoDate(2024, 1, 5),
    note: 'Initial deposit',
    attachment: null,
    ownerId: OWNER_ID,
    created: isoDate(2024, 1, 5),
    updated: isoDate(2024, 1, 5),
  })

  // Quarterly deposits
  for (let q = 1; q <= 7; q++) {
    const year = q <= 4 ? 2024 : 2025
    const month = q <= 4 ? q * 3 : (q - 4) * 3
    txns.push({
      id: `demo-tx-${platformId}-dep-${q}` as Transaction['id'],
      platformId,
      type: 'deposit',
      amount: baseAmount + (q % 3) * (isEur ? 500 : 2000),
      exchangeRate: isEur ? 7.44 + q * 0.01 : null,
      timestamp: isoDate(year, month, 1),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(year, month, 1),
      updated: isoDate(year, month, 1),
    })
  }

  // One withdrawal
  txns.push({
    id: `demo-tx-${platformId}-wd-1` as Transaction['id'],
    platformId,
    type: 'withdrawal',
    amount: isEur ? 1000 : 5000,
    exchangeRate: isEur ? 7.48 : null,
    timestamp: isoDate(2025, 2, 15),
    note: 'Partial withdrawal',
    attachment: null,
    ownerId: OWNER_ID,
    created: isoDate(2025, 2, 15),
    updated: isoDate(2025, 2, 15),
  })

  return txns
}

export function getDemoTransactions(platformId: string): Transaction[] {
  const platform = getDemoPlatforms().find((p) => p.id === platformId)
  if (!platform) return []
  return generatePlatformTransactions(
    platform.id,
    platform.currency,
  )
}

// --- Home (Utilities) data ---

export function getDemoUtilities(): Utility[] {
  return [
    {
      id: UTILITY_IDS.electricity,
      name: 'Electricity',
      unit: 'kWh',
      icon: 'bolt',
      color: 'amber',
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
    {
      id: UTILITY_IDS.water,
      name: 'Water',
      unit: 'm³',
      icon: 'droplet',
      color: 'blue',
      ownerId: OWNER_ID,
      created: isoDate(2024, 1, 1),
      updated: isoDate(2025, 12, 1),
    },
  ]
}

function generateElectricityReadings(): MeterReading[] {
  const readings: MeterReading[] = []
  let value = 12000
  for (let month = 1; month <= 12; month++) {
    const consumption = 250 + (month >= 11 || month <= 2 ? 100 : 0) - (month >= 5 && month <= 8 ? 50 : 0)
    value += consumption
    readings.push({
      id: `demo-mr-elec-2024-${month}` as MeterReading['id'],
      utilityId: UTILITY_IDS.electricity,
      value,
      timestamp: isoDate(2024, month, 1),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 1),
      updated: isoDate(2024, month, 1),
    })
  }
  for (let month = 1; month <= 12; month++) {
    const consumption = 240 + (month >= 11 || month <= 2 ? 90 : 0) - (month >= 5 && month <= 8 ? 40 : 0)
    value += consumption
    readings.push({
      id: `demo-mr-elec-2025-${month}` as MeterReading['id'],
      utilityId: UTILITY_IDS.electricity,
      value,
      timestamp: isoDate(2025, month, 1),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 1),
      updated: isoDate(2025, month, 1),
    })
  }
  return readings
}

function generateWaterReadings(): MeterReading[] {
  const readings: MeterReading[] = []
  let value = 450
  for (let month = 1; month <= 12; month++) {
    const consumption = 8 + (month >= 6 && month <= 8 ? 3 : 0)
    value += consumption
    readings.push({
      id: `demo-mr-water-2024-${month}` as MeterReading['id'],
      utilityId: UTILITY_IDS.water,
      value,
      timestamp: isoDate(2024, month, 1),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, month, 1),
      updated: isoDate(2024, month, 1),
    })
  }
  for (let month = 1; month <= 12; month++) {
    const consumption = 7.5 + (month >= 6 && month <= 8 ? 2.5 : 0)
    value += consumption
    readings.push({
      id: `demo-mr-water-2025-${month}` as MeterReading['id'],
      utilityId: UTILITY_IDS.water,
      value: Math.round(value * 10) / 10,
      timestamp: isoDate(2025, month, 1),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, month, 1),
      updated: isoDate(2025, month, 1),
    })
  }
  return readings
}

const meterReadingsByUtility: Record<string, () => MeterReading[]> = {
  [UTILITY_IDS.electricity]: generateElectricityReadings,
  [UTILITY_IDS.water]: generateWaterReadings,
}

export function getDemoMeterReadings(utilityId: string): MeterReading[] {
  const generator = meterReadingsByUtility[utilityId]
  return generator ? generator() : []
}

function generateElectricityBills(): UtilityBill[] {
  const bills: UtilityBill[] = []
  const quarterlyAmounts = [
    { year: 2024, q: 1, amount: 2100, startM: 1, endM: 3 },
    { year: 2024, q: 2, amount: 1750, startM: 4, endM: 6 },
    { year: 2024, q: 3, amount: 1650, startM: 7, endM: 9 },
    { year: 2024, q: 4, amount: 2200, startM: 10, endM: 12 },
    { year: 2025, q: 1, amount: 2050, startM: 1, endM: 3 },
    { year: 2025, q: 2, amount: 1700, startM: 4, endM: 6 },
    { year: 2025, q: 3, amount: 1600, startM: 7, endM: 9 },
    { year: 2025, q: 4, amount: 2150, startM: 10, endM: 12 },
  ]
  for (const { year, q, amount, startM, endM } of quarterlyAmounts) {
    bills.push({
      id: `demo-bill-elec-${year}-q${q}` as UtilityBill['id'],
      utilityId: UTILITY_IDS.electricity,
      amount,
      periodStart: isoDate(year, startM, 1),
      periodEnd: isoDate(year, endM, 28),
      timestamp: isoDate(year, endM, 28),
      note: null,
      attachment: null,
      ownerId: OWNER_ID,
      created: isoDate(year, endM, 28),
      updated: isoDate(year, endM, 28),
    })
  }
  return bills
}

function generateWaterBills(): UtilityBill[] {
  const bills: UtilityBill[] = []
  const yearlyBills = [
    { year: 2024, amount: 4200 },
    { year: 2025, amount: 4350 },
  ]
  for (const { year, amount } of yearlyBills) {
    // Water billed semi-annually
    bills.push(
      {
        id: `demo-bill-water-${year}-h1` as UtilityBill['id'],
        utilityId: UTILITY_IDS.water,
        amount: Math.round(amount * 0.45),
        periodStart: isoDate(year, 1, 1),
        periodEnd: isoDate(year, 6, 30),
        timestamp: isoDate(year, 7, 15),
        note: null,
        attachment: null,
        ownerId: OWNER_ID,
        created: isoDate(year, 7, 15),
        updated: isoDate(year, 7, 15),
      },
      {
        id: `demo-bill-water-${year}-h2` as UtilityBill['id'],
        utilityId: UTILITY_IDS.water,
        amount: Math.round(amount * 0.55),
        periodStart: isoDate(year, 7, 1),
        periodEnd: isoDate(year, 12, 31),
        timestamp: isoDate(year + 1, 1, 15),
        note: null,
        attachment: null,
        ownerId: OWNER_ID,
        created: isoDate(year + 1, 1, 15),
        updated: isoDate(year + 1, 1, 15),
      },
    )
  }
  return bills
}

const billsByUtility: Record<string, () => UtilityBill[]> = {
  [UTILITY_IDS.electricity]: generateElectricityBills,
  [UTILITY_IDS.water]: generateWaterBills,
}

export function getDemoUtilityBills(utilityId: string): UtilityBill[] {
  const generator = billsByUtility[utilityId]
  return generator ? generator() : []
}

// --- Vehicles data ---

export function getDemoVehicles(): Vehicle[] {
  return [
    {
      id: VEHICLE_IDS.familyCar,
      name: 'Family Car',
      type: 'Car',
      make: 'Skoda',
      model: 'Octavia',
      year: 2021,
      licensePlate: 'AB 12 345',
      fuelType: 'Petrol',
      status: 'active',
      purchaseDate: isoDate(2021, 3, 15),
      purchasePrice: 285000,
      saleDate: null,
      salePrice: null,
      saleNote: null,
      photo: null,
      ownerId: OWNER_ID,
      created: isoDate(2021, 3, 15),
    },
    {
      id: VEHICLE_IDS.cityEv,
      name: 'City EV',
      type: 'Car',
      make: 'VW',
      model: 'ID.3',
      year: 2023,
      licensePlate: 'CD 67 890',
      fuelType: 'Electric',
      status: 'active',
      purchaseDate: isoDate(2023, 6, 1),
      purchasePrice: 320000,
      saleDate: null,
      salePrice: null,
      saleNote: null,
      photo: null,
      ownerId: OWNER_ID,
      created: isoDate(2023, 6, 1),
    },
    {
      id: VEHICLE_IDS.oldBike,
      name: 'Old Bike',
      type: 'Motorcycle',
      make: 'Honda',
      model: 'CB500F',
      year: 2018,
      licensePlate: 'EF 11 222',
      fuelType: 'Petrol',
      status: 'sold',
      purchaseDate: isoDate(2018, 5, 1),
      purchasePrice: 65000,
      saleDate: isoDate(2025, 4, 1),
      salePrice: 38000,
      saleNote: 'Sold to private buyer',
      photo: null,
      ownerId: OWNER_ID,
      created: isoDate(2018, 5, 1),
    },
  ]
}

function generateFamilyCarRefuelings(): Refueling[] {
  const refuelings: Refueling[] = []
  let odometer = 45000
  for (let i = 0; i < 24; i++) {
    const year = i < 12 ? 2024 : 2025
    const month = i < 12 ? i + 1 : i - 11
    const km = 800 + (i % 3) * 200
    odometer += km
    const fuelAmount = 38 + (i % 4) * 3
    const costPerUnit = 12.5 + (i % 5) * 0.3
    refuelings.push({
      id: `demo-ref-fc-${i}` as Refueling['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(year, month, 10 + (i % 15)),
      fuelAmount,
      costPerUnit,
      totalCost: Math.round(fuelAmount * costPerUnit * 100) / 100,
      odometerReading: odometer,
      station: i % 3 === 0 ? 'Circle K' : i % 3 === 1 ? 'OK' : 'Shell',
      chargedAtHome: false,
      note: null,
      receipt: null,
      tripCounterPhoto: null,
      ownerId: OWNER_ID,
      created: isoDate(year, month, 10 + (i % 15)),
    })
  }
  return refuelings
}

function generateCityEvRefuelings(): Refueling[] {
  const refuelings: Refueling[] = []
  let odometer = 12000
  for (let i = 0; i < 14; i++) {
    const year = i < 6 ? 2024 : 2025
    const month = i < 6 ? i + 7 : i - 5
    const km = 600 + (i % 4) * 150
    odometer += km
    const fuelAmount = 40 + (i % 3) * 8
    const atHome = i % 3 === 0
    const costPerUnit = atHome ? 2.1 : 3.8 + (i % 4) * 0.2
    refuelings.push({
      id: `demo-ref-ev-${i}` as Refueling['id'],
      vehicleId: VEHICLE_IDS.cityEv,
      date: isoDate(year, month, 5 + (i % 20)),
      fuelAmount,
      costPerUnit,
      totalCost: Math.round(fuelAmount * costPerUnit * 100) / 100,
      odometerReading: odometer,
      station: atHome ? null : 'Clever',
      chargedAtHome: atHome,
      note: null,
      receipt: null,
      tripCounterPhoto: null,
      ownerId: OWNER_ID,
      created: isoDate(year, month, 5 + (i % 20)),
    })
  }
  return refuelings
}

function generateOldBikeRefuelings(): Refueling[] {
  const refuelings: Refueling[] = []
  let odometer = 28000
  // Only summer months for the bike, 2024 season
  const months = [4, 5, 6, 7, 8, 9]
  for (let i = 0; i < months.length; i++) {
    const km = 400 + (i % 2) * 200
    odometer += km
    const fuelAmount = 12 + (i % 3) * 2
    const costPerUnit = 13.2 + (i % 3) * 0.4
    refuelings.push({
      id: `demo-ref-bike-${i}` as Refueling['id'],
      vehicleId: VEHICLE_IDS.oldBike,
      date: isoDate(2024, months[i]!, 15),
      fuelAmount,
      costPerUnit,
      totalCost: Math.round(fuelAmount * costPerUnit * 100) / 100,
      odometerReading: odometer,
      station: 'Shell',
      chargedAtHome: false,
      note: null,
      receipt: null,
      tripCounterPhoto: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, months[i]!, 15),
    })
  }
  return refuelings
}

const refuelingsByVehicle: Record<string, () => Refueling[]> = {
  [VEHICLE_IDS.familyCar]: generateFamilyCarRefuelings,
  [VEHICLE_IDS.cityEv]: generateCityEvRefuelings,
  [VEHICLE_IDS.oldBike]: generateOldBikeRefuelings,
}

export function getDemoRefuelings(vehicleId: string): Refueling[] {
  const generator = refuelingsByVehicle[vehicleId]
  return generator ? generator() : []
}

function generateFamilyCarMaintenance(): MaintenanceEvent[] {
  return [
    {
      id: 'demo-maint-fc-1' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2024, 3, 20),
      description: 'Oil change + filter',
      cost: 1800,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 3, 20),
    },
    {
      id: 'demo-maint-fc-2' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2024, 6, 10),
      description: 'New front brakes',
      cost: 4200,
      note: 'Pads and discs',
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 6, 10),
    },
    {
      id: 'demo-maint-fc-3' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2024, 10, 5),
      description: 'Winter tires mounted',
      cost: 800,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 10, 5),
    },
    {
      id: 'demo-maint-fc-4' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2025, 3, 15),
      description: 'Annual service',
      cost: 3500,
      note: 'Full inspection + oil change',
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, 3, 15),
    },
    {
      id: 'demo-maint-fc-5' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2025, 8, 20),
      description: 'New battery',
      cost: 2200,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, 8, 20),
    },
    {
      id: 'demo-maint-fc-6' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.familyCar,
      date: isoDate(2025, 11, 1),
      description: 'Winter tires mounted',
      cost: 800,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, 11, 1),
    },
  ]
}

function generateCityEvMaintenance(): MaintenanceEvent[] {
  return [
    {
      id: 'demo-maint-ev-1' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.cityEv,
      date: isoDate(2024, 9, 1),
      description: 'Tire rotation',
      cost: 600,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 9, 1),
    },
    {
      id: 'demo-maint-ev-2' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.cityEv,
      date: isoDate(2025, 3, 10),
      description: 'Cabin air filter',
      cost: 450,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, 3, 10),
    },
    {
      id: 'demo-maint-ev-3' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.cityEv,
      date: isoDate(2025, 10, 15),
      description: 'Winter tires + alignment',
      cost: 5500,
      note: 'New winter tire set',
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2025, 10, 15),
    },
  ]
}

function generateOldBikeMaintenance(): MaintenanceEvent[] {
  return [
    {
      id: 'demo-maint-bike-1' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.oldBike,
      date: isoDate(2024, 4, 1),
      description: 'Season start check',
      cost: 1200,
      note: 'Oil, chain, brake fluid',
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 4, 1),
    },
    {
      id: 'demo-maint-bike-2' as MaintenanceEvent['id'],
      vehicleId: VEHICLE_IDS.oldBike,
      date: isoDate(2024, 9, 30),
      description: 'Winterization',
      cost: 500,
      note: null,
      receipt: null,
      ownerId: OWNER_ID,
      created: isoDate(2024, 9, 30),
    },
  ]
}

const maintenanceByVehicle: Record<string, () => MaintenanceEvent[]> = {
  [VEHICLE_IDS.familyCar]: generateFamilyCarMaintenance,
  [VEHICLE_IDS.cityEv]: generateCityEvMaintenance,
  [VEHICLE_IDS.oldBike]: generateOldBikeMaintenance,
}

export function getDemoMaintenanceEvents(vehicleId: string): MaintenanceEvent[] {
  const generator = maintenanceByVehicle[vehicleId]
  return generator ? generator() : []
}
