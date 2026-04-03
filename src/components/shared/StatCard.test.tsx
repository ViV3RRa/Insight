import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  // --- Card shell ---

  it('renders card shell with correct classes', () => {
    const { container } = renderWithProviders(
      <StatCard label="Test" value="100" />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('bg-white')
    expect(card.className).toContain('dark:bg-base-800')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).toContain('p-5')
    expect(card.className).toContain('shadow-card')
  })

  // --- Label ---

  it('renders label with text-xs text-base-400', () => {
    renderWithProviders(<StatCard label="Current Value" value="5.057,80 DKK" />)
    const label = screen.getByText('Current Value')
    expect(label.className).toContain('text-xs')
    expect(label.className).toContain('text-base-400')
    expect(label.className).toContain('mb-1')
  })

  // --- Variant A: Simple ---

  it('renders simple variant with base-900 text and font-mono-data', () => {
    renderWithProviders(<StatCard label="Value" value="5.057,80 DKK" />)
    const value = screen.getByText('5.057,80 DKK')
    expect(value.className).toContain('font-mono-data')
    expect(value.className).toContain('text-xl')
    expect(value.className).toContain('font-medium')
    expect(value.className).toContain('text-base-900')
    expect(value.className).toContain('dark:text-white')
  })

  // --- Variant B: Colored ---

  it('renders colored variant with emerald for positive trend', () => {
    renderWithProviders(
      <StatCard label="Gain" value="+182.914 DKK" variant="colored" trend="positive" />,
    )
    const value = screen.getByText('+182.914 DKK')
    expect(value.className).toContain('font-mono-data')
    expect(value.className).toContain('text-emerald-600')
    expect(value.className).toContain('dark:text-emerald-400')
  })

  it('renders colored variant with rose for negative trend', () => {
    renderWithProviders(
      <StatCard label="Loss" value="-1.842 DKK" variant="colored" trend="negative" />,
    )
    const value = screen.getByText('-1.842 DKK')
    expect(value.className).toContain('text-rose-600')
    expect(value.className).toContain('dark:text-rose-400')
  })

  it('renders colored variant with base-900 for neutral trend', () => {
    renderWithProviders(
      <StatCard label="Balance" value="0 DKK" variant="colored" trend="neutral" />,
    )
    const value = screen.getByText('0 DKK')
    expect(value.className).toContain('text-base-900')
    expect(value.className).toContain('dark:text-white')
  })

  // --- Variant C: withBadge ---

  it('renders withBadge variant with value and percentage badge', () => {
    renderWithProviders(
      <StatCard
        label="All-Time Gain"
        value="+182.914 DKK"
        variant="withBadge"
        trend="positive"
        badgeValue="+12,5%"
      />,
    )
    const value = screen.getByText('+182.914 DKK')
    expect(value.className).toContain('text-emerald-600')

    const badge = screen.getByText('+12,5%')
    expect(badge.className).toContain('font-mono-data')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('bg-emerald-50')
    expect(badge.className).toContain('text-emerald-700')
    expect(badge.className).toContain('dark:bg-emerald-900/30')
    expect(badge.className).toContain('dark:text-emerald-400')
  })

  it('renders withBadge variant with rose colors for negative trend', () => {
    renderWithProviders(
      <StatCard
        label="Loss"
        value="-500 DKK"
        variant="withBadge"
        trend="negative"
        badgeValue="-3,2%"
      />,
    )
    const badge = screen.getByText('-3,2%')
    expect(badge.className).toContain('bg-rose-50')
    expect(badge.className).toContain('text-rose-700')
    expect(badge.className).toContain('dark:bg-rose-900/30')
  })

  it('renders withBadge variant without badge when badgeValue is omitted', () => {
    const { container } = renderWithProviders(
      <StatCard label="Gain" value="+100 DKK" variant="withBadge" trend="positive" />,
    )
    const badges = container.querySelectorAll('.rounded-full')
    expect(badges).toHaveLength(0)
  })

  // --- Variant D: withUnit ---

  it('renders withUnit variant with value and muted unit suffix', () => {
    renderWithProviders(
      <StatCard label="XIRR" value="8,42" variant="withUnit" unitSuffix="%" />,
    )
    const value = screen.getByText('8,42')
    expect(value.className).toContain('font-mono-data')
    expect(value.className).toContain('text-xl')
    expect(value.className).toContain('text-base-900')

    const unit = screen.getByText('%')
    expect(unit.className).toContain('text-sm')
    expect(unit.className).toContain('text-base-400')
  })

  it('renders withUnit variant without suffix when unitSuffix is omitted', () => {
    renderWithProviders(
      <StatCard label="Score" value="42" variant="withUnit" />,
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  // --- Sublabel ---

  it('renders sublabel when provided', () => {
    renderWithProviders(
      <StatCard label="Value" value="1.000 EUR" sublabel="≈ 7.460 DKK" />,
    )
    const sublabel = screen.getByText('≈ 7.460 DKK')
    expect(sublabel.className).toContain('text-xs')
    expect(sublabel.className).toContain('text-base-300')
    expect(sublabel.className).toContain('dark:text-base-500')
    expect(sublabel.className).toContain('mt-0.5')
  })

  it('does not render sublabel when omitted', () => {
    renderWithProviders(<StatCard label="Value" value="100" />)
    const elements = document.querySelectorAll('.mt-0\\.5')
    expect(elements).toHaveLength(0)
  })

  // --- font-mono-data on all values ---

  it('uses font-mono-data on all variant values', () => {
    const variants = [
      { variant: 'simple' as const },
      { variant: 'colored' as const, trend: 'positive' as const },
      { variant: 'withBadge' as const, trend: 'positive' as const, badgeValue: '+5%' },
      { variant: 'withUnit' as const, unitSuffix: '%' },
    ]

    variants.forEach(({ variant, ...rest }) => {
      const { container, unmount } = renderWithProviders(
        <StatCard label="Test" value="100" variant={variant} {...rest} />,
      )
      const monoData = container.querySelectorAll('.font-mono-data')
      expect(monoData.length).toBeGreaterThan(0)
      unmount()
    })
  })

  // --- Dark mode ---

  it('includes dark mode classes on card shell', () => {
    const { container } = renderWithProviders(
      <StatCard label="Test" value="100" />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('dark:bg-base-800')
    expect(card.className).toContain('dark:shadow-card-dark')
  })
})
