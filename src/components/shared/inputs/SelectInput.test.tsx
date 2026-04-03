import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { createRef } from 'react'
import { SelectInput } from './SelectInput'

describe('SelectInput', () => {
  it('renders a select element', () => {
    renderWithProviders(
      <SelectInput>
        <option value="">Select...</option>
      </SelectInput>,
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('applies form-select and appearance-none classes', () => {
    renderWithProviders(
      <SelectInput>
        <option value="">Select...</option>
      </SelectInput>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('form-select', 'appearance-none')
  })

  it('applies base styling classes', () => {
    renderWithProviders(
      <SelectInput>
        <option value="">Select...</option>
      </SelectInput>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('w-full', 'px-3', 'py-2.5', 'rounded-lg', 'text-sm')
  })

  it('renders children options', () => {
    renderWithProviders(
      <SelectInput>
        <option value="">Select platform...</option>
        <option value="nordnet">Nordnet</option>
        <option value="ib">Interactive Brokers</option>
      </SelectInput>,
    )
    expect(screen.getByText('Select platform...')).toBeInTheDocument()
    expect(screen.getByText('Nordnet')).toBeInTheDocument()
    expect(screen.getByText('Interactive Brokers')).toBeInTheDocument()
  })

  it('applies normal border classes without error', () => {
    renderWithProviders(
      <SelectInput>
        <option>opt</option>
      </SelectInput>,
    )
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('border-base-200')
  })

  it('applies error border classes when error is true', () => {
    renderWithProviders(
      <SelectInput error>
        <option>opt</option>
      </SelectInput>,
    )
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('border-rose-400')
    expect(select.className).toContain('focus:ring-rose-500/30')
  })

  it('handles selection changes', async () => {
    const handleChange = vi.fn()
    renderWithProviders(
      <SelectInput onChange={handleChange}>
        <option value="">Select...</option>
        <option value="nordnet">Nordnet</option>
      </SelectInput>,
    )
    const user = userEvent.setup()
    await user.selectOptions(screen.getByRole('combobox'), 'nordnet')
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports disabled state', () => {
    renderWithProviders(
      <SelectInput disabled>
        <option>opt</option>
      </SelectInput>,
    )
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('forwards ref via forwardRef', () => {
    const ref = createRef<HTMLSelectElement>()
    renderWithProviders(
      <SelectInput ref={ref}>
        <option>opt</option>
      </SelectInput>,
    )
    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('forwards name attribute', () => {
    renderWithProviders(
      <SelectInput name="platform">
        <option>opt</option>
      </SelectInput>,
    )
    expect(screen.getByRole('combobox')).toHaveAttribute('name', 'platform')
  })

  it('merges custom className', () => {
    renderWithProviders(
      <SelectInput className="custom-class">
        <option>opt</option>
      </SelectInput>,
    )
    expect(screen.getByRole('combobox')).toHaveClass('custom-class')
  })

  it('applies dark mode classes', () => {
    renderWithProviders(
      <SelectInput>
        <option>opt</option>
      </SelectInput>,
    )
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('dark:bg-base-900')
    expect(select.className).toContain('dark:border-base-600')
  })
})
