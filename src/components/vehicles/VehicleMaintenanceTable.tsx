import { useMemo, useState } from 'react'
import { Wrench } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { Button } from '@/components/shared/Button'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { formatHumanDate, formatNumber, formatRecordDate } from '@/utils/formatters'
import type { MaintenanceEvent } from '@/types/vehicles'

interface VehicleMaintenanceTableProps {
  events: MaintenanceEvent[]
  onEdit: (event: MaintenanceEvent) => void
  onDelete: (event: MaintenanceEvent) => void
  onAdd: () => void
}

const columns: Array<ColumnDef<MaintenanceEvent>> = [
  {
    key: 'date',
    label: 'Date',
    align: 'left',
    sortable: true,
    format: (_value, row) => formatHumanDate(row.date),
  },
  {
    key: 'description',
    label: 'Description',
    align: 'left',
    sortable: true,
  },
  {
    key: 'cost',
    label: 'Cost',
    align: 'right',
    sortable: true,
    format: (value) => `${formatNumber(value as number, 0)} DKK`,
  },
  {
    key: 'note',
    label: 'Note',
    align: 'left',
    hideOnMobile: true,
    format: (value) =>
      value ? (
        <span className="text-xs italic text-base-400">{String(value)}</span>
      ) : null,
  },
]

function VehicleMaintenanceTable({ events, onEdit, onDelete, onAdd }: VehicleMaintenanceTableProps) {
  const [selectedRow, setSelectedRow] = useState<MaintenanceEvent | null>(null)

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  )

  const selectedIndex = selectedRow
    ? sortedEvents.findIndex((e) => e.id === selectedRow.id)
    : -1

  const drawerFields = selectedRow
    ? [
        { label: 'Date', value: formatRecordDate(selectedRow.date, 'MMM d, yyyy HH:mm') },
        { label: 'Description', value: selectedRow.description },
        { label: 'Cost', value: `${formatNumber(selectedRow.cost, 0)} DKK` },
        { label: 'Note', value: selectedRow.note ?? '—' },
      ]
    : []

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
      <div className="px-3 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-4 h-4 text-base-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Maintenance</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {events.length}
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={onAdd}>
            + Add Maintenance
          </Button>
        </div>
      </div>
      <DataTable<MaintenanceEvent>
        columns={columns}
        data={sortedEvents}
        onEdit={onEdit}
        onDelete={onDelete}
        onRowClick={(row) => setSelectedRow(row)}
        keyExtractor={(e) => e.id}
        sortable={true}
        defaultSort={{ key: 'date', direction: 'desc' }}
        showMoreThreshold={5}
      />

      <MobileDrawer
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title="Maintenance"
        fields={drawerFields}
        onEdit={() => { if (selectedRow) { onEdit(selectedRow); setSelectedRow(null) } }}
        onDelete={() => { if (selectedRow) { onDelete(selectedRow); setSelectedRow(null) } }}
        onPrev={selectedIndex > 0 ? () => setSelectedRow(sortedEvents[selectedIndex - 1]!) : undefined}
        onNext={selectedIndex < sortedEvents.length - 1 ? () => setSelectedRow(sortedEvents[selectedIndex + 1]!) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < sortedEvents.length - 1}
      />
    </div>
  )
}

export { VehicleMaintenanceTable }
export type { VehicleMaintenanceTableProps }
