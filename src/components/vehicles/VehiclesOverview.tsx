import { useState, useMemo } from 'react'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as vehicleService from '@/services/vehicles'
import * as refuelingService from '@/services/refuelings'
import * as maintenanceService from '@/services/maintenanceEvents'
import { calculateVehicleMetrics, calculateTotalKmDriven } from '@/utils/vehicleMetrics'
import { calculateWeightedEfficiency, calculateYearEfficiency } from '@/utils/fuelEfficiency'
import { formatRecentUpdate } from '@/utils/formatters'
import { Button } from '@/components/shared/Button'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { VehicleCard } from '@/components/vehicles/VehicleCard'
import { SoldVehicleCard } from '@/components/vehicles/SoldVehicleCard'
import { VehicleDialog } from '@/components/vehicles/dialogs/VehicleDialog'
import { RefuelingDialog } from '@/components/vehicles/dialogs/RefuelingDialog'
import { MaintenanceDialog } from '@/components/vehicles/dialogs/MaintenanceDialog'

function VehiclesOverview() {
  const [showAddRefueling, setShowAddRefueling] = useState(false)
  const [showAddMaintenance, setShowAddMaintenance] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  // 1. Fetch all vehicles
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getAll,
  })

  // 2. Fetch refuelings & maintenance per vehicle
  const refuelingsQueries = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ['refuelings', v.id],
      queryFn: () => refuelingService.getByVehicle(v.id),
      enabled: vehicles.length > 0,
    })),
  })

  const maintenanceQueries = useQueries({
    queries: vehicles.map((v) => ({
      queryKey: ['maintenanceEvents', v.id],
      queryFn: () => maintenanceService.getByVehicle(v.id),
      enabled: vehicles.length > 0,
    })),
  })

  // 3. Derive metrics
  const vehicleData = useMemo(() => {
    return vehicles.map((v, i) => {
      const refuelings = refuelingsQueries[i]?.data ?? []
      const maintenance = maintenanceQueries[i]?.data ?? []
      const metrics = calculateVehicleMetrics(v, refuelings, maintenance)
      const currentYear = new Date().getFullYear()
      const priorYearEfficiency = calculateYearEfficiency(refuelings, currentYear - 1)
      const lastRefuelingDate = refuelings.length > 0 ? refuelings[0]!.date : null
      const allTimeEfficiency = calculateWeightedEfficiency(refuelings)
      const totalKmDriven = calculateTotalKmDriven(refuelings)
      return { vehicle: v, metrics, priorYearEfficiency, lastRefuelingDate, allTimeEfficiency, totalKmDriven }
    })
  }, [vehicles, refuelingsQueries, maintenanceQueries])

  const activeVehicles = vehicleData.filter((d) => d.vehicle.status === 'active')
  const soldVehicles = vehicleData.filter((d) => d.vehicle.status === 'sold')

  const isLoading = vehiclesLoading

  // Find most recent refueling date across all vehicles
  const lastRefueledDate = useMemo(() => {
    let latest: string | null = null
    for (const d of vehicleData) {
      if (d.lastRefuelingDate != null) {
        if (latest == null || d.lastRefuelingDate > latest) {
          latest = d.lastRefuelingDate
        }
      }
    }
    return latest
  }, [vehicleData])

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-base-200 dark:bg-base-700 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-base-200 dark:bg-base-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="text-center py-16" data-testid="empty-state">
          <p className="text-base-400 mb-4">No vehicles added yet</p>
          <Button variant="primary" onClick={() => setShowAddVehicle(true)}>+ Add Vehicle</Button>
        </div>
        <VehicleDialog isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)} />
      </div>
    )
  }

  const subtitle = `${activeVehicles.length} active · ${soldVehicles.length} sold${lastRefueledDate != null ? ` · Last refueled ${formatRecentUpdate(lastRefueledDate)}` : ''}`

  // Mobile nav header
  useMobileDetailNav({ name: 'Vehicles', subtitle })

  return (
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Desktop header */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white mb-1">Vehicles</h1>
          <p className="text-sm text-base-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowAddRefueling(true)}>+ Add Refueling</Button>
          <Button variant="secondary" size="sm" onClick={() => setShowAddMaintenance(true)}>+ Add Maintenance</Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddVehicle(true)}>+ Add Vehicle</Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white mb-1">Vehicles</h1>
        <p className="text-sm text-base-400">{subtitle}</p>
      </div>

      {/* Mobile action buttons */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => setShowAddRefueling(true)} className="flex-1">+ Add Refueling</Button>
        <Button variant="primary" size="sm" onClick={() => setShowAddVehicle(true)} className="flex-1">+ Add Vehicle</Button>
      </div>

      {/* Active vehicles grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8" data-testid="active-vehicles-section">
        {activeVehicles.map((d) => (
          <VehicleCard
            key={d.vehicle.id}
            vehicle={d.vehicle}
            metrics={d.metrics}
            priorYearEfficiency={d.priorYearEfficiency}
            lastRefuelingDate={d.lastRefuelingDate}
          />
        ))}
      </div>

      {/* Sold vehicles */}
      {soldVehicles.length > 0 && (
        <div className="mb-6 lg:mb-8" data-testid="sold-vehicles-section">
          <CollapsibleSection title="Sold Vehicles" count={soldVehicles.length} defaultExpanded={false}>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {soldVehicles.map((d) => (
                  <SoldVehicleCard
                    key={d.vehicle.id}
                    vehicle={d.vehicle}
                    totalCostOfOwnership={d.metrics.totalCostOfOwnership}
                    allTimeEfficiency={d.allTimeEfficiency}
                    totalKmDriven={d.totalKmDriven}
                  />
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Dialogs */}
      <VehicleDialog isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)} />
      <RefuelingDialog
        isOpen={showAddRefueling}
        onClose={() => setShowAddRefueling(false)}
        vehicles={vehicles}
      />
      <MaintenanceDialog
        isOpen={showAddMaintenance}
        onClose={() => setShowAddMaintenance(false)}
        vehicles={vehicles}
      />
    </div>
  )
}

export { VehiclesOverview }
