import { StatCard } from '@/components/shared/StatCard'
import { Skeleton, SkeletonKpiCard } from '@/components/shared/Skeleton'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

interface PlatformDetailHeaderProps {
  currency: string
  currentValue: number
  currentValueDkk?: number
  monthEarnings: number
  allTimeGainLoss: number
  allTimeGainLossPercent: number
  allTimeXirr: number | null
  ytdGainLoss: number
  ytdGainLossPercent: number
  ytdXirr: number | null
  isLoading?: boolean
}

function trendFor(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function PlatformDetailHeader({
  currency,
  currentValue,
  currentValueDkk,
  monthEarnings,
  allTimeGainLoss,
  allTimeGainLossPercent,
  allTimeXirr,
  ytdGainLoss,
  ytdGainLossPercent,
  ytdXirr,
  isLoading = false,
}: PlatformDetailHeaderProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 sm:w-8 sm:h-8 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center">
            <Skeleton width="w-4" height="h-4" />
          </div>
          <Skeleton width="w-7" height="h-7" className="rounded-full" />
          <Skeleton width="w-40" height="h-7" />
          <Skeleton width="w-10" height="h-5" className="rounded-full" />
        </div>
        <div className="mb-6 lg:mb-8 ml-11">
          <Skeleton width="w-48" height="h-3" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <SkeletonKpiCard count={6} />
        </div>
      </div>
    )
  }

  const isDkk = currency === 'DKK'

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <StatCard
          label="Current Value"
          value={formatCurrency(currentValue, currency)}
          variant="simple"
          sublabel={!isDkk && currentValueDkk != null ? `≈ ${formatCurrency(currentValueDkk, 'DKK')}` : undefined}
        />
        <StatCard
          label="Month Earnings"
          value={formatCurrency(monthEarnings, currency)}
          variant="colored"
          trend={trendFor(monthEarnings)}
        />
        <StatCard
          label="All-Time Gain/Loss"
          value={formatCurrency(allTimeGainLoss, currency)}
          variant="withBadge"
          trend={trendFor(allTimeGainLoss)}
          badgeValue={formatPercent(allTimeGainLossPercent)}
        />
        <StatCard
          label="All-Time XIRR"
          value={allTimeXirr !== null ? formatNumber(allTimeXirr) : '–'}
          variant="withUnit"
          unitSuffix="%"
        />
        <StatCard
          label="YTD Gain/Loss"
          value={formatCurrency(ytdGainLoss, currency)}
          variant="withBadge"
          trend={trendFor(ytdGainLoss)}
          badgeValue={formatPercent(ytdGainLossPercent)}
        />
        <StatCard
          label="YTD XIRR"
          value={ytdXirr !== null ? formatNumber(ytdXirr) : '–'}
          variant="withUnit"
          unitSuffix="%"
        />
      </div>
    </div>
  )
}

export { PlatformDetailHeader }
export type { PlatformDetailHeaderProps }
