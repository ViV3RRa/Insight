import { useMemo } from 'react'
import { Wrench } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { formatHumanDate, formatNumber } from '@/utils/formatters'
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
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  )

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
      <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-4 h-4 text-base-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Maintenance Log</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {events.length}
            </span>
          </div>
          <button
            onClick={onAdd}
            className="px-3 py-1.5 text-xs font-medium text-base-600 dark:text-base-300 bg-base-50 dark:bg-base-700 rounded-lg hover:bg-base-100 dark:hover:bg-base-600 transition-colors"
          >
            + Add Maintenance
          </button>
        </div>
      </div>
      <DataTable<MaintenanceEvent>
        columns={columns}
        data={sortedEvents}
        onEdit={onEdit}
        onDelete={onDelete}
        keyExtractor={(e) => e.id}
        sortable={true}
        defaultSort={{ key: 'date', direction: 'desc' }}
        showMoreThreshold={5}
      />
    </div>
  )
}

export { VehicleMaintenanceTable }
export type { VehicleMaintenanceTableProps }
