import { type ReactNode, useMemo, useState } from 'react'
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
import { TabBar } from '../shared/TabBar'
import { ChartModeToggle } from '../shared/ChartModeToggle'
import { DataTable, type ColumnDef } from '../shared/DataTable'
import { Skeleton } from '../shared/Skeleton'
import { formatCurrency, formatPercent, formatYearLabel } from '../../utils/formatters'

interface YearlyData {
  year: number
  startingValue: number
  endingValue: number
  netDeposits: number
  earnings: number
  earningsPercent: number
  xirr: number | null
}

interface PortfolioOverviewPerfYearlyProps {
  yearlyData: YearlyData[]
  totals: {
    startingValue: number
    endingValue: number
    netDeposits: number
    earnings: number
    earningsPercent: number
    xirr: number | null
  }
  isLoading?: boolean
}

type YearlyRow = YearlyData & { yearLabel: string }

const yearlyColumns: ColumnDef<YearlyRow>[] = [
  { key: 'yearLabel', label: 'Year', align: 'left' },
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
    key: 'earningsPercent',
    label: 'Earnings %',
    align: 'right',
    hideOnMobile: true,
    format: (v) => {
      const num = v as number
      const color =
        num >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400'
      return <span className={color}>{formatPercent(num)}</span>
    },
  },
  {
    key: 'xirr',
    label: 'XIRR',
    align: 'right',
    hideOnMobile: true,
    format: (v) => {
      if (v == null) return <span className="text-base-300">–</span>
      return <span className="font-semibold">{formatPercent(v as number)}</span>
    },
  },
]

function PortfolioOverviewPerfYearly({
  yearlyData,
  totals,
  isLoading = false,
}: PortfolioOverviewPerfYearlyProps) {
  const [activeTab, setActiveTab] = useState('yearly')
  const [chartMode, setChartMode] = useState('earnings')

  const currentYear = new Date().getFullYear()

  const tableData: YearlyRow[] = useMemo(
    () =>
      yearlyData.map((d) => ({
        ...d,
        yearLabel: formatYearLabel(d.year, d.year === currentYear),
      })),
    [yearlyData, currentYear],
  )

  const barData = useMemo(
    () =>
      yearlyData.map((d) => ({
        year: formatYearLabel(d.year, d.year === currentYear),
        value: chartMode === 'earnings' ? d.earnings : (d.xirr ?? 0),
      })),
    [yearlyData, chartMode, currentYear],
  )

  const totalsRow: Record<string, ReactNode> = useMemo(
    () => ({
      yearLabel: 'All Time',
      startingValue: formatCurrency(totals.startingValue, 'DKK'),
      endingValue: formatCurrency(totals.endingValue, 'DKK'),
      netDeposits: formatCurrency(totals.netDeposits, 'DKK'),
      earnings: (
        <span
          className={
            totals.earnings >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }
        >
          {formatCurrency(totals.earnings, 'DKK')}
        </span>
      ),
      earningsPercent: (
        <span
          className={
            totals.earningsPercent >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }
        >
          {formatPercent(totals.earningsPercent)}
        </span>
      ),
      xirr:
        totals.xirr != null ? (
          <span className="font-semibold">{formatPercent(totals.xirr)}</span>
        ) : (
          <span className="text-base-300">–</span>
        ),
    }),
    [totals],
  )

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        <div className="p-4 sm:p-6">
          <Skeleton width="w-24" height="h-4" className="mb-4" />
          <Skeleton width="w-full" height="h-64" className="rounded-lg mb-6" />
          <Skeleton width="w-full" height="h-40" className="rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
      <TabBar
        tabs={[
          { label: 'Yearly', value: 'yearly' },
          { label: 'Monthly', value: 'monthly' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        rightContent={
          <ChartModeToggle
            options={[
              { label: 'Earnings', value: 'earnings' },
              { label: 'XIRR', value: 'xirr' },
            ]}
            value={chartMode}
            onChange={setChartMode}
          />
        }
      />

      {activeTab === 'yearly' && (
        <div className="p-4 sm:p-6">
          <div className="h-64 sm:h-72 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-base-200 dark:stroke-base-700"
                />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
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
            columns={yearlyColumns}
            data={tableData}
            totals={totalsRow}
            keyExtractor={(row) => String(row.year)}
          />
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="p-4 sm:p-6 text-center text-sm text-base-400">
          Monthly analysis coming soon
        </div>
      )}
    </div>
  )
}

export { PortfolioOverviewPerfYearly }
export type { YearlyData, PortfolioOverviewPerfYearlyProps }
