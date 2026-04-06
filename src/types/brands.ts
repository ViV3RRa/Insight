import { z } from 'zod'

export const UserId = z.string().brand<'UserId'>()
export const PortfolioId = z.string().brand<'PortfolioId'>()
export const PlatformId = z.string().brand<'PlatformId'>()
export const DataPointId = z.string().brand<'DataPointId'>()
export const TransactionId = z.string().brand<'TransactionId'>()
export const ExchangeRateId = z.string().brand<'ExchangeRateId'>()
export const SettingsId = z.string().brand<'SettingsId'>()
export const UtilityId = z.string().brand<'UtilityId'>()
export const MeterReadingId = z.string().brand<'MeterReadingId'>()
export const UtilityBillId = z.string().brand<'UtilityBillId'>()
export const VehicleId = z.string().brand<'VehicleId'>()
export const RefuelingId = z.string().brand<'RefuelingId'>()
export const MaintenanceEventId = z.string().brand<'MaintenanceEventId'>()

export type UserId = z.infer<typeof UserId>
export type PortfolioId = z.infer<typeof PortfolioId>
export type PlatformId = z.infer<typeof PlatformId>
export type DataPointId = z.infer<typeof DataPointId>
export type TransactionId = z.infer<typeof TransactionId>
export type ExchangeRateId = z.infer<typeof ExchangeRateId>
export type SettingsId = z.infer<typeof SettingsId>
export type UtilityId = z.infer<typeof UtilityId>
export type MeterReadingId = z.infer<typeof MeterReadingId>
export type UtilityBillId = z.infer<typeof UtilityBillId>
export type VehicleId = z.infer<typeof VehicleId>
export type RefuelingId = z.infer<typeof RefuelingId>
export type MaintenanceEventId = z.infer<typeof MaintenanceEventId>
