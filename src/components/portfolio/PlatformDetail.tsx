import { useState, useMemo } from 'react'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfYear, format } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import * as platformService from '@/services/platforms'
import * as dataPointService from '@/services/dataPoints'
import * as transactionService from '@/services/transactions'
import {
  computePlatformGainLoss,
  computeMonthlyEarningsForPlatform,
  computeMonthlyXIRRForPlatform,
} from '@/utils/calculations'
import { formatRecentUpdate, formatHumanDate, formatCurrency } from '@/utils/formatters'
import { getDaysStaleness } from '@/utils/staleness'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { StatCard } from '@/components/shared/StatCard'
import { ChartCard } from '@/components/shared/ChartCard'
import { Link } from 'react-router-dom'
import { LayoutGrid, Pencil } from 'lucide-react'
import { PlatformDetailHeader } from './PlatformDetailHeader'
import { PlatformDetailPerfChart } from './PlatformDetailPerfChart'
import { PlatformDetailPerfTabs } from './PlatformDetailPerfTabs'
import { PlatformDetailDataPoints } from './PlatformDetailDataPoints'
import { PlatformDetailTransactions } from './PlatformDetailTransactions'
import { Button } from '@/components/shared/Button'
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
const BALANCE_COLOR = '#3b82f6'

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

  // Fetch all platforms for switcher
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

  const isCash = platform?.type === 'cash'

  // Investment-only computed metrics (hooks must run unconditionally)
  const now = new Date()
  const ytdStart = startOfYear(now)

  const allTimeGainLoss = useMemo(
    () => isCash ? null : computePlatformGainLoss(dataPoints, transactions, EPOCH_START, now),
    [dataPoints, transactions, isCash],
  )

  const ytdGainLoss = useMemo(
    () => isCash ? null : computePlatformGainLoss(dataPoints, transactions, ytdStart, now),
    [dataPoints, transactions, ytdStart, isCash],
  )

  const monthEntry = useMemo(
    () => isCash ? null : computeMonthlyEarningsForPlatform(dataPoints, transactions, now.getFullYear(), now.getMonth() + 1),
    [dataPoints, transactions, isCash],
  )
  const monthEarnings = monthEntry?.earnings ?? 0

  // Latest data point for staleness (investment only)
  const latestDpDate = dataPoints.length > 0 ? dataPoints[0]!.timestamp : null

  const staleness = isCash ? null : getDaysStaleness(latestDpDate)

  // Cash-only: balance history for chart
  const balanceHistory = useMemo(
    () =>
      isCash
        ? [...dataPoints]
            .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
            .map((dp) => ({ timestamp: dp.timestamp, value: dp.value }))
        : [],
    [dataPoints, isCash],
  )

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

  // Investment-only: chart data
  const earningsChartData = useMemo(() => {
    if (isCash) return []
    const months: { month: string; earnings: number }[] = []
    for (let m = 0; m < 12; m++) {
      const d = new Date(now.getFullYear(), m, 1)
      if (d > now) break
      const entry = computeMonthlyEarningsForPlatform(dataPoints, transactions, d.getFullYear(), d.getMonth() + 1)
      months.push({ month: format(d, 'MMM yyyy'), earnings: entry?.earnings ?? 0 })
    }
    return months
  }, [dataPoints, transactions, isCash])

  const xirrChartData = useMemo(() => {
    if (isCash) return []
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
  }, [dataPoints, transactions, isCash])

  // Investment-only: yearly/monthly perf data
  const yearlyPerfData = useMemo(() => {
    if (isCash) return []
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
  }, [allTimeGainLoss, isCash])

  const monthlyPerfData = useMemo(() => {
    if (isCash) return []
    return earningsChartData.map((m) => ({
      period: m.month,
      startingValue: 0,
      endingValue: 0,
      netDeposits: 0,
      earnings: m.earnings,
      monthlyXirr: null as number | null,
    }))
  }, [earningsChartData, isCash])

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
          {!isCash && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-base-200 dark:bg-base-700 rounded-2xl" />
              ))}
            </div>
          )}
          <div className="h-64 bg-base-200 dark:bg-base-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  const showExchangeRate = platform.currency !== 'DKK'
  const currentValue = dataPoints.length > 0 ? dataPoints[0]!.value : 0
  const currentValueDkk = showExchangeRate ? undefined : undefined
  const currency = platform.currency

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
      {/* Desktop header with switcher */}
      <div className="hidden lg:flex lg:items-center lg:justify-between gap-4 mb-8">
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
                {platform.type === 'investment' ? 'Investment' : 'Cash'} &middot; {currency}{updatedText ? ` · Updated ${updatedText}` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setShowAddTransaction(true)}>
            + Add Transaction
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddDataPoint(true)}>
            + Add Data Point
          </Button>
        </div>
      </div>

      {/* Mobile action buttons */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <Button variant="secondary" fullWidth onClick={() => setShowAddTransaction(true)}>
          + Add Transaction
        </Button>
        <Button variant="primary" fullWidth onClick={() => setShowAddDataPoint(true)}>
          + Add Data Point
        </Button>
      </div>

      {/* Investment only: Closure info banner */}
      {!isCash && platform.status === 'closed' && platform.closedDate && (
        <div className="mb-6 lg:mb-8 px-4 py-3 bg-base-100 dark:bg-base-700/50 border border-base-200 dark:border-base-600 rounded-xl">
          <div className="text-sm text-base-600 dark:text-base-300">
            <span className="font-medium">Closed on {formatHumanDate(platform.closedDate)}</span>
            {platform.closureNote && (
              <span className="text-base-400 dark:text-base-500"> — {platform.closureNote}</span>
            )}
          </div>
        </div>
      )}

      {/* Stat cards: investment gets 6, cash gets 1 */}
      {isCash ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard
            label="Current Balance"
            value={formatCurrency(currentValue, currency)}
            variant="simple"
          />
        </div>
      ) : (
        <PlatformDetailHeader
          currency={currency}
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
      )}

      {/* Charts: investment gets perf chart + tabs, cash gets balance history */}
      {isCash ? (
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
      ) : (
        <>
          <div className="mb-6 lg:mb-8">
            <PlatformDetailPerfChart
              earningsData={earningsChartData.map((m) => ({
                month: m.month,
                earnings: m.earnings,
              }))}
              xirrData={xirrChartData}
              currency={currency}
              timeSpan={chartTimeSpan}
              onTimeSpanChange={setChartTimeSpan}
              yoyActive={chartYoY}
              onYoYChange={setChartYoY}
            />
          </div>

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
              currency={currency}
            />
          </div>
        </>
      )}

      {/* Transactions table */}
      <div className="mb-6 lg:mb-8" data-testid="transactions-section">
        <PlatformDetailTransactions
          transactions={transactionRows}
          currency={currency}
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
          currency={currency}
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
