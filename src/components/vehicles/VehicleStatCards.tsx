import { StatCard } from '@/components/shared/StatCard'
import { formatNumber, formatSignedNumber } from '@/utils/formatters'
import type { Vehicle, VehicleMetrics } from '@/types/vehicles'

interface VehicleStatCardsProps {
  vehicle: Vehicle
  metrics: VehicleMetrics
  priorYearEfficiency: number | null
}

const EM_DASH = '\u2014'

function formatMetric(value: number | null, decimals = 1): string {
  return value === null ? EM_DASH : formatNumber(value, decimals)
}

function VehicleStatCards({ vehicle, metrics, priorYearEfficiency }: VehicleStatCardsProps) {
  const efficiencyUnit = vehicle.fuelType === 'Electric' ? 'km/kWh' : 'km/l'
  const currentYear = new Date().getFullYear()
  const isSold = vehicle.status === 'sold'

  const hasPriorYear = priorYearEfficiency !== null && metrics.currentYearEfficiency !== null
  const diff = hasPriorYear
    ? metrics.currentYearEfficiency! - priorYearEfficiency!
    : null
  const yearTrend = diff !== null
    ? diff > 0 ? 'positive' as const : diff < 0 ? 'negative' as const : 'neutral' as const
    : undefined

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4 mb-6 lg:mb-8">
      <StatCard
        label="All-Time Eff."
        value={formatMetric(metrics.allTimeEfficiency)}
        sublabel={`${efficiencyUnit} avg`}
      />

      <StatCard
        label={`${currentYear} Efficiency`}
        value={formatMetric(metrics.currentYearEfficiency)}
        variant={hasPriorYear ? 'withBadge' : 'simple'}
        trend={yearTrend}
        badgeValue={diff !== null ? formatSignedNumber(diff, 1) : undefined}
      />

      <StatCard
        label="Last 5 Fills"
        value={formatMetric(metrics.rolling5Efficiency)}
        sublabel={`${efficiencyUnit} avg`}
      />

      <StatCard
        label="YTD Km"
        value={formatNumber(metrics.ytdKmDriven, 0)}
        sublabel="km driven"
      />

      <StatCard
        label="YTD Fuel Cost"
        value={formatNumber(metrics.ytdFuelCost, 0)}
        sublabel="DKK"
      />

      {isSold ? (
        <>
          <StatCard
            label="Total Cost"
            value={formatNumber(metrics.totalCostOfOwnership?.totalOperatingCost ?? 0, 0)}
            sublabel="DKK lifetime"
          />
          <StatCard
            label="Purchase→Sale"
            value={formatNumber(metrics.totalCostOfOwnership?.purchaseToSaleOffset ?? 0, 0)}
            variant="colored"
            trend={(metrics.totalCostOfOwnership?.purchaseToSaleOffset ?? 0) < 0 ? 'negative' : 'positive'}
            sublabel="DKK offset"
          />
        </>
      ) : (
        <>
          <StatCard
            label="Avg/Month"
            value={formatMetric(metrics.avgFuelCostPerMonth, 0)}
            sublabel="DKK fuel"
          />
          <StatCard
            label="Avg/Day"
            value={formatMetric(metrics.avgFuelCostPerDay)}
            sublabel="DKK fuel"
          />
        </>
      )}
    </div>
  )
}

export { VehicleStatCards }
export type { VehicleStatCardsProps }
