import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonTableRows } from '@/components/shared/Skeleton'
import { formatCurrency, formatPercent, formatRecentUpdate } from '@/utils/formatters'

interface PlatformRow {
  id: string
  name: string
  iconUrl?: string
  currency: string
  currentValue: number
  currentValueDkk?: number
  monthEarnings: number
  allTimeGainLoss: number
  allTimeGainLossPercent: number
  allTimeXirr: number | null
  lastUpdated: string
  staleness?: 'warning' | 'critical'
}

interface PortfolioOverviewPlatformsTableProps {
  platforms: PlatformRow[]
  isLoading?: boolean
  onRowClick?: (platformId: string) => void
  onAddDataPoint?: () => void
  onAddTransaction?: () => void
}

function trendColor(value: number): string {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-base-900 dark:text-white'
}

function PortfolioOverviewPlatformsTable({
  platforms,
  isLoading = false,
  onRowClick,
  onAddDataPoint,
  onAddTransaction,
}: PortfolioOverviewPlatformsTableProps) {
  const columns = useMemo<Array<ColumnDef<PlatformRow>>>(
    () => [
      {
        key: 'name',
        label: 'Platform',
        align: 'left',
        format: (_value, row) => (
          <div className="flex items-center gap-2.5">
            <PlatformIcon imageUrl={row.iconUrl} name={row.name} size="sm" />
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-base-900 dark:text-white">{row.name}</span>
              {row.staleness && <StalenessIndicator severity={row.staleness} size="sm" />}
            </div>
          </div>
        ),
      },
      {
        key: 'currency',
        label: 'Currency',
        align: 'left',
        hideOnMobile: true,
        format: (value) => (
          <span className="text-xs font-medium text-base-500 dark:text-base-400 bg-base-100 dark:bg-base-700 px-2 py-0.5 rounded">
            {String(value)}
          </span>
        ),
      },
      {
        key: 'currentValue',
        label: 'Current Value',
        align: 'right',
        format: (_value, row) => (
          <CurrencyDisplay
            amount={row.currentValue}
            currency={row.currency}
            dkkEquivalent={row.currentValueDkk}
            size="sm"
          />
        ),
      },
      {
        key: 'monthEarnings',
        label: 'Month Earnings',
        align: 'right',
        hideOnMobile: true,
        format: (value) => {
          const num = value as number
          return (
            <span className={`font-mono-data ${trendColor(num)}`}>
              {formatCurrency(num, 'DKK')}
            </span>
          )
        },
      },
      {
        key: 'allTimeGainLoss',
        label: 'All-Time Gain/Loss',
        align: 'right',
        hideOnMobile: true,
        format: (_value, row) => (
          <div>
            <span className={`font-mono-data ${trendColor(row.allTimeGainLoss)}`}>
              {formatCurrency(row.allTimeGainLoss, 'DKK')}
            </span>
            <p className={`text-xs mt-0.5 ${trendColor(row.allTimeGainLossPercent)}`}>
              {formatPercent(row.allTimeGainLossPercent)}
            </p>
          </div>
        ),
      },
      {
        key: 'allTimeXirr',
        label: 'All-Time XIRR',
        align: 'right',
        hideOnMobile: true,
        format: (value) => {
          if (value == null) {
            return <span className="text-base-300 dark:text-base-500">–</span>
          }
          const num = value as number
          return (
            <span className={`font-mono-data font-medium ${trendColor(num)}`}>
              {formatPercent(num)}
            </span>
          )
        },
      },
      {
        key: 'lastUpdated',
        label: 'Updated',
        align: 'right',
        hideOnMobile: true,
        format: (value) => (
          <span className="text-base-500 dark:text-base-400">
            {formatRecentUpdate(value as string)}
          </span>
        ),
      },
    ],
    [],
  )

  const handleRowClick = onRowClick
    ? (row: PlatformRow) => onRowClick(row.id)
    : undefined

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5 flex items-center justify-between border-b border-base-100 dark:border-base-700">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-base-900 dark:text-white">Investment Platforms</h3>
          <span className="text-xs text-base-400 bg-base-100 dark:bg-base-700 px-2 py-0.5 rounded-full font-medium">
            {platforms.length}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onAddDataPoint}>
            + Add Data Point
          </Button>
          <Button variant="primary" size="sm" onClick={onAddTransaction}>
            + Add Transaction
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTableRows count={4} />
      ) : platforms.length === 0 ? (
        <EmptyState
          variant="section"
          icon={BarChart3}
          description="No investment platforms yet. Add your first platform to get started."
        />
      ) : (
        <DataTable
          columns={columns}
          data={platforms}
          keyExtractor={(row) => row.id}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  )
}

export { PortfolioOverviewPlatformsTable }
export type { PlatformRow, PortfolioOverviewPlatformsTableProps }
