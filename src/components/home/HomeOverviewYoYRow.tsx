import { YoYComparisonRow } from '@/components/shared/YoYComparisonRow'
import { formatNumber } from '@/utils/formatters'
import type { HomeYoYComparison } from '@/types/home'

interface HomeOverviewYoYRowProps {
  comparison: HomeYoYComparison | null
}

export function HomeOverviewYoYRow({ comparison }: HomeOverviewYoYRowProps) {
  if (!comparison) return null

  const formatValue = (value: number): string => formatNumber(value, 0)

  const metrics = [
    {
      label: 'YTD Total Cost',
      currentValue: formatValue(comparison.ytdTotalCost.current),
      previousValue: formatValue(comparison.ytdTotalCost.previous),
      changePercent: comparison.ytdTotalCost.changePercent ?? 0,
      invertColor: true,
    },
    {
      label: 'Current Month Cost',
      currentValue: formatValue(comparison.currentMonthCost.current),
      previousValue: formatValue(comparison.currentMonthCost.previous),
      changePercent: comparison.currentMonthCost.changePercent ?? 0,
      invertColor: true,
    },
    {
      label: 'Avg Monthly Cost',
      currentValue: formatValue(comparison.avgMonthlyCost.current),
      previousValue: formatValue(comparison.avgMonthlyCost.previous),
      changePercent: comparison.avgMonthlyCost.changePercent ?? 0,
      invertColor: true,
    },
  ]

  return (
    <div className="mb-6 lg:mb-8">
      <YoYComparisonRow
        periodLabel={`Year-over-Year · Same period last year (${comparison.periodLabel})`}
        metrics={metrics}
      />
    </div>
  )
}
