# US-041: Investment Zod Schemas & Branded Types

## Story
As the Insight platform user, I want strongly typed, runtime-validated data models for the investment domain so that all services and calculations have a reliable contract with branded IDs that prevent cross-entity ID confusion.

## Dependencies
- US-001: Project Scaffolding (zod must be installed)

## Requirements
- Define Zod schemas in `src/types/investment.ts` and re-export from `src/types/index.ts`
- All schemas double as runtime validators — service functions parse PocketBase responses through them
- **Property names must match PocketBase collection field names exactly** — no mapping layer
- Relation fields use `Id` suffix (e.g., `platformId`, `portfolioId`, `ownerId`)

### Branded ID Types

Define branded ID types in `src/types/brands.ts` (shared across all domains):

```ts
import { z } from 'zod';

export const UserId = z.string().brand<'UserId'>();
export const PortfolioId = z.string().brand<'PortfolioId'>();
export const PlatformId = z.string().brand<'PlatformId'>();
export const DataPointId = z.string().brand<'DataPointId'>();
export const TransactionId = z.string().brand<'TransactionId'>();
export const ExchangeRateId = z.string().brand<'ExchangeRateId'>();
export const SettingsId = z.string().brand<'SettingsId'>();

export type UserId = z.infer<typeof UserId>;
export type PortfolioId = z.infer<typeof PortfolioId>;
export type PlatformId = z.infer<typeof PlatformId>;
export type DataPointId = z.infer<typeof DataPointId>;
export type TransactionId = z.infer<typeof TransactionId>;
export type ExchangeRateId = z.infer<typeof ExchangeRateId>;
export type SettingsId = z.infer<typeof SettingsId>;
```

### Schemas

**Portfolio** (PRD §6.1.1):
```ts
export const portfolioSchema = z.object({
  id: PortfolioId,
  name: z.string(),
  ownerName: z.string(),
  isDefault: z.boolean(),
  ownerId: UserId,
  created: z.string().datetime(),
});

export const portfolioCreateSchema = portfolioSchema.omit({
  id: true, created: true, ownerId: true,
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type PortfolioCreate = z.infer<typeof portfolioCreateSchema>;
```

**Platform** (PRD §6.1.2):
```ts
export const platformTypeSchema = z.enum(['investment', 'cash']);
export const platformStatusSchema = z.enum(['active', 'closed']);

export const platformSchema = z.object({
  id: PlatformId,
  portfolioId: PortfolioId,
  name: z.string(),
  icon: z.string(),          // PocketBase file field reference
  type: platformTypeSchema,
  currency: z.string(),      // "DKK", "EUR", etc.
  status: platformStatusSchema,
  closedDate: z.string().nullable(),
  closureNote: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
});

export const platformCreateSchema = platformSchema.omit({
  id: true, created: true, ownerId: true, closedDate: true, closureNote: true,
});

export type Platform = z.infer<typeof platformSchema>;
export type PlatformCreate = z.infer<typeof platformCreateSchema>;
export type PlatformType = z.infer<typeof platformTypeSchema>;
export type PlatformStatus = z.infer<typeof platformStatusSchema>;
```

**DataPoint** (PRD §6.1.3):
```ts
export const dataPointSchema = z.object({
  id: DataPointId,
  platformId: PlatformId,
  value: z.number(),          // Native currency
  timestamp: z.string().datetime(),
  isInterpolated: z.boolean(),
  note: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
});

export const dataPointCreateSchema = dataPointSchema.omit({
  id: true, created: true, ownerId: true,
});

export type DataPoint = z.infer<typeof dataPointSchema>;
export type DataPointCreate = z.infer<typeof dataPointCreateSchema>;
```

**Transaction** (PRD §6.1.4):
```ts
export const transactionTypeSchema = z.enum(['deposit', 'withdrawal']);

export const transactionSchema = z.object({
  id: TransactionId,
  platformId: PlatformId,
  type: transactionTypeSchema,
  amount: z.number(),         // Always positive; sign from type
  exchangeRate: z.number().nullable(),
  timestamp: z.string().datetime(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),  // PocketBase file field
  ownerId: UserId,
  created: z.string().datetime(),
});

export const transactionCreateSchema = transactionSchema.omit({
  id: true, created: true, ownerId: true,
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionCreate = z.infer<typeof transactionCreateSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
```

