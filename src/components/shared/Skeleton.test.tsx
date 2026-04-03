import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { Skeleton, SkeletonKpiCard, SkeletonChart, SkeletonTableRows } from './Skeleton'

describe('Skeleton', () => {
  describe('generic Skeleton bar', () => {
    it('renders with default width and height', () => {
      const { container } = renderWithProviders(<Skeleton />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('skeleton')
      expect(el.className).toContain('h-4')
      expect(el.className).toContain('w-24')
      expect(el.className).toContain('rounded')
    })

    it('accepts custom width and height', () => {
      const { container } = renderWithProviders(
        <Skeleton width="w-48" height="h-8" />,
      )
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('w-48')
      expect(el.className).toContain('h-8')
    })

    it('accepts additional className', () => {
      const { container } = renderWithProviders(
        <Skeleton className="mt-4" />,
      )
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('mt-4')
    })

    it('has aria-hidden attribute', () => {
      const { container } = renderWithProviders(<Skeleton />)
      const el = container.firstChild as HTMLElement
      expect(el.getAttribute('aria-hidden')).toBe('true')
    })

    it('has skeleton class for shimmer animation', () => {
      const { container } = renderWithProviders(<Skeleton />)
      const el = container.firstChild as HTMLElement
      expect(el.className).toContain('skeleton')
    })
  })

  describe('SkeletonKpiCard', () => {
    it('renders a card shell with correct classes', () => {
      const { container } = renderWithProviders(<SkeletonKpiCard />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-white')
      expect(card.className).toContain('dark:bg-base-800')
      expect(card.className).toContain('rounded-2xl')
      expect(card.className).toContain('p-5')
      expect(card.className).toContain('shadow-card')
      expect(card.className).toContain('dark:shadow-card-dark')
    })

    it('renders 3 skeleton bars (label, value, sublabel)', () => {
      const { container } = renderWithProviders(<SkeletonKpiCard />)
      const bars = container.querySelectorAll('.skeleton')
      expect(bars).toHaveLength(3)

      // Label bar
      expect(bars[0]?.className).toContain('h-3')
      expect(bars[0]?.className).toContain('w-20')

      // Value bar
      expect(bars[1]?.className).toContain('h-6')
      expect(bars[1]?.className).toContain('w-32')

      // Sublabel bar
      expect(bars[2]?.className).toContain('h-3')
      expect(bars[2]?.className).toContain('w-16')
    })

    it('renders multiple cards when count > 1', () => {
      const { container } = renderWithProviders(<SkeletonKpiCard count={3} />)
      const cards = container.querySelectorAll('.rounded-2xl')
      expect(cards).toHaveLength(3)
    })

    it('defaults to 1 card', () => {
      const { container } = renderWithProviders(<SkeletonKpiCard />)
      const cards = container.querySelectorAll('.rounded-2xl')
      expect(cards).toHaveLength(1)
    })

    it('has aria-hidden on card elements', () => {
      const { container } = renderWithProviders(<SkeletonKpiCard />)
      const card = container.firstChild as HTMLElement
      expect(card.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('SkeletonChart', () => {
    it('renders a card shell', () => {
      const { container } = renderWithProviders(<SkeletonChart />)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-white')
      expect(card.className).toContain('dark:bg-base-800')
      expect(card.className).toContain('rounded-2xl')
      expect(card.className).toContain('shadow-card')
    })

    it('renders header row with title and control bars', () => {
      const { container } = renderWithProviders(<SkeletonChart />)
      const allBars = container.querySelectorAll('.skeleton')
      // title bar + 2 control bars + time span bar + chart area = 5
      expect(allBars.length).toBeGreaterThanOrEqual(5)

      // Title bar
      expect(allBars[0]?.className).toContain('h-4')
      expect(allBars[0]?.className).toContain('w-36')
    })

    it('renders time span bar', () => {
      const { container } = renderWithProviders(<SkeletonChart />)
      const allBars = container.querySelectorAll('.skeleton')
      // Time span bar is the 4th bar (index 3)
      expect(allBars[3]?.className).toContain('h-7')
      expect(allBars[3]?.className).toContain('w-64')
    })

    it('renders chart area placeholder', () => {
      const { container } = renderWithProviders(<SkeletonChart />)
      const allBars = container.querySelectorAll('.skeleton')
      const chartArea = allBars[allBars.length - 1]
      expect(chartArea?.className).toContain('h-48')
      expect(chartArea?.className).toContain('sm:h-64')
      expect(chartArea?.className).toContain('w-full')
    })

    it('has aria-hidden', () => {
      const { container } = renderWithProviders(<SkeletonChart />)
      const card = container.firstChild as HTMLElement
      expect(card.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('SkeletonTableRows', () => {
    it('renders a header row with 3 bars', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const headerRow = container.querySelector('.border-b.border-base-200')
      expect(headerRow).toBeTruthy()
      const headerBars = headerRow?.querySelectorAll('.skeleton')
      expect(headerBars).toHaveLength(3)
    })

    it('renders 3 body rows by default', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const bodyRows = container.querySelectorAll('.border-b.border-base-100')
      expect(bodyRows).toHaveLength(3)
    })

    it('renders custom count of body rows', () => {
      const { container } = renderWithProviders(<SkeletonTableRows count={5} />)
      const bodyRows = container.querySelectorAll('.border-b.border-base-100')
      expect(bodyRows).toHaveLength(5)
    })

    it('body rows have varying bar widths', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const bodyRows = container.querySelectorAll('.border-b.border-base-100')

      const row1Bars = bodyRows[0]?.querySelectorAll('.skeleton')
      const row2Bars = bodyRows[1]?.querySelectorAll('.skeleton')

      // First bars of row 1 and row 2 should differ in width
      expect(row1Bars?.[0]?.className).toContain('w-24')
      expect(row2Bars?.[0]?.className).toContain('w-20')
    })

    it('has dark mode border classes', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const headerRow = container.querySelector('.dark\\:border-base-700')
      expect(headerRow).toBeTruthy()
    })

    it('has aria-hidden on root', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const root = container.firstChild as HTMLElement
      expect(root.getAttribute('aria-hidden')).toBe('true')
    })

    it('each body row has 3 skeleton bars', () => {
      const { container } = renderWithProviders(<SkeletonTableRows />)
      const bodyRows = container.querySelectorAll('.border-b.border-base-100')
      bodyRows.forEach((row) => {
        const bars = row.querySelectorAll('.skeleton')
        expect(bars).toHaveLength(3)
      })
    })
  })
})
