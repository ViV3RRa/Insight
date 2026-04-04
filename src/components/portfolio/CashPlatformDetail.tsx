import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft, ArrowDownUp, Database, Paperclip } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { ChartCard } from '@/components/shared/ChartCard'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { TransactionTypeBadge } from '@/components/shared/TransactionTypeBadge'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonChart, SkeletonKpiCard, SkeletonTableRows } from '@/components/shared/Skeleton'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import type { TimeSpan } from '@/utils/timeSpan'

interface BalanceHistoryPoint {
  timestamp: string
  value: number
}

interface CashTransactionRow {
  id: string
  date: string
  type: 'deposit' | 'withdrawal'
  amount: number
  amountDkk?: number
  currency: string
  exchangeRate?: number
  note?: string
  attachmentUrl?: string
}

interface CashDataPointRow {
  id: string
  date: string
  value: number
  valueDkk?: number
  currency: string
  note?: string
}

interface CashPlatformDetailProps {
  platformName: string
  platformIcon: string
  currency: string
  currentBalance: number
  currentBalanceDkk?: number
  balanceHistory: BalanceHistoryPoint[]
  transactions: CashTransactionRow[]
  dataPoints: CashDataPointRow[]
  showExchangeRate: boolean
  timeSpan: TimeSpan
  onTimeSpanChange: (span: TimeSpan) => void
  onBack?: () => void
  onAddDataPoint?: () => void
  onAddTransaction?: () => void
  onEditTransaction?: (row: CashTransactionRow) => void
  onDeleteTransaction?: (row: CashTransactionRow) => void
  onEditDataPoint?: (row: CashDataPointRow) => void
  onDeleteDataPoint?: (row: CashDataPointRow) => void
  isLoading?: boolean
}

const BALANCE_COLOR = '#3b82f6'

