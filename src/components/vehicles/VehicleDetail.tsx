import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfYear, parseISO } from 'date-fns'
import * as vehicleService from '@/services/vehicles'
import * as refuelingService from '@/services/refuelings'
import * as maintenanceEventService from '@/services/maintenanceEvents'
import {
  calculateVehicleMetrics,
  calculateMonthlyFuelCost,
  calculateMonthlyKm,
  calculateMonthlyMaintenanceCost,
  calculateYtdKm,
  calculateFuelCost,
} from '@/utils/vehicleMetrics'
import {
  calculateYearEfficiency,
  calculatePerRefuelingEfficiency,
} from '@/utils/fuelEfficiency'
import { VehicleDetailHeader } from '@/components/vehicles/VehicleDetailHeader'
import { VehicleStatCards } from '@/components/vehicles/VehicleStatCards'
import { VehicleYoYRow, type VehicleYoYData } from '@/components/vehicles/VehicleYoYRow'
import { VehicleEfficiencyChart } from '@/components/vehicles/VehicleEfficiencyChart'
import { VehicleFuelCostChart } from '@/components/vehicles/VehicleFuelCostChart'
import { VehicleKmChart } from '@/components/vehicles/VehicleKmChart'
import { VehicleMaintenanceChart } from '@/components/vehicles/VehicleMaintenanceChart'
import { VehicleRefuelingTable } from '@/components/vehicles/VehicleRefuelingTable'
import { VehicleMaintenanceTable } from '@/components/vehicles/VehicleMaintenanceTable'
import { VehicleDialog } from '@/components/vehicles/dialogs/VehicleDialog'
import { RefuelingDialog } from '@/components/vehicles/dialogs/RefuelingDialog'
import { MaintenanceDialog } from '@/components/vehicles/dialogs/MaintenanceDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import type { Refueling, MaintenanceEvent } from '@/types/vehicles'

