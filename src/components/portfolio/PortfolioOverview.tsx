import { useState, useMemo } from 'react'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import * as platformService from '@/services/platforms'
import * as portfolioService from '@/services/portfolios'
import * as dataPointService from '@/services/dataPoints'
import * as transactionService from '@/services/transactions'
import {
  computePlatformGainLoss,
  computeMonthlyEarningsForPlatform,
  computePortfolioAllocation,
  findValueAtOrBefore,
  type PlatformAllocationInput,
} from '@/utils/calculations'
import {
  computeTotalPortfolioValue,
  computePortfolioGainLoss,
  computePortfolioXIRR,
  computePortfolioMonthlyEarnings,
  buildCompositeValueSeries,
  type PlatformWithData,
} from '@/utils/portfolioAggregation'
import { buildCashFlows, calculateXIRR } from '@/utils/xirr'
import { getStalenessLevel } from '@/utils/staleness'
import { formatCurrency } from '@/utils/formatters'
import { PortfolioSwitcher } from './PortfolioSwitcher'
import { PortfolioOverviewSummary } from './PortfolioOverviewSummary'
import { PortfolioOverviewYoY } from './PortfolioOverviewYoY'
import { PortfolioOverviewPerformanceAccordion } from './PortfolioOverviewPerformanceAccordion'
import { PortfolioOverviewValueCharts } from './PortfolioOverviewValueCharts'
import { PortfolioOverviewPerfYearly } from './PortfolioOverviewPerfYearly'
import { PortfolioOverviewPerfMonthly } from './PortfolioOverviewPerfMonthly'
import { PortfolioOverviewPlatformsTable } from './PortfolioOverviewPlatformsTable'
import type { PlatformRow } from './PortfolioOverviewPlatformsTable'
import { PortfolioOverviewCashTable } from './PortfolioOverviewCashTable'
import type { CashPlatformRow } from './PortfolioOverviewCashTable'
import { PortfolioOverviewClosed } from './PortfolioOverviewClosed'
import type { ClosedPlatformRow } from './PortfolioOverviewClosed'
import { PortfolioOverviewAllocation } from './PortfolioOverviewAllocation'
import { PortfolioDialog } from './dialogs/PortfolioDialog'
import { PlatformDialog } from './dialogs/PlatformDialog'
import { DataPointDialog } from './dialogs/DataPointDialog'
import { TransactionDialog } from './dialogs/TransactionDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { Button } from '@/components/shared/Button'
import type { Platform, Portfolio } from '@/types/investment'

const PLATFORM_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#14b8a6', '#06b6d4', '#84cc16', '#eab308',
]

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const EPOCH_START = new Date(2000, 0, 1)

function getLatestDataPoint(
  dataPoints: { value: number; timestamp: string }[],
): { value: number; timestamp: string } | null {
  if (dataPoints.length === 0) return null
  return [...dataPoints].sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0] ?? null
}

function mapInvestmentPlatforms(
  platforms: Platform[],
  pwdList: PlatformWithData[],
): PlatformRow[] {
  const now = new Date()

  return platforms
    .filter((p) => p.type === 'investment' && p.status === 'active')
    .map((p) => {
      const pwd = pwdList.find((d) => (d.platform.id as string) === (p.id as string))
      const dataPoints = pwd?.dataPoints ?? []
      const transactions = pwd?.transactions ?? []

      const latest = getLatestDataPoint(dataPoints)
      const currentValue = latest?.value ?? 0
      const lastUpdated = latest?.timestamp ?? p.created

      const monthEntry = computeMonthlyEarningsForPlatform(
        dataPoints, transactions, now.getFullYear(), now.getMonth() + 1,
      )

      const gainLoss = computePlatformGainLoss(dataPoints, transactions, EPOCH_START, now)

      const startVal = findValueAtOrBefore(dataPoints, EPOCH_START)
      const cashFlows = buildCashFlows(
        startVal?.value ?? 0, EPOCH_START, currentValue, now, transactions,
      )
      const xirr = calculateXIRR(cashFlows)

      const stalenessLevel = getStalenessLevel(latest?.timestamp ?? null)

      return {
        id: p.id as string,
        name: p.name,
        iconUrl: platformService.getPlatformIconUrl(p),
        currency: p.currency,
        currentValue,
        monthEarnings: monthEntry?.earnings ?? 0,
        allTimeGainLoss: gainLoss?.gain ?? 0,
        allTimeGainLossPercent: gainLoss?.gainPercent ?? 0,
        allTimeXirr: xirr,
        lastUpdated,
        staleness: stalenessLevel === 'none' ? undefined : stalenessLevel,
      }
    })
}

