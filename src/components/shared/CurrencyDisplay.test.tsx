import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { CurrencyDisplay } from './CurrencyDisplay'

describe('CurrencyDisplay', () => {
  it('renders DKK amount with no secondary line', () => {
    const { container } = render(
      <CurrencyDisplay amount={1234.56} currency="DKK" />,
    )

    expect(screen.getByText('1.234,56 DKK')).toBeInTheDocument()
    // No secondary line for DKK
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('renders non-DKK with DKK equivalent line', () => {
    render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        dkkEquivalent={700}
      />,
    )

    expect(screen.getByText('100,00 USD')).toBeInTheDocument()
    expect(screen.getByText(/≈.*700,00 DKK/)).toBeInTheDocument()
  })

  it('does not show DKK equivalent when dkkEquivalent is not provided for non-DKK', () => {
    const { container } = render(
      <CurrencyDisplay amount={100} currency="USD" />,
    )

    expect(screen.getByText('100,00 USD')).toBeInTheDocument()
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('applies positive trend class (emerald)', () => {
    const { container } = render(
      <CurrencyDisplay amount={500} currency="DKK" trend="positive" />,
    )
    const primary = container.querySelector('.font-mono-data')!

    expect(primary).toHaveClass('text-emerald-600', 'dark:text-emerald-400')
  })

  it('applies negative trend class (rose)', () => {
    const { container } = render(
      <CurrencyDisplay amount={-200} currency="DKK" trend="negative" />,
    )
    const primary = container.querySelector('.font-mono-data')!

    expect(primary).toHaveClass('text-rose-600', 'dark:text-rose-400')
  })

  it('applies neutral trend class (base)', () => {
    const { container } = render(
      <CurrencyDisplay amount={0} currency="DKK" trend="neutral" />,
    )
    const primary = container.querySelector('.font-mono-data')!

    expect(primary).toHaveClass('text-base-900', 'dark:text-white')
  })

  it('applies default color when no trend provided', () => {
    const { container } = render(
      <CurrencyDisplay amount={100} currency="DKK" />,
    )
    const primary = container.querySelector('.font-mono-data')!

    expect(primary).toHaveClass('text-base-900', 'dark:text-white')
  })

  it('formats with sign when showSign is true', () => {
    render(
      <CurrencyDisplay amount={500} currency="DKK" showSign />,
    )

    expect(screen.getByText('+500,00 DKK')).toBeInTheDocument()
  })

  it('formats DKK equivalent with sign when showSign is true', () => {
    render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        dkkEquivalent={700}
        showSign
      />,
    )

    expect(screen.getByText('+100,00 USD')).toBeInTheDocument()
    expect(screen.getByText(/≈.*\+700,00 DKK/)).toBeInTheDocument()
  })

  it('uses text-xs for secondary line in md size (default)', () => {
    const { container } = render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        dkkEquivalent={700}
      />,
    )
    const secondary = container.querySelector('p')!

    expect(secondary).toHaveClass('text-xs')
  })

  it('uses text-[11px] for secondary line in sm size', () => {
    const { container } = render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        dkkEquivalent={700}
        size="sm"
      />,
    )
    const secondary = container.querySelector('p')!

    expect(secondary).toHaveClass('text-[11px]')
  })

  it('secondary line has correct dark mode classes', () => {
    const { container } = render(
      <CurrencyDisplay
        amount={100}
        currency="USD"
        dkkEquivalent={700}
      />,
    )
    const secondary = container.querySelector('p')!

    expect(secondary).toHaveClass(
      'text-base-300',
      'dark:text-base-500',
      'mt-0.5',
      'font-mono-data',
    )
  })

  it('primary amount has font-mono-data class', () => {
    const { container } = render(
      <CurrencyDisplay amount={100} currency="DKK" />,
    )
    const primary = container.querySelector('.font-mono-data')!

    expect(primary.tagName).toBe('SPAN')
    expect(primary).toHaveClass('font-mono-data')
  })
})
