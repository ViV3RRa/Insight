import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { FuelTypeBadge } from '@/components/shared/FuelTypeBadge'
import { DropdownSwitcher } from '@/components/shared/DropdownSwitcher'
import { formatHumanDate, formatNumber } from '@/utils/formatters'
import type { Vehicle } from '@/types/vehicles'
import type { DropdownItem, DropdownSection } from '@/components/shared/DropdownSwitcher'

interface VehicleDetailHeaderProps {
  vehicle: Vehicle
  allVehicles: Vehicle[]
  onSelectVehicle: (id: string) => void
  onAddRefueling: () => void
  onAddMaintenance: () => void
  onEditVehicle: () => void
}

const vehicleGradients: Record<string, { bg: string; silhouette: string }> = {
  Car: {
    bg: 'from-sky-50 to-blue-100 dark:from-sky-950/60 dark:to-blue-900/40',
    silhouette: 'text-sky-200 dark:text-sky-900',
  },
  Motorcycle: {
    bg: 'from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/40',
    silhouette: 'text-slate-200 dark:text-slate-700',
  },
}

const defaultGradient = vehicleGradients.Car

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

function VehicleDetailHeader({
  vehicle,
  allVehicles,
  onSelectVehicle,
  onAddRefueling,
  onAddMaintenance,
  onEditVehicle,
}: VehicleDetailHeaderProps) {
  const navigate = useNavigate()

  const switcherSections: DropdownSection[] = [
    { key: 'active', label: 'Active' },
    { key: 'sold', label: 'Sold' },
  ]

  const switcherItems: DropdownItem[] = allVehicles.map((v) => ({
    id: v.id,
    name: v.name,
    section: v.status === 'active' ? 'active' : 'sold',
  }))

  const gradient = (vehicle.type ? vehicleGradients[vehicle.type] : undefined) ?? defaultGradient!
  const isMotorcycle = vehicle.type === 'Motorcycle'

  return (
    <>
      {/* Desktop switcher bar + action buttons */}
      <div className="hidden lg:flex items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vehicles')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 shadow-card dark:shadow-card-dark flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 hover:border-base-300 dark:hover:border-base-500 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <DropdownSwitcher
            currentId={vehicle.id}
            items={switcherItems}
            sections={switcherSections}
            onSelect={onSelectVehicle}
            overviewHref="/vehicles"
            overviewLabel="All Vehicles"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEditVehicle}
            className="px-3 py-2 text-sm text-base-500 dark:text-base-400 hover:text-base-700 dark:hover:text-base-200 transition-colors flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <Button variant="secondary" size="sm" onClick={onAddRefueling}>
            + Add Refueling
          </Button>
          <Button variant="primary" size="sm" onClick={onAddMaintenance}>
            + Add Maintenance
          </Button>
        </div>
      </div>

      {/* Mobile action buttons */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <Button variant="secondary" size="sm" onClick={onAddRefueling} className="flex-1">
          + Add Refueling
        </Button>
        <Button variant="primary" size="sm" onClick={onAddMaintenance} className="flex-1">
          + Add Maintenance
        </Button>
      </div>

      {/* Vehicle header card */}
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row">
          {/* Photo area */}
          <div
            className={`h-36 sm:w-48 sm:h-auto lg:w-56 bg-gradient-to-br ${gradient.bg} flex items-center justify-center shrink-0`}
          >
            {isMotorcycle ? (
              <MotorcycleSilhouette className={`w-20 h-20 ${gradient.silhouette}`} />
            ) : (
              <CarSilhouette className={`w-20 h-20 ${gradient.silhouette}`} />
            )}
          </div>

          {/* Metadata */}
          <div className="p-5 lg:p-6 flex-1">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                  {vehicle.name}
                </h1>
                <div className="text-sm text-base-500 dark:text-base-400 mt-0.5">
                  {vehicle.make} {vehicle.model} · {vehicle.year}
                </div>
              </div>
            </div>

            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2">
              {vehicle.licensePlate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-base-100 dark:bg-base-700 text-base-600 dark:text-base-300">
                  {vehicle.licensePlate}
                </span>
              )}
              <FuelTypeBadge fuelType={vehicle.fuelType} />
              {vehicle.type && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-base-100 dark:bg-base-700 text-base-600 dark:text-base-300">
                  {vehicle.type}
                </span>
              )}
              {vehicle.status === 'active' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500 dark:bg-accent-400" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-base-100 dark:bg-base-700 text-base-500 dark:text-base-400">
                  Sold
                </span>
              )}
            </div>

            {/* Sold vehicle info */}
            {vehicle.status === 'sold' && vehicle.saleDate && (
              <div className="mt-3 text-sm text-base-400">
                Sold {formatHumanDate(vehicle.saleDate)}
                {vehicle.salePrice != null && ` · ${formatNumber(vehicle.salePrice, 0)} DKK`}
                {vehicle.saleNote && ` · ${vehicle.saleNote}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export { VehicleDetailHeader }
export type { VehicleDetailHeaderProps }
