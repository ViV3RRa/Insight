import { useMemo } from 'react'
import { Wallet } from 'lucide-react'
import { DataTable, type ColumnDef } from '../shared/DataTable'
import { PlatformIcon } from '../shared/PlatformIcon'
import { CurrencyDisplay } from '../shared/CurrencyDisplay'
import { EmptyState } from '../shared/EmptyState'
import { SkeletonTableRows } from '../shared/Skeleton'
import { formatRecentUpdate } from '../../utils/formatters'

interface CashPlatformRow {
  id: string
  name: string
  iconUrl?: string
  currency: string
  currentBalance: number
  balanceDkk?: number
  lastUpdated: string
}

interface PortfolioOverviewCashTableProps {
  cashPlatforms: CashPlatformRow[]
  isLoading?: boolean
  onRowClick?: (platformId: string) => void
}

function PortfolioOverviewCashTable({
  cashPlatforms,
  isLoading = false,
  onRowClick,
}: PortfolioOverviewCashTableProps) {
  const columns = useMemo<Array<ColumnDef<CashPlatformRow>>>(
    () => [
      {
        key: 'name',
        label: 'Account',
        align: 'left' as const,
        format: (_value: unknown, row: CashPlatformRow) => (
          <div className="flex items-center gap-2.5">
            <PlatformIcon imageUrl={row.iconUrl} name={row.name} size="md" />
            <span className="font-medium text-base-900 dark:text-white">{row.name}</span>
          </div>
        ),
      },
      {
        key: 'currentBalance',
        label: 'Current Balance',
        align: 'right' as const,
        format: (_value: unknown, row: CashPlatformRow) => (
          <CurrencyDisplay
            amount={row.currentBalance}
            currency={row.currency}
            dkkEquivalent={row.balanceDkk}
            size="sm"
          />
        ),
      },
      {
        key: 'lastUpdated',
        label: 'Updated',
        align: 'right' as const,
        hideOnMobile: true,
        format: (value: unknown) => (
          <span className="text-base-400 dark:text-base-500">
            {formatRecentUpdate(value as string)}
          </span>
        ),
      },
    ],
    [],
  )

  const handleRowClick = onRowClick
    ? (row: CashPlatformRow) => onRowClick(row.id)
    : undefined

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-base-900 dark:text-white">Cash Accounts</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
          {cashPlatforms.length}
        </span>
      </div>

      {isLoading && <SkeletonTableRows count={3} />}

      {!isLoading && cashPlatforms.length === 0 && (
        <EmptyState
          variant="section"
          icon={Wallet}
          description="No cash accounts in this portfolio"
        />
      )}

      {!isLoading && cashPlatforms.length > 0 && (
        <DataTable
          columns={columns}
          data={cashPlatforms}
          keyExtractor={(row) => row.id}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  )
}

export { PortfolioOverviewCashTable }
export type { CashPlatformRow, PortfolioOverviewCashTableProps }
