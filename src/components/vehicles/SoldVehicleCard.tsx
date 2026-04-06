import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FuelTypeBadge } from '@/components/shared/FuelTypeBadge'
import { formatNumber, formatHumanDate } from '@/utils/formatters'
import type { Vehicle, TotalCostOfOwnership } from '@/types/vehicles'

interface SoldVehicleCardProps {
  vehicle: Vehicle
  totalCostOfOwnership: TotalCostOfOwnership | null
  allTimeEfficiency: number | null
  totalKmDriven: number
}

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

function SoldVehicleCard({ vehicle, totalCostOfOwnership, allTimeEfficiency, totalKmDriven }: SoldVehicleCardProps) {
  const vehicleType = vehicle.type === 'Motorcycle' ? 'Motorcycle' : 'Car'
  const efficiencyUnit = vehicle.fuelType === 'Electric' ? 'km/kWh' : 'km/l'

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark block hover:shadow-md dark:hover:shadow-card-dark transition-all cursor-pointer group overflow-hidden opacity-60 hover:opacity-90"
    >
      <div className="h-40 bg-gradient-to-br from-base-100 to-base-150 dark:from-base-800 dark:to-base-750 relative flex items-center justify-center">
        {vehicleType === 'Car' ? (
          <CarSilhouette className="w-24 h-24 text-base-200 dark:text-base-700" />
        ) : (
          <MotorcycleSilhouette className="w-24 h-24 text-base-200 dark:text-base-700" />
        )}

        <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium rounded-full bg-base-100 text-base-500 dark:bg-base-700 dark:text-base-400 border border-base-200 dark:border-base-600">
          Sold
        </span>

        <FuelTypeBadge fuelType={vehicle.fuelType} className="absolute top-3 right-3" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">{vehicle.name}</div>
            <div className="text-xs text-base-400 mt-0.5">
              {vehicle.make} {vehicle.model} &middot; {vehicle.year} &middot; Sold {vehicle.saleDate ? formatHumanDate(vehicle.saleDate) : '—'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-base-200 dark:text-base-600 group-hover:text-base-400 transition-colors mt-0.5 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">All-Time Eff.</div>
            <div className="font-mono-data text-xl font-medium">
              {allTimeEfficiency != null ? formatNumber(allTimeEfficiency, 1) : '—'}
            </div>
            <div className="text-xs text-base-400">{efficiencyUnit}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">Km Driven</div>
            <div className="font-mono-data text-xl font-medium">
              {formatNumber(totalKmDriven, 0)}
            </div>
            <div className="text-xs text-base-400">total km</div>
          </div>
        </div>

        <div className="border-t border-base-100 dark:border-base-700 pt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-base-300 dark:text-base-500 mb-0.5">Lifetime Fuel</div>
            <div className="font-mono-data font-medium">
              {totalCostOfOwnership != null ? `${formatNumber(totalCostOfOwnership.lifetimeFuelCost, 0)} DKK` : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-base-300 dark:text-base-500 mb-0.5">Total Cost</div>
            <div className="font-mono-data font-medium">
              {totalCostOfOwnership != null ? `${formatNumber(totalCostOfOwnership.totalOperatingCost, 0)} DKK` : '—'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export { SoldVehicleCard }
export type { SoldVehicleCardProps }
