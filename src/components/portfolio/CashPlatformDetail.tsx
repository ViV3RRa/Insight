import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import * as platformService from '@/services/platforms'
import * as dataPointService from '@/services/dataPoints'
import * as transactionService from '@/services/transactions'
import { StatCard } from '@/components/shared/StatCard'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { ChartCard } from '@/components/shared/ChartCard'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { TransactionTypeBadge } from '@/components/shared/TransactionTypeBadge'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { DataPointDialog } from './dialogs/DataPointDialog'
import { TransactionDialog } from './dialogs/TransactionDialog'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import { formatCurrency, formatNumber } from '@/utils/formatters'
import type { DataPoint, Transaction } from '@/types/investment'
import type { TimeSpan } from '@/utils/timeSpan'

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

const BALANCE_COLOR = '#3b82f6'

function CashPlatformDetail() {
  const { platformId } = useParams<{ platformId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const selectedPortfolioId = useInvestmentUIStore((s) => s.selectedPortfolioId)

  const [chartTimeSpan, setChartTimeSpan] = useState<TimeSpan>('YTD')
  const [showAddDataPoint, setShowAddDataPoint] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [editDataPoint, setEditDataPoint] = useState<DataPoint | null>(null)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [deleteDataPoint, setDeleteDataPoint] = useState<DataPoint | null>(null)
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null)

  // Data fetching
  const { data: platform, isLoading: platformLoading } = useQuery({
    queryKey: ['platforms', selectedPortfolioId, platformId],
    queryFn: () => platformService.getOne(platformId!),
    enabled: !!platformId,
  })

  const portfolioId = platform?.portfolioId ?? selectedPortfolioId

  const { data: allPlatforms = [] } = useQuery({
    queryKey: ['platforms', portfolioId],
    queryFn: () => platformService.getByPortfolio(portfolioId!),
    enabled: !!portfolioId,
  })

  const { data: dataPoints = [] } = useQuery({
    queryKey: ['dataPoints', platformId],
    queryFn: () => dataPointService.getByPlatform(platformId!),
    enabled: !!platformId,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', platformId],
    queryFn: () => transactionService.getByPlatform(platformId!),
    enabled: !!platformId,
  })

  // Derived data
  const currency = platform?.currency ?? 'DKK'
  const isDkk = currency === 'DKK'
  const showExchangeRate = !isDkk
  const currentBalance = dataPoints.length > 0 ? dataPoints[0]!.value : 0

  const balanceHistory = useMemo(
    () =>
      [...dataPoints]
        .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
        .map((dp) => ({ timestamp: dp.timestamp, value: dp.value })),
    [dataPoints],
  )

  const transactionRows: CashTransactionRow[] = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
        .map((tx) => ({
          id: tx.id,
          date: tx.timestamp,
          type: tx.type,
          amount: tx.amount,
          amountDkk: tx.exchangeRate ? tx.amount * tx.exchangeRate : undefined,
          currency,
          exchangeRate: tx.exchangeRate ?? undefined,
          note: tx.note ?? undefined,
          attachmentUrl: transactionService.getAttachmentUrl(tx) ?? undefined,
        })),
    [transactions, currency],
  )

  const dataPointRows: CashDataPointRow[] = useMemo(
    () =>
      [...dataPoints]
        .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
        .map((dp) => ({
          id: dp.id,
          date: dp.timestamp,
          value: dp.value,
          currency,
          note: dp.note ?? undefined,
        })),
    [dataPoints, currency],
  )

  // Mutations
  const deleteDataPointMutation = useMutation({
    mutationFn: (id: string) => dataPointService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataPoints', platformId] })
      setDeleteDataPoint(null)
    },
  })

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => transactionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', platformId] })
      setDeleteTransaction(null)
    },
  })

  // Column definitions
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
          if (!value) return <span className="text-base-200 dark:text-base-600">&mdash;</span>
          return <span className="italic text-xs text-base-300 dark:text-base-500">{String(value)}</span>
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
        if (!value) return <span className="text-base-200 dark:text-base-600">&mdash;</span>
        return <span className="italic text-xs text-base-300 dark:text-base-500">{String(value)}</span>
      },
    },
  ]

  // Platform options for dialogs
  const platformOptions = allPlatforms.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type as 'investment' | 'cash',
    currency: p.currency,
    icon: platformService.getPlatformIconUrl(p),
  }))

  // Loading state
  if (platformLoading || !platform) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-base-200 dark:bg-base-700 rounded" />
          <div className="h-64 bg-base-200 dark:bg-base-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={() => navigate('/investment')}
          aria-label="Back to portfolio overview"
          className="w-11 h-11 sm:w-8 sm:h-8 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <PlatformIcon name={platform.name} imageUrl={platformService.getPlatformIconUrl(platform)} size="md" />

        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
            {platform.name}
          </h1>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-base-100 dark:bg-base-700 text-base-500 dark:text-base-400">
            {currency}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mb-6 lg:mb-8">
        <Button variant="secondary" size="sm" onClick={() => setShowAddDataPoint(true)}>
          + Add Data Point
        </Button>
        <Button variant="primary" size="sm" onClick={() => setShowAddTransaction(true)}>
          + Add Transaction
        </Button>
      </div>

      {/* Current Balance stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <StatCard
          label="Current Balance"
          value={formatCurrency(currentBalance, currency)}
          variant="simple"
        />
      </div>

      {/* Balance History chart */}
      <div className="mb-6 lg:mb-8">
        <ChartCard
          title="Balance History"
          timeSpan={chartTimeSpan}
          onTimeSpanChange={setChartTimeSpan}
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
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
        <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowDownUp className="w-4 h-4 text-base-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-base-900 dark:text-white">Transactions</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
                {transactions.length}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowAddTransaction(true)}>
              + Add Transaction
            </Button>
          </div>
        </div>
        {transactionRows.length === 0 ? (
          <EmptyState variant="section" icon={ArrowDownUp} description="No transactions recorded yet." />
        ) : (
          <DataTable
            columns={transactionColumns}
            data={transactionRows}
            keyExtractor={(row) => row.id}
            onEdit={(row) => {
              const tx = transactions.find((t) => t.id === row.id)
              if (tx) setEditTransaction(tx)
            }}
            onDelete={(row) => {
              const tx = transactions.find((t) => t.id === row.id)
              if (tx) setDeleteTransaction(tx)
            }}
          />
        )}
      </div>

      {/* Data Points table */}
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
        <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-base-400 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-base-900 dark:text-white">Data Points</h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
                {dataPoints.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAddDataPoint(true)}>
              + Add Data Point
            </Button>
          </div>
        </div>
        {dataPointRows.length === 0 ? (
          <EmptyState variant="section" icon={Database} description="No data points recorded yet." />
        ) : (
          <DataTable
            columns={dataPointColumns}
            data={dataPointRows}
            keyExtractor={(row) => row.id}
            showMoreThreshold={5}
            onEdit={(row) => {
              const dp = dataPoints.find((d) => d.id === row.id)
              if (dp) setEditDataPoint(dp)
            }}
            onDelete={(row) => {
              const dp = dataPoints.find((d) => d.id === row.id)
              if (dp) setDeleteDataPoint(dp)
            }}
          />
        )}
      </div>

      {/* Dialogs */}
      <DataPointDialog
        isOpen={showAddDataPoint || editDataPoint !== null}
        onClose={() => { setShowAddDataPoint(false); setEditDataPoint(null) }}
        onSave={async (data) => {
          const payload = {
            platformId: data.platformId as DataPoint['platformId'],
            value: data.value,
            timestamp: data.timestamp,
            note: data.note || null,
            isInterpolated: false,
          }
          if (editDataPoint) {
            await dataPointService.update(editDataPoint.id, payload)
          } else {
            await dataPointService.create(payload)
          }
          queryClient.invalidateQueries({ queryKey: ['dataPoints', platformId] })
          setShowAddDataPoint(false)
          setEditDataPoint(null)
        }}
        platforms={platformOptions}
        platformId={platformId}
        dataPoint={editDataPoint ?? undefined}
      />
      <TransactionDialog
        isOpen={showAddTransaction || editTransaction !== null}
        onClose={() => { setShowAddTransaction(false); setEditTransaction(null) }}
        onSave={async (data) => {
          if (data.attachment) {
            const formData = new FormData()
            formData.append('platformId', data.platformId)
            formData.append('type', data.type)
            formData.append('amount', String(data.amount))
            if (data.exchangeRate != null) formData.append('exchangeRate', String(data.exchangeRate))
            formData.append('timestamp', new Date(data.timestamp).toISOString())
            formData.append('note', data.note || '')
            formData.append('attachment', data.attachment)
            if (editTransaction) {
              await transactionService.update(editTransaction.id, formData)
            } else {
              await transactionService.create(formData)
            }
          } else {
            const payload = {
              platformId: data.platformId as Transaction['platformId'],
              type: data.type,
              amount: data.amount,
              exchangeRate: data.exchangeRate,
              timestamp: data.timestamp,
              note: data.note || null,
              attachment: null as string | null,
            }
            if (editTransaction) {
              await transactionService.update(editTransaction.id, payload)
            } else {
              await transactionService.create(payload)
            }
          }
          queryClient.invalidateQueries({ queryKey: ['transactions', platformId] })
          setShowAddTransaction(false)
          setEditTransaction(null)
        }}
        platforms={platformOptions}
        platformId={platformId}
        transaction={editTransaction ?? undefined}
      />
      <DeleteConfirmDialog
        isOpen={deleteDataPoint !== null}
        onCancel={() => setDeleteDataPoint(null)}
        onConfirm={() => deleteDataPoint && deleteDataPointMutation.mutate(deleteDataPoint.id)}
        title="Delete Data Point"
        description="This data point will be permanently deleted. This action cannot be undone."
        loading={deleteDataPointMutation.isPending}
      />
      <DeleteConfirmDialog
        isOpen={deleteTransaction !== null}
        onCancel={() => setDeleteTransaction(null)}
        onConfirm={() => deleteTransaction && deleteTransactionMutation.mutate(deleteTransaction.id)}
        title="Delete Transaction"
        description="This transaction will be permanently deleted. This action cannot be undone."
        loading={deleteTransactionMutation.isPending}
      />
    </div>
  )
}

// Legacy type exports for test compatibility
type BalanceHistoryPoint = { timestamp: string; value: number }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CashPlatformDetailProps = Record<string, any>

export { CashPlatformDetail }
export type { CashTransactionRow, CashDataPointRow, BalanceHistoryPoint, CashPlatformDetailProps }
