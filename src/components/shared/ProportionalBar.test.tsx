import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { ProportionalBar } from './ProportionalBar'

const sampleSegments = [
  { label: 'Nordnet', value: 50000, formattedValue: '50.000', color: '#22c55e' },
  { label: 'Mintos', value: 30000, formattedValue: '30.000', color: '#3b82f6' },
  { label: 'Revolut', value: 20000, formattedValue: '20.000', color: '#94a3b8', isCash: true },
]

describe('ProportionalBar', () => {
  describe('bar rendering', () => {
    it('renders segments with correct proportional widths', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      const segmentEls = bar.children
      expect(segmentEls).toHaveLength(3)

      // 50000/100000 = 50%, 30000/100000 = 30%, 20000/100000 = 20%
      expect((segmentEls[0] as HTMLElement).style.width).toBe('50%')
      expect((segmentEls[1] as HTMLElement).style.width).toBe('30%')
      expect((segmentEls[2] as HTMLElement).style.width).toBe('20%')
    })

    it('renders single segment at 100%', () => {
      const { container } = renderWithProviders(
        <ProportionalBar
          segments={[{ label: 'Only', value: 100, color: '#22c55e' }]}
        />,
      )

      const bar = container.querySelector('.h-8')!
      expect((bar.children[0] as HTMLElement).style.width).toBe('100%')
    })

    it('renders nothing for empty segments', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={[]} />,
      )

      expect(container.firstChild).toBeNull()
    })

    it('applies bar styling classes', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      expect(bar.className).toContain('rounded-lg')
      expect(bar.className).toContain('overflow-hidden')
      expect(bar.className).toContain('flex')
    })

    it('applies segment transition class', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      const segment = bar.children[0] as HTMLElement
      expect(segment.className).toContain('transition-all')
      expect(segment.className).toContain('duration-300')
    })

    it('applies background color to each segment', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      expect((bar.children[0] as HTMLElement).style.backgroundColor).toBe(
        'rgb(34, 197, 94)',
      )
      expect((bar.children[1] as HTMLElement).style.backgroundColor).toBe(
        'rgb(59, 130, 246)',
      )
    })

    it('applies diagonal stripes to cash segments', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      const cashSegment = bar.children[2] as HTMLElement
      expect(cashSegment.style.backgroundImage).toContain(
        'repeating-linear-gradient',
      )
    })

    it('does not apply stripes to non-cash segments', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const bar = container.querySelector('.h-8')!
      const normalSegment = bar.children[0] as HTMLElement
      expect(normalSegment.style.backgroundImage).toBe('')
    })
  })

  describe('minimum width enforcement', () => {
    it('enforces minimum 2% visual width for tiny segments', () => {
      const segments = [
        { label: 'Big', value: 990, color: '#22c55e' },
        { label: 'Tiny', value: 10, color: '#3b82f6' }, // 1% — below minimum
      ]

      const { container } = renderWithProviders(
        <ProportionalBar segments={segments} />,
      )

      const bar = container.querySelector('.h-8')!
      const tinyWidth = parseFloat(
        (bar.children[1] as HTMLElement).style.width,
      )
      expect(tinyWidth).toBeGreaterThanOrEqual(2)
    })
  })

  describe('legend', () => {
    it('renders legend by default', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      expect(screen.getByText('Nordnet')).toBeInTheDocument()
      expect(screen.getByText('Mintos')).toBeInTheDocument()
      expect(screen.getByText('Revolut')).toBeInTheDocument()
    })

    it('hides legend when showLegend is false', () => {
      renderWithProviders(
        <ProportionalBar segments={sampleSegments} showLegend={false} />,
      )

      expect(screen.queryByText('Nordnet')).not.toBeInTheDocument()
    })

    it('renders formatted values in legend', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      expect(screen.getByText('50.000')).toBeInTheDocument()
      expect(screen.getByText('30.000')).toBeInTheDocument()
    })

    it('renders percentages in legend', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      expect(screen.getByText('50,0%')).toBeInTheDocument()
      expect(screen.getByText('30,0%')).toBeInTheDocument()
      expect(screen.getByText('20,0%')).toBeInTheDocument()
    })

    it('shows Cash badge for cash segments', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      expect(screen.getByText('Cash')).toBeInTheDocument()
    })

    it('applies muted text to cash segment labels', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      const cashLabel = screen.getByText('Revolut')
      expect(cashLabel.className).toContain('text-base-500')
      expect(cashLabel.className).toContain('dark:text-base-400')
    })

    it('does not show Cash badge for non-cash segments', () => {
      const nonCashSegments = [
        { label: 'Nordnet', value: 100, color: '#22c55e' },
      ]
      renderWithProviders(<ProportionalBar segments={nonCashSegments} />)

      expect(screen.queryByText('Cash')).not.toBeInTheDocument()
    })

    it('renders color squares in legend', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const colorSquares = container.querySelectorAll('.w-2\\.5.h-2\\.5')
      expect(colorSquares).toHaveLength(3)
    })

    it('applies font-mono-data to values and percentages', () => {
      renderWithProviders(<ProportionalBar segments={sampleSegments} />)

      const value = screen.getByText('50.000')
      expect(value.className).toContain('font-mono-data')

      const pct = screen.getByText('50,0%')
      expect(pct.className).toContain('font-mono-data')
    })

    it('applies legend spacing classes', () => {
      const { container } = renderWithProviders(
        <ProportionalBar segments={sampleSegments} />,
      )

      const legend = container.querySelector('.space-y-2\\.5')
      expect(legend).not.toBeNull()
      expect(legend!.className).toContain('mt-5')
    })
  })

  describe('many segments', () => {
    it('handles 10+ segments', () => {
      const manySegments = Array.from({ length: 12 }, (_, i) => ({
        label: `Platform ${i + 1}`,
        value: 100 + i * 10,
        color: `#${((i * 30 + 50) % 256).toString(16).padStart(2, '0')}82f6`,
      }))

      const { container } = renderWithProviders(
        <ProportionalBar segments={manySegments} />,
      )

      const bar = container.querySelector('.h-8')!
      expect(bar.children).toHaveLength(12)
      expect(screen.getByText('Platform 1')).toBeInTheDocument()
      expect(screen.getByText('Platform 12')).toBeInTheDocument()
    })
  })
})
