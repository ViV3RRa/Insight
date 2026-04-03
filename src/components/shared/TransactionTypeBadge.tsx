interface TransactionTypeBadgeProps {
  type: 'deposit' | 'withdrawal'
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  if (type === 'deposit') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span className="hidden sm:inline">Deposit</span>
        <span className="sm:hidden">Dep.</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
      <span className="hidden sm:inline">Withdrawal</span>
      <span className="sm:hidden">Wdl.</span>
    </span>
  )
}
