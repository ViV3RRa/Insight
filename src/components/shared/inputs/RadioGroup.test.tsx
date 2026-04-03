import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { RadioGroup } from './RadioGroup'

const options = [
  { label: 'Deposit', value: 'deposit' },
  { label: 'Withdrawal', value: 'withdrawal' },
]

describe('RadioGroup', () => {
  it('renders all options', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    expect(screen.getByText('Deposit')).toBeInTheDocument()
    expect(screen.getByText('Withdrawal')).toBeInTheDocument()
  })

  it('renders radio inputs with correct name', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toHaveAttribute('name', 'type')
    expect(radios[1]).toHaveAttribute('name', 'type')
  })

  it('renders with radiogroup role', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('checks the radio matching the value prop', () => {
    renderWithProviders(<RadioGroup name="type" options={options} value="deposit" />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toBeChecked()
    expect(radios[1]).not.toBeChecked()
  })

  it('calls onChange with the selected value', async () => {
    const handleChange = vi.fn()
    renderWithProviders(
      <RadioGroup name="type" options={options} onChange={handleChange} />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByText('Withdrawal'))
    expect(handleChange).toHaveBeenCalledWith('withdrawal')
  })

  it('uses sr-only class on native radio inputs', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveClass('peer', 'sr-only')
    expect(radios[1]).toHaveClass('peer', 'sr-only')
  })

  it('applies peer-checked styling classes on visible labels', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const depositLabel = screen.getByText('Deposit')
    expect(depositLabel.className).toContain('peer-checked:border-accent-500')
    expect(depositLabel.className).toContain('peer-checked:bg-accent-50')
    expect(depositLabel.className).toContain('peer-checked:text-accent-700')
  })

  it('applies dark mode peer-checked classes', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const label = screen.getByText('Deposit')
    expect(label.className).toContain('dark:peer-checked:border-accent-400')
    expect(label.className).toContain('dark:peer-checked:bg-accent-500/10')
    expect(label.className).toContain('dark:peer-checked:text-accent-400')
  })

  it('renders labels as flex-1 cursor-pointer', () => {
    const { container } = renderWithProviders(
      <RadioGroup name="type" options={options} />,
    )
    const labels = container.querySelectorAll('label')
    labels.forEach((label) => {
      expect(label).toHaveClass('flex-1', 'cursor-pointer')
    })
  })

  it('renders container with flex gap-3', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const group = screen.getByRole('radiogroup')
    expect(group).toHaveClass('flex', 'gap-3')
  })

  it('applies error border when error is true', () => {
    renderWithProviders(<RadioGroup name="type" options={options} error />)
    const label = screen.getByText('Deposit')
    expect(label.className).toContain('border-rose-400')
  })

  it('applies normal border when error is false', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const label = screen.getByText('Deposit')
    expect(label.className).toContain('border-base-200')
    expect(label.className).not.toContain('border-rose-400')
  })

  it('applies visible label styling classes', () => {
    renderWithProviders(<RadioGroup name="type" options={options} />)
    const label = screen.getByText('Deposit')
    expect(label).toHaveClass('text-center', 'py-2.5', 'rounded-lg', 'border', 'text-sm', 'font-medium')
  })
})
