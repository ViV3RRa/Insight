import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { YoYComparisonRow } from './YoYComparisonRow'

const sampleMetrics = [
  {
    label: 'Total Value',
    currentValue: '120.000 DKK',
    previousValue: '100.000 DKK',
    changePercent: 20,
  },
  {
    label: 'Gain/Loss',
    currentValue: '15.000 DKK',
    previousValue: '10.000 DKK',
    changePercent: 50,
  },
  {
    label: 'XIRR',
    currentValue: '8,50%',
    previousValue: '7,20%',
    changePercent: 18.06,
  },
]

describe('YoYComparisonRow', () => {
  it('renders card shell with correct classes', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Jan 2025 vs Jan 2024" metrics={sampleMetrics} />,
    )
    const card = container.firstElementChild as HTMLElement

    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-base-800',
      'rounded-2xl',
      'shadow-card',
      'dark:shadow-card-dark',
      'p-4',
      'sm:p-5',
    )
  })

  it('renders header with ArrowLeftRight icon and period label', () => {
    render(
      <YoYComparisonRow periodLabel="Jan 2025 vs Jan 2024" metrics={sampleMetrics} />,
    )

    expect(screen.getByText('Jan 2025 vs Jan 2024')).toBeInTheDocument()
    // ArrowLeftRight renders as SVG — check the header wrapper
    const label = screen.getByText('Jan 2025 vs Jan 2024')
    expect(label).toHaveClass('text-xs', 'text-base-400', 'font-medium')

    const header = label.parentElement!
    expect(header).toHaveClass('flex', 'items-center', 'gap-2', 'mb-4')
    // Icon SVG is present
    expect(header.querySelector('svg')).toBeInTheDocument()
  })

  it('renders all 3 metric labels', () => {
    render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    expect(screen.getAllByText('Total Value')).toHaveLength(2) // desktop + mobile
    expect(screen.getAllByText('Gain/Loss')).toHaveLength(2)
    expect(screen.getAllByText('XIRR')).toHaveLength(2)
  })

  it('renders current and previous values', () => {
    render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    // Current values appear in both desktop and mobile
    expect(screen.getAllByText('120.000 DKK')).toHaveLength(2)
    expect(screen.getAllByText('15.000 DKK')).toHaveLength(2)
    expect(screen.getAllByText('8,50%')).toHaveLength(2)

    // Previous values with "vs" prefix
    expect(screen.getAllByText('vs 100.000 DKK')).toHaveLength(2)
    expect(screen.getAllByText('vs 10.000 DKK')).toHaveLength(2)
    expect(screen.getAllByText('vs 7,20%')).toHaveLength(2)
  })

  it('renders ChangeIndicator for each metric', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    // Each metric has a ChangeIndicator in both desktop and mobile = 6 total
    const changeIndicators = container.querySelectorAll('.inline-flex.items-center.gap-0\\.5')
    expect(changeIndicators.length).toBe(6)
  })

  it('passes invertColor to ChangeIndicator', () => {
    const metrics = [
      {
        label: 'Cost',
        currentValue: '500 DKK',
        previousValue: '400 DKK',
        changePercent: 25,
        invertColor: true,
      },
    ]

    const { container } = render(
      <YoYComparisonRow periodLabel="Test" metrics={metrics} />,
    )

    // With invertColor, positive value should be rose (not emerald)
    const changeIndicators = container.querySelectorAll('.inline-flex.items-center.gap-0\\.5')
    changeIndicators.forEach((indicator) => {
      expect(indicator).toHaveClass('text-rose-600')
    })
  })

  it('renders desktop layout as hidden sm:grid', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const desktopGrid = container.querySelector('.hidden.sm\\:grid')
    expect(desktopGrid).toBeInTheDocument()
    expect(desktopGrid).toHaveClass('sm:grid-cols-3', 'gap-6')
  })

  it('renders mobile layout with sm:hidden', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const mobileLayout = container.querySelector('.sm\\:hidden')
    expect(mobileLayout).toBeInTheDocument()
    expect(mobileLayout).toHaveClass('space-y-0')
  })

  it('renders mobile dividers between metrics (not before first)', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const mobileLayout = container.querySelector('.sm\\:hidden')!
    const mobileItems = mobileLayout.children

    // First item has no border-t
    expect(mobileItems[0]).not.toHaveClass('border-t')
    // Second and third items have border-t
    expect(mobileItems[1]).toHaveClass('border-t', 'border-base-100', 'dark:border-base-700')
    expect(mobileItems[2]).toHaveClass('border-t', 'border-base-100', 'dark:border-base-700')
  })

  it('renders empty metrics array without errors', () => {
    const { container } = render(
      <YoYComparisonRow periodLabel="Empty" metrics={[]} />,
    )

    expect(screen.getByText('Empty')).toBeInTheDocument()
    // Desktop grid and mobile layout are present but empty
    expect(container.querySelector('.hidden.sm\\:grid')).toBeInTheDocument()
    expect(container.querySelector('.sm\\:hidden')).toBeInTheDocument()
  })

  it('metric labels have correct typography classes', () => {
    render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const labels = screen.getAllByText('Total Value')
    labels.forEach((label) => {
      expect(label).toHaveClass(
        'text-[10px]',
        'font-medium',
        'uppercase',
        'tracking-wider',
        'text-base-400',
      )
    })
  })

  it('current values have correct typography classes', () => {
    render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const currentValues = screen.getAllByText('120.000 DKK')
    currentValues.forEach((val) => {
      expect(val).toHaveClass('font-mono-data', 'text-lg', 'font-medium')
      expect(val).toHaveClass('text-base-900', 'dark:text-white')
    })
  })

  it('previous values have correct typography classes', () => {
    render(
      <YoYComparisonRow periodLabel="Test" metrics={sampleMetrics} />,
    )

    const prevValues = screen.getAllByText('vs 100.000 DKK')
    prevValues.forEach((val) => {
      expect(val).toHaveClass('font-mono-data', 'text-xs', 'text-base-300')
    })
  })
})
