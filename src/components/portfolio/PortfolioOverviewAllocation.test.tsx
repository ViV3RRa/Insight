import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { PortfolioOverviewAllocation } from './PortfolioOverviewAllocation'
import type { AllocationSegment } from './PortfolioOverviewAllocation'

const testSegments: AllocationSegment[] = [
  {
    label: 'Saxo Investor',
    value: 850000,
    formattedValue: '850.000,00 DKK',
    color: '#3b82f6',
    isCash: false,
  },
  {
    label: 'Nordnet',
    value: 450000,
    formattedValue: '450.000,00 DKK',
    color: '#10b981',
    isCash: false,
  },
  {
    label: 'Emergency Fund',
    value: 200000,
    formattedValue: '200.000,00 DKK',
    color: '#f59e0b',
    isCash: true,
  },
  {
    label: 'Lunar Savings',
    value: 100000,
    formattedValue: '100.000,00 DKK',
    color: '#8b5cf6',
    isCash: true,
  },
]

describe('PortfolioOverviewAllocation', () => {
  describe('section structure', () => {
    it('renders "Portfolio Allocation" section header', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      expect(
        screen.getByRole('heading', { name: 'Portfolio Allocation' }),
      ).toBeInTheDocument()
    })

    it('has correct section wrapper classes (mb-6 lg:mb-8)', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('mb-6')
      expect(wrapper.className).toContain('lg:mb-8')
    })

    it('has correct card classes (rounded-2xl, shadow-card, p-4 sm:p-5)', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      const card = container.querySelector('.rounded-2xl') as HTMLElement
      expect(card).toBeInTheDocument()
      expect(card.className).toContain('shadow-card')
      expect(card.className).toContain('p-4')
      expect(card.className).toContain('sm:p-5')
      expect(card.className).toContain('bg-white')
      expect(card.className).toContain('dark:bg-base-800')
    })
  })

  describe('normal state', () => {
    it('renders ProportionalBar inside the card', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      // ProportionalBar renders an h-8 rounded-lg bar
      const bar = container.querySelector('.h-8.rounded-lg')
      expect(bar).toBeInTheDocument()
    })

    it('renders all segment labels in the legend', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      expect(screen.getByText('Saxo Investor')).toBeInTheDocument()
      expect(screen.getByText('Nordnet')).toBeInTheDocument()
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument()
      expect(screen.getByText('Lunar Savings')).toBeInTheDocument()
    })

    it('renders formatted DKK values for each segment', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      expect(screen.getByText('850.000,00 DKK')).toBeInTheDocument()
      expect(screen.getByText('450.000,00 DKK')).toBeInTheDocument()
      expect(screen.getByText('200.000,00 DKK')).toBeInTheDocument()
      expect(screen.getByText('100.000,00 DKK')).toBeInTheDocument()
    })

    it('renders percentage for each segment', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      // Total = 1,600,000. Saxo: 53.1%, Nordnet: 28.1%, Emergency: 12.5%, Lunar: 6.3%
      expect(screen.getByText('53,1%')).toBeInTheDocument()
      expect(screen.getByText('28,1%')).toBeInTheDocument()
      expect(screen.getByText('12,5%')).toBeInTheDocument()
      expect(screen.getByText('6,3%')).toBeInTheDocument()
    })

    it('renders cash badge for cash platforms', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      const cashBadges = screen.getAllByText('Cash')
      // Two cash platforms: Emergency Fund and Lunar Savings
      expect(cashBadges).toHaveLength(2)
    })

    it('does not render cash badge for non-cash platforms', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation
          segments={[testSegments[0]!, testSegments[1]!]}
        />,
      )
      expect(screen.queryByText('Cash')).not.toBeInTheDocument()
    })

    it('renders color squares for each segment', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      const colorSquares = container.querySelectorAll('.w-2\\.5.h-2\\.5.rounded-sm')
      expect(colorSquares).toHaveLength(4)
    })

    it('renders proportional bar segments with correct colors', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={testSegments} />,
      )
      const bar = container.querySelector('.h-8.rounded-lg') as HTMLElement
      const barSegments = bar.children
      expect(barSegments).toHaveLength(4)
      expect((barSegments[0] as HTMLElement).style.backgroundColor).toBe(
        'rgb(59, 130, 246)',
      )
      expect((barSegments[1] as HTMLElement).style.backgroundColor).toBe(
        'rgb(16, 185, 129)',
      )
    })
  })

  describe('loading state', () => {
    it('renders skeleton placeholders when isLoading is true', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={[]} isLoading />,
      )
      const skeletonWrapper = container.querySelector('[aria-hidden="true"]')
      expect(skeletonWrapper).toBeInTheDocument()
    })

    it('renders skeleton bar placeholder', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={[]} isLoading />,
      )
      // Skeleton bar: h-8 rounded-lg
      const skeletonBar = container.querySelector('.skeleton.h-8')
      expect(skeletonBar).toBeInTheDocument()
    })

    it('does not render ProportionalBar or EmptyState when loading', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={[]} isLoading />,
      )
      expect(
        screen.queryByText('No allocation data available'),
      ).not.toBeInTheDocument()
    })

    it('still shows section header when loading', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={[]} isLoading />,
      )
      expect(
        screen.getByRole('heading', { name: 'Portfolio Allocation' }),
      ).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders EmptyState when segments array is empty', () => {
      renderWithProviders(<PortfolioOverviewAllocation segments={[]} />)
      expect(
        screen.getByText('No allocation data available'),
      ).toBeInTheDocument()
    })

    it('does not render ProportionalBar when segments are empty', () => {
      const { container } = renderWithProviders(
        <PortfolioOverviewAllocation segments={[]} />,
      )
      const bar = container.querySelector('.h-8.rounded-lg')
      expect(bar).not.toBeInTheDocument()
    })
  })

  describe('single segment', () => {
    it('renders correctly with a single segment taking 100%', () => {
      renderWithProviders(
        <PortfolioOverviewAllocation segments={[testSegments[0]!]} />,
      )
      expect(screen.getByText('Saxo Investor')).toBeInTheDocument()
      expect(screen.getByText('100,0%')).toBeInTheDocument()
    })
  })
})
