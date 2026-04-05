import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'
import { calculateUtilityMetrics } from '@/utils/utilityCosts'
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

  function handleSelectUtility(id: string) {
    navigate(`/home/utility/${id}`)
  }

  // Loading state
  if (utilityLoading || !utility) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
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
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Section 1: Header with switcher bar, action buttons, stat cards */}
      <UtilityDetailHeader
        utility={utility}
        allUtilities={utilities}
        metrics={metrics}
        latestReadingDate={latestReadingDate}
        onSelectUtility={handleSelectUtility}
        onAddReading={() => setShowAddReading(true)}
        onAddBill={() => setShowAddBill(true)}
      />

      {/* Section 2: Chart card */}
      <div className="mb-6 lg:mb-8" data-testid="chart-section">
        <UtilityDetailChart utility={utility} metrics={metrics} />
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
    </div>
  )
}

export { UtilityDetail }
