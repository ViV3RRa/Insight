import type { FuelType } from '@/types/vehicles'

const fuelTypeClasses: Record<FuelType, string> = {
  Petrol:
    'bg-orange-100 text-orange-700 border-orange-200/80 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/60',
  Diesel:
    'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/60',
  Electric:
    'bg-blue-50 text-blue-600 border-blue-200/70 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/60',
  Hybrid:
    'bg-emerald-50 text-emerald-600 border-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/60',
}

interface FuelTypeBadgeProps {
  fuelType: FuelType
  className?: string
}

function FuelTypeBadge({ fuelType, className = '' }: FuelTypeBadgeProps) {
  const colorClasses = fuelTypeClasses[fuelType] ?? fuelTypeClasses.Petrol

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${colorClasses} ${className}`.trim()}
    >
      {fuelType}
    </span>
  )
}

export { FuelTypeBadge }
export type { FuelTypeBadgeProps }
