import { describe, it, expect, vi, afterEach } from 'vitest'
import { getStalenessLevel } from './staleness'

describe('getStalenessLevel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'none' when lastEntryDate is in the current month", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15)) // Jan 15
    expect(getStalenessLevel('2026-01-10')).toBe('none')
  })

  it("returns 'none' for entry on first day of current month", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 20)) // Mar 20
    expect(getStalenessLevel('2026-03-01')).toBe('none')
  })

  it("returns 'none' when lastEntryDate is null and today is day 1", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 1)) // Apr 1
    expect(getStalenessLevel(null)).toBe('none')
  })

  it("returns 'none' when lastEntryDate is null and today is day 2", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 2)) // Apr 2
    expect(getStalenessLevel(null)).toBe('none')
  })

  it("returns 'none' on day 1 even with no data at all", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 1)) // Jun 1
    expect(getStalenessLevel(null)).toBe('none')
  })

  it("returns 'none' on day 2 even with stale data from months ago", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 2)) // Jun 2
    expect(getStalenessLevel('2026-01-15')).toBe('none')
  })

  it("returns 'warning' when lastEntryDate is null and today is day 3", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 3)) // Apr 3
    expect(getStalenessLevel(null)).toBe('warning')
  })

  it("returns 'warning' when last entry is previous month and today is day 3-7", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 5)) // Apr 5
    expect(getStalenessLevel('2026-03-28')).toBe('warning')
  })

  it("returns 'warning' on day 7 (boundary)", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 7)) // Apr 7
    expect(getStalenessLevel('2026-03-15')).toBe('warning')
  })

  it("returns 'critical' when lastEntryDate is null and today is day 8", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 8)) // Apr 8
    expect(getStalenessLevel(null)).toBe('critical')
  })

  it("returns 'critical' when last entry is previous month and today is day 8+", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15)) // Apr 15
    expect(getStalenessLevel('2026-03-20')).toBe('critical')
  })

  it('handles year boundary (Dec entry, checking in Jan)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 5)) // Jan 5, 2026
    // Dec 2025 entry — not current month, day 5 → warning
    expect(getStalenessLevel('2025-12-28')).toBe('warning')
  })

  it('handles year boundary — Dec entry still current in Dec', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 11, 15)) // Dec 15, 2025
    expect(getStalenessLevel('2025-12-01')).toBe('none')
  })

  it("returns 'critical' at year boundary when day > 7", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 10)) // Jan 10, 2026
    expect(getStalenessLevel('2025-12-28')).toBe('critical')
  })
})
