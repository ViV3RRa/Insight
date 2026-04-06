import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { FuelTypeBadge } from './FuelTypeBadge'
import type { FuelType } from '@/types/vehicles'

describe('FuelTypeBadge', () => {
  const fuelTypes: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

  it.each(fuelTypes)('renders %s label text', (fuelType) => {
    renderWithProviders(<FuelTypeBadge fuelType={fuelType} />)
    expect(screen.getByText(fuelType)).toBeInTheDocument()
  })

  it('applies Petrol color classes', () => {
    renderWithProviders(<FuelTypeBadge fuelType="Petrol" />)
    const badge = screen.getByText('Petrol')
    expect(badge.className).toContain('bg-orange-100')
    expect(badge.className).toContain('text-orange-700')
    expect(badge.className).toContain('dark:bg-orange-900/50')
    expect(badge.className).toContain('dark:text-orange-300')
  })

  it('applies Diesel color classes', () => {
    renderWithProviders(<FuelTypeBadge fuelType="Diesel" />)
    const badge = screen.getByText('Diesel')
    expect(badge.className).toContain('bg-slate-100')
    expect(badge.className).toContain('text-slate-700')
    expect(badge.className).toContain('dark:bg-slate-800/50')
    expect(badge.className).toContain('dark:text-slate-300')
  })

  it('applies Electric color classes', () => {
    renderWithProviders(<FuelTypeBadge fuelType="Electric" />)
    const badge = screen.getByText('Electric')
    expect(badge.className).toContain('bg-blue-50')
    expect(badge.className).toContain('text-blue-600')
    expect(badge.className).toContain('dark:bg-blue-900/30')
    expect(badge.className).toContain('dark:text-blue-400')
  })

  it('applies Hybrid color classes', () => {
    renderWithProviders(<FuelTypeBadge fuelType="Hybrid" />)
    const badge = screen.getByText('Hybrid')
    expect(badge.className).toContain('bg-emerald-50')
    expect(badge.className).toContain('text-emerald-600')
    expect(badge.className).toContain('dark:bg-emerald-900/30')
    expect(badge.className).toContain('dark:text-emerald-400')
  })

  it('applies base badge styling', () => {
    renderWithProviders(<FuelTypeBadge fuelType="Petrol" />)
    const badge = screen.getByText('Petrol')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('font-medium')
    expect(badge.className).toContain('px-2')
    expect(badge.className).toContain('py-0.5')
    expect(badge.className).toContain('rounded-md')
    expect(badge.className).toContain('border')
  })

  it('accepts additional className prop', () => {
    renderWithProviders(
      <FuelTypeBadge fuelType="Petrol" className="absolute top-3 right-3" />,
    )
    const badge = screen.getByText('Petrol')
    expect(badge.className).toContain('absolute')
    expect(badge.className).toContain('top-3')
    expect(badge.className).toContain('right-3')
  })
})
