import { useState, useMemo, memo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartCard } from '@/components/shared/ChartCard'
import { formatNumber, formatRecentUpdate } from '@/utils/formatters'
import { filterByTimeSpan, DEFAULT_TIME_SPAN } from '@/utils/timeSpan'
import { parseISO } from 'date-fns'
import type { TimeSpan } from '@/utils/timeSpan'

interface EfficiencyDataPoint {
  date: string
  efficiency: number
  fuelAmount: number
}

interface VehicleEfficiencyChartProps {
  data: EfficiencyDataPoint[]
  priorYearData?: EfficiencyDataPoint[]
  unit: string
}

interface ChartPoint {
  date: string
  efficiency: number
  rawDate: string
}

function formatDateTick(dateStr: string): string {
  return dateStr
}

function CustomTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
  unit: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  if (!point) return null
  return (
    <div className="bg-white dark:bg-base-800 rounded-lg shadow-lg border border-base-150 dark:border-base-700 p-3 text-xs">
      <div className="font-medium mb-1">{point.rawDate}</div>
      <div className="font-mono-data">
        {formatNumber(point.efficiency, 1)} {unit}
      </div>
    </div>
  )
}

function toChartPoints(data: EfficiencyDataPoint[]): ChartPoint[] {
  return data.map((d) => ({
    date: formatRecentUpdate(d.date),
    efficiency: d.efficiency,
    rawDate: d.date,
  }))
}

const VehicleEfficiencyChart = memo(function VehicleEfficiencyChart({ data, priorYearData, unit }: VehicleEfficiencyChartProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>(DEFAULT_TIME_SPAN)
  const [yoyActive, setYoyActive] = useState(false)

  const filteredData = useMemo(
    () => filterByTimeSpan(data, timeSpan, (d) => parseISO(d.date)),
    [data, timeSpan],
  )

  const filteredPriorYearData = useMemo(
    () => (priorYearData ? filterByTimeSpan(priorYearData, timeSpan, (d) => parseISO(d.date)) : []),
    [priorYearData, timeSpan],
  )

  const chartData = useMemo(() => toChartPoints(filteredData), [filteredData])
  const chartPriorData = useMemo(() => toChartPoints(filteredPriorYearData), [filteredPriorYearData])

  return (
    <ChartCard
      title="Fuel Efficiency"
      timeSpan={timeSpan}
      onTimeSpanChange={setTimeSpan}
      yoyActive={yoyActive}
      onYoYChange={setYoyActive}
    >
      <div className="h-56 lg:h-64">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-base-300 dark:text-base-500 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-base-150, #e7e9e7)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tick={{ fontSize: 11 }}
                stroke="#afb1af"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#afb1af"
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: '#22c55e' }}
                activeDot={{ r: 5 }}
              />
              {yoyActive && priorYearData && chartPriorData.length > 0 && (
                <Line
                  type="monotone"
                  data={chartPriorData}
                  dataKey="efficiency"
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                  opacity={0.4}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-base-400">
          <span className="w-3 h-0.5 bg-accent-500 rounded inline-block" />
          Per refueling
        </div>
      </div>
    </ChartCard>
  )
})

export { VehicleEfficiencyChart }
export type { EfficiencyDataPoint, VehicleEfficiencyChartProps }
