import { useMemo, memo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartCard } from '@/components/shared/ChartCard'
import { formatNumber } from '@/utils/formatters'
import { parseISO, format } from 'date-fns'

interface MonthlyMaintenanceCostPoint {
  month: string // "YYYY-MM" format
  cost: number
}

interface VehicleMaintenanceChartProps {
  data: MonthlyMaintenanceCostPoint[]
}

interface ChartPoint {
  label: string
  cost: number
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="bg-white dark:bg-base-800 rounded-lg shadow-lg border border-base-150 dark:border-base-700 p-3 text-xs">
      <div className="font-medium mb-1">{point.label}</div>
      <div className="font-mono-data">
        {formatNumber(point.cost, 0)} DKK
      </div>
    </div>
  )
}

function toChartData(data: MonthlyMaintenanceCostPoint[]): ChartPoint[] {
  return data.map((d) => ({
    label: format(parseISO(d.month + '-01'), 'MMM yy'),
    cost: d.cost,
  }))
}

const VehicleMaintenanceChart = memo(function VehicleMaintenanceChart({ data }: VehicleMaintenanceChartProps) {
  const chartData = useMemo(() => toChartData(data), [data])

  return (
    <ChartCard
      title="Maintenance Cost"
      hideTimeSpan={true}
      hideYoY={true}
    >
      <div className="h-40">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-base-300 dark:text-base-500 text-sm">
            No maintenance costs
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-base-150, #e7e9e7)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                stroke="#afb1af"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#afb1af"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cost"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-base-400">
          <span className="w-3 h-3 bg-amber-500 rounded-sm inline-block" />
          Maintenance
        </div>
      </div>
    </ChartCard>
  )
})

export { VehicleMaintenanceChart }
export type { MonthlyMaintenanceCostPoint, VehicleMaintenanceChartProps }
