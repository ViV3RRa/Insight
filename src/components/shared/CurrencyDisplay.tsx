import { formatCurrency, formatSignedCurrency } from '@/utils/formatters'

interface CurrencyDisplayProps {
  amount: number
  currency: string
  dkkEquivalent?: number
  trend?: 'positive' | 'negative' | 'neutral'
  showSign?: boolean
  size?: 'sm' | 'md'
}

export function CurrencyDisplay({
  amount,
  currency,
  dkkEquivalent,
  trend,
  showSign = false,
  size = 'md',
}: CurrencyDisplayProps) {
  const formattedAmount = showSign
    ? formatSignedCurrency(amount, currency)
    : formatCurrency(amount, currency)

  const trendClass =
    trend === 'positive'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'negative'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-base-900 dark:text-white'

  const showDkkLine = currency !== 'DKK' && dkkEquivalent != null
  const dkkFormatted = showDkkLine
    ? showSign
      ? formatSignedCurrency(dkkEquivalent!, 'DKK')
      : formatCurrency(dkkEquivalent!, 'DKK')
    : null

  const secondaryTextSize = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <div>
      <span className={`font-mono-data ${trendClass}`}>{formattedAmount}</span>
      {showDkkLine && (
        <p
          className={`${secondaryTextSize} text-base-300 dark:text-base-500 mt-0.5 font-mono-data`}
        >
          ≈ {dkkFormatted}
        </p>
      )}
    </div>
  )
}
