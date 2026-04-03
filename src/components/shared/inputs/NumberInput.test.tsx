import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { createRef } from 'react'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('renders a number input', () => {
    renderWithProviders(<NumberInput />)
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('has type="number"', () => {
    renderWithProviders(<NumberInput />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('applies font-mono-data class for tabular numbers', () => {
    renderWithProviders(<NumberInput />)
    expect(screen.getByRole('spinbutton')).toHaveClass('font-mono-data')
  })

  it('applies base styling classes', () => {
    renderWithProviders(<NumberInput />)
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveClass('w-full', 'px-3', 'py-2.5', 'rounded-lg', 'text-sm')
  })

  it('applies normal border classes without error', () => {
    renderWithProviders(<NumberInput />)
    const input = screen.getByRole('spinbutton')
    expect(input.className).toContain('border-base-200')
    expect(input.className).toContain('focus:ring-accent-500/30')
  })

  it('applies error border classes when error is true', () => {
    renderWithProviders(<NumberInput error />)
    const input = screen.getByRole('spinbutton')
    expect(input.className).toContain('border-rose-400')
    expect(input.className).toContain('focus:ring-rose-500/30')
  })

  it('forwards placeholder', () => {
    renderWithProviders(<NumberInput placeholder="0,00" />)
    expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument()
  })

  it('forwards value and onChange', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<NumberInput onChange={handleChange} />)
    const input = screen.getByRole('spinbutton')

    const user = userEvent.setup()
    await user.type(input, '42')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    renderWithProviders(<NumberInput disabled />)
    expect(screen.getByRole('spinbutton')).toBeDisabled()
  })

  it('forwards ref via forwardRef', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<NumberInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('merges custom className', () => {
    renderWithProviders(<NumberInput className="custom-class" />)
    expect(screen.getByRole('spinbutton')).toHaveClass('custom-class')
  })

  it('applies dark mode classes', () => {
    renderWithProviders(<NumberInput />)
    const input = screen.getByRole('spinbutton')
    expect(input.className).toContain('dark:bg-base-900')
    expect(input.className).toContain('dark:text-white')
  })

  it('forwards name attribute', () => {
    renderWithProviders(<NumberInput name="amount" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('name', 'amount')
  })
})
