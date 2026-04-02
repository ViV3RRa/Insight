# US-107: Vehicle TypeScript Types

## Story
As the Insight platform user, I want strongly typed data models for the Vehicles domain so that all services and calculations have a reliable, self-documenting contract.

## Dependencies
- US-001: Project Scaffolding

## Requirements
- Add the following TypeScript types to `src/types/index.ts` (alongside existing types):

**Vehicle** (PRD §7.1.1):
- `id`: string (PocketBase auto-generated)
- `name`: string (user-defined label, e.g. "Family Car")
- `type`: string (e.g. "Car", "Motorcycle")
- `make`: string (e.g. "Toyota", "BMW")
- `model`: string (e.g. "Corolla", "R1250GS")
- `year`: number (model year)
- `licensePlate`: string
- `fuelType`: string (e.g. "Petrol", "Diesel", "Electric", "Hybrid")
- `status`: `"active" | "sold"`
- `purchaseDate`: string | null (optional, ISO date)
- `purchasePrice`: number | null (optional)
- `saleDate`: string | null (optional, ISO date)
- `salePrice`: number | null (optional)
- `saleNote`: string | null (optional)
- `photo`: string | null (optional, PocketBase file field)
- `owner`: string (FK to users)
- `created`: string (ISO datetime)

**Refueling** (PRD §7.1.2):
- `id`: string
- `vehicleId`: string (FK to Vehicle)
- `date`: string (ISO date)
- `fuelAmount`: number (liters for petrol/diesel, kWh for electric)
- `costPerUnit`: number (DKK/liter or DKK/kWh)
- `totalCost`: number (computed or entered)
- `odometerReading`: number (total km at this refueling)
- `station`: string | null (optional, service station name)
- `chargedAtHome`: boolean (default: false, only relevant for EVs)
- `note`: string | null (optional)
- `receipt`: string | null (optional, PocketBase file field)
- `tripCounterPhoto`: string | null (optional, PocketBase file field)
- `owner`: string
- `created`: string

**MaintenanceEvent** (PRD §7.1.3):
- `id`: string
- `vehicleId`: string (FK to Vehicle)
- `date`: string (ISO date)
- `description`: string (what was done)
- `cost`: number
- `note`: string | null (optional)
- `receipt`: string | null (optional, PocketBase file field)
- `owner`: string
- `created`: string

- Define union literal types:
  - `VehicleStatus = "active" | "sold"`
  - `FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid"`
  - `VehicleType = "Car" | "Motorcycle" | string` (extensible)

- Define creation types:
  - `VehicleCreate`: Omit<Vehicle, "id" | "created" | "owner" | "saleDate" | "salePrice" | "saleNote">
  - `RefuelingCreate`: Omit<Refueling, "id" | "created" | "owner">
  - `MaintenanceEventCreate`: Omit<MaintenanceEvent, "id" | "created" | "owner">

- Define computed metric types:
  - `VehicleMetrics = { allTimeEfficiency: number | null; currentYearEfficiency: number | null; rolling5Efficiency: number | null; ytdKmDriven: number; ytdFuelCost: number; avgFuelCostPerMonth: number | null; avgFuelCostPerDay: number | null; totalMaintenanceCost: number; totalVehicleCost: number; totalCostOfOwnership: number | null }`

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `Vehicle` type includes all fields from PRD §7.1.1 plus `owner`
- [ ] `Vehicle.status` restricted to `"active" | "sold"`
- [ ] `Vehicle.fuelType` typed for known types with string extensibility
- [ ] `Refueling` type includes all fields from PRD §7.1.2 plus `owner`
- [ ] `Refueling.chargedAtHome` is boolean (default false)
- [ ] `MaintenanceEvent` type includes all fields from PRD §7.1.3 plus `owner`
- [ ] All union literal types exported
- [ ] Creation types omit server-generated fields
- [ ] `VehicleMetrics` type covers all computed metrics from PRD §7.2
- [ ] TypeScript compilation succeeds with strict mode

## Technical Notes
- File to modify: `src/types/index.ts`
- `fuelType` drives which units are displayed (km/l vs km/kWh) and whether chargedAtHome is relevant
- `photo` is a PocketBase file field for vehicle images
- `receipt` and `tripCounterPhoto` on Refueling are both PocketBase file fields
- Sale-related fields on Vehicle are only populated when status is "sold"
