import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '@/components/shared/ChartCard'
import { type TimeSpan, DEFAULT_TIME_SPAN, getTimeSpanRange } from '@/utils/timeSpan'
import type { Utility, UtilityMetrics, UtilityColor } from '@/types/home'
import { parse, isWithinInterval } from 'date-fns'

const UTILITY_CHART_COLORS: Record<UtilityColor, string> = {
  amber: '#f59e0b',
  blue: '#3b82f6',
  orange: '#f97316',
  emerald: '#10b981',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  slate: '#64748b',
}

const chartModes = [
  { label: 'Consumption', value: 'consumption' },
  { label: 'Cost', value: 'cost' },
  { label: 'Cost/Unit', value: 'costPerUnit' },
]

type ChartMode = 'consumption' | 'cost' | 'costPerUnit'

interface ChartDataPoint {
  month: string
  value: number | null
  priorYear?: number | null
}

function monthLabel(monthKey: string): string {
  const [, mm] = monthKey.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return monthNames[parseInt(mm!, 10) - 1]!
}

function buildChartData(
  mode: ChartMode,
  metrics: UtilityMetrics | null,
  priorYearMetrics: UtilityMetrics | null | undefined,
  timeSpan: TimeSpan,
  yoyActive: boolean,
): ChartDataPoint[] {
  if (!metrics) return []

  const { start, end } = getTimeSpanRange(timeSpan)

  const getEntries = (m: UtilityMetrics) => {
    switch (mode) {
      case 'consumption':
        return m.monthlyConsumption.map((e) => ({ month: e.month, value: e.consumption as number | null }))
      case 'cost':
        return m.monthlyCost.map((e) => ({ month: e.month, value: e.cost as number | null }))
      case 'costPerUnit':
        return m.monthlyCostPerUnit.map((e) => ({ month: e.month, value: e.costPerUnit }))
    }
  }

  const currentEntries = getEntries(metrics)

  // Filter by time span
  const filtered = currentEntries.filter((entry) => {
    const monthDate = parse(entry.month, 'yyyy-MM', new Date())
    return isWithinInterval(monthDate, { start, end })
  })

  const sortedEntries = filtered.sort((a, b) => a.month.localeCompare(b.month))

  // Build prior year lookup
  const priorLookup = new Map<string, number | null>()
  if (yoyActive && priorYearMetrics) {
    const priorEntries = getEntries(priorYearMetrics)
    for (const entry of priorEntries) {
      priorLookup.set(entry.month, entry.value)
    }
  }

  return sortedEntries.map((entry) => {
    const point: ChartDataPoint = {
      month: monthLabel(entry.month),
      value: entry.value,
    }
    if (yoyActive) {
      point.priorYear = priorLookup.get(entry.month) ?? null
    }
    return point
  })
}

interface UtilityDetailChartProps {
  utility: Utility
  metrics: UtilityMetrics | null
  priorYearMetrics?: UtilityMetrics | null
}

function UtilityDetailChart({ utility, metrics, priorYearMetrics }: UtilityDetailChartProps) {
  const [mode, setMode] = useState<string>('consumption')
  const [timeSpan, setTimeSpan] = useState<TimeSpan>(DEFAULT_TIME_SPAN)
  const [yoyActive, setYoyActive] = useState(false)

  const utilityColor = UTILITY_CHART_COLORS[utility.color]

  const chartData = useMemo(
    () => buildChartData(mode as ChartMode, metrics, priorYearMetrics, timeSpan, yoyActive),
    [mode, metrics, priorYearMetrics, timeSpan, yoyActive],
  )

  return (
    <ChartCard
      title="Consumption & Cost"
      modes={chartModes}
      activeMode={mode}
      onModeChange={setMode}
      timeSpan={timeSpan}
      onTimeSpanChange={setTimeSpan}
      yoyActive={yoyActive}
      onYoYChange={setYoyActive}
    >
      <div className="h-56 lg:h-64">
        {!metrics || chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-base-300 dark:text-base-500 text-sm">
            No data available
          </div>
        ) : mode === 'costPerUnit' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-base-200 dark:text-base-700"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-base-400"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-base-400"
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-base-800)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              {yoyActive && (
                <Line
                  type="monotone"
                  dataKey="priorYear"
                  stroke={utilityColor}
                  strokeDasharray="5 5"
                  opacity={0.4}
                  dot={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={utilityColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-base-200 dark:text-base-700"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-base-400"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                className="text-base-400"
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-base-800)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              {yoyActive && (
                <Bar
                  dataKey="priorYear"
                  fill={utilityColor}
                  opacity={0.3}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
              <Bar
                dataKey="value"
                fill={utilityColor}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  )
}

export { UtilityDetailChart }
