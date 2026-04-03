import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { ChangeIndicator } from './ChangeIndicator'

describe('ChangeIndicator', () => {
  it('renders positive value with up arrow and emerald color', () => {
    const { container } = render(<ChangeIndicator value={5.25} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper).toHaveClass('text-emerald-600')
    expect(wrapper).toHaveClass('dark:text-emerald-400')
    expect(wrapper.querySelector('svg')).toBeInTheDocument()
    // Up arrow path
    expect(wrapper.querySelector('path')).toHaveAttribute(
      'd',
      'M6 9V3M6 3L3 6M6 3L9 6',
    )
    expect(screen.getByText(/5,25%/)).toBeInTheDocument()
  })

  it('renders negative value with down arrow and rose color', () => {
    const { container } = render(<ChangeIndicator value={-3.5} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper).toHaveClass('text-rose-600')
    expect(wrapper).toHaveClass('dark:text-rose-400')
    // Down arrow path
    expect(wrapper.querySelector('path')).toHaveAttribute(
      'd',
      'M6 3V9M6 9L3 6M6 9L9 6',
    )
    expect(screen.getByText(/3,50%/)).toBeInTheDocument()
  })

  it('renders zero value with no arrow and base-400 color', () => {
    const { container } = render(<ChangeIndicator value={0} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper).toHaveClass('text-base-400')
    expect(wrapper.querySelector('svg')).not.toBeInTheDocument()
    expect(screen.getByText('0,00%')).toBeInTheDocument()
  })

  it('inverts colors when invertColor is true', () => {
    const { container: posContainer } = render(
      <ChangeIndicator value={5} invertColor />,
    )
    const posWrapper = posContainer.firstElementChild as HTMLElement
    // Positive + invertColor = rose
    expect(posWrapper).toHaveClass('text-rose-600')
    expect(posWrapper).toHaveClass('dark:text-rose-400')

    const { container: negContainer } = render(
      <ChangeIndicator value={-5} invertColor />,
    )
    const negWrapper = negContainer.firstElementChild as HTMLElement
    // Negative + invertColor = emerald
    expect(negWrapper).toHaveClass('text-emerald-600')
    expect(negWrapper).toHaveClass('dark:text-emerald-400')
  })

  it('uses formattedValue when provided', () => {
    render(<ChangeIndicator value={10} formattedValue="custom value" />)
    expect(screen.getByText('custom value')).toBeInTheDocument()
  })

  it('appends suffix to auto-formatted value', () => {
    render(<ChangeIndicator value={2.5} suffix="pp" />)
    expect(screen.getByText('+2,50%pp')).toBeInTheDocument()
  })

  it('adds + sign for positive values', () => {
    render(<ChangeIndicator value={1} />)
    expect(screen.getByText('+1,00%')).toBeInTheDocument()
  })

  it('adds - sign for negative values', () => {
    render(<ChangeIndicator value={-1} />)
    expect(screen.getByText('-1,00%')).toBeInTheDocument()
  })

  it('has correct container classes', () => {
    const { container } = render(<ChangeIndicator value={1} />)
    const wrapper = container.firstElementChild as HTMLElement

    expect(wrapper).toHaveClass('inline-flex', 'items-center', 'gap-0.5')
  })

  it('renders value text with correct typography classes', () => {
    render(<ChangeIndicator value={1} />)
    const valueEl = screen.getByText('+1,00%')

    expect(valueEl).toHaveClass('font-mono-data', 'text-xs', 'font-medium')
  })

  it('renders SVG with correct dimensions', () => {
    const { container } = render(<ChangeIndicator value={5} />)
    const svg = container.querySelector('svg')!

    expect(svg).toHaveClass('w-3', 'h-3')
    expect(svg).toHaveAttribute('viewBox', '0 0 12 12')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2.5')
    expect(svg).toHaveAttribute('stroke-linecap', 'round')
    expect(svg).toHaveAttribute('stroke-linejoin', 'round')
  })
})
