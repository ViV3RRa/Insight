import { z } from 'zod'
import {
  UserId,
  PortfolioId,
  PlatformId,
  DataPointId,
  TransactionId,
  ExchangeRateId,
} from './brands'

// --- Currency ---

export const currencySchema = z.string()
export type Currency = z.infer<typeof currencySchema>

// --- Portfolio (PRD §6.1.1) ---

export const portfolioSchema = z.object({
  id: PortfolioId,
  name: z.string(),
  ownerName: z.string(),
  isDefault: z.boolean(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const portfolioCreateSchema = portfolioSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type Portfolio = z.infer<typeof portfolioSchema>
export type PortfolioCreate = z.infer<typeof portfolioCreateSchema>

// --- Platform (PRD §6.1.2) ---

export const platformTypeSchema = z.enum(['investment', 'cash'])
export const platformStatusSchema = z.enum(['active', 'closed'])

export const platformSchema = z.object({
  id: PlatformId,
  portfolioId: PortfolioId,
  name: z.string(),
  icon: z.string(),
  type: platformTypeSchema,
  currency: z.string(),
  status: platformStatusSchema,
  closedDate: z.string().nullable(),
  closureNote: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const platformCreateSchema = platformSchema.omit({
  id: true,
  created: true,
  ownerId: true,
  closedDate: true,
  closureNote: true,
})

export type Platform = z.infer<typeof platformSchema>
export type PlatformCreate = z.infer<typeof platformCreateSchema>
export type PlatformType = z.infer<typeof platformTypeSchema>
export type PlatformStatus = z.infer<typeof platformStatusSchema>

// --- DataPoint (PRD §6.1.3) ---

export const dataPointSchema = z.object({
  id: DataPointId,
  platformId: PlatformId,
  value: z.number(),
  timestamp: z.string().datetime(),
  isInterpolated: z.boolean(),
  note: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const dataPointCreateSchema = dataPointSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type DataPoint = z.infer<typeof dataPointSchema>
export type DataPointCreate = z.infer<typeof dataPointCreateSchema>

// --- Transaction (PRD §6.1.4) ---

export const transactionTypeSchema = z.enum(['deposit', 'withdrawal'])

export const transactionSchema = z.object({
  id: TransactionId,
  platformId: PlatformId,
  type: transactionTypeSchema,
  amount: z.number(),
  exchangeRate: z.number().nullable(),
  timestamp: z.string().datetime(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const transactionCreateSchema = transactionSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type Transaction = z.infer<typeof transactionSchema>
export type TransactionCreate = z.infer<typeof transactionCreateSchema>
export type TransactionType = z.infer<typeof transactionTypeSchema>

// --- ExchangeRate (PRD §4.1.1) ---

export const exchangeRateSourceSchema = z.enum(['auto', 'manual'])

export const exchangeRateSchema = z.object({
  id: ExchangeRateId,
  fromCurrency: z.string(),
  toCurrency: z.string(),
  rate: z.number(),
  date: z.string(),
  source: exchangeRateSourceSchema,
  ownerId: UserId,
  created: z.string().datetime(),
})

export const exchangeRateCreateSchema = exchangeRateSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type ExchangeRate = z.infer<typeof exchangeRateSchema>
export type ExchangeRateCreate = z.infer<typeof exchangeRateCreateSchema>
export type ExchangeRateSource = z.infer<typeof exchangeRateSourceSchema>