function VehicleDetail() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Dialog states
  const [showAddRefueling, setShowAddRefueling] = useState(false)
  const [showAddMaintenance, setShowAddMaintenance] = useState(false)
  const [showEditVehicle, setShowEditVehicle] = useState(false)
  const [editRefueling, setEditRefueling] = useState<Refueling | null>(null)
  const [editMaintenanceEvent, setEditMaintenanceEvent] = useState<MaintenanceEvent | null>(null)
  const [deleteRefueling, setDeleteRefueling] = useState<Refueling | null>(null)
  const [deleteMaintenanceEvent, setDeleteMaintenanceEvent] = useState<MaintenanceEvent | null>(null)
  const [deleteVehicle, setDeleteVehicle] = useState(false)

  // Fetch all vehicles (for switcher)
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getAll,
  })

  // Fetch the current vehicle
  const { data: vehicle, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicles', vehicleId],
    queryFn: () => vehicleService.getOne(vehicleId!),
    enabled: !!vehicleId,
  })

  // Fetch refuelings for this vehicle
  const { data: refuelings = [] } = useQuery({
    queryKey: ['refuelings', vehicleId],
    queryFn: () => refuelingService.getByVehicle(vehicleId!),
    enabled: !!vehicleId,
  })

  // Fetch maintenance events for this vehicle
  const { data: maintenanceEvents = [] } = useQuery({
    queryKey: ['maintenanceEvents', vehicleId],
    queryFn: () => maintenanceEventService.getByVehicle(vehicleId!),
    enabled: !!vehicleId,
  })

  // Derived data
  const metrics = useMemo(
    () => (vehicle ? calculateVehicleMetrics(vehicle, refuelings, maintenanceEvents) : null),
    [vehicle, refuelings, maintenanceEvents],
  )

  const currentYear = new Date().getFullYear()

  const priorYearEfficiency = useMemo(
    () => calculateYearEfficiency(refuelings, currentYear - 1),
    [refuelings, currentYear],
  )

  const efficiencyData = useMemo(
    () => calculatePerRefuelingEfficiency(refuelings),
    [refuelings],
  )

  const monthlyFuelCost = useMemo(
    () =>
      calculateMonthlyFuelCost(refuelings).map((d) => ({
        month: `${d.year}-${d.month}`,
        cost: d.cost,
      })),
    [refuelings],
  )

  const monthlyKm = useMemo(
    () =>
      calculateMonthlyKm(refuelings).map((d) => ({
        month: `${d.year}-${d.month}`,
        km: d.km,
      })),
    [refuelings],
  )

  const monthlyMaintenanceCost = useMemo(
    () =>
      calculateMonthlyMaintenanceCost(maintenanceEvents).map((d) => ({
        month: `${d.year}-${d.month}`,
        cost: d.cost,
      })),
    [maintenanceEvents],
  )

  const efficiencyUnit = vehicle?.fuelType === 'Electric' ? 'km/kWh' : 'km/l'

  // YoY comparison data
  const yoyData = useMemo((): VehicleYoYData | null => {
    if (refuelings.length === 0) return null

    const now = new Date()
    const ytdKmCurrent = calculateYtdKm(refuelings)
    const ytdFuelCostCurrent = calculateFuelCost(refuelings, startOfYear(now), now)

    const priorYearStart = startOfYear(new Date(currentYear - 1, 0, 1))
    const priorYearSameDay = new Date(currentYear - 1, now.getMonth(), now.getDate())

    const priorYearRefuelings = refuelings.filter((r) => {
      const d = parseISO(r.date)
      return d >= priorYearStart && d <= priorYearSameDay
    })

    let ytdKmPrevious = 0
    if (priorYearRefuelings.length >= 2) {
      const sorted = [...priorYearRefuelings].sort((a, b) => a.date.localeCompare(b.date))
      ytdKmPrevious = sorted[sorted.length - 1]!.odometerReading - sorted[0]!.odometerReading
    }

    const ytdFuelCostPrevious = calculateFuelCost(refuelings, priorYearStart, priorYearSameDay)
    const efficiencyCurrent = calculateYearEfficiency(refuelings, currentYear)
    const efficiencyPrevious = calculateYearEfficiency(refuelings, currentYear - 1)

    if (ytdKmPrevious === 0 && ytdFuelCostPrevious === 0 && efficiencyPrevious === null) {
      return null
    }

    return {
      ytdKm: { current: ytdKmCurrent, previous: ytdKmPrevious },
      ytdFuelCost: { current: ytdFuelCostCurrent, previous: ytdFuelCostPrevious },
      efficiency: { current: efficiencyCurrent, previous: efficiencyPrevious, unit: efficiencyUnit },
    }
  }, [refuelings, currentYear, efficiencyUnit])

  // Delete mutations
  const deleteRefuelingMutation = useMutation({
    mutationFn: (id: string) => refuelingService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuelings', vehicleId] })
      setDeleteRefueling(null)
    },
  })

  const deleteMaintenanceMutation = useMutation({
    mutationFn: (id: string) => maintenanceEventService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceEvents', vehicleId] })
      setDeleteMaintenanceEvent(null)
    },
  })

  const deleteVehicleMutation = useMutation({
    mutationFn: () => vehicleService.remove(vehicleId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigate('/vehicles')
    },
  })

  // Loading state
  if (vehicleLoading || !vehicle) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-base-200 dark:bg-base-700 rounded" />
          <div className="h-40 bg-base-200 dark:bg-base-700 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-24 bg-base-200 dark:bg-base-700 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-base-200 dark:bg-base-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 1. Header with switcher + action buttons + vehicle card */}
      <VehicleDetailHeader
        vehicle={vehicle}
        allVehicles={vehicles}
        onSelectVehicle={(id) => navigate(`/vehicles/${id}`)}
        onAddRefueling={() => setShowAddRefueling(true)}
        onAddMaintenance={() => setShowAddMaintenance(true)}
        onEditVehicle={() => setShowEditVehicle(true)}
      />

      {/* 2. Stat cards */}
      <div className="mb-6 lg:mb-8" data-testid="stat-cards-section">
        <VehicleStatCards
          vehicle={vehicle}
          metrics={metrics!}
          priorYearEfficiency={priorYearEfficiency}
        />
      </div>

      {/* 3. YoY comparison row */}
      <div className="mb-6 lg:mb-8" data-testid="yoy-section">
        <VehicleYoYRow data={yoyData} />
      </div>

      {/* 4. Performance charts (always visible) */}
      <div className="mb-6 lg:mb-8 space-y-4" data-testid="charts-section">
        <VehicleEfficiencyChart data={efficiencyData} unit={efficiencyUnit} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VehicleFuelCostChart data={monthlyFuelCost} />
          <VehicleKmChart data={monthlyKm} />
        </div>
        <VehicleMaintenanceChart data={monthlyMaintenanceCost} />
      </div>

      {/* 5. Refueling log table */}
      <div className="mb-6 lg:mb-8" data-testid="refueling-section">
        <VehicleRefuelingTable
          refuelings={refuelings}
          fuelType={vehicle.fuelType}
          onEdit={(r) => setEditRefueling(r)}
          onDelete={(r) => setDeleteRefueling(r)}
          onAdd={() => setShowAddRefueling(true)}
        />
      </div>

      {/* 6. Maintenance log table */}
      <div className="mb-6 lg:mb-8" data-testid="maintenance-section">
        <VehicleMaintenanceTable
          events={maintenanceEvents}
          onEdit={(e) => setEditMaintenanceEvent(e)}
          onDelete={(e) => setDeleteMaintenanceEvent(e)}
          onAdd={() => setShowAddMaintenance(true)}
        />
      </div>

      {/* Dialogs */}
      <VehicleDialog
        isOpen={showEditVehicle}
        onClose={() => setShowEditVehicle(false)}
        vehicle={vehicle}
        onDelete={() => {
          setShowEditVehicle(false)
          setDeleteVehicle(true)
        }}
      />
      <RefuelingDialog
        isOpen={showAddRefueling || editRefueling !== null}
        onClose={() => {
          setShowAddRefueling(false)
          setEditRefueling(null)
        }}
        refueling={editRefueling ?? undefined}
        vehicleId={vehicleId}
        vehicleFuelType={vehicle.fuelType}
      />
      <MaintenanceDialog
        isOpen={showAddMaintenance || editMaintenanceEvent !== null}
        onClose={() => {
          setShowAddMaintenance(false)
          setEditMaintenanceEvent(null)
        }}
        event={editMaintenanceEvent ?? undefined}
        vehicleId={vehicleId}
      />
      <DeleteConfirmDialog
        isOpen={deleteRefueling !== null}
        onCancel={() => setDeleteRefueling(null)}
        onConfirm={() => deleteRefueling && deleteRefuelingMutation.mutate(deleteRefueling.id)}
        title="Delete Refueling"
        description="This refueling record will be permanently deleted."
        loading={deleteRefuelingMutation.isPending}
      />
      <DeleteConfirmDialog
        isOpen={deleteMaintenanceEvent !== null}
        onCancel={() => setDeleteMaintenanceEvent(null)}
        onConfirm={() =>
          deleteMaintenanceEvent && deleteMaintenanceMutation.mutate(deleteMaintenanceEvent.id)
        }
        title="Delete Maintenance"
        description="This maintenance record will be permanently deleted."
        loading={deleteMaintenanceMutation.isPending}
      />
      <DeleteConfirmDialog
        isOpen={deleteVehicle}
        onCancel={() => setDeleteVehicle(false)}
        onConfirm={() => deleteVehicleMutation.mutate()}
        title="Delete Vehicle"
        description="This vehicle and all its records will be permanently deleted."
        loading={deleteVehicleMutation.isPending}
      />
    </div>
  )
}

export { VehicleDetail }
