import { useState, useMemo } from 'react'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfYear, format } from 'date-fns'
import * as platformService from '@/services/platforms'
import * as dataPointService from '@/services/dataPoints'
import * as transactionService from '@/services/transactions'
import {
  computePlatformGainLoss,
  computeMonthlyEarningsForPlatform,
  computeMonthlyXIRRForPlatform,
} from '@/utils/calculations'
import { formatRecentUpdate, formatHumanDate } from '@/utils/formatters'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { Link } from 'react-router-dom'
import { LayoutGrid, Pencil } from 'lucide-react'
import { PlatformDetailHeader } from './PlatformDetailHeader'
import { PlatformDetailPerfChart } from './PlatformDetailPerfChart'
import { PlatformDetailPerfTabs } from './PlatformDetailPerfTabs'
import { PlatformDetailDataPoints } from './PlatformDetailDataPoints'
import { PlatformDetailTransactions } from './PlatformDetailTransactions'
import { DropdownSwitcher, type DropdownItem, type DropdownSection } from '@/components/shared/DropdownSwitcher'
import { ArrowLeft } from 'lucide-react'
import { PlatformDialog } from './dialogs/PlatformDialog'
import { DataPointDialog } from './dialogs/DataPointDialog'
import { TransactionDialog } from './dialogs/TransactionDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import type { DataPoint, Transaction } from '@/types/investment'
import type { TimeSpan } from '@/utils/timeSpan'
import type { DataPointRow } from './PlatformDetailDataPoints'
import type { TransactionRow } from './PlatformDetailTransactions'

const EPOCH_START = new Date(2000, 0, 1)

