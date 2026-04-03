import type { ReactNode } from 'react'

type StatCardVariant = 'simple' | 'colored' | 'withBadge' | 'withUnit'
type Trend = 'positive' | 'negative' | 'neutral'

interface StatCardProps {
  label: string
  value: string
  variant?: StatCardVariant
  trend?: Trend
  badgeValue?: string
  unitSuffix?: string
  sublabel?: string
  children?: ReactNode
}

const trendValueClasses: Record<Trend, string> = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-base-900 dark:text-white',
}

const badgeTrendClasses: Record<'positive' | 'negative', string> = {
  positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  negative: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
}

function StatCard({
  label,
  value,
  variant = 'simple',
  trend = 'neutral',
  badgeValue,
  unitSuffix,
  sublabel,
}: StatCardProps) {
  const renderValue = () => {
    switch (variant) {
      case 'colored':
        return (
          <p className={`font-mono-data text-xl font-medium ${trendValueClasses[trend]}`}>
            {value}
          </p>
        )

      case 'withBadge': {
        const badgeTrend = trend === 'neutral' ? 'positive' : trend
        return (
          <div className="flex items-baseline gap-2">
            <p className={`font-mono-data text-xl font-medium ${trendValueClasses[trend]}`}>
              {value}
            </p>
            {badgeValue && (
              <span
                className={`font-mono-data text-xs font-medium px-1.5 py-0.5 rounded-full ${badgeTrendClasses[badgeTrend]}`}
              >
                {badgeValue}
              </span>
            )}
          </div>
        )
      }

      case 'withUnit':
        return (
          <div className="flex items-baseline gap-1">
            <p className="font-mono-data text-xl font-medium text-base-900 dark:text-white">
              {value}
            </p>
            {unitSuffix && <span className="text-sm text-base-400">{unitSuffix}</span>}
          </div>
        )

      default:
        return (
          <p className="font-mono-data text-xl font-medium text-base-900 dark:text-white">
            {value}
          </p>
        )
    }
  }

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
      <p className="text-xs text-base-400 dark:text-base-400 mb-1">{label}</p>
      {renderValue()}
      {sublabel && (
        <p className="text-xs text-base-300 dark:text-base-500 mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}

export { StatCard }