**ExchangeRate** (PRD §4.1.1):
```ts
export const exchangeRateSourceSchema = z.enum(['auto', 'manual']);

export const exchangeRateSchema = z.object({
  id: ExchangeRateId,
  fromCurrency: z.string(),
  toCurrency: z.string(),     // Always "DKK" for now
  rate: z.number(),
  date: z.string(),           // ISO date
  source: exchangeRateSourceSchema,
  ownerId: UserId,
  created: z.string().datetime(),
});

export const exchangeRateCreateSchema = exchangeRateSchema.omit({
  id: true, created: true, ownerId: true,
});

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;
export type ExchangeRateCreate = z.infer<typeof exchangeRateCreateSchema>;
export type ExchangeRateSource = z.infer<typeof exchangeRateSourceSchema>;
```

**Settings** (PRD §3.8, §10):
```ts
export const dateFormatSchema = z.enum(['YYYY-MM-DD', 'DD/MM/YYYY']);
export const themeSchema = z.enum(['light', 'dark']);

export const settingsSchema = z.object({
  id: SettingsId,
  userId: UserId,
  dateFormat: dateFormatSchema,
  theme: themeSchema,
  demoMode: z.boolean(),
  created: z.string().datetime(),
});

export const settingsCreateSchema = settingsSchema.omit({
  id: true, created: true,
});

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsCreate = z.infer<typeof settingsCreateSchema>;
export type DateFormat = z.infer<typeof dateFormatSchema>;
export type Theme = z.infer<typeof themeSchema>;
```

**Currency type** (extensible):
```ts
export const currencySchema = z.string(); // "DKK", "EUR", etc.
export type Currency = z.infer<typeof currencySchema>;
```

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] All schemas defined as Zod objects with correct field types
- [ ] Branded ID types: `PortfolioId`, `PlatformId`, `DataPointId`, `TransactionId`, `ExchangeRateId`, `SettingsId`, `UserId`
- [ ] `portfolio.id` has type `PortfolioId`, not `string`
- [ ] `dataPoint.platformId` has type `PlatformId`, not `string`
- [ ] Cannot pass a `PortfolioId` where a `PlatformId` is expected (compile error)
- [ ] Property names match PocketBase field names exactly (relation fields use `Id` suffix)
- [ ] Enum schemas for `PlatformType`, `PlatformStatus`, `TransactionType`, `ExchangeRateSource`, `DateFormat`, `Theme`
- [ ] Create schemas omit `id`, `created`, and `ownerId`
- [ ] All types inferred from schemas via `z.infer<>`
- [ ] Nullable fields use `.nullable()` (not `.optional()`) to match PocketBase response shape
- [ ] `schema.parse(pocketbaseResponse)` successfully validates a well-formed response
- [ ] `schema.parse(malformedData)` throws `ZodError` with descriptive message
- [ ] TypeScript compilation succeeds with strict mode
- [ ] All schemas and types are re-exported from `src/types/index.ts`
- [ ] All schema tests pass and meet 100% coverage of schema definitions

## Testing Requirements
- **Test file**: `src/types/investment.test.ts` (co-located)
- **Approach**: Zod schema acceptance/rejection tests
- **Coverage target**: 100% of schema definitions
- Test that each schema accepts valid PocketBase response payloads
- Test that each schema rejects malformed data (missing required fields, wrong types) — expect ZodError
- Test branded ID types are produced by schema parsing (PortfolioId, PlatformId, etc.)
- Test `*Create` schemas correctly omit `id`, `created`, `ownerId`
- Test nullable fields accept both `null` and actual values
- Test enum/select fields reject invalid option values
- Test platformStatusSchema accepts "active" and "closed"

## Technical Notes
- Files to create: `src/types/brands.ts`, `src/types/investment.ts`, re-export from `src/types/index.ts`
- Branded types use Zod's `.brand<>()` method — these are compile-time only, zero runtime cost
- Use `.nullable()` for optional PocketBase fields (PocketBase returns `null`, not `undefined`)
- Use `.datetime()` for timestamp fields to get basic ISO format validation
- The `icon` field on Platform is a PocketBase file field reference (string path) — not the image bytes
- The `attachment` field on Transaction is also a file field reference
- Service functions (US-042–046) will call `schema.parse()` on every PocketBase response before returning
- The `Currency` type is an open string (not enum) per PRD §4.4 — extensible for future currencies
- `platformStatusSchema` uses `active | closed` (not `sold`) — intentional: investment platforms are "closed", vehicles are "sold". Different lifecycle terminology for different domains.
- `Platform.icon` is a PocketBase **file field** (image upload) — get URL via `pb.files.getUrl()`. Not to be confused with `Utility.icon` (US-080) which is a plain text identifier for a Lucide icon.
