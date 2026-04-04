import { useMemo } from 'react'
import { Database } from 'lucide-react'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonTableRows } from '@/components/shared/Skeleton'

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
  onRowClick?: (row: DataPointRow) => void
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
  return <span className="text-sm text-base-500">Manual</span>
}

function NoteCell({ note }: { note?: string }) {
  if (!note) return null
  return <span className="text-xs italic text-base-300">{note}</span>
}

const columns: Array<ColumnDef<DataPointRow>> = [
  {
    key: 'date',
    label: 'Date',
    align: 'left',
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
  onRowClick,
  onAdd,
  isLoading = false,
}: PlatformDetailDataPointsProps) {
  const sortedDataPoints = useMemo(
    () => [...dataPoints].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [dataPoints],
  )

  return (
    <div className="mb-6 lg:mb-8">
      <CollapsibleSection
        title="Data Points"
        icon={Database}
        count={dataPoints.length}
        defaultExpanded={false}
      >
        {onAdd && (
          <div className="flex justify-end px-4 pt-3 sm:px-5">
            <Button variant="ghost" size="sm" onClick={onAdd}>
              + Add Data Point
            </Button>
          </div>
        )}
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
            onRowClick={onRowClick}
            keyExtractor={(row) => row.id}
          />
        )}
      </CollapsibleSection>
    </div>
  )
}

export { PlatformDetailDataPoints }
export type { DataPointRow, PlatformDetailDataPointsProps }
