import { useMemo, useState } from 'react'
import { Fuel, Home } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { Button } from '@/components/shared/Button'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { formatNumber, formatHumanDate, formatRecordDate } from '@/utils/formatters'
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
  const [selectedRow, setSelectedRow] = useState<RefuelingWithEfficiency | null>(null)

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

  const selectedIndex = selectedRow
    ? refuelingsWithEfficiency.findIndex((r) => r.id === selectedRow.id)
    : -1

  const drawerFields = selectedRow
    ? [
        { label: 'Date', value: formatRecordDate(selectedRow.date, 'MMM d, yyyy HH:mm') },
        { label: fuelUnit === 'kWh' ? 'Energy' : 'Fuel', value: `${formatNumber(selectedRow.fuelAmount, 1)} ${fuelUnit}` },
        { label: `Price per ${fuelUnit}`, value: `${formatNumber(selectedRow.costPerUnit, 2)} DKK/${fuelUnit}` },
        { label: 'Total Cost', value: `${formatNumber(selectedRow.totalCost, 0)} DKK` },
        { label: 'Odometer', value: `${formatNumber(selectedRow.odometerReading, 0)} km` },
        { label: 'Efficiency', value: selectedRow.efficiency != null ? `${formatNumber(selectedRow.efficiency, 1)} km/${fuelUnit}` : '—' },
        { label: 'Station', value: (fuelType === 'Electric' && selectedRow.chargedAtHome) ? 'Home' : (selectedRow.station ?? '—') },
        { label: 'Note', value: selectedRow.note ?? '—' },
      ]
    : []

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
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Refueling</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {refuelings.length}
            </span>
          </div>
          <Button variant="primary" size="sm" onClick={onAdd}>
            + Add Refueling
          </Button>
        </div>
      </div>
      <DataTable<RefuelingWithEfficiency>
        columns={columns}
        data={refuelingsWithEfficiency}
        onEdit={onEdit}
        onDelete={onDelete}
        onRowClick={(row) => setSelectedRow(row)}
        keyExtractor={(r) => r.id}
        sortable={true}
        defaultSort={{ key: 'date', direction: 'desc' }}
        showMoreThreshold={5}
      />

      <MobileDrawer
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title="Refueling"
        fields={drawerFields}
        onEdit={() => { if (selectedRow) { onEdit(selectedRow); setSelectedRow(null) } }}
        onDelete={() => { if (selectedRow) { onDelete(selectedRow); setSelectedRow(null) } }}
        onPrev={selectedIndex > 0 ? () => setSelectedRow(refuelingsWithEfficiency[selectedIndex - 1]!) : undefined}
        onNext={selectedIndex < refuelingsWithEfficiency.length - 1 ? () => setSelectedRow(refuelingsWithEfficiency[selectedIndex + 1]!) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < refuelingsWithEfficiency.length - 1}
      />
    </div>
  )
}

export { VehicleRefuelingTable }
export type { VehicleRefuelingTableProps }
