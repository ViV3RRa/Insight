import { useSettingsStore } from '@/stores/settingsStore'
import {
  getDemoPortfolios,
  getDemoPlatforms,
  getDemoDataPoints,
  getDemoTransactions,
  getDemoUtilities,
  getDemoMeterReadings,
  getDemoUtilityBills,
  getDemoVehicles,
  getDemoRefuelings,
  getDemoMaintenanceEvents,
} from '@/utils/demoData'
import type { Portfolio, Platform, DataPoint, Transaction } from '@/types/investment'
import type { Utility, MeterReading, UtilityBill } from '@/types/home'
import type { Vehicle, Refueling, MaintenanceEvent } from '@/types/vehicles'

/** Mimics TanStack Query's return shape for seamless consumer swap */
type DemoQueryResult<T> = {
  data: T | undefined
  isLoading: false
  error: null
}

function demoResult<T>(data: T): DemoQueryResult<T> {
  return { data, isLoading: false, error: null }
}

export function useDemoPortfolios(): DemoQueryResult<Portfolio[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoPortfolios())
}

export function useDemoPlatforms(portfolioId: string): DemoQueryResult<Platform[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(
    getDemoPlatforms().filter((p) => p.portfolioId === portfolioId),
  )
}

export function useDemoDataPoints(platformId: string): DemoQueryResult<DataPoint[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoDataPoints(platformId))
}

export function useDemoTransactions(platformId: string): DemoQueryResult<Transaction[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoTransactions(platformId))
}

export function useDemoUtilities(): DemoQueryResult<Utility[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoUtilities())
}

export function useDemoMeterReadings(utilityId: string): DemoQueryResult<MeterReading[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoMeterReadings(utilityId))
}

export function useDemoUtilityBills(utilityId: string): DemoQueryResult<UtilityBill[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoUtilityBills(utilityId))
}

export function useDemoVehicles(): DemoQueryResult<Vehicle[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoVehicles())
}

export function useDemoRefuelings(vehicleId: string): DemoQueryResult<Refueling[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoRefuelings(vehicleId))
}

export function useDemoMaintenanceEvents(vehicleId: string): DemoQueryResult<MaintenanceEvent[]> {
  const demoMode = useSettingsStore((s) => s.demoMode)
  if (!demoMode) return { data: undefined, isLoading: false, error: null }
  return demoResult(getDemoMaintenanceEvents(vehicleId))
}