function mapCashPlatforms(
  platforms: Platform[],
  pwdList: PlatformWithData[],
): CashPlatformRow[] {
  return platforms
    .filter((p) => p.type === 'cash' && p.status === 'active')
    .map((p) => {
      const pwd = pwdList.find((d) => (d.platform.id as string) === (p.id as string))
      const latest = getLatestDataPoint(pwd?.dataPoints ?? [])

      return {
        id: p.id as string,
        name: p.name,
        iconUrl: platformService.getPlatformIconUrl(p),
        currency: p.currency,
        currentBalance: latest?.value ?? 0,
        lastUpdated: latest?.timestamp ?? p.created,
      }
    })
}

function mapClosedPlatforms(
  platforms: Platform[],
  pwdList: PlatformWithData[],
): ClosedPlatformRow[] {
  const now = new Date()

  return platforms
    .filter((p) => p.status === 'closed')
    .map((p) => {
      const pwd = pwdList.find((d) => (d.platform.id as string) === (p.id as string))
      const dataPoints = pwd?.dataPoints ?? []
      const transactions = pwd?.transactions ?? []
      const latest = getLatestDataPoint(dataPoints)

      const gainLoss = computePlatformGainLoss(dataPoints, transactions, EPOCH_START, now)

      return {
        id: p.id as string,
        name: p.name,
        iconUrl: platformService.getPlatformIconUrl(p),
        finalValue: latest?.value ?? 0,
        allTimeGainLoss: gainLoss?.gain ?? 0,
        allTimeGainLossPercent: gainLoss?.gainPercent ?? 0,
        closedDate: p.closedDate ?? '',
      }
    })
}

