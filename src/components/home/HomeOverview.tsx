import { useState, useMemo } from 'react'
import { useQuery, useQueries } from '@tanstack/react-query'
import * as utilityService from '@/services/utilities'
import * as meterReadingService from '@/services/meterReadings'
import * as utilityBillService from '@/services/utilityBills'
import { calculateUtilityMetrics } from '@/utils/utilityCosts'
import { amortizeAllBills } from '@/utils/amortization'
import { formatRecentUpdate } from '@/utils/formatters'
import { format, startOfYear, subYears } from 'date-fns'
import { UtilitySummaryCards } from '@/components/home/UtilitySummaryCards'
import { HomeOverviewYoYRow } from '@/components/home/HomeOverviewYoYRow'
import { HomeOverviewChart } from '@/components/home/HomeOverviewChart'
import { AddUtilityLink } from '@/components/home/AddUtilityLink'
import {
  HomeQuickActionsDesktop,
  HomeQuickActionsMobile,
} from '@/components/home/HomeQuickActions'
import { MeterReadingDialog } from '@/components/home/dialogs/MeterReadingDialog'
import { BillDialog } from '@/components/home/dialogs/BillDialog'
import { UtilityDialog } from '@/components/home/dialogs/UtilityDialog'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import type { UtilityMetrics, HomeYoYComparison } from '@/types/home'

