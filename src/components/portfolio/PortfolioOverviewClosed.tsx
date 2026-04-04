import { useState } from 'react'
import { PlatformIcon } from '../shared/PlatformIcon'
import {
  MobileColumnCyclerHeader,
  MobileColumnCyclerCell,
} from '../shared/MobileColumnCycler'
import { SkeletonTableRows } from '../shared/Skeleton'
import { formatCurrency, formatPercent, formatHumanDate } from '../../utils/formatters'

interface ClosedPlatformRow {
  id: string
  name: string
  iconUrl?: string
  finalValue: number
  allTimeGainLoss: number
  allTimeGainLossPercent: number
  closedDate: string
}

interface PortfolioOverviewClosedProps {
  closedPlatforms: ClosedPlatformRow[]
  isLoading?: boolean
  onRowClick?: (platformId: string) => void
}

function trendColor(value: number): string {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-base-900 dark:text-white'
}

const mobileColumns = [{ label: 'Gain/Loss' }, { label: 'Closed' }]

function PortfolioOverviewClosed({
  closedPlatforms,
  isLoading = false,
  onRowClick,
}: PortfolioOverviewClosedProps) {
  const [mobileColumnIndex, setMobileColumnIndex] = useState(0)

  if (closedPlatforms.length === 0 && !isLoading) return null

  const handleCycle = () => {
    setMobileColumnIndex((prev) => (prev + 1) % mobileColumns.length)
  }

  return (
    <div
      data-testid="closed-platforms-section"
      className="mb-6 lg:mb-8 opacity-60 hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-base-900 dark:text-white">Closed Platforms</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
          {closedPlatforms.length}
        </span>
      </div>

      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        {isLoading ? (
          <SkeletonTableRows count={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base-200 dark:border-base-700">
                  <th className="px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400 text-left">
                    Platform
                  </th>
                  <th className="px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400 text-right">
                    Final Value
                  </th>
                  <th className="hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400 text-right">
                    Gain/Loss
                  </th>
                  <th className="hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400 text-right">
                    Closed
                  </th>
                  <MobileColumnCyclerHeader
                    columns={mobileColumns}
                    activeIndex={mobileColumnIndex}
                    onCycle={handleCycle}
                  />
                </tr>
              </thead>
              <tbody>
                {closedPlatforms.map((platform) => (
                  <tr
                    key={platform.id}
                    className={[
                      'border-b border-base-100 dark:border-base-700/50 hover:bg-accent-50/20 dark:hover:bg-accent-900/10 transition-colors duration-100',
                      onRowClick && 'cursor-pointer',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={onRowClick ? () => onRowClick(platform.id) : undefined}
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2.5">
                        <PlatformIcon
                          imageUrl={platform.iconUrl}
                          name={platform.name}
                          size="sm"
                        />
                        <span className="font-medium text-base-700 dark:text-base-300">
                          {platform.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
                      {formatCurrency(platform.finalValue, 'DKK')}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-right">
                      <div>
                        <span
                          className={`font-mono-data ${trendColor(platform.allTimeGainLoss)}`}
                        >
                          {formatCurrency(platform.allTimeGainLoss, 'DKK')}
                        </span>
                        <p
                          className={`text-xs mt-0.5 ${trendColor(platform.allTimeGainLossPercent)}`}
                        >
                          {formatPercent(platform.allTimeGainLossPercent)}
                        </p>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-right text-base-500 dark:text-base-400">
                      {formatHumanDate(platform.closedDate)}
                    </td>
                    <MobileColumnCyclerCell
                      values={[
                        <div key="gain">
                          <span
                            className={`font-mono-data ${trendColor(platform.allTimeGainLoss)}`}
                          >
                            {formatCurrency(platform.allTimeGainLoss, 'DKK')}
                          </span>
                          <p
                            className={`text-xs mt-0.5 ${trendColor(platform.allTimeGainLossPercent)}`}
                          >
                            {formatPercent(platform.allTimeGainLossPercent)}
                          </p>
                        </div>,
                        <span key="closed" className="text-base-500 dark:text-base-400">
                          {formatHumanDate(platform.closedDate)}
                        </span>,
                      ]}
                      activeIndex={mobileColumnIndex}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export { PortfolioOverviewClosed }
export type { ClosedPlatformRow, PortfolioOverviewClosedProps }
