import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { StalenessIndicator } from './StalenessIndicator'

describe('StalenessIndicator', () => {
  it('renders "Stale" label', () => {
    render(<StalenessIndicator severity="warning" />)
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  // --- Warning severity ---

  it('renders warning severity with amber colors', () => {
    const { container } = render(<StalenessIndicator severity="warning" />)
    const badge = container.firstElementChild as HTMLElement

    expect(badge).toHaveClass('bg-amber-50', 'text-amber-700', 'border-amber-200')
    expect(badge).toHaveClass(
      'dark:bg-amber-900/30',
      'dark:text-amber-400',
      'dark:border-amber-700',
    )
  })

  it('renders warning dot with amber-500', () => {
    const { container } = render(<StalenessIndicator severity="warning" />)
    const dot = container.querySelector('.rounded-full.animate-pulse')!

    expect(dot).toHaveClass('bg-amber-500')
  })

  // --- Critical severity ---

  it('renders critical severity with rose colors', () => {
    const { container } = render(<StalenessIndicator severity="critical" />)
    const badge = container.firstElementChild as HTMLElement

    expect(badge).toHaveClass('bg-rose-50', 'text-rose-700', 'border-rose-200')
    expect(badge).toHaveClass(
      'dark:bg-rose-900/30',
      'dark:text-rose-400',
      'dark:border-rose-700',
    )
  })

  it('renders critical dot with rose-500', () => {
    const { container } = render(<StalenessIndicator severity="critical" />)
    const dot = container.querySelector('.rounded-full.animate-pulse')!

    expect(dot).toHaveClass('bg-rose-500')
  })

  // --- Size: sm ---

  it('renders sm size with correct classes', () => {
    const { container } = render(
      <StalenessIndicator severity="warning" size="sm" />,
    )
    const badge = container.firstElementChild as HTMLElement
    const dot = container.querySelector('.rounded-full.animate-pulse')!

    expect(badge).toHaveClass('text-[10px]', 'font-medium', 'px-1.5', 'py-0.5', 'gap-1')
    expect(dot).toHaveClass('w-1', 'h-1')
  })

  // --- Size: md (default) ---

  it('renders md size by default', () => {
    const { container } = render(<StalenessIndicator severity="warning" />)
    const badge = container.firstElementChild as HTMLElement
    const dot = container.querySelector('.rounded-full.animate-pulse')!

    expect(badge).toHaveClass('text-xs', 'font-medium', 'px-2', 'py-0.5', 'gap-1.5')
    expect(dot).toHaveClass('w-1.5', 'h-1.5')
  })

  // --- Size: lg ---

  it('renders lg size with correct classes', () => {
    const { container } = render(
      <StalenessIndicator severity="critical" size="lg" />,
    )
    const badge = container.firstElementChild as HTMLElement
    const dot = container.querySelector('.rounded-full.animate-pulse')!

    expect(badge).toHaveClass('text-sm', 'font-semibold', 'px-3.5', 'py-1', 'gap-2')
    expect(dot).toHaveClass('w-2', 'h-2')
  })

  // --- Common container classes ---

  it('has rounded-full border container', () => {
    const { container } = render(<StalenessIndicator severity="warning" />)
    const badge = container.firstElementChild as HTMLElement

    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
    )
  })

  // --- Dot has animate-pulse ---

  it('dot has animate-pulse class', () => {
    const { container } = render(<StalenessIndicator severity="critical" />)
    const dot = container.querySelector('.rounded-full.animate-pulse')

    expect(dot).toBeInTheDocument()
  })

  // --- All 6 combinations ---

  it.each([
    ['warning', 'sm'],
    ['warning', 'md'],
    ['warning', 'lg'],
    ['critical', 'sm'],
    ['critical', 'md'],
    ['critical', 'lg'],
  ] as const)('renders %s/%s combination without errors', (severity, size) => {
    const { container } = render(
      <StalenessIndicator severity={severity} size={size} />,
    )
    expect(container.firstElementChild).toBeInTheDocument()
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })
})