function HomeOverview() {
  // Dialog states
  const [showAddReading, setShowAddReading] = useState(false)
  const [showAddBill, setShowAddBill] = useState(false)
  const [showAddUtility, setShowAddUtility] = useState(false)

  // Step 1: Fetch all utilities
  const { data: utilities = [], isLoading: utilitiesLoading } = useQuery({
    queryKey: ['utilities'],
    queryFn: utilityService.getAll,
  })

  // Step 2: Fetch readings and bills per utility
  const readingsQueries = useQueries({
    queries: utilities.map((u) => ({
      queryKey: ['meterReadings', u.id],
      queryFn: () => meterReadingService.getByUtility(u.id),
      enabled: utilities.length > 0,
    })),
  })

  const billsQueries = useQueries({
    queries: utilities.map((u) => ({
      queryKey: ['utilityBills', u.id],
      queryFn: () => utilityBillService.getByUtility(u.id),
      enabled: utilities.length > 0,
    })),
  })

  // Step 3: Derive metrics per utility
  const metricsMap = useMemo(() => {
    const map = new Map<string, UtilityMetrics>()
    utilities.forEach((u, i) => {
      const readings = readingsQueries[i]?.data ?? []
      const bills = billsQueries[i]?.data ?? []
      if (readings.length > 0 || bills.length > 0) {
        map.set(u.id, calculateUtilityMetrics(readings, bills))
      }
    })
    return map
  }, [utilities, readingsQueries, billsQueries])

  // Step 4: Derive latest reading date per utility
  const latestReadingDates = useMemo(() => {
    const map = new Map<string, Date | null>()
    utilities.forEach((u, i) => {
      const readings = readingsQueries[i]?.data ?? []
      if (readings.length > 0) {
        // Readings are sorted by -timestamp from the service
        map.set(u.id, new Date(readings[0]!.timestamp))
      } else {
        map.set(u.id, null)
      }
    })
    return map
  }, [utilities, readingsQueries])

  // Step 5: YoY comparison — aggregate costs across all utilities
  const homeYoY = useMemo<HomeYoYComparison | null>(() => {
    const now = new Date()
    const currentMonthKey = format(now, 'yyyy-MM')
    const ytdStartKey = format(startOfYear(now), 'yyyy-MM')
    const prevYear = subYears(now, 1)
    const prevYtdStartKey = format(startOfYear(prevYear), 'yyyy-MM')
    const prevCurrentMonthKey = format(prevYear, 'yyyy-MM')

    // Collect all bills across utilities
    const allBills = utilities.flatMap((_, i) => billsQueries[i]?.data ?? [])
    if (allBills.length === 0) return null

    const monthlyCosts = amortizeAllBills(allBills)

    // Current year YTD
    const currentYtdEntries = monthlyCosts.filter(
      (c) => c.month >= ytdStartKey && c.month <= currentMonthKey,
    )
    const currentYtdTotal = currentYtdEntries.reduce((s, c) => s + c.cost, 0)
    const currentMonthCost = monthlyCosts.find((c) => c.month === currentMonthKey)?.cost ?? 0
    const currentAvg = currentYtdEntries.length > 0 ? currentYtdTotal / currentYtdEntries.length : 0

    // Previous year same period
    const prevYtdEntries = monthlyCosts.filter(
      (c) => c.month >= prevYtdStartKey && c.month <= prevCurrentMonthKey,
    )
    const prevYtdTotal = prevYtdEntries.reduce((s, c) => s + c.cost, 0)
    const prevMonthCost = monthlyCosts.find((c) => c.month === prevCurrentMonthKey)?.cost ?? 0
    const prevAvg = prevYtdEntries.length > 0 ? prevYtdTotal / prevYtdEntries.length : 0

    const pct = (cur: number, prev: number) =>
      prev !== 0 ? ((cur - prev) / prev) * 100 : cur !== 0 ? 100 : null

    const periodEnd = format(now, 'MMM d')
    const periodLabel = `Jan 1 – ${periodEnd}, ${prevYear.getFullYear()}`

    return {
      ytdTotalCost: { current: currentYtdTotal, previous: prevYtdTotal, changePercent: pct(currentYtdTotal, prevYtdTotal) },
      currentMonthCost: { current: currentMonthCost, previous: prevMonthCost, changePercent: pct(currentMonthCost, prevMonthCost) },
      avgMonthlyCost: { current: currentAvg, previous: prevAvg, changePercent: pct(currentAvg, prevAvg) },
      periodLabel,
    }
  }, [utilities, billsQueries])

  // Subtitle
  const lastUpdate = useMemo(() => {
    let latest: Date | null = null
    latestReadingDates.forEach((date) => {
      if (date && (!latest || date > latest)) latest = date
    })
    return latest
  }, [latestReadingDates])

  const subtitle = `${utilities.length} utilities tracked${lastUpdate ? ` · Updated ${formatRecentUpdate(lastUpdate)}` : ''}`

  // Mobile nav header
  useMobileDetailNav({ name: 'Home', subtitle })

  // Loading state
  const isLoading =
    utilitiesLoading ||
    readingsQueries.some((q) => q.isLoading) ||
    billsQueries.some((q) => q.isLoading)

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-base-200 dark:bg-base-700 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-base-200 dark:bg-base-700 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Page header — desktop only */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white mb-1">
            Home
          </h1>
          <p className="text-sm text-base-400">{subtitle}</p>
        </div>
        <HomeQuickActionsDesktop
          onAddReading={() => setShowAddReading(true)}
          onAddBill={() => setShowAddBill(true)}
        />
      </div>

      {/* Mobile action buttons */}
      <HomeQuickActionsMobile
        onAddReading={() => setShowAddReading(true)}
        onAddBill={() => setShowAddBill(true)}
      />

      {/* Utility Summary Cards */}
      <div className="mb-6 lg:mb-8" data-testid="summary-cards-section">
        <UtilitySummaryCards
          utilities={utilities}
          metricsMap={metricsMap}
          latestReadingDates={latestReadingDates}
        />
      </div>

      {/* YoY Comparison Row */}
      <div className="mb-6 lg:mb-8" data-testid="yoy-section">
        <HomeOverviewYoYRow comparison={homeYoY} />
      </div>

      {/* Monthly Overview Chart */}
      <div className="mb-6 lg:mb-8" data-testid="chart-section">
        <HomeOverviewChart utilities={utilities} metricsMap={metricsMap} />
      </div>

      {/* Add Utility Link */}
      <div data-testid="add-utility-section">
        <AddUtilityLink onAdd={() => setShowAddUtility(true)} />
      </div>

      {/* Dialogs */}
      <MeterReadingDialog
        isOpen={showAddReading}
        onClose={() => setShowAddReading(false)}
        utilities={utilities}
      />
      <BillDialog
        isOpen={showAddBill}
        onClose={() => setShowAddBill(false)}
        utilities={utilities}
      />
      <UtilityDialog
        isOpen={showAddUtility}
        onClose={() => setShowAddUtility(false)}
      />
    </div>
  )
}

export { HomeOverview }
