import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { YoYToggle } from '@/components/shared/YoYToggle'
import { ChartModeToggle } from '@/components/shared/ChartModeToggle'
import { TimeSpanSelector } from '@/components/shared/TimeSpanSelector'
import { type TimeSpan, getTimeSpanRange } from '@/utils/timeSpan'
import type { Utility, UtilityMetrics, UtilityColor } from '@/types/home'
import { parse, format, isWithinInterval } from 'date-fns'

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
]

const layoutModes = [
  { label: 'Grouped', value: 'grouped' },
  { label: 'Stacked', value: 'stacked' },
]

interface HomeOverviewChartProps {
  utilities: Utility[]
  metricsMap: Map<string, UtilityMetrics>
  priorYearMetricsMap?: Map<string, UtilityMetrics>
}

function HomeOverviewChart({
  utilities,
  metricsMap,
  priorYearMetricsMap,
}: HomeOverviewChartProps) {
  const [mode, setMode] = useState<string>('consumption')
  const [layout, setLayout] = useState<string>('grouped')
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('YTD')
  const [yoyActive, setYoyActive] = useState(false)

  const chartData = useMemo(() => {
    if (utilities.length === 0) return []

    const { start, end } = getTimeSpanRange(timeSpan)

    // Collect all unique months across all utilities within the time range
    const monthSet = new Set<string>()

    for (const utility of utilities) {
      const metrics = metricsMap.get(utility.id)
      if (!metrics) continue

      const entries =
        mode === 'consumption'
          ? metrics.monthlyConsumption
          : metrics.monthlyCost

      for (const entry of entries) {
        const monthDate = parse(entry.month, 'yyyy-MM', new Date())
        if (isWithinInterval(monthDate, { start, end })) {
          monthSet.add(entry.month)
        }
      }
    }

    const sortedMonths = Array.from(monthSet).sort()

    return sortedMonths.map((month) => {
      const monthDate = parse(month, 'yyyy-MM', new Date())
      const label = format(monthDate, 'MMM yyyy')
      const row: Record<string, string | number> = { month: label }

      for (const utility of utilities) {
        const metrics = metricsMap.get(utility.id)
        if (!metrics) continue

        if (mode === 'consumption') {
          const entry = metrics.monthlyConsumption.find(
            (e) => e.month === month,
          )
          row[utility.name] = entry?.consumption ?? 0
        } else {
          const entry = metrics.monthlyCost.find((e) => e.month === month)
          row[utility.name] = entry?.cost ?? 0
        }

        // YoY prior year data
        if (yoyActive && priorYearMetricsMap) {
          const priorMetrics = priorYearMetricsMap.get(utility.id)
          if (priorMetrics) {
            if (mode === 'consumption') {
              const entry = priorMetrics.monthlyConsumption.find(
                (e) => e.month === month,
              )
              row[`${utility.name}_yoy`] = entry?.consumption ?? 0
            } else {
              const entry = priorMetrics.monthlyCost.find(
                (e) => e.month === month,
              )
              row[`${utility.name}_yoy`] = entry?.cost ?? 0
            }
          }
        }
      }

      return row
    })
  }, [utilities, metricsMap, priorYearMetricsMap, mode, timeSpan, yoyActive])

  const isStacked = layout === 'stacked'

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-6">
      {/* Row 1: Title + controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-base-900 dark:text-white">
          Monthly Overview
        </h3>

        <div className="flex items-center gap-2">
          <YoYToggle active={yoyActive} onChange={setYoyActive} />
          <ChartModeToggle
            options={layoutModes}
            value={layout}
            onChange={setLayout}
          />
          <ChartModeToggle
            options={chartModes}
            value={mode}
            onChange={setMode}
          />
        </div>
      </div>

      {/* Row 2: Time span selector */}
      <div className="mb-4">
        <TimeSpanSelector value={timeSpan} onChange={setTimeSpan} />
      </div>

      {/* Row 3: Chart area */}
      <div className="h-56 lg:h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-base-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
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
              {utilities.map((utility) => (
                <Bar
                  key={utility.id}
                  dataKey={utility.name}
                  fill={UTILITY_CHART_COLORS[utility.color]}
                  stackId={isStacked ? 'stack' : undefined}
                  radius={isStacked ? 0 : [2, 2, 0, 0]}
                  maxBarSize={40}
                />
              ))}
              {yoyActive &&
                priorYearMetricsMap &&
                utilities.map((utility) => (
                  <Bar
                    key={`${utility.id}_yoy`}
                    dataKey={`${utility.name}_yoy`}
                    fill={UTILITY_CHART_COLORS[utility.color]}
                    stackId={isStacked ? 'stack_yoy' : undefined}
                    radius={isStacked ? 0 : [2, 2, 0, 0]}
                    maxBarSize={40}
                    opacity={0.3}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {utilities.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {utilities.map((utility) => (
            <div key={utility.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: UTILITY_CHART_COLORS[utility.color],
                }}
              />
              <span className="text-xs text-base-400">{utility.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { HomeOverviewChart }