function PlatformDetail() {
  const { platformId } = useParams<{ platformId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const selectedPortfolioId = useInvestmentUIStore((s) => s.selectedPortfolioId)

  // Dialog states
  const [editPlatformId, setEditPlatformId] = useState<string | null>(null)
  const [showAddDataPoint, setShowAddDataPoint] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [editDataPoint, setEditDataPoint] = useState<DataPoint | null>(null)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [deleteDataPoint, setDeleteDataPoint] = useState<DataPoint | null>(null)
  const [deleteTransaction, setDeleteTransaction] = useState<Transaction | null>(null)

  // Chart state
  const [chartTimeSpan, setChartTimeSpan] = useState<TimeSpan>('YTD')
  const [chartYoY, setChartYoY] = useState(false)

  // Fetch platform
  const { data: platform, isLoading: platformLoading } = useQuery({
    queryKey: ['platforms', selectedPortfolioId, platformId],
    queryFn: () => platformService.getOne(platformId!),
    enabled: !!platformId,
  })

  // Fetch all platforms for switcher — use portfolioId from the loaded platform, falling back to store
  const portfolioId = platform?.portfolioId ?? selectedPortfolioId
  const { data: allPlatforms = [] } = useQuery({
    queryKey: ['platforms', portfolioId],
    queryFn: () => platformService.getByPortfolio(portfolioId!),
    enabled: !!portfolioId,
  })

  // Fetch data points
  const { data: dataPoints = [] } = useQuery({
    queryKey: ['dataPoints', platformId],
    queryFn: () => dataPointService.getByPlatform(platformId!),
    enabled: !!platformId,
  })

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', platformId],
    queryFn: () => transactionService.getByPlatform(platformId!),
    enabled: !!platformId,
  })

  // Computed metrics
  const now = new Date()
  const ytdStart = startOfYear(now)

  const allTimeGainLoss = useMemo(
    () => computePlatformGainLoss(dataPoints, transactions, EPOCH_START, now),
    [dataPoints, transactions],
  )

  const ytdGainLoss = useMemo(
    () => computePlatformGainLoss(dataPoints, transactions, ytdStart, now),
    [dataPoints, transactions, ytdStart],
  )

  const monthEntry = useMemo(
    () => computeMonthlyEarningsForPlatform(dataPoints, transactions, now.getFullYear(), now.getMonth() + 1),
    [dataPoints, transactions],
  )
  const monthEarnings = monthEntry?.earnings ?? 0

  // Latest data point for staleness
  const latestDpDate = dataPoints.length > 0 ? dataPoints[0]!.timestamp : null

  const staleness = useMemo(() => {
    if (!latestDpDate) return 'critical' as const
    const daysDiff = Math.floor(
      (Date.now() - new Date(latestDpDate).getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysDiff > 7) return 'critical' as const
    if (daysDiff > 2) return 'warning' as const
    return undefined
  }, [latestDpDate])

  // Mobile nav header + dropdown
  const updatedText = latestDpDate ? formatRecentUpdate(new Date(latestDpDate)) : undefined
  const mobileSubtitle = platform
    ? `${platform.type === 'investment' ? 'Investment' : 'Cash'} · ${platform.currency}${updatedText ? ` · Updated ${updatedText}` : ''}`
    : ''

  const mobileDropdownContent = useMemo(() => {
    if (!platform) return null
    const investmentPlatforms = allPlatforms.filter((p) => p.type === 'investment' && p.status === 'active')
    const cashPlatforms = allPlatforms.filter((p) => p.type === 'cash' && p.status === 'active')

    const renderPlatform = (p: typeof allPlatforms[0]) => {
      const isActive = p.id === platform.id
      const href = p.type === 'cash' ? `/investment/cash/${p.id}` : `/investment/platform/${p.id}`
      return (
        <div
          key={p.id}
          className={[
            'flex items-center gap-3 px-4 py-2.5',
            isActive
              ? 'bg-accent-50/50 dark:bg-accent-900/20 border-l-2 border-accent-600'
              : 'hover:bg-base-50 dark:hover:bg-base-700 border-l-2 border-transparent',
          ].join(' ')}
        >
          <button
            type="button"
            onClick={() => navigate(href)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <PlatformIcon imageUrl={platformService.getPlatformIconUrl(p)} name={p.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{p.name}</div>
              <div className="text-xs text-base-400">{p.currency}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditPlatformId(p.id); }}
            className="p-1.5 text-base-300 hover:text-base-600 dark:hover:text-base-300 shrink-0"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }

    const renderSection = (label: string, platforms: typeof allPlatforms) => {
      if (platforms.length === 0) return null
      return (
        <div className="py-1">
          <div className="px-4 py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-base-300 dark:text-base-500">{label}</span>
          </div>
          {platforms.map(renderPlatform)}
        </div>
      )
    }

    return (
      <div className="py-1">
        <Link
          to="/investment"
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-base-500 hover:bg-base-50 dark:hover:bg-base-700 border-b border-base-100 dark:border-base-700"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="font-medium">Portfolio Overview</span>
        </Link>
        {renderSection('Active Platforms', investmentPlatforms)}
        {cashPlatforms.length > 0 && (
          <>
            <div className="border-t border-base-100 dark:border-base-700 my-1" />
            {renderSection('Cash Accounts', cashPlatforms)}
          </>
        )}
      </div>
    )
  }, [allPlatforms, platform, navigate])

  useMobileDetailNav(
    platform
      ? {
          backTo: '/investment',
          icon: <PlatformIcon imageUrl={platformService.getPlatformIconUrl(platform)} name={platform.name} size="md" />,
          name: platform.name,
          subtitle: mobileSubtitle,
          dropdown: mobileDropdownContent,
          badge: staleness ? <StalenessIndicator severity={staleness} size="lg" /> : undefined,
        }
      : null,
    `platforms-${allPlatforms.length}`,
  )

  // Desktop dropdown items (active platforms only, no closed)
  const dropdownSections: DropdownSection[] = [
    { key: 'investment', label: 'Active Platforms' },
    { key: 'cash', label: 'Cash Accounts' },
  ]

  const dropdownItems: DropdownItem[] = useMemo(
    () =>
      allPlatforms
        .filter((p) => p.status === 'active')
        .map((p) => ({
          id: p.id,
          name: p.name,
          icon: <PlatformIcon imageUrl={platformService.getPlatformIconUrl(p)} name={p.name} size="sm" />,
          section: p.type === 'cash' ? 'cash' : 'investment',
        })),
    [allPlatforms],
  )

  // Data point rows
  const dataPointRows: DataPointRow[] = useMemo(
    () =>
      dataPoints.map((dp) => ({
        id: dp.id,
        date: dp.timestamp,
        value: dp.value,
        currency: platform?.currency ?? 'DKK',
        isInterpolated: dp.isInterpolated ?? false,
        note: dp.note ?? undefined,
      })),
    [dataPoints, platform],
  )

  // Transaction rows
  const transactionRows: TransactionRow[] = useMemo(
    () =>
      transactions.map((tx) => ({
        id: tx.id,
        date: tx.timestamp,
        type: tx.type,
        amount: tx.amount,
        amountDkk: tx.exchangeRate ? tx.amount * tx.exchangeRate : undefined,
        currency: platform?.currency ?? 'DKK',
        exchangeRate: tx.exchangeRate ?? undefined,
        note: tx.note ?? undefined,
        attachmentUrl: transactionService.getAttachmentUrl(tx) ?? undefined,
      })),
    [transactions, platform],
  )

  // Monthly perf data for chart
  const earningsChartData = useMemo(() => {
    const months: { month: string; earnings: number }[] = []
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1)
      if (d > now) break
      const entry = computeMonthlyEarningsForPlatform(dataPoints, transactions, d.getFullYear(), d.getMonth() + 1)
      months.push({ month: format(d, 'MMM yyyy'), earnings: entry?.earnings ?? 0 })
    }
    return months
  }, [dataPoints, transactions])

  // Monthly XIRR data for chart
  const xirrChartData = useMemo(() => {
    const months: { month: string; xirr: number }[] = []
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1)
      if (d > now) break
      const xirr = computeMonthlyXIRRForPlatform(dataPoints, transactions, d.getFullYear(), d.getMonth() + 1)
      if (xirr != null) {
        months.push({ month: format(d, 'MMM yyyy'), xirr: xirr * 100 })
      }
    }
    return months
  }, [dataPoints, transactions])

  // Yearly/monthly perf data for tabs
  const yearlyPerfData = useMemo(() => {
    const currentYear = now.getFullYear()
    return [
      {
        period: `${currentYear}`,
        startingValue: allTimeGainLoss?.startingValue ?? 0,
        endingValue: allTimeGainLoss?.endingValue ?? 0,
        netDeposits: allTimeGainLoss ? allTimeGainLoss.deposits - allTimeGainLoss.withdrawals : 0,
        earnings: allTimeGainLoss?.gain ?? 0,
        earningsPercent: allTimeGainLoss?.gainPercent ?? 0,
        xirr: null as number | null,
      },
    ]
  }, [allTimeGainLoss, now])

  const monthlyPerfData = useMemo(() => {
    return earningsChartData.map((m) => ({
      period: m.month,
      startingValue: 0,
      endingValue: 0,
      netDeposits: 0,
      earnings: m.earnings,
      monthlyXirr: null as number | null,
    }))
  }, [earningsChartData])

  // Delete mutations
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

  function handleSelectPlatform(id: string) {
    const target = allPlatforms.find((p) => p.id === id)
    if (target?.type === 'cash') {
      navigate(`/investment/cash/${id}`)
    } else {
      navigate(`/investment/platform/${id}`)
    }
  }

  // Loading state
  if (platformLoading || !platform) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-base-200 dark:bg-base-700 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-base-200 dark:bg-base-700 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-base-200 dark:bg-base-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  const showExchangeRate = platform.currency !== 'DKK'
  const currentValue = dataPoints.length > 0 ? dataPoints[0]!.value : 0
  const currentValueDkk = showExchangeRate ? undefined : undefined

  // Platform options for dialogs
  const platformOptions = allPlatforms.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type as 'investment' | 'cash',
    currency: p.currency,
    icon: platformService.getPlatformIconUrl(p),
  }))

  return (
    <div>
      {/* Header with switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        {/* Desktop switcher bar */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => navigate('/investment')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 hover:border-base-300 dark:hover:border-base-500 transition-colors shadow-sm"
            title="Back to Portfolio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <PlatformIcon imageUrl={platformService.getPlatformIconUrl(platform)} name={platform.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <DropdownSwitcher
                  currentId={platform.id}
                  items={dropdownItems}
                  sections={dropdownSections}
                  onSelect={handleSelectPlatform}
                  overviewHref="/investment"
                  overviewLabel="Portfolio Overview"
                  onEditItem={(id) => setEditPlatformId(id)}
                />
                {staleness && <StalenessIndicator severity={staleness} />}
              </div>
              <div className="text-xs text-base-400 mt-0.5">
                {platform.type === 'investment' ? 'Investment' : 'Cash'} &middot; {platform.currency}{updatedText ? ` · Updated ${updatedText}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddDataPoint(true)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg hover:border-base-300 dark:hover:border-base-500 transition-colors"
          >
            + Add Data Point
          </button>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg shadow-sm hover:bg-base-800 dark:hover:bg-accent-700 transition-colors"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      {/* Closure info banner */}
      {platform.status === 'closed' && platform.closedDate && (
        <div className="mb-6 lg:mb-8 px-4 py-3 bg-base-100 dark:bg-base-700/50 border border-base-200 dark:border-base-600 rounded-xl">
          <div className="text-sm text-base-600 dark:text-base-300">
            <span className="font-medium">Closed on {formatHumanDate(platform.closedDate)}</span>
            {platform.closureNote && (
              <span className="text-base-400 dark:text-base-500"> — {platform.closureNote}</span>
            )}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <PlatformDetailHeader
        currency={platform.currency}
        currentValue={currentValue}
        currentValueDkk={currentValueDkk}
        monthEarnings={monthEarnings}
        allTimeGainLoss={allTimeGainLoss?.gain ?? 0}
        allTimeGainLossPercent={allTimeGainLoss?.gainPercent ?? 0}
        allTimeXirr={null}
        ytdGainLoss={ytdGainLoss?.gain ?? 0}
        ytdGainLossPercent={ytdGainLoss?.gainPercent ?? 0}
        ytdXirr={null}
      />

      {/* Performance chart */}
      <div className="mb-6 lg:mb-8">
        <PlatformDetailPerfChart
          earningsData={earningsChartData.map((m) => ({
            month: m.month,
            earnings: m.earnings,
          }))}
          xirrData={xirrChartData}
          currency={platform.currency}
          timeSpan={chartTimeSpan}
          onTimeSpanChange={setChartTimeSpan}
          yoyActive={chartYoY}
          onYoYChange={setChartYoY}
        />
      </div>

      {/* Performance tabs */}
      <div className="mb-6 lg:mb-8">
        <PlatformDetailPerfTabs
          yearlyData={yearlyPerfData}
          monthlyData={monthlyPerfData}
          yearlyTotals={{
            period: 'All Time',
            startingValue: allTimeGainLoss?.startingValue ?? 0,
            endingValue: allTimeGainLoss?.endingValue ?? 0,
            netDeposits: allTimeGainLoss ? allTimeGainLoss.deposits - allTimeGainLoss.withdrawals : 0,
            earnings: allTimeGainLoss?.gain ?? 0,
            earningsPercent: allTimeGainLoss?.gainPercent ?? 0,
            xirr: null,
          }}
          currency={platform.currency}
        />
      </div>

      {/* Transactions table */}
      <div className="mb-6 lg:mb-8" data-testid="transactions-section">
        <PlatformDetailTransactions
          transactions={transactionRows}
          currency={platform.currency}
          showExchangeRate={showExchangeRate}
          onEdit={(row) => {
            const tx = transactions.find((t) => t.id === row.id)
            if (tx) setEditTransaction(tx)
          }}
          onDelete={(row) => {
            const tx = transactions.find((t) => t.id === row.id)
            if (tx) setDeleteTransaction(tx)
          }}
          onAdd={() => setShowAddTransaction(true)}
        />
      </div>

      {/* Data points table */}
      <div data-testid="datapoints-section">
        <PlatformDetailDataPoints
          dataPoints={dataPointRows}
          currency={platform.currency}
          onEdit={(row) => {
            const dp = dataPoints.find((d) => d.id === row.id)
            if (dp) setEditDataPoint(dp)
          }}
          onDelete={(row) => {
            const dp = dataPoints.find((d) => d.id === row.id)
            if (dp) setDeleteDataPoint(dp)
          }}
          onAdd={() => setShowAddDataPoint(true)}
        />
      </div>

      {/* Dialogs */}
      <PlatformDialog
        isOpen={editPlatformId !== null}
        onClose={() => setEditPlatformId(null)}
        onSave={async (data) => {
          const targetId = editPlatformId ?? platform.id
          await platformService.update(targetId, { name: data.name } as Parameters<typeof platformService.update>[1])
          queryClient.invalidateQueries({ queryKey: ['platforms'] })
          setEditPlatformId(null)
        }}
        onClosePlatform={async (data) => {
          const targetId = editPlatformId ?? platform.id
          await platformService.closePlatform(targetId, data.closedDate, data.closureNote)
          queryClient.invalidateQueries({ queryKey: ['platforms'] })
          setEditPlatformId(null)
          if (targetId === platform.id) navigate('/investment')
        }}
        onReopenPlatform={async () => {
          const targetId = editPlatformId ?? platform.id
          await platformService.reopenPlatform(targetId)
          queryClient.invalidateQueries({ queryKey: ['platforms'] })
          setEditPlatformId(null)
        }}
        platform={allPlatforms.find((p) => p.id === editPlatformId) ?? platform}
      />
      <DataPointDialog
        isOpen={showAddDataPoint || editDataPoint !== null}
        onClose={() => {
          setShowAddDataPoint(false)
          setEditDataPoint(null)
        }}
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
        onSaveAndAddAnother={
          editDataPoint
            ? undefined
            : async (data) => {
                await dataPointService.create({
                  platformId: data.platformId as DataPoint['platformId'],
                  value: data.value,
                  timestamp: data.timestamp,
                  note: data.note || null,
                  isInterpolated: false,
                })
                queryClient.invalidateQueries({ queryKey: ['dataPoints', platformId] })
              }
        }
        platforms={platformOptions}
        platformId={platformId}
        dataPoint={editDataPoint ?? undefined}
      />
      <TransactionDialog
        isOpen={showAddTransaction || editTransaction !== null}
        onClose={() => {
          setShowAddTransaction(false)
          setEditTransaction(null)
        }}
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
        onConfirm={() =>
          deleteTransaction && deleteTransactionMutation.mutate(deleteTransaction.id)
        }
        title="Delete Transaction"
        description="This transaction will be permanently deleted. This action cannot be undone."
        loading={deleteTransactionMutation.isPending}
      />
    </div>
  )
}

export { PlatformDetail }
