import { generateId, buildEntity } from './base'
import type { Vehicle, Refueling, MaintenanceEvent } from '@/types/vehicles'

const vehicleDefaults: Vehicle = {
  id: '' as Vehicle['id'],
  name: 'Family Car',
  type: 'Car',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'AB 12 345',
  fuelType: 'Petrol',
  status: 'active',
  purchaseDate: '2022-03-15',
  purchasePrice: 250000,
  saleDate: null,
  salePrice: null,
  saleNote: null,
  photo: null,
  ownerId: '' as Vehicle['ownerId'],
  created: '2026-01-01T00:00:00.000Z',
}

export function buildVehicle(overrides?: Partial<Vehicle>): Vehicle {
  return buildEntity(
    {
      ...vehicleDefaults,
      id: generateId() as Vehicle['id'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Vehicle['ownerId'],
    },
    overrides,
  )
}

const refuelingDefaults: Refueling = {
  id: '' as Refueling['id'],
  vehicleId: '' as Refueling['vehicleId'],
  date: '2026-01-15',
  fuelAmount: 45,
  costPerUnit: 12.5,
  totalCost: 562.5,
  odometerReading: 15000,
  station: null,
  chargedAtHome: false,
  note: null,
  receipt: null,
  tripCounterPhoto: null,
  ownerId: '' as Refueling['ownerId'],
  created: '2026-01-15T10:00:00.000Z',
}

export function buildRefueling(overrides?: Partial<Refueling>): Refueling {
  return buildEntity(
    {
      ...refuelingDefaults,
      id: generateId() as Refueling['id'],
      vehicleId: (overrides?.vehicleId ?? generateId()) as Refueling['vehicleId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Refueling['ownerId'],
    },
    overrides,
  )
}

const maintenanceEventDefaults: MaintenanceEvent = {
  id: '' as MaintenanceEvent['id'],
  vehicleId: '' as MaintenanceEvent['vehicleId'],
  date: '2026-01-20',
  description: 'Oil change',
  cost: 800,
  note: null,
  receipt: null,
  ownerId: '' as MaintenanceEvent['ownerId'],
  created: '2026-01-20T10:00:00.000Z',
}

export function buildMaintenanceEvent(overrides?: Partial<MaintenanceEvent>): MaintenanceEvent {
  return buildEntity(
    {
      ...maintenanceEventDefaults,
      id: generateId() as MaintenanceEvent['id'],
      vehicleId: (overrides?.vehicleId ?? generateId()) as MaintenanceEvent['vehicleId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as MaintenanceEvent['ownerId'],
    },
    overrides,
  )
}
