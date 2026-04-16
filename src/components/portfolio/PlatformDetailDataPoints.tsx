import { useMemo, useState } from 'react'
import { Database } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { SkeletonTableRows } from '@/components/shared/Skeleton'
import { formatCurrency, formatRecordDate } from '@/utils/formatters'

interface DataPointRow {
  id: string
  date: string
  value: number
  valueDkk?: number
  currency: string
  isInterpolated: boolean
  note?: string
}

interface PlatformDetailDataPointsProps {
  dataPoints: DataPointRow[]
  currency: string
  onEdit?: (row: DataPointRow) => void
  onDelete?: (row: DataPointRow) => void
  onAdd?: () => void
  isLoading?: boolean
}

function SourceCell({ isInterpolated }: { isInterpolated: boolean }) {
  if (isInterpolated) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
        est.
      </span>
    )
  }
  return <span className="text-sm text-base-500 dark:text-base-400">Manual</span>
}

function NoteCell({ note }: { note?: string }) {
  if (!note) return null
  return <span className="text-xs italic text-base-300 dark:text-base-500">{note}</span>
}

const columns: Array<ColumnDef<DataPointRow>> = [
  {
    key: 'date',
    label: 'Date',
    align: 'left',
    format: (_value: unknown, row: DataPointRow) => formatRecordDate(row.date, 'MMM d, yyyy'),
  },
  {
    key: 'value',
    label: 'Value',
    align: 'right',
    format: (_value: unknown, row: DataPointRow) => (
      <CurrencyDisplay
        amount={row.value}
        currency={row.currency}
        dkkEquivalent={row.valueDkk}
        size="sm"
      />
    ),
  },
  {
    key: 'isInterpolated',
    label: 'Source',
    hideOnMobile: true,
    format: (_value: unknown, row: DataPointRow) => (
      <SourceCell isInterpolated={row.isInterpolated} />
    ),
  },
  {
    key: 'note',
    label: 'Note',
    hideOnMobile: true,
    format: (_value: unknown, row: DataPointRow) => <NoteCell note={row.note} />,
  },
]

function PlatformDetailDataPoints({
  dataPoints,
  currency: _currency,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
}: PlatformDetailDataPointsProps) {
  const [selectedRow, setSelectedRow] = useState<DataPointRow | null>(null)

  const sortedDataPoints = useMemo(
    () => [...dataPoints].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [dataPoints],
  )

  const selectedIndex = selectedRow
    ? sortedDataPoints.findIndex((dp) => dp.id === selectedRow.id)
    : -1

  const drawerFields = selectedRow
    ? [
        { label: 'Date', value: formatRecordDate(selectedRow.date, 'MMM d, yyyy HH:mm') },
        { label: 'Value', value: formatCurrency(selectedRow.value, selectedRow.currency) },
        { label: 'Source', value: selectedRow.isInterpolated ? 'Estimated' : 'Manual' },
        { label: 'Note', value: selectedRow.note ?? '—' },
      ]
    : []

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-4 h-4 text-base-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Data Points</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {dataPoints.length}
            </span>
          </div>
          {onAdd && (
            <Button variant="primary" size="sm" onClick={onAdd}>
              + Add Data Point
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <SkeletonTableRows count={3} />
      ) : sortedDataPoints.length === 0 ? (
        <EmptyState
          variant="section"
          icon={Database}
          description="No data points yet"
        />
      ) : (
        <DataTable
          columns={columns}
          data={sortedDataPoints}
          showMoreThreshold={5}
          onEdit={onEdit}
          onDelete={onDelete}
          onRowClick={(row) => setSelectedRow(row)}
          keyExtractor={(row) => row.id}
        />
      )}

      <MobileDrawer
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title="Data Point"
        fields={drawerFields}
        onEdit={onEdit ? () => { onEdit(selectedRow!); setSelectedRow(null) } : undefined}
        onDelete={onDelete ? () => { onDelete(selectedRow!); setSelectedRow(null) } : undefined}
        onPrev={selectedIndex > 0 ? () => setSelectedRow(sortedDataPoints[selectedIndex - 1]!) : undefined}
        onNext={selectedIndex < sortedDataPoints.length - 1 ? () => setSelectedRow(sortedDataPoints[selectedIndex + 1]!) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < sortedDataPoints.length - 1}
      />
    </div>
  )
}

export { PlatformDetailDataPoints }
export type { DataPointRow, PlatformDetailDataPointsProps }