function PortfolioOverview() {
  const navigate = useNavigate()

  const selectedPortfolioId = useInvestmentUIStore((s) => s.selectedPortfolioId)
  const timeSpan = useInvestmentUIStore((s) => s.timeSpan)
  const setTimeSpan = useInvestmentUIStore((s) => s.setTimeSpan)
  const yoyActive = useInvestmentUIStore((s) => s.yoyActive)
  const setYoyActive = useInvestmentUIStore((s) => s.setYoyActive)
  const chartMode = useInvestmentUIStore((s) => s.chartMode)

  const queryClient = useQueryClient()

  const [dataPointDialogOpen, setDataPointDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false)
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false)
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null)
  const [deletingPortfolio, setDeletingPortfolio] = useState<Portfolio | null>(null)

  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: portfolioService.getAll,
  })

  const { data: platforms, isLoading } = useQuery({
    queryKey: ['platforms', selectedPortfolioId],
    queryFn: () => platformService.getByPortfolio(selectedPortfolioId!),
    enabled: !!selectedPortfolioId,
  })

  // Fetch data points and transactions for all platforms
  const { data: platformsWithData, isLoading: isPlatformDataLoading } = useQuery({
    queryKey: ['platformsWithData', selectedPortfolioId],
    queryFn: async () => {
      if (!platforms) return []
      const result: PlatformWithData[] = []
      for (const platform of platforms) {
        const [dataPoints, transactions] = await Promise.all([
          dataPointService.getByPlatform(platform.id as string),
          transactionService.getByPlatform(platform.id as string),
        ])
        result.push({ platform, dataPoints, transactions })
      }
      return result
    },
    enabled: !!platforms && platforms.length > 0,
  })

  // Compute portfolio-level aggregates (async due to currency conversion)
  const { data: aggregatedData, isLoading: isAggregating } = useQuery({
    queryKey: ['portfolioAggregation', selectedPortfolioId, platformsWithData?.length],
    queryFn: async () => {
      if (!platformsWithData || platformsWithData.length === 0) return null

      const now = new Date()
      const currentYear = now.getFullYear()
      const yearStart = new Date(currentYear, 0, 1)
      const prevYearStart = new Date(currentYear - 1, 0, 1)
      const prevYearSameDate = new Date(currentYear - 1, now.getMonth(), now.getDate())

      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth()
      const prevMonthYear = now.getMonth() === 0 ? currentYear - 1 : currentYear

      const allocationInputs: PlatformAllocationInput[] = platformsWithData
        .filter((pwd) => pwd.platform.status === 'active')
        .map((pwd) => ({
          platform: pwd.platform,
          currentValue: getLatestDataPoint(pwd.dataPoints)?.value ?? 0,
        }))

      // Parallel computation of independent aggregates
      const [
        totalValue,
        allTimeGainLoss,
        allTimeXirr,
        ytdGainLoss,
        ytdXirr,
        monthEarnings,
        prevYtdGainLoss,
        prevYtdXirr,
        prevMonthEarnings,
        allocation,
        compositeSeriesRaw,
      ] = await Promise.all([
        computeTotalPortfolioValue(platformsWithData),
        computePortfolioGainLoss(platformsWithData, EPOCH_START, now),
        computePortfolioXIRR(platformsWithData, EPOCH_START, now),
        computePortfolioGainLoss(platformsWithData, yearStart, now),
        computePortfolioXIRR(platformsWithData, yearStart, now),
        computePortfolioMonthlyEarnings(platformsWithData, currentYear, now.getMonth() + 1),
        computePortfolioGainLoss(platformsWithData, prevYearStart, prevYearSameDate),
        computePortfolioXIRR(platformsWithData, prevYearStart, prevYearSameDate),
        computePortfolioMonthlyEarnings(platformsWithData, prevMonthYear, prevMonth),
        computePortfolioAllocation(allocationInputs),
        buildCompositeValueSeries(platformsWithData, EPOCH_START, now),
      ])

      // Find earliest year with data for yearly table
      let firstYear = currentYear
      for (const { dataPoints } of platformsWithData) {
        for (const dp of dataPoints) {
          const year = new Date(dp.timestamp).getFullYear()
          if (year < firstYear) firstYear = year
        }
      }

      // Yearly performance data (parallel per-year)
      const yearlyPromises = Array.from(
        { length: currentYear - firstYear + 1 },
        (_, i) => {
          const year = firstYear + i
          const yStart = new Date(year, 0, 1)
          const yEnd = year === currentYear ? now : new Date(year + 1, 0, 0, 23, 59, 59)
          return Promise.all([
            computePortfolioGainLoss(platformsWithData, yStart, yEnd),
            computePortfolioXIRR(platformsWithData, yStart, yEnd),
          ]).then(([gl, yearXirr]) =>
            gl
              ? {
                  year,
                  startingValue: gl.startingValue,
                  endingValue: gl.endingValue,
                  netDeposits: gl.netDeposits,
                  earnings: gl.gain,
                  earningsPercent: gl.gainPercent ?? 0,
                  xirr: yearXirr,
                }
              : null,
          )
        },
      )
      const yearlyData = (await Promise.all(yearlyPromises)).filter(
        (d): d is NonNullable<typeof d> => d !== null,
      )

      // Monthly performance data for current year (parallel per-month)
      const monthlyPromises = Array.from(
        { length: now.getMonth() + 1 },
        (_, i) => {
          const month = i + 1
          const mStart = new Date(currentYear, month - 1, 1)
          const mEnd =
            month - 1 === now.getMonth()
              ? now
              : new Date(currentYear, month, 0, 23, 59, 59)
          return Promise.all([
            computePortfolioGainLoss(platformsWithData, mStart, mEnd),
            computePortfolioXIRR(platformsWithData, mStart, mEnd),
          ]).then(([gl, monthXirr]) => ({
            period: `${currentYear}-${String(month).padStart(2, '0')}`,
            periodLabel: `${MONTH_NAMES[month - 1]} ${currentYear}`,
            startingValue: gl?.startingValue ?? 0,
            endingValue: gl?.endingValue ?? 0,
            netDeposits: gl?.netDeposits ?? 0,
            earnings: gl?.gain ?? 0,
            monthlyXirr: monthXirr,
          }))
        },
      )
      const monthlyData = await Promise.all(monthlyPromises)

      return {
        totalValue,
        allTimeGainLoss,
        allTimeXirr,
        ytdGainLoss,
        ytdXirr,
        monthEarnings,
        prevYtdGainLoss,
        prevYtdXirr,
        prevMonthEarnings,
        allocation,
        compositeSeriesRaw,
        yearlyData,
        monthlyData,
      }
    },
    enabled: !!platformsWithData && platformsWithData.length > 0,
  })

  const dataLoading = isLoading || isPlatformDataLoading || isAggregating

  const pwdList = platformsWithData ?? []
  const investmentPlatforms = platforms ? mapInvestmentPlatforms(platforms, pwdList) : []
  const cashPlatforms = platforms ? mapCashPlatforms(platforms, pwdList) : []
  const closedPlatforms = platforms ? mapClosedPlatforms(platforms, pwdList) : []

  // Latest data point date across all platforms
  const latestDataPointDate = useMemo(() => {
    if (!platformsWithData || platformsWithData.length === 0) return null
    let latest: string | null = null
    for (const { dataPoints } of platformsWithData) {
      for (const dp of dataPoints) {
        if (!latest || dp.timestamp > latest) latest = dp.timestamp
      }
    }
    return latest
  }, [platformsWithData])

  // Chart data: composite value series
  const compositeData = useMemo(
    () =>
      (aggregatedData?.compositeSeriesRaw ?? []).map((cp) => ({
        timestamp: cp.date.toISOString(),
        totalValue: cp.totalValueDKK,
        platformValues: cp.platformBreakdown,
      })),
    [aggregatedData?.compositeSeriesRaw],
  )

  // Chart data: platform series for legend
  const chartPlatforms = useMemo(
    () =>
      (platforms ?? [])
        .filter((p) => p.status === 'active')
        .map((p, i) => ({
          name: p.name,
          color: PLATFORM_COLORS[i % PLATFORM_COLORS.length]!,
        })),
    [platforms],
  )

  // Chart data: monthly performance for bar chart
  const monthlyPerformance = useMemo(
    () =>
      (aggregatedData?.monthlyData ?? []).map((m) => ({
        month: m.periodLabel,
        earnings: m.earnings,
        xirr: m.monthlyXirr,
      })),
    [aggregatedData?.monthlyData],
  )

  // Yearly performance totals
  const yearlyTotals = useMemo(() => {
    const gl = aggregatedData?.allTimeGainLoss
    return gl
      ? {
          startingValue: gl.startingValue,
          endingValue: gl.endingValue,
          netDeposits: gl.netDeposits,
          earnings: gl.gain,
          earningsPercent: gl.gainPercent ?? 0,
          xirr: aggregatedData?.allTimeXirr ?? null,
        }
      : {
          startingValue: 0,
          endingValue: 0,
          netDeposits: 0,
          earnings: 0,
          earningsPercent: 0,
          xirr: null,
        }
  }, [aggregatedData?.allTimeGainLoss, aggregatedData?.allTimeXirr])

  // Allocation segments
  const allocationSegments = useMemo(
    () =>
      (aggregatedData?.allocation ?? []).map((a, i) => ({
        label: a.platformName,
        value: a.allocationPercent ?? 0,
        formattedValue: formatCurrency(a.valueDKK, 'DKK'),
        color: PLATFORM_COLORS[i % PLATFORM_COLORS.length]!,
        isCash: a.type === 'cash',
      })),
    [aggregatedData?.allocation],
  )

  const platformOptions = (platforms ?? [])
    .filter((p) => p.status === 'active')
    .map((p) => ({
      id: p.id as string,
      name: p.name,
      type: p.type,
      currency: p.currency,
      icon: platformService.getPlatformIconUrl(p),
    }))

  const activePlatformCount = investmentPlatforms.length + cashPlatforms.length
  const platformCountSummary = activePlatformCount > 0
    ? `${activePlatformCount} active platform${activePlatformCount !== 1 ? 's' : ''}`
    : undefined

  // Mobile nav header
  useMobileDetailNav({ name: 'Investment Portfolio', subtitle: platformCountSummary ?? '' })

  const handlePlatformRowClick = (platformId: string) => {
    navigate(`/investment/platform/${platformId}`)
  }

  const handleCashRowClick = (platformId: string) => {
    navigate(`/investment/cash/${platformId}`)
  }

  function invalidatePortfolioData() {
    queryClient.invalidateQueries({ queryKey: ['platforms', selectedPortfolioId] })
    queryClient.invalidateQueries({ queryKey: ['platformsWithData', selectedPortfolioId] })
    queryClient.invalidateQueries({ queryKey: ['portfolioAggregation', selectedPortfolioId] })
  }

  return (
    <div className="relative z-0">
      {/* Desktop page header */}
      <div
        className="hidden lg:flex items-center justify-between mb-8"
        data-testid="section-header"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
              Investment Portfolio
            </h1>
            <PortfolioSwitcher
              onAddPortfolio={() => {
                setEditingPortfolio(null)
                setPortfolioDialogOpen(true)
              }}
              onEditPortfolio={(id) => {
                const p = portfolios?.find((port) => port.id === id) ?? null
                setEditingPortfolio(p)
                setPortfolioDialogOpen(true)
              }}
            />
          </div>
          {platformCountSummary && (
            <p className="text-sm text-base-400">{platformCountSummary}</p>
          )}
        </div>
      </div>

      {/* Mobile portfolio switcher */}
      <div className="lg:hidden mb-4" data-testid="section-mobile-switcher">
        <PortfolioSwitcher
          onAddPortfolio={() => {
            setEditingPortfolio(null)
            setPortfolioDialogOpen(true)
          }}
          onEditPortfolio={(id) => {
            const p = portfolios?.find((port) => port.id === id) ?? null
            setEditingPortfolio(p)
            setPortfolioDialogOpen(true)
          }}
        />
      </div>

      {/* Mobile action buttons */}
      <div
        className="flex flex-col sm:flex-row gap-2 mb-4 lg:hidden"
        data-testid="section-mobile-actions"
      >
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setDataPointDialogOpen(true)}
        >
          + Add Data Point
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setTransactionDialogOpen(true)}
        >
          + Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div data-testid="section-summary-cards">
        <PortfolioOverviewSummary
          totalValue={aggregatedData?.totalValue ?? 0}
          latestDataPointDate={latestDataPointDate}
          allTimeGain={aggregatedData?.allTimeGainLoss?.gain ?? 0}
          allTimeGainPercent={aggregatedData?.allTimeGainLoss?.gainPercent ?? 0}
          allTimeXirr={aggregatedData?.allTimeXirr ?? null}
          ytdGain={aggregatedData?.ytdGainLoss?.gain ?? 0}
          ytdGainPercent={aggregatedData?.ytdGainLoss?.gainPercent ?? 0}
          ytdXirr={aggregatedData?.ytdXirr ?? null}
          monthEarnings={aggregatedData?.monthEarnings ?? 0}
          currentMonth={new Date()}
          isLoading={dataLoading}
        />
      </div>

      {/* YoY Comparison */}
      <div data-testid="section-yoy" className="mt-6 lg:mt-8">
        <PortfolioOverviewYoY
          ytdEarnings={aggregatedData?.ytdGainLoss?.gain ?? 0}
          prevYtdEarnings={aggregatedData?.prevYtdGainLoss?.gain ?? 0}
          ytdXirr={aggregatedData?.ytdXirr ?? null}
          prevYtdXirr={aggregatedData?.prevYtdXirr ?? null}
          monthEarnings={aggregatedData?.monthEarnings ?? 0}
          prevMonthEarnings={aggregatedData?.prevMonthEarnings ?? 0}
          isLoading={dataLoading}
        />
      </div>

      {/* Performance Charts Accordion */}
      <div data-testid="section-performance" className="mt-6 lg:mt-8">
        <PortfolioOverviewPerformanceAccordion>
          <PortfolioOverviewValueCharts
            compositeData={compositeData}
            platforms={chartPlatforms}
            monthlyPerformance={monthlyPerformance}
            timeSpan={timeSpan}
            onTimeSpanChange={setTimeSpan}
            yoyActive={yoyActive}
            onYoYChange={setYoyActive}
            isLoading={dataLoading}
          />
          <PortfolioOverviewPerfYearly
            yearlyData={aggregatedData?.yearlyData ?? []}
            totals={yearlyTotals}
            isLoading={dataLoading}
          />
          <PortfolioOverviewPerfMonthly
            monthlyData={aggregatedData?.monthlyData ?? []}
            chartMode={chartMode}
            isLoading={dataLoading}
          />
        </PortfolioOverviewPerformanceAccordion>
      </div>

      {/* Investment Platforms Table */}
      <div data-testid="section-platforms" className="mt-6 lg:mt-8">
        <PortfolioOverviewPlatformsTable
          platforms={investmentPlatforms}
          isLoading={isLoading}
          onRowClick={handlePlatformRowClick}
          onAddDataPoint={() => setDataPointDialogOpen(true)}
          onAddTransaction={() => setTransactionDialogOpen(true)}
        />
      </div>

      {/* Cash Accounts Table */}
      <div data-testid="section-cash" className="mt-6 lg:mt-8">
        <PortfolioOverviewCashTable
          cashPlatforms={cashPlatforms}
          isLoading={isLoading}
          onRowClick={handleCashRowClick}
        />
      </div>

      {/* Closed Platforms */}
      <div data-testid="section-closed" className="mt-6 lg:mt-8">
        <PortfolioOverviewClosed
          closedPlatforms={closedPlatforms}
          isLoading={isLoading}
          onRowClick={handlePlatformRowClick}
        />
      </div>

      {/* Portfolio Allocation */}
      <div data-testid="section-allocation" className="mt-6 lg:mt-8">
        <PortfolioOverviewAllocation
          segments={allocationSegments}
          isLoading={dataLoading}
        />
      </div>

      {/* Add Platform link */}
      <button
        className="w-full py-3 text-sm font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 mt-2 mb-2"
        onClick={() => setPlatformDialogOpen(true)}
        data-testid="add-platform-button"
      >
        <Plus className="w-4 h-4" />
        Add Platform
      </button>

      {/* Dialogs */}
      <PortfolioDialog
        isOpen={portfolioDialogOpen}
        onClose={() => {
          setPortfolioDialogOpen(false)
          setEditingPortfolio(null)
        }}
        onSave={async (data) => {
          if (editingPortfolio) {
            await portfolioService.update(editingPortfolio.id, data)
          } else {
            await portfolioService.create(data)
          }
          queryClient.invalidateQueries({ queryKey: ['portfolios'] })
          setPortfolioDialogOpen(false)
          setEditingPortfolio(null)
        }}
        portfolio={editingPortfolio ?? undefined}
        onDelete={() => {
          setPortfolioDialogOpen(false)
          setDeletingPortfolio(editingPortfolio)
          setEditingPortfolio(null)
        }}
      />
      <DeleteConfirmDialog
        isOpen={deletingPortfolio !== null}
        onCancel={() => setDeletingPortfolio(null)}
        onConfirm={async () => {
          if (deletingPortfolio) {
            await portfolioService.remove(deletingPortfolio.id)
            queryClient.invalidateQueries({ queryKey: ['portfolios'] })
            setDeletingPortfolio(null)
          }
        }}
        title="Delete Portfolio"
        description={`"${deletingPortfolio?.name}" and all its platforms and data will be permanently deleted. This action cannot be undone.`}
      />

      <PlatformDialog
        isOpen={platformDialogOpen}
        onClose={() => setPlatformDialogOpen(false)}
        onSave={async (data) => {
          if (!selectedPortfolioId) return
          const formData = new FormData()
          formData.set('portfolioId', selectedPortfolioId as string)
          formData.set('name', data.name)
          formData.set('type', data.type ?? 'investment')
          formData.set('currency', data.currency ?? 'DKK')
          if (data.icon) {
            formData.set('icon', data.icon)
          }
          await platformService.create(formData)
          invalidatePortfolioData()
          setPlatformDialogOpen(false)
        }}
      />

      <DataPointDialog
        isOpen={dataPointDialogOpen}
        onClose={() => setDataPointDialogOpen(false)}
        onSave={async (data) => {
          await dataPointService.create({
            platformId: data.platformId as never,
            value: data.value,
            timestamp: data.timestamp,
            isInterpolated: false,
            note: data.note || null,
          })
          invalidatePortfolioData()
          setDataPointDialogOpen(false)
        }}
        platforms={platformOptions}
      />

      <TransactionDialog
        isOpen={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        onSave={async (data) => {
          await transactionService.create({
            platformId: data.platformId as never,
            type: data.type,
            amount: data.amount,
            exchangeRate: data.exchangeRate,
            timestamp: data.timestamp,
            note: data.note || null,
            attachment: data.attachment?.name ?? null,
          })
          invalidatePortfolioData()
          setTransactionDialogOpen(false)
        }}
        platforms={platformOptions}
      />
    </div>
  )
}

export { PortfolioOverview }
