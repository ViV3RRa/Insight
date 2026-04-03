import { z } from 'zod'

export const UserId = z.string().brand<'UserId'>()
export const PortfolioId = z.string().brand<'PortfolioId'>()
export const PlatformId = z.string().brand<'PlatformId'>()
export const DataPointId = z.string().brand<'DataPointId'>()
export const TransactionId = z.string().brand<'TransactionId'>()
export const ExchangeRateId = z.string().brand<'ExchangeRateId'>()
export const SettingsId = z.string().brand<'SettingsId'>()

export type UserId = z.infer<typeof UserId>
export type PortfolioId = z.infer<typeof PortfolioId>
export type PlatformId = z.infer<typeof PlatformId>
export type DataPointId = z.infer<typeof DataPointId>
export type TransactionId = z.infer<typeof TransactionId>
export type ExchangeRateId = z.infer<typeof ExchangeRateId>
export type SettingsId = z.infer<typeof SettingsId>
