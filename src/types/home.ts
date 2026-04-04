import { z } from 'zod'
import { UserId, UtilityId, MeterReadingId, UtilityBillId } from './brands'

// --- Utility enums ---

export const utilityIconSchema = z.enum([
  'bolt',
  'droplet',
  'flame',
  'sun',
  'wind',
  'thermometer',
  'wifi',
  'trash',
])

export const utilityColorSchema = z.enum([
  'amber',
  'blue',
  'orange',
  'emerald',
  'violet',
  'rose',
  'cyan',
  'slate',
])

// --- Utility (PRD §5.1.1) ---

export const utilitySchema = z.object({
  id: UtilityId,
  name: z.string(),
  unit: z.string(),
  icon: utilityIconSchema,
  color: utilityColorSchema,
  ownerId: UserId,
  created: z.string().datetime(),
})

export const utilityCreateSchema = utilitySchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type Utility = z.infer<typeof utilitySchema>
export type UtilityCreate = z.infer<typeof utilityCreateSchema>
export type UtilityIcon = z.infer<typeof utilityIconSchema>
export type UtilityColor = z.infer<typeof utilityColorSchema>

// --- MeterReading (PRD §5.1.2) ---

export const meterReadingSchema = z.object({
  id: MeterReadingId,
  utilityId: UtilityId,
  value: z.number(),
  timestamp: z.string().datetime(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const meterReadingCreateSchema = meterReadingSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type MeterReading = z.infer<typeof meterReadingSchema>
export type MeterReadingCreate = z.infer<typeof meterReadingCreateSchema>

// --- UtilityBill (PRD §5.1.3) ---

export const utilityBillSchema = z.object({
  id: UtilityBillId,
  utilityId: UtilityId,
  amount: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  timestamp: z.string().datetime().nullable(),
  note: z.string().nullable(),
  attachment: z.string().nullable(),
  ownerId: UserId,
  created: z.string().datetime(),
})

export const utilityBillCreateSchema = utilityBillSchema.omit({
  id: true,
  created: true,
  ownerId: true,
})

export type UtilityBill = z.infer<typeof utilityBillSchema>
export type UtilityBillCreate = z.infer<typeof utilityBillCreateSchema>

// --- Computed metric types (plain TypeScript) ---

export type MonthlyConsumption = {
  month: string
  year: number
  consumption: number
  isInterpolated: boolean
}

export type MonthlyCost = {
  month: string
  year: number
  cost: number
}

export type UtilityYearlySummary = {
  year: number
  totalConsumption: number
  avgMonthlyConsumption: number
  consumptionChangePercent: number | null
  totalCost: number
  avgMonthlyCost: number
  avgCostPerUnit: number
  costChangePercent: number | null
}

export type UtilityMonthlySummary = {
  month: string
  year: number
  consumption: number
  consumptionChangePercent: number | null
  cost: number
  costPerUnit: number | null
  costChangePercent: number | null
}
