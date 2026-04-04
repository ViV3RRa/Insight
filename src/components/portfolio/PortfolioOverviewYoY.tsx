import { Skeleton } from '@/components/shared/Skeleton'
import { YoYComparisonRow } from '@/components/shared/YoYComparisonRow'
import { formatCurrency, formatPercent, formatHumanDate } from '@/utils/formatters'
import { getTimeSpanRange } from '@/utils/timeSpan'
import { subYears } from 'date-fns'

interface PortfolioOverviewYoYProps {
  ytdEarnings: number
  prevYtdEarnings: number
  ytdXirr: number | null
  prevYtdXirr: number | null
  monthEarnings: number
  prevMonthEarnings: number
  isLoading?: boolean
}

function computeChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

function formatXirr(value: number | null): string {
  if (value === null) return '–'
  return formatPercent(value)
}

function buildPeriodLabel(): string {
  const { start, end } = getTimeSpanRange('YTD')
  const prevStart = subYears(start, 1)
  const prevEnd = subYears(end, 1)
  return `${formatHumanDate(start)} – ${formatHumanDate(end)} vs ${formatHumanDate(prevStart)} – ${formatHumanDate(prevEnd)}`
}

function PortfolioOverviewYoY({
  ytdEarnings,
  prevYtdEarnings,
  ytdXirr,
  prevYtdXirr,
  monthEarnings,
  prevMonthEarnings,
  isLoading = false,
}: PortfolioOverviewYoYProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-5">
        <Skeleton className="mb-4" width="w-48" height="h-3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2" width="w-20" height="h-3" />
              <Skeleton width="w-24" height="h-5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const xirrChange =
    ytdXirr !== null && prevYtdXirr !== null ? ytdXirr - prevYtdXirr : 0

  const metrics = [
    {
      label: 'YTD Earnings',
      currentValue: formatCurrency(ytdEarnings, 'DKK'),
      previousValue: formatCurrency(prevYtdEarnings, 'DKK'),
      changePercent: computeChangePercent(ytdEarnings, prevYtdEarnings),
    },
    {
      label: 'YTD XIRR',
      currentValue: formatXirr(ytdXirr),
      previousValue: formatXirr(prevYtdXirr),
      changePercent: xirrChange,
    },
    {
      label: 'Month Earnings',
      currentValue: formatCurrency(monthEarnings, 'DKK'),
      previousValue: formatCurrency(prevMonthEarnings, 'DKK'),
      changePercent: computeChangePercent(monthEarnings, prevMonthEarnings),
    },
  ]

  const periodLabel = buildPeriodLabel()

  return <YoYComparisonRow periodLabel={periodLabel} metrics={metrics} />
}

export { PortfolioOverviewYoY }
export type { PortfolioOverviewYoYProps }
