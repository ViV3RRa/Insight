import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  type TimeSpan,
  TIME_SPAN_OPTIONS,
  DEFAULT_TIME_SPAN,
  getTimeSpanRange,
  filterByTimeSpan,
  getYoYRange,
} from '@/utils/timeSpan'

afterEach(() => {
  vi.useRealTimers()
})

/** Create a local-time midnight date (avoids UTC parsing pitfalls). */
function localDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

function setToday(year: number, month: number, day: number) {
  vi.useFakeTimers()
  vi.setSystemTime(localDate(year, month, day))
}

describe('TIME_SPAN_OPTIONS', () => {
  it('contains all 9 time span options in order', () => {
    expect(TIME_SPAN_OPTIONS).toHaveLength(9)
    const values = TIME_SPAN_OPTIONS.map((o) => o.value)
    expect(values).toEqual(['1M', '3M', '6M', 'MTD', 'YTD', '1Y', '3Y', '5Y', 'All'])
  })

  it('each option has value and label', () => {
    for (const opt of TIME_SPAN_OPTIONS) {
      expect(opt).toHaveProperty('value')
      expect(opt).toHaveProperty('label')
      expect(typeof opt.label).toBe('string')
    }
  })
})

describe('DEFAULT_TIME_SPAN', () => {
  it('is YTD', () => {
    expect(DEFAULT_TIME_SPAN).toBe('YTD')
  })
})

describe('getTimeSpanRange', () => {
  // Pin today to July 15, 2025 for most tests
  describe.each<{ span: TimeSpan; startY: number; startM: number; startD: number }>([
    { span: '1M', startY: 2025, startM: 6, startD: 1 },
    { span: '3M', startY: 2025, startM: 4, startD: 1 },
    { span: '6M', startY: 2025, startM: 1, startD: 1 },
    { span: 'MTD', startY: 2025, startM: 7, startD: 1 },
    { span: 'YTD', startY: 2025, startM: 1, startD: 1 },
    { span: '1Y', startY: 2024, startM: 7, startD: 1 },
    { span: '3Y', startY: 2022, startM: 7, startD: 1 },
    { span: '5Y', startY: 2020, startM: 7, startD: 1 },
  ])('$span', ({ span, startY, startM, startD }) => {
    it(`returns correct start date`, () => {
      setToday(2025, 7, 15)
      const { start, end } = getTimeSpanRange(span)
      expect(start).toEqual(localDate(startY, startM, startD))
      expect(end).toEqual(localDate(2025, 7, 15))
    })
  })

  it('All uses earliestDate when provided', () => {
    setToday(2025, 7, 15)
    const earliest = localDate(2018, 3, 15)
    const { start, end } = getTimeSpanRange('All', earliest)
    expect(start).toEqual(earliest)
    expect(end).toEqual(localDate(2025, 7, 15))
  })

  it('All falls back to 2000-01-01 when no earliestDate', () => {
    setToday(2025, 7, 15)
    const { start } = getTimeSpanRange('All')
    expect(start).toEqual(localDate(2000, 1, 1))
  })

  it('end is always startOfDay(today) regardless of actual time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 6, 15, 18, 30, 45)) // July 15 at 18:30:45
    const { end } = getTimeSpanRange('MTD')
    expect(end).toEqual(localDate(2025, 7, 15))
  })

  describe('calendar boundary semantics', () => {
    it('1M starts at first of previous month, not 30 days ago', () => {
      setToday(2025, 3, 15)
      const { start } = getTimeSpanRange('1M')
      // Should be Feb 1, not Feb 13 (30 days ago)
      expect(start).toEqual(localDate(2025, 2, 1))
    })

    it('3M on the 1st of a month uses correct start', () => {
      setToday(2025, 4, 1)
      const { start } = getTimeSpanRange('3M')
      expect(start).toEqual(localDate(2025, 1, 1))
    })
  })

  describe('edge cases', () => {
    it('handles year boundary — Jan 15 with 1M spans to Dec of prior year', () => {
      setToday(2025, 1, 15)
      const { start } = getTimeSpanRange('1M')
      expect(start).toEqual(localDate(2024, 12, 1))
    })

    it('handles year boundary — Jan 15 with YTD starts Jan 1', () => {
      setToday(2025, 1, 15)
      const { start } = getTimeSpanRange('YTD')
      expect(start).toEqual(localDate(2025, 1, 1))
    })

    it('handles leap year — Feb 29 2024', () => {
      setToday(2024, 2, 29)
      const { start } = getTimeSpanRange('1M')
      expect(start).toEqual(localDate(2024, 1, 1))
    })

    it('handles Dec 31 year boundary with 3M', () => {
      setToday(2025, 12, 31)
      const { start } = getTimeSpanRange('3M')
      expect(start).toEqual(localDate(2025, 9, 1))
    })

    it('MTD on the first day of the month returns start = end = first of month', () => {
      setToday(2025, 7, 1)
      const { start, end } = getTimeSpanRange('MTD')
      expect(start).toEqual(localDate(2025, 7, 1))
      expect(end).toEqual(localDate(2025, 7, 1))
    })
  })
})

