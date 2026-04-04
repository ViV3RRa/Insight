import { StatCard } from '@/components/shared/StatCard'
import { SkeletonKpiCard } from '@/components/shared/Skeleton'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatHumanDate,
  formatMonthPeriod,
} from '@/utils/formatters'

interface PortfolioOverviewSummaryProps {
  totalValue: number
  latestDataPointDate: string | null
  allTimeGain: number
  allTimeGainPercent: number
  allTimeXirr: number | null
  ytdGain: number
  ytdGainPercent: number
  ytdXirr: number | null
  monthEarnings: number
  currentMonth: Date
  isLoading?: boolean
}

function trendFor(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function PortfolioOverviewSummary({
  totalValue,
  latestDataPointDate,
  allTimeGain,
  allTimeGainPercent,
  allTimeXirr,
  ytdGain,
  ytdGainPercent,
  ytdXirr,
  monthEarnings,
  currentMonth,
  isLoading = false,
}: PortfolioOverviewSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <SkeletonKpiCard count={6} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      <StatCard
        label="Total Value"
        value={formatCurrency(totalValue, 'DKK')}
        variant="simple"
        sublabel={latestDataPointDate ? formatHumanDate(latestDataPointDate) : undefined}
      />
      <StatCard
        label="All-Time Gain/Loss"
        value={formatCurrency(allTimeGain, 'DKK')}
        variant="withBadge"
        trend={trendFor(allTimeGain)}
        badgeValue={formatPercent(allTimeGainPercent)}
      />
      <StatCard
        label="All-Time XIRR"
        value={allTimeXirr !== null ? formatNumber(allTimeXirr) : '–'}
        variant="withUnit"
        unitSuffix="%"
        sublabel="Annualized return"
      />
      <StatCard
        label="YTD Gain/Loss"
        value={formatCurrency(ytdGain, 'DKK')}
        variant="withBadge"
        trend={trendFor(ytdGain)}
        badgeValue={formatPercent(ytdGainPercent)}
      />
      <StatCard
        label="YTD XIRR"
        value={ytdXirr !== null ? formatNumber(ytdXirr) : '–'}
        variant="withUnit"
        unitSuffix="%"
        sublabel="Annualized YTD"
      />
      <StatCard
        label="Month Earnings"
        value={formatCurrency(monthEarnings, 'DKK')}
        variant="colored"
        trend={trendFor(monthEarnings)}
        sublabel={formatMonthPeriod(currentMonth)}
      />
    </div>
  )
}

export { PortfolioOverviewSummary }
export type { PortfolioOverviewSummaryProps }
