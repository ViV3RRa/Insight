import { useMemo, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { Button } from '@/components/shared/Button'
import { formatNumber, formatRecordDate } from '@/utils/formatters'
import type { UtilityBill } from '@/types/home'

interface UtilityBillsTableProps {
  bills: UtilityBill[]
  onAddBill: () => void
  onEditBill: (bill: UtilityBill) => void
  onDeleteBill: (bill: UtilityBill) => void
}

function formatPeriod(bill: UtilityBill): string {
  return `${format(parseISO(bill.periodStart), 'MMM yyyy')} – ${format(parseISO(bill.periodEnd), 'MMM yyyy')}`
}

function UtilityBillsTable({
  bills,
  onAddBill,
  onEditBill,
  onDeleteBill,
}: UtilityBillsTableProps) {
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null)

  const sortedBills = useMemo(
    () =>
      [...bills].sort(
        (a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime(),
      ),
    [bills],
  )

  const selectedIndex = selectedBill
    ? sortedBills.findIndex((b) => b.id === selectedBill.id)
    : -1

  const columns: Array<ColumnDef<UtilityBill>> = [
    {
      key: 'period',
      label: 'Period',
      align: 'left',
      format: (_value, row) => (
        <span className="text-base-500">{formatPeriod(row)}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      format: (_value, row) => (
        <span className="font-mono-data font-medium">
          {formatNumber(row.amount, 0)} DKK
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date received',
      align: 'left',
      hideOnMobile: true,
      format: (_value, row) =>
        row.timestamp ? (
          <span className="font-mono-data text-base-400">
            {formatRecordDate(row.timestamp, 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="text-base-400">—</span>
        ),
    },
    {
      key: 'note',
      label: 'Note',
      align: 'left',
      hideOnMobile: true,
      format: (_value, row) =>
        row.note ? (
          <span className="text-sm text-base-500">{row.note}</span>
        ) : (
          <span className="text-base-400">—</span>
        ),
    },
    {
      key: 'attachment',
      label: 'Attachment',
      align: 'left',
      hideOnMobile: true,
      format: (_value, row) =>
        row.attachment ? (
          <Paperclip className="w-4 h-4 text-base-400" aria-label="Has attachment" />
        ) : (
          <span className="text-base-400">—</span>
        ),
    },
  ]

  function handleRowClick(bill: UtilityBill) {
    setSelectedBill(bill)
  }

  function handleDrawerClose() {
    setSelectedBill(null)
  }

  function handleDrawerEdit() {
    if (selectedBill) {
      onEditBill(selectedBill)
      setSelectedBill(null)
    }
  }

  function handleDrawerDelete() {
    if (selectedBill) {
      onDeleteBill(selectedBill)
      setSelectedBill(null)
    }
  }

  function handlePrev() {
    if (selectedIndex > 0) {
      setSelectedBill(sortedBills[selectedIndex - 1] ?? null)
    }
  }

  function handleNext() {
    if (selectedIndex < sortedBills.length - 1) {
      setSelectedBill(sortedBills[selectedIndex + 1] ?? null)
    }
  }

  const drawerFields = selectedBill
    ? [
        {
          label: 'Period',
          value: formatPeriod(selectedBill),
        },
        {
          label: 'Amount',
          value: `${formatNumber(selectedBill.amount, 0)} DKK`,
        },
        {
          label: 'Date received',
          value: selectedBill.timestamp
            ? formatRecordDate(selectedBill.timestamp, 'MMM d, yyyy')
            : '—',
        },
        {
          label: 'Note',
          value: selectedBill.note ?? '—',
        },
        {
          label: 'Attachment',
          value: selectedBill.attachment ? 'Yes' : '—',
        },
      ]
    : []

  if (bills.length === 0) {
    return (
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
        <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-base-900 dark:text-white">Bills</h3>
              <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">
                0
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={onAddBill}>
              + Add Bill
            </Button>
          </div>
        </div>
        <div className="px-3 lg:px-6 py-12 text-center text-sm text-base-400">
          No bills yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Bills</h3>
            <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">
              {bills.length}
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={onAddBill}>
            + Add Bill
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortedBills}
        showMoreThreshold={5}
        onEdit={onEditBill}
        onDelete={onDeleteBill}
        onRowClick={handleRowClick}
        keyExtractor={(bill) => bill.id}
      />

      <MobileDrawer
        isOpen={selectedBill !== null}
        onClose={handleDrawerClose}
        title="Bill"
        fields={drawerFields}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < sortedBills.length - 1}
      />
    </div>
  )
}

export { UtilityBillsTable }
export type { UtilityBillsTableProps }
