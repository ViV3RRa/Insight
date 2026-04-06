import { z } from 'zod'
import { UserId, VehicleId, RefuelingId, MaintenanceEventId } from './brands'

// --- Enums ---

export const fuelTypeSchema = z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid'])
export const vehicleStatusSchema = z.enum(['active', 'sold'])

// --- Vehicle (PRD §7.1.1) ---

export const vehicleSchema = z.object({
  id: VehicleId,
  name: z.string(),
  type: z.string().nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  licensePlate: z.string().nullable(),
  fuelType: fuelTypeSchema,
  status: vehicleStatusSchema,
  purchaseDate: z.string().nullable(),
  purchasePrice: z.number().nullable(),
  saleDate: z.string().nullable(),
  salePrice: z.number().nullable(),
  saleNote: z.string().nullable(),
  photo: z.string().nullable(),
  ownerId: UserId,
  created: z.string(),
})

export const vehicleCreateSchema = vehicleSchema.omit({
  id: true,
  created: true,
  ownerId: true,
  saleDate: true,
  salePrice: true,
  saleNote: true,
})

export type Vehicle = z.infer<typeof vehicleSchema>
export type VehicleCreate = z.infer<typeof vehicleCreateSchema>
export type FuelType = z.infer<typeof fuelTypeSchema>
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>

// --- Refueling (PRD §7.1.2) ---

export const refuelingSchema = z.object({
  id: RefuelingId,
  vehicleId: VehicleId,
  date: z.string(),
  fuelAmount: z.number(),
  costPerUnit: z.number(),
  totalCost: z.number(),
  odometerReading: z.number(),
  station: z.string().nullable(),
  chargedAtHome: z.boolean(),
  note: z.string().nullable(),
  receipt: z.string().nullable(),
  tripCounterPhoto: z.string().nullable(),
  ownerId: UserId,
  created: z.string(),
})

export const refuelingCreateSchema = refuelingSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type Refueling = z.infer<typeof refuelingSchema>
export type RefuelingCreate = z.infer<typeof refuelingCreateSchema>

// --- MaintenanceEvent (PRD §7.1.3) ---

export const maintenanceEventSchema = z.object({
  id: MaintenanceEventId,
  vehicleId: VehicleId,
  date: z.string(),
  description: z.string(),
  cost: z.number(),
  note: z.string().nullable(),
  receipt: z.string().nullable(),
  ownerId: UserId,
  created: z.string(),
})

export const maintenanceEventCreateSchema = maintenanceEventSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type MaintenanceEvent = z.infer<typeof maintenanceEventSchema>
export type MaintenanceEventCreate = z.infer<typeof maintenanceEventCreateSchema>

// --- Computed metric types (not stored in PocketBase) ---

export type TotalCostOfOwnership = {
  lifetimeFuelCost: number
  lifetimeMaintenanceCost: number
  totalOperatingCost: number
  purchaseToSaleOffset: number
}

export type VehicleMetrics = {
  allTimeEfficiency: number | null
  currentYearEfficiency: number | null
  rolling5Efficiency: number | null
  ytdKmDriven: number
  ytdFuelCost: number
  avgFuelCostPerMonth: number | null
  avgFuelCostPerDay: number | null
  totalMaintenanceCost: number
  totalVehicleCost: number
  totalCostOfOwnership: TotalCostOfOwnership | null
}
