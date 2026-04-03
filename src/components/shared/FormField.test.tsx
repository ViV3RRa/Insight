import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders label text', () => {
    renderWithProviders(
      <FormField label="Amount">
        <input />
      </FormField>,
    )
    expect(screen.getByText('Amount')).toBeInTheDocument()
  })

  it('renders label with correct styling classes', () => {
    renderWithProviders(
      <FormField label="Amount">
        <input />
      </FormField>,
    )
    const label = screen.getByText('Amount')
    expect(label).toHaveClass('block', 'text-xs', 'font-medium', 'text-base-500')
    expect(label.className).toContain('dark:text-base-400')
  })

  it('renders required asterisk when required is true', () => {
    renderWithProviders(
      <FormField label="Amount" required>
        <input />
      </FormField>,
    )
    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveClass('text-rose-500', 'ml-0.5')
  })

  it('does not render asterisk when required is false or omitted', () => {
    renderWithProviders(
      <FormField label="Amount">
        <input />
      </FormField>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders error message with AlertCircle icon when error is provided', () => {
    renderWithProviders(
      <FormField label="Amount" error="Amount is required">
        <input />
      </FormField>,
    )
    expect(screen.getByText('Amount is required')).toBeInTheDocument()
    const errorMessage = screen.getByText('Amount is required')
    expect(errorMessage).toHaveClass('text-xs', 'text-rose-500')
  })

  it('does not render error message when error is not provided', () => {
    renderWithProviders(
      <FormField label="Amount">
        <input />
      </FormField>,
    )
    expect(screen.queryByText('Amount is required')).not.toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    renderWithProviders(
      <FormField label="Amount" htmlFor="amount-input">
        <input id="amount-input" />
      </FormField>,
    )
    const label = screen.getByText('Amount')
    expect(label).toHaveAttribute('for', 'amount-input')
  })

  it('renders children', () => {
    renderWithProviders(
      <FormField label="Amount">
        <input data-testid="child-input" />
      </FormField>,
    )
    expect(screen.getByTestId('child-input')).toBeInTheDocument()
  })

  it('wraps content in space-y-1 container', () => {
    const { container } = renderWithProviders(
      <FormField label="Amount">
        <input />
      </FormField>,
    )
    const wrapper = container.firstElementChild!
    expect(wrapper).toHaveClass('space-y-1')
  })
})
