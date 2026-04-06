import { describe, it, expect } from 'vitest'
import {
  fuelTypeSchema,
  vehicleStatusSchema,
  vehicleSchema,
  vehicleCreateSchema,
  refuelingSchema,
  refuelingCreateSchema,
  maintenanceEventSchema,
  maintenanceEventCreateSchema,
} from './vehicles'
import type { Vehicle, Refueling, MaintenanceEvent } from './vehicles'

// --- Valid test payloads ---

const validVehicle = {
  id: 'veh_001',
  name: 'Family Car',
  type: 'Car',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'AB 12 345',
  fuelType: 'Petrol' as const,
  status: 'active' as const,
  purchaseDate: '2022-03-15',
  purchasePrice: 250000,
  saleDate: null,
  salePrice: null,
  saleNote: null,
  photo: null,
  ownerId: 'user_001',
  created: '2026-01-01T00:00:00.000Z',
}

const validRefueling = {
  id: 'ref_001',
  vehicleId: 'veh_001',
  date: '2026-01-15',
  fuelAmount: 45.2,
  costPerUnit: 12.5,
  totalCost: 565,
  odometerReading: 15000,
  station: 'Shell',
  chargedAtHome: false,
  note: null,
  receipt: null,
  tripCounterPhoto: null,
  ownerId: 'user_001',
  created: '2026-01-15T10:00:00.000Z',
}

const validMaintenanceEvent = {
  id: 'maint_001',
  vehicleId: 'veh_001',
  date: '2026-01-20',
  description: 'Oil change',
  cost: 800,
  note: null,
  receipt: null,
  ownerId: 'user_001',
  created: '2026-01-20T10:00:00.000Z',
}

// --- fuelTypeSchema ---

describe('fuelTypeSchema', () => {
  const validTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

  it.each(validTypes)('accepts "%s"', (type) => {
    expect(fuelTypeSchema.parse(type)).toBe(type)
  })

  it('rejects invalid fuel type', () => {
    expect(() => fuelTypeSchema.parse('Hydrogen')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => fuelTypeSchema.parse('')).toThrow()
  })

  it('rejects lowercase variant', () => {
    expect(() => fuelTypeSchema.parse('petrol')).toThrow()
  })
})

// --- vehicleStatusSchema ---

describe('vehicleStatusSchema', () => {
  const validStatuses = ['active', 'sold']

  it.each(validStatuses)('accepts "%s"', (status) => {
    expect(vehicleStatusSchema.parse(status)).toBe(status)
  })

  it('rejects invalid status', () => {
    expect(() => vehicleStatusSchema.parse('closed')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => vehicleStatusSchema.parse('')).toThrow()
  })
})

// --- vehicleSchema ---

