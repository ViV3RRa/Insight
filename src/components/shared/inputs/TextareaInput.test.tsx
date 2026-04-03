import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { createRef } from 'react'
import { TextareaInput } from './TextareaInput'

describe('TextareaInput', () => {
  it('renders a textarea', () => {
    renderWithProviders(<TextareaInput />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('defaults to rows={3}', () => {
    renderWithProviders(<TextareaInput />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3')
  })

  it('respects custom rows prop', () => {
    renderWithProviders(<TextareaInput rows={5} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5')
  })

  it('applies resize-none class', () => {
    renderWithProviders(<TextareaInput />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-none')
  })

  it('applies base styling classes', () => {
    renderWithProviders(<TextareaInput />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('w-full', 'px-3', 'py-2.5', 'rounded-lg', 'text-sm')
  })

  it('applies normal border classes without error', () => {
    renderWithProviders(<TextareaInput />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('border-base-200')
  })

  it('applies error border classes when error is true', () => {
    renderWithProviders(<TextareaInput error />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('border-rose-400')
    expect(textarea.className).toContain('focus:ring-rose-500/30')
  })

  it('forwards placeholder', () => {
    renderWithProviders(<TextareaInput placeholder="Optional note..." />)
    expect(screen.getByPlaceholderText('Optional note...')).toBeInTheDocument()
  })

  it('forwards value and onChange', async () => {
    const handleChange = vi.fn()
    renderWithProviders(<TextareaInput value="test" onChange={handleChange} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('test')

    const user = userEvent.setup()
    await user.type(textarea, 'x')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    renderWithProviders(<TextareaInput disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards ref via forwardRef', () => {
    const ref = createRef<HTMLTextAreaElement>()
    renderWithProviders(<TextareaInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('merges custom className', () => {
    renderWithProviders(<TextareaInput className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('applies dark mode classes', () => {
    renderWithProviders(<TextareaInput />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('dark:bg-base-900')
    expect(textarea.className).toContain('dark:text-white')
  })

  it('forwards name attribute', () => {
    renderWithProviders(<TextareaInput name="notes" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'notes')
  })
})
