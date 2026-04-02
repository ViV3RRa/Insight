# US-107: Vehicle Zod Schemas & Branded Types

## Story
As the Insight platform user, I want strongly typed, runtime-validated data models for the Vehicles domain so that all services and calculations have a reliable contract with branded IDs.

## Dependencies
- US-001: Project Scaffolding (zod must be installed)
- US-041: Investment Zod Schemas (branded ID base types in `src/types/brands.ts`)

## Requirements
- Define Zod schemas in `src/types/vehicles.ts` and re-export from `src/types/index.ts`
- Add branded ID types to `src/types/brands.ts`
- **Property names must match PocketBase collection field names exactly**

### Branded ID Types

Add to `src/types/brands.ts`:

```ts
export const VehicleId = z.string().brand<'VehicleId'>();
export const RefuelingId = z.string().brand<'RefuelingId'>();
export const MaintenanceEventId = z.string().brand<'MaintenanceEventId'>();

export type VehicleId = z.infer<typeof VehicleId>;
export type RefuelingId = z.infer<typeof RefuelingId>;
export type MaintenanceEventId = z.infer<typeof MaintenanceEventId>;
```

### Schemas

**Vehicle** (PRD §7.1.1):
```ts
export const fuelTypeSchema = z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']);
export const vehicleStatusSchema = z.enum(['active', 'sold']);

export const vehicleSchema = z.object({
  id: VehicleId,
  name: z.string(),
  type: z.string().nullable(),           // "Car", "Motorcycle", etc.
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  licensePlate: z.string().nullable(),
  fuelType: fuelTypeSchema,
  status: vehicleStatusSchema,
  purchaseDate: z.string().nullable(),   // ISO date
  purchasePrice: z.number().nullable(),
  saleDate: z.string().nullable(),       // ISO date
  salePrice: z.number().nullable(),
  saleNote: z.string().nullable(),
  photo: z.string().nullable(),          // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const vehicleCreateSchema = vehicleSchema.omit({
  id: true, created: true, ownerId: true,
  saleDate: true, salePrice: true, saleNote: true,
});

export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehicleCreate = z.infer<typeof vehicleCreateSchema>;
export type FuelType = z.infer<typeof fuelTypeSchema>;
export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
```

**Refueling** (PRD §7.1.2):
```ts
export const refuelingSchema = z.object({
  id: RefuelingId,
  vehicleId: VehicleId,
  date: z.string(),           // ISO date
  fuelAmount: z.number(),     // Liters or kWh
  costPerUnit: z.number(),    // DKK/liter or DKK/kWh
  totalCost: z.number(),
  odometerReading: z.number(),
  station: z.string().nullable(),
  chargedAtHome: z.boolean(),
  note: z.string().nullable(),
  receipt: z.string().nullable(),          // PocketBase file field
  tripCounterPhoto: z.string().nullable(), // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const refuelingCreateSchema = refuelingSchema.omit({
  id: true, created: true, ownerId: true,
});

export type Refueling = z.infer<typeof refuelingSchema>;
export type RefuelingCreate = z.infer<typeof refuelingCreateSchema>;
```

**MaintenanceEvent** (PRD §7.1.3):
```ts
export const maintenanceEventSchema = z.object({
  id: MaintenanceEventId,
  vehicleId: VehicleId,
  date: z.string(),           // ISO date
  description: z.string(),
  cost: z.number(),
  note: z.string().nullable(),
  receipt: z.string().nullable(),  // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const maintenanceEventCreateSchema = maintenanceEventSchema.omit({
  id: true, created: true, ownerId: true,
});

export type MaintenanceEvent = z.infer<typeof maintenanceEventSchema>;
export type MaintenanceEventCreate = z.infer<typeof maintenanceEventCreateSchema>;
```

### Computed Metric Types (not stored in PocketBase)

```ts
export type VehicleMetrics = {
  allTimeEfficiency: number | null;
  currentYearEfficiency: number | null;
  rolling5Efficiency: number | null;
  ytdKmDriven: number;
  ytdFuelCost: number;
  avgFuelCostPerMonth: number | null;
  avgFuelCostPerDay: number | null;
  totalMaintenanceCost: number;
  totalVehicleCost: number;
  totalCostOfOwnership: number | null;
};
```

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] All schemas defined as Zod objects with correct field types
- [ ] Branded ID types: `VehicleId`, `RefuelingId`, `MaintenanceEventId`
- [ ] `vehicle.id` has type `VehicleId`, `refueling.vehicleId` has type `VehicleId`
- [ ] `fuelTypeSchema` restricts to `Petrol`, `Diesel`, `Electric`, `Hybrid`
- [ ] `vehicleStatusSchema` restricts to `active`, `sold`
- [ ] Property names match PocketBase field names exactly
- [ ] Create schemas omit `id`, `created`, `ownerId`
- [ ] Vehicle create schema also omits sale fields (`saleDate`, `salePrice`, `saleNote`)
- [ ] `refuelingSchema` has `chargedAtHome` as boolean (not nullable)
- [ ] `refuelingSchema` has two file fields: `receipt` and `tripCounterPhoto`
- [ ] Nullable fields use `.nullable()`
- [ ] `VehicleMetrics` computed type covers all metrics from PRD §7.2
- [ ] `schema.parse()` validates well-formed responses and rejects malformed data
- [ ] TypeScript compilation succeeds with strict mode
- [ ] All schemas and types re-exported from `src/types/index.ts`
- [ ] All tests pass and meet coverage target
- [ ] Zod schemas reject malformed PocketBase responses at runtime

## Testing Requirements
- **Test file**: `src/types/vehicle.test.ts` (co-located)
- **Approach**: Zod schema acceptance/rejection tests
- **Coverage target**: 100% of schema definitions
- Test each schema accepts valid PocketBase responses
- Test rejection of malformed data
- Test branded IDs (VehicleId, RefuelingId, MaintenanceEventId)
- Test `*Create` schemas omit `id`, `created`, `ownerId`
- **Critical**: Test nullable fields accept `null` — `type`, `make`, `model`, `licensePlate` must accept null (refinement fix C2)
- Test fuelType select accepts: Petrol, Diesel, Electric, Hybrid — rejects invalid
- Test status accepts: active, sold — rejects invalid

## Technical Notes
- Files to create: `src/types/vehicles.ts`, update `src/types/brands.ts` and `src/types/index.ts`
- `fuelType` drives unit labels (km/l vs km/kWh) and `chargedAtHome` relevance
- `photo`, `receipt`, `tripCounterPhoto` are PocketBase file field references (string paths)
- Sale fields on Vehicle are only populated when `status` is `sold`
- `VehicleMetrics` is a plain TypeScript type — computed in the calculation layer, not parsed from API
- `type` on Vehicle is an open string (not enum) per PRD — extensible for future vehicle types
- `status` uses `active | sold` (not `closed`) — intentional: vehicles are "sold", investment platforms are "closed". Different lifecycle terminology for different domains.
