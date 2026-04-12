import { differenceInDays, parseISO, getMonth, getYear, getDate } from 'date-fns'

export type StalenessLevel = 'none' | 'warning' | 'critical'

/**
 * Determines the staleness level based on how recently data was entered.
 *
 * - If a current-month entry exists → 'none'
 * - If no current-month entry: day 1–2 → 'none', day 3–7 → 'warning', day 8+ → 'critical'
 */
export function getStalenessLevel(
  lastEntryDate: string | null
): StalenessLevel {
  const today = new Date()
  const currentMonth = getMonth(today)
  const currentYear = getYear(today)
  const dayOfMonth = getDate(today)

  if (lastEntryDate !== null) {
    const entryDate = parseISO(lastEntryDate)
    if (
      getMonth(entryDate) === currentMonth &&
      getYear(entryDate) === currentYear
    ) {
      return 'none'
    }
  }

  if (dayOfMonth > 7) return 'critical'
  if (dayOfMonth > 2) return 'warning'
  return 'none'
}

/**
 * Simple days-since-last-entry staleness check.
 * Returns 'critical' if >7 days (or no date), 'warning' if >2 days, null if fresh.
 */
export function getDaysStaleness(
  lastEntryDate: Date | string | null | undefined,
): 'critical' | 'warning' | null {
  if (lastEntryDate == null) return 'critical'
  const date = typeof lastEntryDate === 'string' ? new Date(lastEntryDate) : lastEntryDate
  const days = differenceInDays(new Date(), date)
  if (days > 7) return 'critical'
  if (days > 2) return 'warning'
  return null
}
