import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { UtilityIcon } from '@/components/shared/UtilityIcon'
import { ChangeIndicator } from '@/components/shared/ChangeIndicator'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { formatNumber, formatRecentUpdate } from '@/utils/formatters'
import { getDaysStaleness } from '@/utils/staleness'
import type { Utility, UtilityMetrics } from '@/types/home'

export interface UtilitySummaryCardsProps {
  utilities: Utility[]
  metricsMap: Map<string, UtilityMetrics>
  latestReadingDates: Map<string, Date | null>
}

function getConsumptionChange(metrics: UtilityMetrics): number | null {
  const monthly = metrics.monthlyConsumption
  if (monthly.length < 2) return null
  const current = monthly[monthly.length - 1]!
  const previous = monthly[monthly.length - 2]!
  if (previous.consumption === 0) return null
  return ((current.consumption - previous.consumption) / previous.consumption) * 100
}

export function UtilitySummaryCards({
  utilities,
  metricsMap,
  latestReadingDates,
}: UtilitySummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
      {utilities.map((utility) => {
        const metrics = metricsMap.get(utility.id)
        const latestDate = latestReadingDates.get(utility.id)
        const staleness = getDaysStaleness(latestDate)
        const consumptionChange = metrics ? getConsumptionChange(metrics) : null

        const consumption = metrics?.currentMonthConsumption
        const cost = metrics?.currentMonthCost
        const ytdCost = metrics?.ytdCost ?? 0
        const costPerUnit = metrics?.currentMonthCostPerUnit

        return (
          <Link
            key={utility.id}
            to={`/home/utility/${utility.id}`}
            className="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark block hover:shadow-lg dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer group relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <UtilityIcon icon={utility.icon} color={utility.color} size="md" />
                <div>
                  <div className="text-sm font-semibold">{utility.name}</div>
                  <div className="text-xs text-base-400">{utility.unit}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {staleness && <StalenessIndicator severity={staleness} size="sm" />}
                <ChevronRight className="w-4 h-4 text-base-200 dark:text-base-600 group-hover:text-base-400 dark:group-hover:text-base-400 transition-colors" />
              </div>
            </div>

            {/* 2-col metric grid */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">
                  Consumption
                </div>
                <div className="font-mono-data text-xl font-medium">
                  {consumption != null ? formatNumber(consumption, 1) : '—'}
                </div>
                <div className="text-xs text-base-400">{utility.unit}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">
                  Cost
                </div>
                <div className="font-mono-data text-xl font-medium">
                  {cost != null ? formatNumber(cost, 0) : '—'}
                </div>
                <div className="text-xs text-base-400">DKK</div>
              </div>
            </div>

            {/* Change indicator */}
            {consumptionChange != null && (
              <div className="mb-3">
                <ChangeIndicator
                  value={consumptionChange}
                  invertColor={true}
                  suffix="% vs last month"
                />
              </div>
            )}

            {/* 3-col footer */}
            <div className="border-t border-base-100 dark:border-base-700 pt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-base-300 dark:text-base-500 mb-0.5">YTD Cost</div>
                <div className="font-mono-data font-medium">{formatNumber(ytdCost, 0)}</div>
              </div>
              <div>
                <div className="text-base-300 dark:text-base-500 mb-0.5">Cost/Unit</div>
                <div className="font-mono-data font-medium">
                  {costPerUnit != null ? formatNumber(costPerUnit, 2) : '—'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base-300 dark:text-base-500 mb-0.5">Updated</div>
                <div className="font-mono-data">
                  {latestDate ? formatRecentUpdate(latestDate) : '—'}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
