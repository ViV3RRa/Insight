import { z } from 'zod'

export const settingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  dateFormat: z.enum(['yyyy-MM-dd', 'dd/MM/yyyy']),
  theme: z.enum(['light', 'dark']),
  demoMode: z.boolean(),
  created: z.string(),
  updated: z.string(),
})

export const settingsCreateSchema = settingsSchema.omit({
  id: true,
  created: true,
  updated: true,
  userId: true,
})

export type Settings = z.infer<typeof settingsSchema>
export type SettingsCreate = z.infer<typeof settingsCreateSchema>
