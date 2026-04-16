import { useMemo, useState } from 'react'
import { ArrowDownUp, Paperclip } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/shared/DataTable'
import { TransactionTypeBadge } from '@/components/shared/TransactionTypeBadge'
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { SkeletonTableRows } from '@/components/shared/Skeleton'
import { formatNumber, formatCurrency, formatRecordDate } from '@/utils/formatters'

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
  onAdd?: () => void
  isLoading?: boolean
}

function PlatformDetailTransactions(props: PlatformDetailTransactionsProps) {
  const {
    transactions,
    showExchangeRate,
    onEdit,
    onDelete,
    onAdd,
    isLoading = false,
  } = props

  const [selectedRow, setSelectedRow] = useState<TransactionRow | null>(null)

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0)),
    [transactions],
  )

  const selectedIndex = selectedRow
    ? sortedTransactions.findIndex((tx) => tx.id === selectedRow.id)
    : -1

  const drawerFields = selectedRow
    ? [
        { label: 'Date', value: formatRecordDate(selectedRow.date, 'MMM d, yyyy HH:mm') },
        { label: 'Type', value: selectedRow.type === 'deposit' ? 'Deposit' : 'Withdrawal' },
        { label: 'Amount', value: formatCurrency(selectedRow.amount, selectedRow.currency) },
        ...(selectedRow.amountDkk != null ? [{ label: 'Amount (DKK)', value: formatCurrency(selectedRow.amountDkk, 'DKK') }] : []),
        ...(selectedRow.exchangeRate != null ? [{ label: 'Exchange Rate', value: formatNumber(selectedRow.exchangeRate, 4) }] : []),
        { label: 'Note', value: selectedRow.note ?? '—' },
        { label: 'Attachment', value: selectedRow.attachmentUrl ? 'Yes' : '—' },
      ]
    : []

  const columns = useMemo<Array<ColumnDef<TransactionRow>>>(() => {
    const cols: Array<ColumnDef<TransactionRow>> = [
      {
        key: 'date',
        label: 'Date',
        align: 'left',
        format: (value) => (
          <span className="text-base-900 dark:text-white">{formatRecordDate(String(value), 'MMM d, yyyy')}</span>
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
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowDownUp className="w-4 h-4 text-base-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-base-900 dark:text-white">Transactions</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
              {transactions.length}
            </span>
          </div>
          {onAdd && (
            <Button variant="secondary" size="sm" onClick={onAdd}>
              + Add Transaction
            </Button>
          )}
        </div>
      </div>

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
          onRowClick={(row) => setSelectedRow(row)}
          showMoreThreshold={5}
        />
      )}

      <MobileDrawer
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title="Transaction"
        fields={drawerFields}
        onEdit={onEdit ? () => { onEdit(selectedRow!); setSelectedRow(null) } : undefined}
        onDelete={onDelete ? () => { onDelete(selectedRow!); setSelectedRow(null) } : undefined}
        onPrev={selectedIndex > 0 ? () => setSelectedRow(sortedTransactions[selectedIndex - 1]!) : undefined}
        onNext={selectedIndex < sortedTransactions.length - 1 ? () => setSelectedRow(sortedTransactions[selectedIndex + 1]!) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < sortedTransactions.length - 1}
      />
    </div>
  )
}

export { PlatformDetailTransactions }
export type { TransactionRow, PlatformDetailTransactionsProps }
