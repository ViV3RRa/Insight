import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { createRef } from 'react'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('renders a text input', () => {
    renderWithProviders(<TextInput />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('has type="text" by default', () => {
    renderWithProviders(<TextInput />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })

  it('applies base styling classes', () => {
    renderWithProviders(<TextInput />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('w-full', 'px-3', 'py-2.5', 'rounded-lg', 'text-sm')
    expect(input.className).toContain('bg-white')
    expect(input.className).toContain('dark:bg-base-900')
  })

  it('applies normal border classes without error', () => {
    renderWithProviders(<TextInput />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-base-200')
    expect(input.className).toContain('dark:border-base-600')
    expect(input.className).toContain('focus:ring-accent-500/30')
  })

  it('applies error border classes when error is true', () => {
    renderWithProviders(<TextInput error />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-rose-400')
    expect(input.className).toContain('dark:border-rose-500')
    expect(input.className).toContain('focus:ring-rose-500/30')
  })

  it('does not apply error classes when error is false', () => {
    renderWithProviders(<TextInput error={false} />)
    const input = screen.getByRole('textbox')
    expect(input.className).not.toContain('border-rose-400')
  })

  it('forwards placeholder', () => {
    renderWithProviders(<TextInput placeholder="Enter value..." />)
    expect(screen.getByPlaceholderText('Enter value...')).toBeInTheDocument()
  })

  it('forwards name attribute', () => {
    renderWithProviders(<TextInput name="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
  })

  it('forwards value and onChange', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<TextInput value="hello" onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('hello')

    const user = userEvent.setup()
    await user.type(input, 'x')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    renderWithProviders(<TextInput disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards ref via forwardRef', () => {
    const ref = createRef<HTMLInputElement>()
    renderWithProviders(<TextInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('merges custom className', () => {
    renderWithProviders(<TextInput className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('applies dark mode text classes', () => {
    renderWithProviders(<TextInput />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('dark:text-white')
    expect(input.className).toContain('dark:placeholder:text-base-500')
  })

  it('includes focus ring classes', () => {
    renderWithProviders(<TextInput />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('focus:ring-2')
    expect(input.className).toContain('focus:border-accent-500')
  })
})
