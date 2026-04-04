import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '@/components/shared/ChartCard'
import { SkeletonChart } from '@/components/shared/Skeleton'
import { formatMonthPeriod, formatCurrency, formatPercent } from '@/utils/formatters'
import type { TimeSpan } from '@/utils/timeSpan'

const PLATFORM_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#eab308', // yellow
]

interface PlatformSeries {
  name: string
  color: string
}

interface CompositeDataPoint {
  timestamp: string
  totalValue: number
  platformValues: Record<string, number>
}

interface MonthlyPerformancePoint {
  month: string
  earnings: number
  xirr: number | null
}

interface PortfolioOverviewValueChartsProps {
  compositeData: CompositeDataPoint[]
  platforms: PlatformSeries[]
  monthlyPerformance: MonthlyPerformancePoint[]
  yoyMonthlyPerformance?: MonthlyPerformancePoint[]
  timeSpan: TimeSpan
  onTimeSpanChange: (span: TimeSpan) => void
  yoyActive: boolean
  onYoYChange: (active: boolean) => void
  isLoading?: boolean
}

const PERFORMANCE_MODES = [
  { label: 'Earnings', value: 'earnings' },
  { label: 'XIRR', value: 'xirr' },
]

const POSITIVE_COLOR = '#22c55e' // emerald-500
const NEGATIVE_COLOR = '#ef4444' // rose-500

function PortfolioOverviewValueCharts({
  compositeData,
  platforms,
  monthlyPerformance,
  yoyMonthlyPerformance,
  timeSpan,
  onTimeSpanChange,
  yoyActive,
  onYoYChange,
  isLoading = false,
}: PortfolioOverviewValueChartsProps) {
  const [activeMode, setActiveMode] = useState('earnings')

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  // Transform composite data for the stacked area chart
  const areaChartData = compositeData.map((dp) => ({
    month: formatMonthPeriod(dp.timestamp),
    ...dp.platformValues,
  }))

  // Transform monthly performance for the bar chart
  const barData = monthlyPerformance.map((dp) => ({
    month: dp.month,
    value: activeMode === 'earnings' ? dp.earnings : (dp.xirr ?? 0),
  }))

  // YoY bar data when active
  const yoyBarData = yoyActive && yoyMonthlyPerformance
    ? yoyMonthlyPerformance.map((dp) => ({
        month: dp.month,
        yoyValue: activeMode === 'earnings' ? dp.earnings : (dp.xirr ?? 0),
      }))
    : null

  // Merge current and YoY data for the bar chart
  const mergedBarData = barData.map((item, i) => ({
    ...item,
    yoyValue: yoyBarData?.[i]?.yoyValue ?? 0,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <ChartCard
        title="Portfolio Value"
        timeSpan={timeSpan}
        onTimeSpanChange={onTimeSpanChange}
        yoyActive={yoyActive}
        onYoYChange={onYoYChange}
        hideYoY
        hideTimeSpan
      >
        {compositeData.length === 0 ? (
          <div className="flex items-center justify-center h-60 text-base-400 dark:text-base-500 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={areaChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-base-400" />
              <YAxis tick={{ fontSize: 11 }} className="text-base-400" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value, 'DKK')}
                contentStyle={{
                  backgroundColor: 'var(--color-base-800, #1f2937)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.75rem',
                }}
              />
              {platforms.map((platform) => (
                <Area
                  key={platform.name}
                  type="monotone"
                  dataKey={platform.name}
                  stackId="1"
                  fill={platform.color}
                  stroke={platform.color}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Monthly Performance"
        modes={PERFORMANCE_MODES}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        timeSpan={timeSpan}
        onTimeSpanChange={onTimeSpanChange}
        yoyActive={yoyActive}
        onYoYChange={onYoYChange}
        hideYoY
        hideTimeSpan
      >
        {monthlyPerformance.length === 0 ? (
          <div className="flex items-center justify-center h-60 text-base-400 dark:text-base-500 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mergedBarData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-base-400" />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-base-400"
                tickFormatter={(value: number) =>
                  activeMode === 'xirr' ? `${value}%` : String(value)
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  activeMode === 'earnings'
                    ? formatCurrency(value, 'DKK')
                    : formatPercent(value)
                }
                contentStyle={{
                  backgroundColor: 'var(--color-base-800, #1f2937)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.75rem',
                }}
              />
              {yoyActive && yoyBarData && (
                <Bar dataKey="yoyValue" opacity={0.3}>
                  {mergedBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.yoyValue >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                    />
                  ))}
                </Bar>
              )}
              <Bar dataKey="value">
                {mergedBarData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}

export { PortfolioOverviewValueCharts, PLATFORM_COLORS }
export type {
  PlatformSeries,
  CompositeDataPoint,
  MonthlyPerformancePoint,
  PortfolioOverviewValueChartsProps,
}