describe('vehicleSchema', () => {
  it('accepts a valid vehicle', () => {
    const result = vehicleSchema.parse(validVehicle)
    expect(result.name).toBe('Family Car')
    expect(result.fuelType).toBe('Petrol')
    expect(result.status).toBe('active')
  })

  it('produces branded VehicleId for id', () => {
    const result = vehicleSchema.parse(validVehicle)
    const id: Vehicle['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded UserId for ownerId', () => {
    const result = vehicleSchema.parse(validVehicle)
    const ownerId: Vehicle['ownerId'] = result.ownerId
    expect(typeof ownerId).toBe('string')
  })

  it('accepts null for type', () => {
    const result = vehicleSchema.parse({ ...validVehicle, type: null })
    expect(result.type).toBeNull()
  })

  it('accepts null for make', () => {
    const result = vehicleSchema.parse({ ...validVehicle, make: null })
    expect(result.make).toBeNull()
  })

  it('accepts null for model', () => {
    const result = vehicleSchema.parse({ ...validVehicle, model: null })
    expect(result.model).toBeNull()
  })

  it('accepts null for year', () => {
    const result = vehicleSchema.parse({ ...validVehicle, year: null })
    expect(result.year).toBeNull()
  })

  it('accepts null for licensePlate', () => {
    const result = vehicleSchema.parse({ ...validVehicle, licensePlate: null })
    expect(result.licensePlate).toBeNull()
  })

  it('accepts null for purchaseDate', () => {
    const result = vehicleSchema.parse({ ...validVehicle, purchaseDate: null })
    expect(result.purchaseDate).toBeNull()
  })

  it('accepts null for purchasePrice', () => {
    const result = vehicleSchema.parse({ ...validVehicle, purchasePrice: null })
    expect(result.purchasePrice).toBeNull()
  })

  it('accepts null for saleDate, salePrice, saleNote', () => {
    const result = vehicleSchema.parse(validVehicle)
    expect(result.saleDate).toBeNull()
    expect(result.salePrice).toBeNull()
    expect(result.saleNote).toBeNull()
  })

  it('accepts non-null sale fields for sold vehicle', () => {
    const sold = {
      ...validVehicle,
      status: 'sold' as const,
      saleDate: '2026-03-01',
      salePrice: 200000,
      saleNote: 'Sold to neighbor',
    }
    const result = vehicleSchema.parse(sold)
    expect(result.saleDate).toBe('2026-03-01')
    expect(result.salePrice).toBe(200000)
    expect(result.saleNote).toBe('Sold to neighbor')
  })

  it('accepts null for photo', () => {
    const result = vehicleSchema.parse(validVehicle)
    expect(result.photo).toBeNull()
  })

  it('accepts non-null photo', () => {
    const result = vehicleSchema.parse({ ...validVehicle, photo: 'car_photo.jpg' })
    expect(result.photo).toBe('car_photo.jpg')
  })

  it('rejects missing required fields', () => {
    expect(() => vehicleSchema.parse({ id: 'veh_001' })).toThrow()
  })

  it('rejects missing name', () => {
    const { name: _, ...without } = validVehicle
    expect(() => vehicleSchema.parse(without)).toThrow()
  })

  it('rejects invalid fuelType', () => {
    expect(() =>
      vehicleSchema.parse({ ...validVehicle, fuelType: 'Hydrogen' }),
    ).toThrow()
  })

  it('rejects invalid status', () => {
    expect(() =>
      vehicleSchema.parse({ ...validVehicle, status: 'closed' }),
    ).toThrow()
  })

  it('accepts PocketBase datetime format for created', () => {
    const result = vehicleSchema.parse({ ...validVehicle, created: '2026-04-04 19:10:52.889Z' })
    expect(result.created).toBe('2026-04-04 19:10:52.889Z')
  })
})

describe('vehicleCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      name: 'Motorcycle',
      type: 'Motorcycle',
      make: 'BMW',
      model: 'R1250GS',
      year: 2023,
      licensePlate: null,
      fuelType: 'Petrol' as const,
      status: 'active' as const,
      purchaseDate: '2023-06-01',
      purchasePrice: 180000,
      photo: null,
    }
    const result = vehicleCreateSchema.parse(payload)
    expect(result.name).toBe('Motorcycle')
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      name: 'Test',
      type: null,
      make: null,
      model: null,
      year: null,
      licensePlate: null,
      fuelType: 'Diesel' as const,
      status: 'active' as const,
      purchaseDate: null,
      purchasePrice: null,
      photo: null,
    }
    const result = vehicleCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })

  it('omits sale fields (saleDate, salePrice, saleNote)', () => {
    const payload = {
      name: 'Test',
      type: null,
      make: null,
      model: null,
      year: null,
      licensePlate: null,
      fuelType: 'Petrol' as const,
      status: 'active' as const,
      purchaseDate: null,
      purchasePrice: null,
      photo: null,
      saleDate: '2026-01-01',
      salePrice: 100000,
      saleNote: 'test',
    }
    const result = vehicleCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).saleDate).toBeUndefined()
    expect((result as Record<string, unknown>).salePrice).toBeUndefined()
    expect((result as Record<string, unknown>).saleNote).toBeUndefined()
  })

  it('rejects missing name', () => {
    expect(() =>
      vehicleCreateSchema.parse({ fuelType: 'Petrol', status: 'active' }),
    ).toThrow()
  })
})

