import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartCard } from '@/components/shared/ChartCard'
import { SkeletonChart } from '@/components/shared/Skeleton'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import type { TimeSpan } from '@/utils/timeSpan'

interface EarningsDataPoint {
  month: string
  earnings: number
}

interface XirrDataPoint {
  month: string
  xirr: number
}

interface PlatformDetailPerfChartProps {
  earningsData: EarningsDataPoint[]
  xirrData: XirrDataPoint[]
  yoyEarningsData?: EarningsDataPoint[]
  yoyXirrData?: XirrDataPoint[]
  currency: string
  timeSpan: TimeSpan
  onTimeSpanChange: (span: TimeSpan) => void
  yoyActive: boolean
  onYoYChange: (active: boolean) => void
  isLoading?: boolean
}

const MODES = [
  { label: 'Earnings', value: 'earnings' },
  { label: 'XIRR %', value: 'xirr' },
]

const POSITIVE_COLOR = '#22c55e'
const NEGATIVE_COLOR = '#ef4444'
const XIRR_COLOR = '#3b82f6'

function PlatformDetailPerfChart({
  earningsData,
  xirrData,
  yoyEarningsData,
  yoyXirrData,
  currency,
  timeSpan,
  onTimeSpanChange,
  yoyActive,
  onYoYChange,
  isLoading = false,
}: PlatformDetailPerfChartProps) {
  const [activeMode, setActiveMode] = useState('earnings')

  if (isLoading) {
    return <SkeletonChart />
  }

  const isEarningsMode = activeMode === 'earnings'
  const data = isEarningsMode ? earningsData : xirrData
  const isEmpty = data.length === 0

  // Merge earnings data with YoY
  const mergedEarningsData = earningsData.map((item, i) => ({
    month: item.month,
    earnings: item.earnings,
    yoyEarnings: yoyEarningsData?.[i]?.earnings ?? 0,
  }))

  // Merge XIRR data with YoY
  const mergedXirrData = xirrData.map((item, i) => ({
    month: item.month,
    xirr: item.xirr,
    yoyXirr: yoyXirrData?.[i]?.xirr ?? 0,
  }))

  return (
    <ChartCard
      title="Performance Overview"
      modes={MODES}
      activeMode={activeMode}
      onModeChange={setActiveMode}
      timeSpan={timeSpan}
      onTimeSpanChange={onTimeSpanChange}
      yoyActive={yoyActive}
      onYoYChange={onYoYChange}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-60 text-base-400 dark:text-base-500 text-sm">
          No data available
        </div>
      ) : isEarningsMode ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={mergedEarningsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-700" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-base-400" />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-base-400"
              tickFormatter={(value: number) => formatCurrency(value, currency)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{
                backgroundColor: 'var(--color-base-800, #1f2937)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem',
              }}
            />
            {yoyActive && yoyEarningsData && (
              <Bar dataKey="yoyEarnings" opacity={0.3}>
                {mergedEarningsData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.yoyEarnings >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                  />
                ))}
              </Bar>
            )}
            <Bar dataKey="earnings">
              {mergedEarningsData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.earnings >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={mergedXirrData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-700" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-base-400" />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-base-400"
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              formatter={(value: number) => formatPercent(value)}
              contentStyle={{
                backgroundColor: 'var(--color-base-800, #1f2937)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem',
              }}
            />
            <Area
              type="monotone"
              dataKey="xirr"
              fill={XIRR_COLOR}
              fillOpacity={0.1}
              stroke="none"
            />
            {yoyActive && yoyXirrData && (
              <Line
                type="monotone"
                dataKey="yoyXirr"
                stroke={XIRR_COLOR}
                strokeDasharray="5 5"
                strokeOpacity={0.4}
                dot={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="xirr"
              stroke={XIRR_COLOR}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export { PlatformDetailPerfChart }
export type {
  EarningsDataPoint,
  XirrDataPoint,
  PlatformDetailPerfChartProps,
}
