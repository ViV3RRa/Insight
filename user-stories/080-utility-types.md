# US-080: Home (Utilities) TypeScript Types

## Story
As the Insight platform user, I want strongly typed data models for the Home (Utilities) domain so that all services and calculations have a reliable, self-documenting contract.

## Dependencies
- US-001: Project Scaffolding

## Requirements
- Add the following TypeScript types to `src/types/index.ts` (alongside existing types):

**Utility** (PRD §5.1.1):
- `id`: string (PocketBase auto-generated)
- `name`: string (e.g. "Electricity", "Water", "Heat")
- `unit`: string (e.g. "kWh", "m³", "MWh")
- `icon`: string (identifier from curated icon set: "bolt", "droplet", "flame", "sun", "wind", "thermometer", "wifi", "trash")
- `color`: string (preset palette color: "amber", "blue", "orange", "emerald", "violet", "rose", "cyan", "slate")
- `owner`: string (FK to users)
- `created`: string (ISO datetime)

**MeterReading** (PRD §5.1.2):
- `id`: string
- `utilityId`: string (FK to Utility)
- `value`: number (cumulative meter reading)
- `timestamp`: string (ISO datetime, defaults to now)
- `note`: string | null (optional, e.g. "meter replaced, reading reset")
- `attachment`: string | null (optional — PocketBase file field reference)
- `owner`: string
- `created`: string

**UtilityBill** (PRD §5.1.3):
- `id`: string
- `utilityId`: string (FK to Utility)
- `amount`: number (total billed amount in DKK)
- `periodStart`: string (ISO date — first day bill covers)
- `periodEnd`: string (ISO date — last day bill covers)
- `timestamp`: string (ISO datetime — date bill was received/registered)
- `note`: string | null (optional)
- `attachment`: string | null (optional — PocketBase file field)
- `owner`: string
- `created`: string

- Define union literal types for reuse:
  - `UtilityIcon = "bolt" | "droplet" | "flame" | "sun" | "wind" | "thermometer" | "wifi" | "trash"`
  - `UtilityColor = "amber" | "blue" | "orange" | "emerald" | "violet" | "rose" | "cyan" | "slate"`

- Define creation/input types (omitting server-generated fields):
  - `UtilityCreate`: Omit<Utility, "id" | "created" | "owner">
  - `MeterReadingCreate`: Omit<MeterReading, "id" | "created" | "owner">
  - `UtilityBillCreate`: Omit<UtilityBill, "id" | "created" | "owner">

- Define computed metric types:
  - `MonthlyConsumption = { month: string; year: number; consumption: number; isInterpolated: boolean }`
  - `MonthlyCost = { month: string; year: number; cost: number }`
  - `UtilityYearlySummary = { year: number; totalConsumption: number; avgMonthlyConsumption: number; consumptionChangePercent: number | null; totalCost: number; avgMonthlyCost: number; avgCostPerUnit: number; costChangePercent: number | null }`
  - `UtilityMonthlySummary = { month: string; year: number; consumption: number; consumptionChangePercent: number | null; cost: number; costPerUnit: number | null; costChangePercent: number | null }`

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `Utility` type includes all fields from PRD §5.1.1 plus `owner`
- [ ] `Utility.icon` is restricted to the curated icon set union type
- [ ] `Utility.color` is restricted to the preset palette union type
- [ ] `MeterReading` type includes all fields from PRD §5.1.2 plus `owner`
- [ ] `MeterReading.value` is a number (cumulative reading)
- [ ] `UtilityBill` type includes all fields from PRD §5.1.3 plus `owner`
- [ ] `UtilityBill.periodStart` and `periodEnd` are strings (ISO dates)
- [ ] All union literal types (`UtilityIcon`, `UtilityColor`) are exported
- [ ] Creation types omit id, created, and owner fields
- [ ] Computed metric types defined for monthly consumption, monthly cost, yearly and monthly summaries
- [ ] TypeScript compilation succeeds with strict mode

## Technical Notes
- File to modify: `src/types/index.ts`
- Use `type` (not `interface`) for consistency with existing investment types (US-041)
- All optional fields use `| null` rather than `?` to match PocketBase API response patterns
- PocketBase returns ISO string dates, so all datetime fields are `string`
- The `owner` field on every type enables data isolation via PocketBase filter rules
- Computed metric types are used by calculation utilities and UI components but are not stored in PocketBase
