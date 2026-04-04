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
import { formatCurrency, formatPercent } from '../../utils/formatters'

interface YearlyPerfRow {
  period: string
  startingValue: number
  endingValue: number
  netDeposits: number
  earnings: number
  earningsPercent: number
  xirr: number | null
}

interface MonthlyPerfRow {
  period: string
  startingValue: number
  endingValue: number
  netDeposits: number
  earnings: number
  monthlyXirr: number | null
}

interface PlatformDetailPerfTabsProps {
  yearlyData: YearlyPerfRow[]
  monthlyData: MonthlyPerfRow[]
  yearlyTotals?: YearlyPerfRow
  monthlyTotals?: MonthlyPerfRow
  currency: string
  isLoading?: boolean
}

function buildYearlyColumns(currency: string): ColumnDef<YearlyPerfRow>[] {
  return [
    { key: 'period', label: 'Period', align: 'left' },
    {
      key: 'startingValue',
      label: 'Starting Value',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
    },
    {
      key: 'endingValue',
      label: 'Ending Value',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
    },
    {
      key: 'netDeposits',
      label: 'Net Deposits',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
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
        return <span className={color}>{formatCurrency(num, currency)}</span>
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
}

function buildMonthlyColumns(currency: string): ColumnDef<MonthlyPerfRow>[] {
  return [
    { key: 'period', label: 'Period', align: 'left' },
    {
      key: 'startingValue',
      label: 'Starting Value',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
    },
    {
      key: 'endingValue',
      label: 'Ending Value',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
    },
    {
      key: 'netDeposits',
      label: 'Net Deposits',
      align: 'right',
      hideOnMobile: true,
      format: (v) => formatCurrency(v as number, currency),
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
        return <span className={color}>{formatCurrency(num, currency)}</span>
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
}

function PlatformDetailPerfTabs({
  yearlyData,
  monthlyData,
  yearlyTotals,
  monthlyTotals,
  currency,
  isLoading = false,
}: PlatformDetailPerfTabsProps) {
  const [activeTab, setActiveTab] = useState('yearly')
  const [chartMode, setChartMode] = useState('earnings')

  const yearlyColumns = useMemo(() => buildYearlyColumns(currency), [currency])
  const monthlyColumns = useMemo(() => buildMonthlyColumns(currency), [currency])

  const yearlyBarData = useMemo(
    () =>
      yearlyData.map((d) => ({
        period: d.period,
        value: chartMode === 'earnings' ? d.earnings : (d.xirr ?? 0),
      })),
    [yearlyData, chartMode],
  )

  const monthlyBarData = useMemo(
    () =>
      monthlyData.map((d) => ({
        period: d.period,
        value: chartMode === 'earnings' ? d.earnings : (d.monthlyXirr ?? 0),
      })),
    [monthlyData, chartMode],
  )

  const yearlyTotalsRow: Record<string, ReactNode> | undefined = useMemo(() => {
    if (!yearlyTotals) return undefined
    return {
      period: 'All Time',
      startingValue: formatCurrency(yearlyTotals.startingValue, currency),
      endingValue: formatCurrency(yearlyTotals.endingValue, currency),
      netDeposits: formatCurrency(yearlyTotals.netDeposits, currency),
      earnings: (
        <span
          className={
            yearlyTotals.earnings >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }
        >
          {formatCurrency(yearlyTotals.earnings, currency)}
        </span>
      ),
      earningsPercent: (
        <span
          className={
            yearlyTotals.earningsPercent >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }
        >
          {formatPercent(yearlyTotals.earningsPercent)}
        </span>
      ),
      xirr:
        yearlyTotals.xirr != null ? (
          <span className="font-semibold">{formatPercent(yearlyTotals.xirr)}</span>
        ) : (
          <span className="text-base-300">–</span>
        ),
    }
  }, [yearlyTotals, currency])

  const monthlyTotalsRow: Record<string, ReactNode> | undefined = useMemo(() => {
    if (!monthlyTotals) return undefined
    return {
      period: 'All Time',
      startingValue: formatCurrency(monthlyTotals.startingValue, currency),
      endingValue: formatCurrency(monthlyTotals.endingValue, currency),
      netDeposits: formatCurrency(monthlyTotals.netDeposits, currency),
      earnings: (
        <span
          className={
            monthlyTotals.earnings >= 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }
        >
          {formatCurrency(monthlyTotals.earnings, currency)}
        </span>
      ),
      monthlyXirr:
        monthlyTotals.monthlyXirr != null ? (
          <span
            className={
              monthlyTotals.monthlyXirr >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }
          >
            {formatPercent(monthlyTotals.monthlyXirr)}
          </span>
        ) : (
          <span className="text-base-300">–</span>
        ),
    }
  }, [monthlyTotals, currency])

  if (isLoading) {
    return (
      <div
        className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8"
        data-testid="perf-tabs-loading"
      >
        <div className="p-4 sm:p-6">
          <Skeleton width="w-24" height="h-4" className="mb-4" />
          <Skeleton width="w-full" height="h-64" className="rounded-lg mb-6" />
          <Skeleton width="w-full" height="h-40" className="rounded-lg" />
        </div>
      </div>
    )
  }

  const hasData = activeTab === 'yearly' ? yearlyData.length > 0 : monthlyData.length > 0
  const barData = activeTab === 'yearly' ? yearlyBarData : monthlyBarData

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
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

      {!hasData ? (
        <div className="p-4 sm:p-6 text-center text-sm text-base-400">
          No performance data available
        </div>
      ) : (
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

          {activeTab === 'yearly' && (
            <DataTable
              columns={yearlyColumns}
              data={yearlyData}
              totals={yearlyTotalsRow}
              keyExtractor={(row) => row.period}
            />
          )}

          {activeTab === 'monthly' && (
            <DataTable
              columns={monthlyColumns}
              data={monthlyData}
              totals={monthlyTotalsRow}
              showMoreThreshold={12}
              keyExtractor={(row) => row.period}
            />
          )}
        </div>
      )}
    </div>
  )
}

export { PlatformDetailPerfTabs }
export type {
  YearlyPerfRow,
  MonthlyPerfRow,
  PlatformDetailPerfTabsProps,
}
