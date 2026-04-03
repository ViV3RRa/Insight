import {
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
  startOfDay,
  isWithinInterval,
} from 'date-fns'

export type TimeSpan = '1M' | '3M' | '6M' | 'MTD' | 'YTD' | '1Y' | '3Y' | '5Y' | 'All'

export const TIME_SPAN_OPTIONS: { value: TimeSpan; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'MTD', label: 'MTD' },
  { value: 'YTD', label: 'YTD' },
  { value: '1Y', label: '1Y' },
  { value: '3Y', label: '3Y' },
  { value: '5Y', label: '5Y' },
  { value: 'All', label: 'All' },
]

export const DEFAULT_TIME_SPAN: TimeSpan = 'YTD'

const FAR_PAST_DEFAULT = new Date(2000, 0, 1)

/**
 * Returns the date range for a given time span.
 * Uses calendar boundary semantics — month-based spans start at the first day
 * of the target month, not N*30 days ago.
 */
export function getTimeSpanRange(
  span: TimeSpan,
  earliestDate?: Date,
): { start: Date; end: Date } {
  const today = startOfDay(new Date())

  let start: Date
  switch (span) {
    case '1M':
      start = startOfMonth(subMonths(today, 1))
      break
    case '3M':
      start = startOfMonth(subMonths(today, 3))
      break
    case '6M':
      start = startOfMonth(subMonths(today, 6))
      break
    case 'MTD':
      start = startOfMonth(today)
      break
    case 'YTD':
      start = startOfYear(today)
      break
    case '1Y':
      start = startOfMonth(subMonths(today, 12))
      break
    case '3Y':
      start = startOfMonth(subMonths(today, 36))
      break
    case '5Y':
      start = startOfMonth(subMonths(today, 60))
      break
    case 'All':
      start = earliestDate ?? FAR_PAST_DEFAULT
      break
  }

  return { start, end: today }
}

/**
 * Filters items where getDate(item) falls within the span's range (inclusive both ends).
 */
export function filterByTimeSpan<T>(
  items: T[],
  span: TimeSpan,
  getDate: (item: T) => Date,
  earliestDate?: Date,
): T[] {
  const { start, end } = getTimeSpanRange(span, earliestDate)
  return items.filter((item) =>
    isWithinInterval(getDate(item), { start, end }),
  )
}

/**
 * Returns the equivalent prior-year range for YoY comparison.
 * Takes the range from getTimeSpanRange and shifts it back exactly 1 year.
 */
export function getYoYRange(
  span: TimeSpan,
  earliestDate?: Date,
): { start: Date; end: Date } {
  const { start, end } = getTimeSpanRange(span, earliestDate)
  return {
    start: subYears(start, 1),
    end: subYears(end, 1),
  }
}
