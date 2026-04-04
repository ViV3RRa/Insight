import { useMemo } from 'react'
import { ArrowDownUp, Paperclip } from 'lucide-react'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { TransactionTypeBadge } from '@/components/shared/TransactionTypeBadge'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { SkeletonTableRows } from '@/components/shared/Skeleton'
import { formatNumber } from '@/utils/formatters'

interface TransactionRow {
  id: string
  date: string
  type: 'deposit' | 'withdrawal'
  amount: number
  amountDkk?: number
  currency: string
  exchangeRate?: number
  note?: string
  attachmentUrl?: string
}

interface PlatformDetailTransactionsProps {
  transactions: TransactionRow[]
  currency: string
  showExchangeRate: boolean
  onEdit?: (row: TransactionRow) => void
  onDelete?: (row: TransactionRow) => void
  onRowClick?: (row: TransactionRow) => void
  onAdd?: () => void
  isLoading?: boolean
}

function PlatformDetailTransactions(props: PlatformDetailTransactionsProps) {
  const {
    transactions,
    showExchangeRate,
    onEdit,
    onDelete,
    onRowClick,
    onAdd,
    isLoading = false,
  } = props
  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [transactions],
  )

  const columns = useMemo<Array<ColumnDef<TransactionRow>>>(() => {
    const cols: Array<ColumnDef<TransactionRow>> = [
      {
        key: 'date',
        label: 'Date',
        align: 'left',
        format: (value) => (
          <span className="text-base-900 dark:text-white">{String(value)}</span>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        align: 'left',
        format: (_value, row) => <TransactionTypeBadge type={row.type} />,
      },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        format: (_value, row) => (
          <CurrencyDisplay
            amount={row.amount}
            currency={row.currency}
            dkkEquivalent={row.amountDkk}
            size="sm"
          />
        ),
      },
    ]

    if (showExchangeRate) {
      cols.push({
        key: 'exchangeRate',
        label: 'Exchange Rate',
        align: 'right',
        hideOnMobile: true,
        format: (value) => {
          if (value == null) {
            return <span className="text-base-200 dark:text-base-600">—</span>
          }
          return (
            <span className="font-mono-data text-sm text-base-500 dark:text-base-400">
              {formatNumber(value as number, 4)}
            </span>
          )
        },
      })
    }

    cols.push(
      {
        key: 'note',
        label: 'Note',
        align: 'left',
        hideOnMobile: true,
        format: (value) => {
          if (!value) {
            return <span className="text-base-200 dark:text-base-600">—</span>
          }
          return (
            <span className="italic text-xs text-base-300 dark:text-base-500">
              {String(value)}
            </span>
          )
        },
      },
      {
        key: 'attachmentUrl',
        label: 'Attachment',
        align: 'left',
        hideOnMobile: true,
        format: (value) => {
          if (value) {
            return (
              <a
                href={String(value)}
                className="text-base-400 hover:text-accent-600 dark:hover:text-accent-400"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </a>
            )
          }
          return <span className="text-base-200 dark:text-base-600">—</span>
        },
      },
    )

    return cols
  }, [showExchangeRate])

  return (
    <div className="mb-6 lg:mb-8">
      <CollapsibleSection
        title="Transactions"
        icon={ArrowDownUp}
        count={transactions.length}
        defaultExpanded={false}
      >
        {onAdd && (
          <div className="px-4 py-3 sm:px-5 border-b border-base-100 dark:border-base-700 flex justify-end">
            <Button variant="secondary" size="sm" onClick={onAdd}>
              + Add Transaction
            </Button>
          </div>
        )}

        {isLoading ? (
          <SkeletonTableRows count={3} />
        ) : sortedTransactions.length === 0 ? (
          <EmptyState
            variant="section"
            icon={ArrowDownUp}
            description="No transactions recorded yet."
          />
        ) : (
          <DataTable
            columns={columns}
            data={sortedTransactions}
            keyExtractor={(row) => row.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onRowClick={onRowClick}
          />
        )}
      </CollapsibleSection>
    </div>
  )
}

export { PlatformDetailTransactions }
export type { TransactionRow, PlatformDetailTransactionsProps }
