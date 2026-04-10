import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfYear } from 'date-fns'
import { Zap } from 'lucide-react'
import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'
import * as refuelingService from '@/services/refuelings'
import { calculateUtilityMetrics, calculateMonthlyCostPerUnit } from '@/utils/utilityCosts'
import {
  getHomeChargingKwh,
  getMonthlyHomeChargingKwh,
  adjustConsumptionForEvCharging,
} from '@/utils/evCrossover'
import { formatNumber } from '@/utils/formatters'
import { UtilityDetailHeader } from '@/components/home/UtilityDetailHeader'
import { UtilityDetailChart } from '@/components/home/UtilityDetailChart'
import { UtilityYearlyTable } from '@/components/home/UtilityYearlyTable'
import { UtilityReadingsTable } from '@/components/home/UtilityReadingsTable'
import { UtilityBillsTable } from '@/components/home/UtilityBillsTable'
import { MeterReadingDialog } from '@/components/home/dialogs/MeterReadingDialog'
import { BillDialog } from '@/components/home/dialogs/BillDialog'
import { UtilityDialog } from '@/components/home/dialogs/UtilityDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import type { MeterReading, UtilityBill } from '@/types/home'

function UtilityDetail() {
  const { utilityId } = useParams<{ utilityId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Dialog states
  const [showAddReading, setShowAddReading] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showEditUtility, setShowEditUtility] = useState(false)
  const [editReading, setEditReading] = useState<MeterReading | null>(null)
  const [editBill, setEditBill] = useState<UtilityBill | null>(null)
  const [deleteReading, setDeleteReading] = useState<MeterReading | null>(null)
  const [deleteBill, setDeleteBill] = useState<UtilityBill | null>(null)
  const [showDeleteUtility, setShowDeleteUtility] = useState(false)
  const [excludeEvCharging, setExcludeEvCharging] = useState(false)

  // Fetch all utilities (for switcher)
  const { data: utilities = [] } = useQuery({
    queryKey: ['utilities'],
    queryFn: utilityService.getAll,
  })

  // Fetch the current utility
  const { data: utility, isLoading: utilityLoading } = useQuery({
    queryKey: ['utilities', utilityId],
    queryFn: () => utilityService.getOne(utilityId!),
    enabled: !!utilityId,
  })

  // Fetch readings
  const { data: readings = [] } = useQuery({
    queryKey: ['meterReadings', utilityId],
    queryFn: () => meterReadingService.getByUtility(utilityId!),
    enabled: !!utilityId,
  })

  // Fetch bills
  const { data: bills = [] } = useQuery({
    queryKey: ['utilityBills', utilityId],
    queryFn: () => utilityBillService.getByUtility(utilityId!),
    enabled: !!utilityId,
  })

  // Derived data
  const metrics = useMemo(() => {
    if (readings.length === 0 && bills.length === 0) return null
    return calculateUtilityMetrics(readings, bills)
  }, [readings, bills])

  const latestReadingDate = useMemo(() => {
    if (readings.length === 0) return null
    return new Date(readings[0]!.timestamp)
  }, [readings])

  // EV home-charging detection
  const isElectricity = utility?.icon === 'bolt' || utility?.unit === 'kWh'

  const { data: allRefuelings = [] } = useQuery({
    queryKey: ['refuelings'],
    queryFn: refuelingService.getAll,
    enabled: isElectricity,
  })

  const evRefuelings = useMemo(
    () => allRefuelings.filter((r) => r.chargedAtHome),
    [allRefuelings],
  )

  const hasEvChargingData = evRefuelings.length > 0

  const monthlyHomeChargingKwh = useMemo(
    () => (hasEvChargingData ? getMonthlyHomeChargingKwh(evRefuelings) : []),
    [evRefuelings, hasEvChargingData],
  )

  const totalHomeChargingKwh = useMemo(() => {
    if (!hasEvChargingData) return 0
    const now = new Date()
    return getHomeChargingKwh(evRefuelings, startOfYear(now), now)
  }, [evRefuelings, hasEvChargingData])

  const displayMetrics = useMemo(() => {
    if (!metrics || !excludeEvCharging || !hasEvChargingData) return metrics
    const adjustedConsumption = adjustConsumptionForEvCharging(
      metrics.monthlyConsumption,
      monthlyHomeChargingKwh,
    )
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const ytdStartKey = `${now.getFullYear()}-01`
    const currentEntry = adjustedConsumption.find((c) => c.month === currentMonthKey)
    const ytdConsumption = adjustedConsumption
      .filter((c) => c.month >= ytdStartKey && c.month <= currentMonthKey)
      .reduce((sum, c) => sum + c.consumption, 0)
    const adjustedCostPerUnit = calculateMonthlyCostPerUnit(adjustedConsumption, metrics.monthlyCost)
    const currentCpuEntry = adjustedCostPerUnit.find((c) => c.month === currentMonthKey)
    return {
      ...metrics,
      monthlyConsumption: adjustedConsumption,
      monthlyCostPerUnit: adjustedCostPerUnit,
      currentMonthConsumption: currentEntry?.consumption ?? null,
      currentMonthCostPerUnit: currentCpuEntry?.costPerUnit ?? null,
      ytdConsumption,
    }
  }, [metrics, excludeEvCharging, hasEvChargingData, monthlyHomeChargingKwh])

  // Delete mutations
  const deleteReadingMutation = useMutation({
    mutationFn: (id: string) => meterReadingService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterReadings', utilityId] })
      setDeleteReading(null)
    },
  })

  const deleteBillMutation = useMutation({
    mutationFn: (id: string) => utilityBillService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilityBills', utilityId] })
      setDeleteBill(null)
    },
  })

  const deleteUtilityMutation = useMutation({
    mutationFn: (id: string) => utilityService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] })
      navigate('/home')
    },
  })

  function handleSelectUtility(id: string) {
    navigate(`/home/utility/${id}`)
  }

  // Loading state
  if (utilityLoading || !utility) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-base-200 dark:bg-base-700 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
      {/* Section 1: Header with switcher bar, action buttons, stat cards */}
      <UtilityDetailHeader
        utility={utility}
        allUtilities={utilities}
        metrics={displayMetrics}
        latestReadingDate={latestReadingDate}
        onSelectUtility={handleSelectUtility}
        onAddReading={() => setShowAddReading(true)}
        onAddBill={() => setShowAddBill(true)}
        onEdit={() => setShowEditUtility(true)}
      />

      {/* EV home-charging metric */}
      {isElectricity && totalHomeChargingKwh > 0 && (
        <div className="text-xs text-base-400 dark:text-base-500 flex items-center gap-1.5 mb-4" data-testid="ev-charging-metric">
          <Zap className="w-3.5 h-3.5" />
          {formatNumber(totalHomeChargingKwh, 1)} kWh used for EV home charging (YTD)
        </div>
      )}

      {/* Section 2: Chart card */}
      <div className="mb-6 lg:mb-8" data-testid="chart-section">
        {isElectricity && hasEvChargingData && (
          <div className="flex justify-end mb-2">
            <label className="flex items-center gap-1.5 text-xs text-base-400 cursor-pointer" data-testid="ev-toggle">
              <input
                type="checkbox"
                checked={excludeEvCharging}
                onChange={(e) => setExcludeEvCharging(e.target.checked)}
                className="rounded border-base-300 text-accent-600 focus:ring-accent-500/30"
              />
              Exclude EV charging
            </label>
          </div>
        )}
        <UtilityDetailChart utility={utility} metrics={displayMetrics} />
      </div>

      {/* Section 3: Yearly Summary */}
      <div data-testid="yearly-section">
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />
      </div>

      {/* Section 4: Meter Readings */}
      <div data-testid="readings-section">
        <UtilityReadingsTable
          readings={readings}
          unit={utility.unit}
          onAddReading={() => setShowAddReading(true)}
          onEditReading={(reading) => setEditReading(reading)}
          onDeleteReading={(reading) => setDeleteReading(reading)}
        />
      </div>

      {/* Section 5: Bills */}
      <div data-testid="bills-section">
        <UtilityBillsTable
          bills={bills}
          onAddBill={() => setShowAddBill(true)}
          onEditBill={(bill) => setEditBill(bill)}
          onDeleteBill={(bill) => setDeleteBill(bill)}
        />
      </div>

      {/* Dialogs */}
      <UtilityDialog
        isOpen={showEditUtility}
        onClose={() => setShowEditUtility(false)}
        utility={utility}
        onDelete={() => {
          setShowEditUtility(false)
          setShowDeleteUtility(true)
        }}
      />
      <MeterReadingDialog
        isOpen={showAddReading || editReading !== null}
        onClose={() => {
          setShowAddReading(false)
          setEditReading(null)
        }}
        reading={editReading ?? undefined}
        utilityId={utilityId}
      />
      <BillDialog
        isOpen={showAddBill || editBill !== null}
        onClose={() => {
          setShowAddBill(false)
          setEditBill(null)
        }}
        bill={editBill ?? undefined}
        utilityId={utilityId}
      />
      <DeleteConfirmDialog
        isOpen={deleteReading !== null}
        onCancel={() => setDeleteReading(null)}
        onConfirm={() => deleteReading && deleteReadingMutation.mutate(deleteReading.id)}
        title="Delete Reading"
        description="This reading will be permanently deleted. This action cannot be undone."
        loading={deleteReadingMutation.isPending}
      />
      <DeleteConfirmDialog
        isOpen={deleteBill !== null}
        onCancel={() => setDeleteBill(null)}
        onConfirm={() => deleteBill && deleteBillMutation.mutate(deleteBill.id)}
        title="Delete Bill"
        description="This bill will be permanently deleted. This action cannot be undone."
        loading={deleteBillMutation.isPending}
      />
      <DeleteConfirmDialog
        isOpen={showDeleteUtility}
        onCancel={() => setShowDeleteUtility(false)}
        onConfirm={() => deleteUtilityMutation.mutate(utility.id)}
        title="Delete Utility"
        description={`"${utility.name}" and all its readings and bills will be permanently deleted. This action cannot be undone.`}
        loading={deleteUtilityMutation.isPending}
      />
    </div>
  )
}

export { UtilityDetail }
