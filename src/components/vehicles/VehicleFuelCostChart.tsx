import { useState, useMemo } from 'react'
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
import { filterByTimeSpan, DEFAULT_TIME_SPAN } from '@/utils/timeSpan'
import { parseISO, format } from 'date-fns'
import type { TimeSpan } from '@/utils/timeSpan'

interface MonthlyFuelCostPoint {
  month: string // "YYYY-MM" format
  cost: number
}

interface VehicleFuelCostChartProps {
  data: MonthlyFuelCostPoint[]
  priorYearData?: MonthlyFuelCostPoint[]
}

interface ChartPoint {
  label: string
  cost: number
  priorCost?: number
}

function toChartData(
  data: MonthlyFuelCostPoint[],
  priorData?: MonthlyFuelCostPoint[],
): ChartPoint[] {
  const priorMap = new Map<string, number>()
  if (priorData) {
    for (const d of priorData) {
      const label = format(parseISO(d.month + '-01'), 'MMM yy')
      priorMap.set(label, d.cost)
    }
  }

  return data.map((d) => {
    const label = format(parseISO(d.month + '-01'), 'MMM yy')
    return {
      label,
      cost: d.cost,
      ...(priorMap.size > 0 ? { priorCost: priorMap.get(label) } : {}),
    }
  })
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

function VehicleFuelCostChart({ data, priorYearData }: VehicleFuelCostChartProps) {
  const [timeSpan, setTimeSpan] = useState<TimeSpan>(DEFAULT_TIME_SPAN)
  const [yoyActive, setYoyActive] = useState(false)

  const filteredData = useMemo(
    () => filterByTimeSpan(data, timeSpan, (d) => parseISO(d.month + '-01')),
    [data, timeSpan],
  )

  const filteredPriorYearData = useMemo(
    () =>
      priorYearData
        ? filterByTimeSpan(priorYearData, timeSpan, (d) => parseISO(d.month + '-01'))
        : [],
    [priorYearData, timeSpan],
  )

  const chartData = useMemo(
    () =>
      toChartData(
        filteredData,
        yoyActive && priorYearData ? filteredPriorYearData : undefined,
      ),
    [filteredData, filteredPriorYearData, yoyActive, priorYearData],
  )

  return (
    <ChartCard
      title="Monthly Fuel Cost"
      timeSpan={timeSpan}
      onTimeSpanChange={setTimeSpan}
      yoyActive={yoyActive}
      onYoYChange={setYoyActive}
    >
      <div className="h-44">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-base-300 dark:text-base-500 text-sm">
            No data available
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
              {yoyActive && priorYearData && (
                <Bar
                  dataKey="priorCost"
                  fill="#22c55e"
                  opacity={0.3}
                  radius={[3, 3, 0, 0]}
                />
              )}
              <Bar
                dataKey="cost"
                fill="#22c55e"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-base-400">
          <span className="w-3 h-3 bg-accent-500 rounded-sm inline-block" />
          Fuel cost
        </div>
      </div>
    </ChartCard>
  )
}

export { VehicleFuelCostChart }
export type { MonthlyFuelCostPoint, VehicleFuelCostChartProps }
