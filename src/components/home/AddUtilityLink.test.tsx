import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { AddUtilityLink } from './AddUtilityLink'

describe('AddUtilityLink', () => {
  it('renders add utility text', () => {
    renderWithProviders(<AddUtilityLink onAdd={vi.fn()} />)
    expect(screen.getByText('Add Utility')).toBeInTheDocument()
  })

  it('calls onAdd when clicked', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<AddUtilityLink onAdd={onAdd} />)
    await user.click(screen.getByRole('button'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders with centered flex layout', () => {
    const { container } = renderWithProviders(<AddUtilityLink onAdd={vi.fn()} />)
    const button = container.querySelector('button')!
    expect(button.className).toContain('flex')
    expect(button.className).toContain('items-center')
    expect(button.className).toContain('justify-center')
  })

  it('renders with muted text color', () => {
    const { container } = renderWithProviders(<AddUtilityLink onAdd={vi.fn()} />)
    const button = container.querySelector('button')!
    expect(button.className).toContain('text-base-400')
  })

  it('renders Plus icon', () => {
    const { container } = renderWithProviders(<AddUtilityLink onAdd={vi.fn()} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
