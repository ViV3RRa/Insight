import { useMemo } from 'react'
import { Fuel, Home } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { formatNumber, formatHumanDate } from '@/utils/formatters'
import type { Refueling, FuelType } from '@/types/vehicles'

interface VehicleRefuelingTableProps {
  refuelings: Refueling[]
  fuelType: FuelType
  onEdit: (refueling: Refueling) => void
  onDelete: (refueling: Refueling) => void
  onAdd: () => void
}

type RefuelingWithEfficiency = Refueling & { efficiency: number | null }

function VehicleRefuelingTable({
  refuelings,
  fuelType,
  onEdit,
  onDelete,
  onAdd,
}: VehicleRefuelingTableProps) {
  const fuelUnit = fuelType === 'Electric' ? 'kWh' : 'L'

  const refuelingsWithEfficiency = useMemo(() => {
    const sorted = [...refuelings].sort((a, b) => a.date.localeCompare(b.date))
    return sorted
      .map((r, i) => {
        if (i === 0) return { ...r, efficiency: null }
        const prev = sorted[i - 1]!
        const distance = r.odometerReading - prev.odometerReading
        if (distance <= 0 || r.fuelAmount === 0) return { ...r, efficiency: null }
        return { ...r, efficiency: distance / r.fuelAmount }
      })
      .reverse()
  }, [refuelings])

  const columns: Array<ColumnDef<RefuelingWithEfficiency>> = [
    {
      key: 'date',
      label: 'Date',
      align: 'left',
      sortable: true,
      format: (_value, row) => formatHumanDate(row.date),
    },
    {
      key: 'fuelAmount',
      label: fuelUnit === 'kWh' ? 'Energy' : 'Fuel',
      align: 'right',
      sortable: true,
      hideOnMobile: true,
      format: (value) => `${formatNumber(value as number, 1)} ${fuelUnit}`,
    },
    {
      key: 'costPerUnit',
      label: `DKK/${fuelUnit}`,
      align: 'right',
      sortable: true,
      hideOnMobile: true,
      format: (value) => `${formatNumber(value as number, 2)} DKK/${fuelUnit}`,
    },
    {
      key: 'totalCost',
      label: 'Cost',
      align: 'right',
      sortable: true,
      format: (value) => `${formatNumber(value as number, 0)} DKK`,
    },
    {
      key: 'odometerReading',
      label: 'Odometer',
      align: 'right',
      sortable: true,
      hideOnMobile: true,
      format: (value) => `${formatNumber(value as number, 0)} km`,
    },
    {
      key: 'efficiency',
      label: `km/${fuelUnit}`,
      align: 'right',
      hideOnMobile: true,
      format: (_value, row) => {
        if (row.efficiency === null) return '—'
        return (
          <span className="text-emerald-600 dark:text-emerald-400">
            {formatNumber(row.efficiency, 1)} km/{fuelUnit}
          </span>
        )
      },
    },
    {
      key: 'station',
      label: 'Station',
      align: 'left',
      hideOnMobile: true,
      format: (_value, row) => {
        if (fuelType === 'Electric' && row.chargedAtHome) {
          return (
            <span className="inline-flex items-center gap-1 text-base-400">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </span>
          )
        }
        return (
          <span className="text-base-400">{row.station ?? '—'}</span>
        )
      },
    },
  ]

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
      <div className="px-3 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fuel className="w-4 h-4 text-base-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Refueling Log</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {refuelings.length}
            </span>
          </div>
          <button
            onClick={onAdd}
            className="px-3 py-1.5 text-xs font-medium text-base-600 dark:text-base-300 bg-base-50 dark:bg-base-700 rounded-lg hover:bg-base-100 dark:hover:bg-base-600 transition-colors"
          >
            + Add Refueling
          </button>
        </div>
      </div>
      <DataTable<RefuelingWithEfficiency>
        columns={columns}
        data={refuelingsWithEfficiency}
        onEdit={onEdit}
        onDelete={onDelete}
        keyExtractor={(r) => r.id}
        sortable={true}
        defaultSort={{ key: 'date', direction: 'desc' }}
        showMoreThreshold={5}
      />
    </div>
  )
}

export { VehicleRefuelingTable }
export type { VehicleRefuelingTableProps }