function CashPlatformDetail({
  platformName,
  platformIcon,
  currency,
  currentBalance,
  currentBalanceDkk,
  balanceHistory,
  transactions,
  dataPoints,
  showExchangeRate,
  timeSpan,
  onTimeSpanChange,
  onBack,
  onAddDataPoint,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onEditDataPoint,
  onDeleteDataPoint,
  isLoading = false,
}: CashPlatformDetailProps) {
  const isDkk = currency === 'DKK'

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [transactions],
  )

  const sortedDataPoints = useMemo(
    () => [...dataPoints].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [dataPoints],
  )

  const transactionColumns = useMemo<Array<ColumnDef<CashTransactionRow>>>(() => {
    const cols: Array<ColumnDef<CashTransactionRow>> = [
      {
        key: 'date',
        label: 'Date',
        align: 'left',
        format: (value) => (
          <span className="text-base-900 dark:text-white">{String(value)}</span>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        align: 'left',
        format: (_value, row) => <TransactionTypeBadge type={row.type} />,
      },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        format: (_value, row) => (
          <CurrencyDisplay
            amount={row.amount}
            currency={row.currency}
            dkkEquivalent={row.amountDkk}
            size="sm"
          />
        ),
      },
    ]

    if (showExchangeRate) {
      cols.push({
        key: 'exchangeRate',
        label: 'Exchange Rate',
        align: 'right',
        hideOnMobile: true,
        format: (value) => {
          if (value == null) {
            return <span className="text-base-200 dark:text-base-600">&mdash;</span>
          }
          return (
            <span className="font-mono-data text-sm text-base-500 dark:text-base-400">
              {formatNumber(value as number, 4)}
            </span>
          )
        },
      })
    }

    cols.push(
      {
        key: 'note',
        label: 'Note',
        align: 'left',
        hideOnMobile: true,
        format: (value) => {
          if (!value) {
            return <span className="text-base-200 dark:text-base-600">&mdash;</span>
          }
          return (
            <span className="italic text-xs text-base-300 dark:text-base-500">
              {String(value)}
            </span>
          )
        },
      },
      {
        key: 'attachmentUrl',
        label: 'Attachment',
        align: 'left',
        hideOnMobile: true,
        format: (value) => {
          if (value) {
            return (
              <a
                href={String(value)}
                className="text-base-400 hover:text-accent-600 dark:hover:text-accent-400"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </a>
            )
          }
          return <span className="text-base-200 dark:text-base-600">&mdash;</span>
        },
      },
    )

    return cols
  }, [showExchangeRate])

  const dataPointColumns: Array<ColumnDef<CashDataPointRow>> = [
    {
      key: 'date',
      label: 'Date',
      align: 'left',
      format: (value) => (
        <span className="text-base-900 dark:text-white">{String(value)}</span>
      ),
    },
    {
      key: 'value',
      label: 'Value',
      align: 'right',
      format: (_value, row) => (
        <CurrencyDisplay
          amount={row.value}
          currency={row.currency}
          dkkEquivalent={row.valueDkk}
          size="sm"
        />
      ),
    },
    {
      key: 'note',
      label: 'Note',
      align: 'left',
      hideOnMobile: true,
      format: (value) => {
        if (!value) {
          return <span className="text-base-200 dark:text-base-600">&mdash;</span>
        }
        return (
          <span className="italic text-xs text-base-300 dark:text-base-500">
            {String(value)}
          </span>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-xl bg-base-50 dark:bg-base-700" />
          <div className="w-7 h-7 rounded-full bg-base-100 dark:bg-base-700" />
          <div className="w-40 h-7 rounded bg-base-100 dark:bg-base-700" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <SkeletonKpiCard count={1} />
        </div>
        <SkeletonChart />
        <div className="mt-6">
          <SkeletonTableRows count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to portfolio overview"
            className="w-11 h-11 sm:w-8 sm:h-8 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <PlatformIcon name={platformName} imageUrl={platformIcon} size="md" />

        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
            {platformName}
          </h1>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-base-100 dark:bg-base-700 text-base-500 dark:text-base-400">
            {currency}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-6 lg:mb-8">
        {onAddDataPoint && (
          <Button variant="secondary" size="sm" onClick={onAddDataPoint}>
            + Add Data Point
          </Button>
        )}
        {onAddTransaction && (
          <Button variant="primary" size="sm" onClick={onAddTransaction}>
            + Add Transaction
          </Button>
        )}
      </div>

      {/* Current Balance stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <StatCard
          label="Current Balance"
          value={formatCurrency(currentBalance, currency)}
          variant="simple"
          sublabel={!isDkk && currentBalanceDkk != null ? `≈ ${formatCurrency(currentBalanceDkk, 'DKK')}` : undefined}
        />
      </div>

      {/* Balance History chart */}
      <div className="mb-6 lg:mb-8">
        <ChartCard
          title="Balance History"
          timeSpan={timeSpan}
          onTimeSpanChange={onTimeSpanChange}
          hideYoY
        >
          {balanceHistory.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-base-400 dark:text-base-500 text-sm">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <AreaChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-base-200 dark:stroke-base-700" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} className="text-base-400" />
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={BALANCE_COLOR}
                  fill={BALANCE_COLOR}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Transactions table */}
      <div className="mb-6 lg:mb-8">
        <CollapsibleSection
          title="Transactions"
          icon={ArrowDownUp}
          count={transactions.length}
          defaultExpanded={false}
        >
          {onAddTransaction && (
            <div className="px-4 py-3 sm:px-5 border-b border-base-100 dark:border-base-700 flex justify-end">
              <Button variant="secondary" size="sm" onClick={onAddTransaction}>
                + Add Transaction
              </Button>
            </div>
          )}

          {sortedTransactions.length === 0 ? (
            <EmptyState
              variant="section"
              icon={ArrowDownUp}
              description="No transactions recorded yet."
            />
          ) : (
            <DataTable
              columns={transactionColumns}
              data={sortedTransactions}
              keyExtractor={(row) => row.id}
              onEdit={onEditTransaction}
              onDelete={onDeleteTransaction}
            />
          )}
        </CollapsibleSection>
      </div>

      {/* Data Points table */}
      <div className="mb-6 lg:mb-8">
        <CollapsibleSection
          title="Data Points"
          icon={Database}
          count={dataPoints.length}
          defaultExpanded={false}
        >
          {onAddDataPoint && (
            <div className="flex justify-end px-4 pt-3 sm:px-5">
              <Button variant="ghost" size="sm" onClick={onAddDataPoint}>
                + Add Data Point
              </Button>
            </div>
          )}

          {sortedDataPoints.length === 0 ? (
            <EmptyState
              variant="section"
              icon={Database}
              description="No data points recorded yet."
            />
          ) : (
            <DataTable
              columns={dataPointColumns}
              data={sortedDataPoints}
              keyExtractor={(row) => row.id}
              onEdit={onEditDataPoint}
              onDelete={onDeleteDataPoint}
            />
          )}
        </CollapsibleSection>
      </div>
    </div>
  )
}

export { CashPlatformDetail }
export type {
  BalanceHistoryPoint,
  CashTransactionRow,
  CashDataPointRow,
  CashPlatformDetailProps,
}
