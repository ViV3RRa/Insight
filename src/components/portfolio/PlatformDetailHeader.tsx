import { ArrowLeft } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { Skeleton, SkeletonKpiCard } from '@/components/shared/Skeleton'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

interface PlatformDetailHeaderProps {
  platformName: string
  platformIconUrl?: string
  currency: string
  staleness?: 'warning' | 'critical'
  lastUpdated?: string
  currentValue: number
  currentValueDkk?: number
  monthEarnings: number
  allTimeGainLoss: number
  allTimeGainLossPercent: number
  allTimeXirr: number | null
  ytdGainLoss: number
  ytdGainLossPercent: number
  ytdXirr: number | null
  onBack: () => void
  isLoading?: boolean
}

function trendFor(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

function PlatformDetailHeader({
  platformName,
  platformIconUrl,
  currency,
  staleness,
  lastUpdated,
  currentValue,
  currentValueDkk,
  monthEarnings,
  allTimeGainLoss,
  allTimeGainLossPercent,
  allTimeXirr,
  ytdGainLoss,
  ytdGainLossPercent,
  ytdXirr,
  onBack,
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
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to portfolio overview"
          className="w-11 h-11 sm:w-8 sm:h-8 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <PlatformIcon name={platformName} imageUrl={platformIconUrl} size="md" />

        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
            {platformName}
          </h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
            {currency}
          </span>
          {staleness && <StalenessIndicator severity={staleness} size="md" />}
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-base-400 mb-6 lg:mb-8 ml-11">
          Investment · {currency} · Updated {lastUpdated}
        </p>
      )}

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
