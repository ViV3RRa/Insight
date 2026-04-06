import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FuelTypeBadge } from '@/components/shared/FuelTypeBadge'
import { ChangeIndicator } from '@/components/shared/ChangeIndicator'
import { formatNumber, formatRecentUpdate } from '@/utils/formatters'
import type { Vehicle, VehicleMetrics } from '@/types/vehicles'

interface VehicleCardProps {
  vehicle: Vehicle
  metrics: VehicleMetrics
  priorYearEfficiency: number | null
  lastRefuelingDate: string | null
}

const gradientClasses = {
  Car: 'from-sky-50 to-blue-100 dark:from-sky-950/60 dark:to-blue-900/40',
  Motorcycle: 'from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/40',
} as const

const silhouetteClasses = {
  Car: 'text-sky-200 dark:text-sky-900',
  Motorcycle: 'text-slate-200 dark:text-slate-700',
} as const

function CarSilhouette({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.8"
        d="M19 17H5v-7l3-6h8l3 6v7zm0 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0M9 17a2 2 0 11-4 0m4 0a2 2 0 10-4 0"
      />
    </svg>
  )
}

function MotorcycleSilhouette({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="0.8"
        d="M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM5 15h3l3-6h3l3 3 3 2-1 1M8 9l2 6"
      />
    </svg>
  )
}

function VehicleCard({ vehicle, metrics, priorYearEfficiency, lastRefuelingDate }: VehicleCardProps) {
  const currentYear = new Date().getFullYear()
  const vehicleType = vehicle.type === 'Motorcycle' ? 'Motorcycle' : 'Car'
  const efficiencyUnit = vehicle.fuelType === 'Electric' ? 'km/kWh' : 'km/l'

  const gradient = gradientClasses[vehicleType]
  const silhouetteColor = silhouetteClasses[vehicleType]

  const changePercent =
    priorYearEfficiency != null && metrics.currentYearEfficiency != null
      ? ((metrics.currentYearEfficiency - priorYearEfficiency) / priorYearEfficiency) * 100
      : null

  const changeDiff =
    priorYearEfficiency != null && metrics.currentYearEfficiency != null
      ? metrics.currentYearEfficiency - priorYearEfficiency
      : null

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark block hover:shadow-lg dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer group overflow-hidden"
    >
      <div className={`h-40 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
        {vehicleType === 'Car' ? (
          <CarSilhouette className={`w-24 h-24 ${silhouetteColor}`} />
        ) : (
          <MotorcycleSilhouette className={`w-24 h-24 ${silhouetteColor}`} />
        )}
        <FuelTypeBadge fuelType={vehicle.fuelType} className="absolute top-3 right-3" />
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/60 dark:bg-base-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-base-600 dark:text-base-300" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">{vehicle.name}</div>
            <div className="text-xs text-base-400 mt-0.5">
              {vehicle.make} {vehicle.model} &middot; {vehicle.year} &middot; {vehicle.licensePlate}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-base-200 dark:text-base-600 group-hover:text-base-400 transition-colors mt-0.5 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">
              {currentYear} Efficiency
            </div>
            <div className="font-mono-data text-xl font-medium">
              {metrics.currentYearEfficiency != null ? formatNumber(metrics.currentYearEfficiency, 1) : '—'}
            </div>
            <div className="text-xs text-base-400">{efficiencyUnit}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">
              YTD Km
            </div>
            <div className="font-mono-data text-xl font-medium">
              {formatNumber(metrics.ytdKmDriven, 0)}
            </div>
            <div className="text-xs text-base-400">km driven</div>
          </div>
        </div>

        {changePercent != null && changeDiff != null && (
          <div className="mb-3">
            <ChangeIndicator
              value={changePercent}
              formattedValue={`${changeDiff > 0 ? '+' : ''}${formatNumber(changeDiff, 1)} ${efficiencyUnit} vs ${currentYear - 1}`}
            />
          </div>
        )}

        <div className="border-t border-base-100 dark:border-base-700 pt-3 grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-base-300 dark:text-base-500 mb-0.5">YTD Fuel</div>
            <div className="font-mono-data font-medium">{formatNumber(metrics.ytdFuelCost, 0)} kr</div>
          </div>
          <div>
            <div className="text-base-300 dark:text-base-500 mb-0.5">YTD Total</div>
            <div className="font-mono-data font-medium">{formatNumber(metrics.totalVehicleCost, 0)} kr</div>
          </div>
          <div className="text-right">
            <div className="text-base-300 dark:text-base-500 mb-0.5">Last fill</div>
            <div className="font-mono-data">
              {lastRefuelingDate != null ? formatRecentUpdate(lastRefuelingDate) : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export { VehicleCard }
export type { VehicleCardProps }
