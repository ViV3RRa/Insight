import { useMemo, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { Button } from '@/components/shared/Button'
import { formatRecordDate, formatNumber } from '@/utils/formatters'
import type { MeterReading } from '@/types/home'

interface UtilityReadingsTableProps {
  readings: MeterReading[]
  unit: string
  onAddReading: () => void
  onEditReading: (reading: MeterReading) => void
  onDeleteReading: (reading: MeterReading) => void
}

function UtilityReadingsTable({
  readings,
  unit,
  onAddReading,
  onEditReading,
  onDeleteReading,
}: UtilityReadingsTableProps) {
  const [selectedReading, setSelectedReading] = useState<MeterReading | null>(null)

  const sortedReadings = useMemo(
    () =>
      [...readings].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [readings],
  )

  const selectedIndex = selectedReading
    ? sortedReadings.findIndex((r) => r.id === selectedReading.id)
    : -1

  const columns: Array<ColumnDef<MeterReading>> = [
    {
      key: 'timestamp',
      label: 'Date',
      align: 'left',
      format: (_value, row) => formatRecordDate(row.timestamp, 'MMM d, yyyy'),
    },
    {
      key: 'value',
      label: 'Reading',
      align: 'right',
      format: (_value, row) => (
        <span>
          {formatNumber(row.value, 2)} {unit}
        </span>
      ),
    },
    {
      key: 'note',
      label: 'Note',
      align: 'left',
      hideOnMobile: true,
      format: (_value, row) =>
        row.note ? (
          <span className="italic text-xs text-base-300 dark:text-base-500">{row.note}</span>
        ) : (
          '—'
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
          '—'
        ),
    },
  ]

  function handleRowClick(reading: MeterReading) {
    setSelectedReading(reading)
  }

  function handleDrawerClose() {
    setSelectedReading(null)
  }

  function handleDrawerEdit() {
    if (selectedReading) {
      onEditReading(selectedReading)
      setSelectedReading(null)
    }
  }

  function handleDrawerDelete() {
    if (selectedReading) {
      onDeleteReading(selectedReading)
      setSelectedReading(null)
    }
  }

  function handlePrev() {
    if (selectedIndex > 0) {
      setSelectedReading(sortedReadings[selectedIndex - 1] ?? null)
    }
  }

  function handleNext() {
    if (selectedIndex < sortedReadings.length - 1) {
      setSelectedReading(sortedReadings[selectedIndex + 1] ?? null)
    }
  }

  const drawerFields = selectedReading
    ? [
        {
          label: 'Date',
          value: formatRecordDate(selectedReading.timestamp, 'MMM d, yyyy HH:mm'),
        },
        {
          label: 'Reading',
          value: `${formatNumber(selectedReading.value, 2)} ${unit}`,
        },
        {
          label: 'Note',
          value: selectedReading.note ?? '—',
        },
        {
          label: 'Attachment',
          value: selectedReading.attachment ? 'Yes' : '—',
        },
      ]
    : []

  if (readings.length === 0) {
    return (
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
        <div className="px-3 lg:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-base-900 dark:text-white">Meter Readings</h3>
              <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">
                0
              </span>
            </div>
            <Button variant="primary" size="sm" onClick={onAddReading}>
              + Add Reading
            </Button>
          </div>
        </div>
        <div className="px-3 lg:px-6 py-12 text-center text-sm text-base-400">
          No readings yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Meter Readings</h3>
            <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">
              {readings.length}
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={onAddReading}>
            + Add Reading
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortedReadings}
        showMoreThreshold={5}
        onEdit={onEditReading}
        onDelete={onDeleteReading}
        onRowClick={handleRowClick}
        keyExtractor={(reading) => reading.id}
      />

      <MobileDrawer
        isOpen={selectedReading !== null}
        onClose={handleDrawerClose}
        title="Meter Reading"
        fields={drawerFields}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < sortedReadings.length - 1}
      />
    </div>
  )
}

export { UtilityReadingsTable }
export type { UtilityReadingsTableProps }
