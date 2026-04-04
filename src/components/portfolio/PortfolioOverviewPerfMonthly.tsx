import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { DataTable, type ColumnDef } from '../shared/DataTable'
import { Skeleton } from '../shared/Skeleton'
import { formatCurrency, formatPercent } from '../../utils/formatters'

interface MonthlyData {
  period: string
  periodLabel: string
  startingValue: number
  endingValue: number
  netDeposits: number
  earnings: number
  monthlyXirr: number | null
}

interface PortfolioOverviewPerfMonthlyProps {
  monthlyData: MonthlyData[]
  chartMode: 'earnings' | 'xirr'
  isLoading?: boolean
}

const monthlyColumns: ColumnDef<MonthlyData>[] = [
  { key: 'periodLabel', label: 'Period', align: 'left' },
  {
    key: 'startingValue',
    label: 'Starting Value',
    align: 'right',
    hideOnMobile: true,
    format: (v) => formatCurrency(v as number, 'DKK'),
  },
  {
    key: 'endingValue',
    label: 'Ending Value',
    align: 'right',
    hideOnMobile: true,
    format: (v) => formatCurrency(v as number, 'DKK'),
  },
  {
    key: 'netDeposits',
    label: 'Net Deposits',
    align: 'right',
    hideOnMobile: true,
    format: (v) => formatCurrency(v as number, 'DKK'),
  },
  {
    key: 'earnings',
    label: 'Earnings',
    align: 'right',
    format: (v) => {
      const num = v as number
      const color =
        num >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400'
      return <span className={color}>{formatCurrency(num, 'DKK')}</span>
    },
  },
  {
    key: 'monthlyXirr',
    label: 'Monthly XIRR',
    align: 'right',
    hideOnMobile: true,
    format: (v) => {
      if (v == null) return <span className="text-base-300">–</span>
      const num = v as number
      const color =
        num >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400'
      return <span className={color}>{formatPercent(num)}</span>
    },
  },
]

function PortfolioOverviewPerfMonthly({
  monthlyData,
  chartMode,
  isLoading = false,
}: PortfolioOverviewPerfMonthlyProps) {
  const barData = useMemo(
    () =>
      monthlyData.map((d) => ({
        period: d.periodLabel,
        value: chartMode === 'earnings' ? d.earnings : (d.monthlyXirr ?? 0),
      })),
    [monthlyData, chartMode],
  )

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Skeleton width="w-full" height="h-64" className="rounded-lg mb-6" />
        <Skeleton width="w-full" height="h-40" className="rounded-lg" />
      </div>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <div className="p-4 sm:p-6 text-center text-sm text-base-400">
        No monthly data available
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="h-64 sm:h-72 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-base-200 dark:stroke-base-700"
            />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="value" position="top" fontSize={10} />
              {barData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={monthlyColumns}
        data={monthlyData}
        showMoreThreshold={12}
        keyExtractor={(row) => row.period}
      />
    </div>
  )
}

export { PortfolioOverviewPerfMonthly }
export type { MonthlyData, PortfolioOverviewPerfMonthlyProps }