describe('filterByTimeSpan', () => {
  interface TestItem {
    date: Date
    name: string
  }

  const getDate = (item: TestItem) => item.date

  function makeItems(): TestItem[] {
    return [
      { date: localDate(2024, 1, 10), name: 'old' },
      { date: localDate(2025, 1, 15), name: 'jan' },
      { date: localDate(2025, 4, 20), name: 'apr' },
      { date: localDate(2025, 7, 1), name: 'jul-start' },
      { date: localDate(2025, 7, 15), name: 'today' },
    ]
  }

  it('filters items within the range (MTD)', () => {
    setToday(2025, 7, 15)
    const result = filterByTimeSpan(makeItems(), 'MTD', getDate)
    const names = result.map((r) => r.name)
    expect(names).toEqual(['jul-start', 'today'])
  })

  it('filters items within the range (YTD)', () => {
    setToday(2025, 7, 15)
    const result = filterByTimeSpan(makeItems(), 'YTD', getDate)
    const names = result.map((r) => r.name)
    expect(names).toEqual(['jan', 'apr', 'jul-start', 'today'])
  })

  it('returns all items for All span', () => {
    setToday(2025, 7, 15)
    const result = filterByTimeSpan(makeItems(), 'All', getDate)
    expect(result).toHaveLength(5)
  })

  it('returns empty array when no items match', () => {
    setToday(2025, 7, 15)
    const futureItems: TestItem[] = [
      { date: localDate(2030, 1, 1), name: 'future' },
    ]
    const result = filterByTimeSpan(futureItems, 'MTD', getDate)
    expect(result).toEqual([])
  })

  it('returns empty array for empty input', () => {
    setToday(2025, 7, 15)
    const result = filterByTimeSpan([], 'YTD', getDate)
    expect(result).toEqual([])
  })

  it('includes items on the exact boundary dates (inclusive)', () => {
    setToday(2025, 7, 15)
    // MTD range: Jul 1 to Jul 15
    const boundaryItems: TestItem[] = [
      { date: localDate(2025, 6, 30), name: 'before' },
      { date: localDate(2025, 7, 1), name: 'start-boundary' },
      { date: localDate(2025, 7, 15), name: 'end-boundary' },
      { date: localDate(2025, 7, 16), name: 'after' },
    ]
    const result = filterByTimeSpan(boundaryItems, 'MTD', getDate)
    const names = result.map((r) => r.name)
    expect(names).toEqual(['start-boundary', 'end-boundary'])
  })

  it('passes earliestDate through to getTimeSpanRange for All', () => {
    setToday(2025, 7, 15)
    const earliest = localDate(2025, 1, 1)
    const result = filterByTimeSpan(makeItems(), 'All', getDate, earliest)
    const names = result.map((r) => r.name)
    // Only items from 2025-01-01 onward
    expect(names).toEqual(['jan', 'apr', 'jul-start', 'today'])
  })
})

describe('getYoYRange', () => {
  describe.each<{
    span: TimeSpan
    startY: number; startM: number; startD: number
    endY: number; endM: number; endD: number
  }>([
    { span: '1M', startY: 2024, startM: 6, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: '3M', startY: 2024, startM: 4, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: '6M', startY: 2024, startM: 1, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: 'MTD', startY: 2024, startM: 7, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: 'YTD', startY: 2024, startM: 1, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: '1Y', startY: 2023, startM: 7, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: '3Y', startY: 2021, startM: 7, startD: 1, endY: 2024, endM: 7, endD: 15 },
    { span: '5Y', startY: 2019, startM: 7, startD: 1, endY: 2024, endM: 7, endD: 15 },
  ])('$span', ({ span, startY, startM, startD, endY, endM, endD }) => {
    it(`returns prior-year range`, () => {
      setToday(2025, 7, 15)
      const { start, end } = getYoYRange(span)
      expect(start).toEqual(localDate(startY, startM, startD))
      expect(end).toEqual(localDate(endY, endM, endD))
    })
  })

  it('All with earliestDate shifts both dates back 1 year', () => {
    setToday(2025, 7, 15)
    const earliest = localDate(2020, 6, 1)
    const { start, end } = getYoYRange('All', earliest)
    expect(start).toEqual(localDate(2019, 6, 1))
    expect(end).toEqual(localDate(2024, 7, 15))
  })

  it('handles leap year — today is Feb 29 2024, YoY end is Feb 28 2023', () => {
    setToday(2024, 2, 29)
    const { end } = getYoYRange('MTD')
    // subYears(2024-02-29, 1) → 2023-02-28 (date-fns handles this)
    expect(end).toEqual(localDate(2023, 2, 28))
  })

  it('handles Dec→Jan boundary', () => {
    setToday(2025, 1, 15)
    // 1M: start = 2024-12-01, YoY start = 2023-12-01
    const { start, end } = getYoYRange('1M')
    expect(start).toEqual(localDate(2023, 12, 1))
    expect(end).toEqual(localDate(2024, 1, 15))
  })
})
