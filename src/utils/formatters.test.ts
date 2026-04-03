import { describe, expect, test } from 'vitest'
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatPercentagePoints,
  formatSignedNumber,
  formatSignedCurrency,
  formatRecordDate,
  formatHumanDate,
  formatMonthPeriod,
  formatRecentUpdate,
  formatYearLabel,
} from '@/utils/formatters'

// --- Number formatting ---

describe('formatNumber', () => {
  test.each([
    [1000.5, undefined, '1.000,50'],
    [1000.5, 1, '1.000,5'],
    [0, undefined, '0,00'],
    [0, 0, '0'],
    [-1234.56, undefined, '-1.234,56'],
    [1000000, undefined, '1.000.000,00'],
    [0.123, 3, '0,123'],
    [42, undefined, '42,00'],
    [999.999, 2, '1.000,00'],
  ] as [number, number | undefined, string][])(
    'formatNumber(%s, %s) → %s',
    (value, decimals, expected) => {
      expect(formatNumber(value, decimals)).toBe(expected)
    },
  )
})

describe('formatCurrency', () => {
  test.each([
    [5057.8, 'DKK', '5.057,80 DKK'],
    [0, 'DKK', '0,00 DKK'],
    [-1842, 'EUR', '-1.842,00 EUR'],
    [1000000, 'USD', '1.000.000,00 USD'],
    [99.9, 'SEK', '99,90 SEK'],
  ] as [number, string, string][])(
    'formatCurrency(%s, %s) → %s',
    (value, currency, expected) => {
      expect(formatCurrency(value, currency)).toBe(expected)
    },
  )
})

describe('formatPercent', () => {
  test.each([
    [5.48, undefined, '5,48%'],
    [0, undefined, '0,00%'],
    [-3.2, undefined, '-3,20%'],
    [100, 0, '100%'],
    [12.345, 1, '12,3%'],
    [0.1, 3, '0,100%'],
  ] as [number, number | undefined, string][])(
    'formatPercent(%s, %s) → %s',
    (value, decimals, expected) => {
      expect(formatPercent(value, decimals)).toBe(expected)
    },
  )
})

describe('formatPercentagePoints', () => {
  test.each([
    [2.3, '+2,3pp'],
    [-1.5, '-1,5pp'],
    [0, '0,0pp'],
    [10, '+10,0pp'],
    [-0.1, '-0,1pp'],
  ] as [number, string][])(
    'formatPercentagePoints(%s) → %s',
    (value, expected) => {
      expect(formatPercentagePoints(value)).toBe(expected)
    },
  )
})

describe('formatSignedNumber', () => {
  test.each([
    [182914, undefined, '+182.914,00'],
    [-500, undefined, '-500,00'],
    [0, undefined, '0,00'],
    [1.5, 1, '+1,5'],
    [-99.99, 2, '-99,99'],
    [1000000, 0, '+1.000.000'],
  ] as [number, number | undefined, string][])(
    'formatSignedNumber(%s, %s) → %s',
    (value, decimals, expected) => {
      expect(formatSignedNumber(value, decimals)).toBe(expected)
    },
  )
})

describe('formatSignedCurrency', () => {
  test.each([
    [1000, 'DKK', '+1.000,00 DKK'],
    [-1842, 'DKK', '-1.842,00 DKK'],
    [0, 'EUR', '0,00 EUR'],
    [500.5, 'USD', '+500,50 USD'],
  ] as [number, string, string][])(
    'formatSignedCurrency(%s, %s) → %s',
    (value, currency, expected) => {
      expect(formatSignedCurrency(value, currency)).toBe(expected)
    },
  )
})

// --- Date formatting ---

const testDate = new Date(2026, 1, 14) // Feb 14, 2026
const testDateISO = '2026-02-14'

describe('formatRecordDate', () => {
  test('formats Date with yyyy-MM-dd', () => {
    expect(formatRecordDate(testDate, 'yyyy-MM-dd')).toBe('2026-02-14')
  })

  test('formats ISO string with dd/MM/yyyy', () => {
    expect(formatRecordDate(testDateISO, 'dd/MM/yyyy')).toBe('14/02/2026')
  })

  test('formats Date with dd/MM/yyyy', () => {
    expect(formatRecordDate(testDate, 'dd/MM/yyyy')).toBe('14/02/2026')
  })

  test('formats ISO string with yyyy-MM-dd', () => {
    expect(formatRecordDate(testDateISO, 'yyyy-MM-dd')).toBe('2026-02-14')
  })
})

describe('formatHumanDate', () => {
  test('formats Date object', () => {
    expect(formatHumanDate(testDate)).toBe('Feb 14, 2026')
  })

  test('formats ISO string', () => {
    expect(formatHumanDate(testDateISO)).toBe('Feb 14, 2026')
  })

  test('formats different months', () => {
    expect(formatHumanDate(new Date(2026, 11, 25))).toBe('Dec 25, 2026')
    expect(formatHumanDate('2026-07-01')).toBe('Jul 1, 2026')
  })
})

describe('formatMonthPeriod', () => {
  test('formats Date object', () => {
    expect(formatMonthPeriod(testDate)).toBe('Feb 2026')
  })

  test('formats ISO string', () => {
    expect(formatMonthPeriod(testDateISO)).toBe('Feb 2026')
  })

  test('formats different months', () => {
    expect(formatMonthPeriod(new Date(2025, 0, 1))).toBe('Jan 2025')
    expect(formatMonthPeriod('2026-12-31')).toBe('Dec 2026')
  })
})

describe('formatRecentUpdate', () => {
  test('formats Date object', () => {
    expect(formatRecentUpdate(testDate)).toBe('Feb 14')
  })

  test('formats ISO string', () => {
    expect(formatRecentUpdate(testDateISO)).toBe('Feb 14')
  })

  test('formats different months', () => {
    expect(formatRecentUpdate(new Date(2026, 5, 1))).toBe('Jun 1')
    expect(formatRecentUpdate('2026-11-30')).toBe('Nov 30')
  })
})

describe('formatYearLabel', () => {
  test('formats non-current year', () => {
    expect(formatYearLabel(2025, false)).toBe('2025')
  })

  test('formats current year with YTD', () => {
    expect(formatYearLabel(2026, true)).toBe('2026 (YTD)')
  })

  test('formats other years', () => {
    expect(formatYearLabel(2020, false)).toBe('2020')
    expect(formatYearLabel(2030, true)).toBe('2030 (YTD)')
  })
})
