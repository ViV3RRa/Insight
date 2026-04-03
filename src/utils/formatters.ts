import { format, parseISO } from 'date-fns'

// --- Number formatting ---

const DA_DK = 'da-DK'

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat(DA_DK, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCurrency(value: number, currency: string): string {
  return `${formatNumber(value)} ${currency}`
}

export function formatPercent(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`
}

export function formatPercentagePoints(value: number): string {
  const formatted = formatNumber(value, 1)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatted}pp`
}

export function formatSignedNumber(value: number, decimals = 2): string {
  const formatted = formatNumber(value, decimals)
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${formatted}`
}

export function formatSignedCurrency(value: number, currency: string): string {
  return `${formatSignedNumber(value)} ${currency}`
}

// --- Date formatting ---

function toDate(date: Date | string): Date {
  return typeof date === 'string' ? parseISO(date) : date
}

export function formatRecordDate(date: Date | string, dateFormat: string): string {
  return format(toDate(date), dateFormat)
}

export function formatHumanDate(date: Date | string): string {
  return format(toDate(date), 'MMM d, yyyy')
}

export function formatMonthPeriod(date: Date | string): string {
  return format(toDate(date), 'MMM yyyy')
}

export function formatRecentUpdate(date: Date | string): string {
  return format(toDate(date), 'MMM d')
}

export function formatYearLabel(year: number, isCurrentYear: boolean): string {
  return isCurrentYear ? `${year} (YTD)` : `${year}`
}
