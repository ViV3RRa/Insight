# US-080: Home (Utilities) Zod Schemas & Branded Types

## Story
As the Insight platform user, I want strongly typed, runtime-validated data models for the Home (Utilities) domain so that all services and calculations have a reliable contract with branded IDs.

## Dependencies
- US-001: Project Scaffolding (zod must be installed)
- US-041: Investment Zod Schemas (branded ID base types in `src/types/brands.ts`)

## Requirements
- Define Zod schemas in `src/types/home.ts` and re-export from `src/types/index.ts`
- Add branded ID types to `src/types/brands.ts`
- **Property names must match PocketBase collection field names exactly**

### Branded ID Types

Add to `src/types/brands.ts`:

```ts
export const UtilityId = z.string().brand<'UtilityId'>();
export const MeterReadingId = z.string().brand<'MeterReadingId'>();
export const UtilityBillId = z.string().brand<'UtilityBillId'>();

export type UtilityId = z.infer<typeof UtilityId>;
export type MeterReadingId = z.infer<typeof MeterReadingId>;
export type UtilityBillId = z.infer<typeof UtilityBillId>;
```

### Schemas

**Utility** (PRD §5.1.1):
```ts
export const utilityIconSchema = z.enum([
  'bolt', 'droplet', 'flame', 'sun', 'wind', 'thermometer', 'wifi', 'trash',
]);
export const utilityColorSchema = z.enum([
  'amber', 'blue', 'orange', 'emerald', 'violet', 'rose', 'cyan', 'slate',
]);

export const utilitySchema = z.object({
  id: UtilityId,
  name: z.string(),
  unit: z.string(),           // "kWh", "m³", "MWh"
  icon: utilityIconSchema,
  color: utilityColorSchema,
  ownerId: UserId,
  created: z.string().datetime(),
});

export const utilityCreateSchema = utilitySchema.omit({
  id: true, created: true, ownerId: true,
});

export type Utility = z.infer<typeof utilitySchema>;
export type UtilityCreate = z.infer<typeof utilityCreateSchema>;
export type UtilityIcon = z.infer<typeof utilityIconSchema>;
export type UtilityColor = z.infer<typeof utilityColorSchema>;
```

**MeterReading** (PRD §5.1.2):
```ts
export const meterReadingSchema = z.object({
  id: MeterReadingId,
  utilityId: UtilityId,
  value: z.number(),          // Cumulative reading
  timestamp: z.string().datetime(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),  // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const meterReadingCreateSchema = meterReadingSchema.omit({
  id: true, created: true, ownerId: true,
});

export type MeterReading = z.infer<typeof meterReadingSchema>;
export type MeterReadingCreate = z.infer<typeof meterReadingCreateSchema>;
```

**UtilityBill** (PRD §5.1.3):
```ts
export const utilityBillSchema = z.object({
  id: UtilityBillId,
  utilityId: UtilityId,
  amount: z.number(),         // Total billed DKK
  periodStart: z.string(),    // ISO date
  periodEnd: z.string(),      // ISO date
  timestamp: z.string().datetime().nullable(), // Date received
  note: z.string().nullable(),
  attachment: z.string().nullable(),  // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const utilityBillCreateSchema = utilityBillSchema.omit({
  id: true, created: true, ownerId: true,
});

export type UtilityBill = z.infer<typeof utilityBillSchema>;
export type UtilityBillCreate = z.infer<typeof utilityBillCreateSchema>;
```

### Computed Metric Types (not stored in PocketBase)

These remain plain TypeScript types since they're derived in the calculation layer, not parsed from API responses:

```ts
export type MonthlyConsumption = {
  month: string;
  year: number;
  consumption: number;
  isInterpolated: boolean;
};

export type MonthlyCost = {
  month: string;
  year: number;
  cost: number;
};

export type UtilityYearlySummary = {
  year: number;
  totalConsumption: number;
  avgMonthlyConsumption: number;
  consumptionChangePercent: number | null;
  totalCost: number;
  avgMonthlyCost: number;
  avgCostPerUnit: number;
  costChangePercent: number | null;
};

export type UtilityMonthlySummary = {
  month: string;
  year: number;
  consumption: number;
  consumptionChangePercent: number | null;
  cost: number;
  costPerUnit: number | null;
  costChangePercent: number | null;
};
```

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] All schemas defined as Zod objects with correct field types
- [ ] Branded ID types: `UtilityId`, `MeterReadingId`, `UtilityBillId`
- [ ] `utility.id` has type `UtilityId`, `meterReading.utilityId` has type `UtilityId`
- [ ] `utilityIconSchema` restricts to the 8 curated icon identifiers
- [ ] `utilityColorSchema` restricts to the 8 palette colors
- [ ] Property names match PocketBase field names exactly
- [ ] Create schemas omit `id`, `created`, `ownerId`
- [ ] Nullable fields use `.nullable()`
- [ ] Computed metric types defined for consumption, cost, yearly and monthly summaries
- [ ] `schema.parse()` validates well-formed responses and rejects malformed data
- [ ] TypeScript compilation succeeds with strict mode
- [ ] All schemas and types re-exported from `src/types/index.ts`
- [ ] All tests pass and meet coverage target
- [ ] Schema parse/reject behavior verified by tests for every exported schema

## Testing Requirements
- **Test file**: `src/types/home.test.ts` (co-located)
- **Approach**: Zod schema acceptance/rejection tests
- **Coverage target**: 100% of schema definitions
- Test each schema accepts valid PocketBase responses
- Test rejection of malformed data (missing required fields, wrong types)
- Test branded IDs (UtilityId, MeterReadingId, UtilityBillId)
- Test `*Create` schemas omit `id`, `created`, `ownerId`
- Test nullable fields accept both `null` and actual values
- Test icon/color values are valid text fields

## Technical Notes
- Files to create: `src/types/home.ts`, update `src/types/brands.ts` and `src/types/index.ts`
- `icon` and `color` on Utility use Zod enums — validated both at parse time and at compile time
- Computed metric types are plain TypeScript (not Zod) since they're never parsed from API responses
- `periodStart` and `periodEnd` on UtilityBill use `z.string()` (ISO date, not datetime)
- `timestamp` on UtilityBill is nullable — it defaults to now in the frontend, not in the schema
- `Utility.icon` is a **text string** identifier (e.g., "bolt", "droplet") mapped to Lucide icons in the frontend. Not to be confused with `Platform.icon` (US-041) which is a PocketBase file upload field.