// --- refuelingSchema ---

describe('refuelingSchema', () => {
  it('accepts a valid refueling', () => {
    const result = refuelingSchema.parse(validRefueling)
    expect(result.fuelAmount).toBe(45.2)
    expect(result.totalCost).toBe(565)
    expect(result.chargedAtHome).toBe(false)
  })

  it('produces branded RefuelingId for id', () => {
    const result = refuelingSchema.parse(validRefueling)
    const id: Refueling['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded VehicleId for vehicleId', () => {
    const result = refuelingSchema.parse(validRefueling)
    const vehicleId: Refueling['vehicleId'] = result.vehicleId
    expect(typeof vehicleId).toBe('string')
  })

  it('chargedAtHome is boolean, not nullable', () => {
    expect(() =>
      refuelingSchema.parse({ ...validRefueling, chargedAtHome: null }),
    ).toThrow()
    const result = refuelingSchema.parse({ ...validRefueling, chargedAtHome: true })
    expect(result.chargedAtHome).toBe(true)
  })

  it('accepts null station', () => {
    const result = refuelingSchema.parse({ ...validRefueling, station: null })
    expect(result.station).toBeNull()
  })

  it('accepts non-null station', () => {
    const result = refuelingSchema.parse(validRefueling)
    expect(result.station).toBe('Shell')
  })

  it('accepts null note', () => {
    const result = refuelingSchema.parse(validRefueling)
    expect(result.note).toBeNull()
  })

  it('accepts non-null note', () => {
    const result = refuelingSchema.parse({ ...validRefueling, note: 'Highway trip' })
    expect(result.note).toBe('Highway trip')
  })

  it('accepts null receipt', () => {
    const result = refuelingSchema.parse(validRefueling)
    expect(result.receipt).toBeNull()
  })

  it('accepts non-null receipt', () => {
    const result = refuelingSchema.parse({ ...validRefueling, receipt: 'receipt.jpg' })
    expect(result.receipt).toBe('receipt.jpg')
  })

  it('accepts null tripCounterPhoto', () => {
    const result = refuelingSchema.parse(validRefueling)
    expect(result.tripCounterPhoto).toBeNull()
  })

  it('accepts non-null tripCounterPhoto', () => {
    const result = refuelingSchema.parse({ ...validRefueling, tripCounterPhoto: 'odometer.jpg' })
    expect(result.tripCounterPhoto).toBe('odometer.jpg')
  })

  it('rejects missing required fields', () => {
    expect(() => refuelingSchema.parse({ id: 'ref_001' })).toThrow()
  })

  it('rejects non-number fuelAmount', () => {
    expect(() =>
      refuelingSchema.parse({ ...validRefueling, fuelAmount: '45.2' }),
    ).toThrow()
  })

  it('rejects non-number odometerReading', () => {
    expect(() =>
      refuelingSchema.parse({ ...validRefueling, odometerReading: '15000' }),
    ).toThrow()
  })
})

describe('refuelingCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      vehicleId: 'veh_001',
      date: '2026-02-01',
      fuelAmount: 50,
      costPerUnit: 13.0,
      totalCost: 650,
      odometerReading: 16000,
      station: null,
      chargedAtHome: false,
      note: null,
      receipt: null,
      tripCounterPhoto: null,
    }
    const result = refuelingCreateSchema.parse(payload)
    expect(result.fuelAmount).toBe(50)
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      vehicleId: 'veh_001',
      date: '2026-02-01',
      fuelAmount: 50,
      costPerUnit: 13.0,
      totalCost: 650,
      odometerReading: 16000,
      station: null,
      chargedAtHome: false,
      note: null,
      receipt: null,
      tripCounterPhoto: null,
    }
    const result = refuelingCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- maintenanceEventSchema ---

describe('maintenanceEventSchema', () => {
  it('accepts a valid maintenance event', () => {
    const result = maintenanceEventSchema.parse(validMaintenanceEvent)
    expect(result.description).toBe('Oil change')
    expect(result.cost).toBe(800)
  })

  it('produces branded MaintenanceEventId for id', () => {
    const result = maintenanceEventSchema.parse(validMaintenanceEvent)
    const id: MaintenanceEvent['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded VehicleId for vehicleId', () => {
    const result = maintenanceEventSchema.parse(validMaintenanceEvent)
    const vehicleId: MaintenanceEvent['vehicleId'] = result.vehicleId
    expect(typeof vehicleId).toBe('string')
  })

  it('accepts null note', () => {
    const result = maintenanceEventSchema.parse(validMaintenanceEvent)
    expect(result.note).toBeNull()
  })

  it('accepts non-null note', () => {
    const result = maintenanceEventSchema.parse({ ...validMaintenanceEvent, note: 'Used synthetic oil' })
    expect(result.note).toBe('Used synthetic oil')
  })

  it('accepts null receipt', () => {
    const result = maintenanceEventSchema.parse(validMaintenanceEvent)
    expect(result.receipt).toBeNull()
  })

  it('accepts non-null receipt', () => {
    const result = maintenanceEventSchema.parse({ ...validMaintenanceEvent, receipt: 'receipt.pdf' })
    expect(result.receipt).toBe('receipt.pdf')
  })

  it('rejects missing required fields', () => {
    expect(() => maintenanceEventSchema.parse({ id: 'maint_001' })).toThrow()
  })

  it('rejects missing description', () => {
    const { description: _, ...without } = validMaintenanceEvent
    expect(() => maintenanceEventSchema.parse(without)).toThrow()
  })

  it('rejects non-number cost', () => {
    expect(() =>
      maintenanceEventSchema.parse({ ...validMaintenanceEvent, cost: '800' }),
    ).toThrow()
  })
})

describe('maintenanceEventCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      vehicleId: 'veh_001',
      date: '2026-02-15',
      description: 'Tire rotation',
      cost: 500,
      note: null,
      receipt: null,
    }
    const result = maintenanceEventCreateSchema.parse(payload)
    expect(result.description).toBe('Tire rotation')
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      vehicleId: 'veh_001',
      date: '2026-02-15',
      description: 'Tire rotation',
      cost: 500,
      note: null,
      receipt: null,
    }
    const result = maintenanceEventCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- Branded ID type safety ---

describe('branded ID type safety', () => {
  it('VehicleId, RefuelingId, and MaintenanceEventId are different types at compile time', () => {
    const vehicle = vehicleSchema.parse(validVehicle)
    const refueling = refuelingSchema.parse(validRefueling)
    const event = maintenanceEventSchema.parse(validMaintenanceEvent)

    expect(typeof vehicle.id).toBe('string')
    expect(typeof refueling.id).toBe('string')
    expect(typeof event.id).toBe('string')

    // TypeScript prevents cross-assignment:
    // const refuelingId: RefuelingId = vehicle.id // TS error
    // const eventId: MaintenanceEventId = refueling.id // TS error

    const vehicleId: Vehicle['id'] = vehicle.id
    const refuelingId: Refueling['id'] = refueling.id
    const eventId: MaintenanceEvent['id'] = event.id
    expect(vehicleId).not.toBe(refuelingId)
    expect(refuelingId).not.toBe(eventId)
  })

  it('relation IDs are branded with their target type', () => {
    const refueling = refuelingSchema.parse(validRefueling)
    // refueling.vehicleId is VehicleId, not plain string
    const vehicleRef: Vehicle['id'] = refueling.vehicleId
    expect(typeof vehicleRef).toBe('string')

    const event = maintenanceEventSchema.parse(validMaintenanceEvent)
    // event.vehicleId is VehicleId, not plain string
    const eventVehicleRef: Vehicle['id'] = event.vehicleId
    expect(typeof eventVehicleRef).toBe('string')
  })
})
