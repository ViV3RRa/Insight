import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { EmptyState } from './EmptyState'
import { TrendingUp, Receipt } from 'lucide-react'

describe('EmptyState', () => {
  describe('page variant', () => {
    it('renders icon in accent circle', () => {
      renderWithProviders(
        <EmptyState
          variant="page"
          icon={TrendingUp}
          heading="No platforms yet"
          description="Add your first platform."
        />,
      )
      const iconCircle = screen.getByText('No platforms yet').parentElement?.querySelector('div')
      expect(iconCircle?.className).toContain('w-16')
      expect(iconCircle?.className).toContain('h-16')
      expect(iconCircle?.className).toContain('rounded-full')
      expect(iconCircle?.className).toContain('bg-accent-50')
      expect(iconCircle?.className).toContain('dark:bg-accent-900/30')
    })

    it('renders heading text', () => {
      renderWithProviders(
        <EmptyState variant="page" icon={TrendingUp} heading="No platforms yet" />,
      )
      expect(screen.getByText('No platforms yet')).toBeInTheDocument()
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).toContain('text-lg')
      expect(heading.className).toContain('font-semibold')
      expect(heading.className).toContain('text-base-900')
      expect(heading.className).toContain('dark:text-white')
    })

    it('renders description text', () => {
      renderWithProviders(
        <EmptyState
          variant="page"
          icon={TrendingUp}
          heading="No platforms"
          description="Add your first platform to get started."
        />,
      )
      const desc = screen.getByText('Add your first platform to get started.')
      expect(desc.className).toContain('text-sm')
      expect(desc.className).toContain('text-base-400')
      expect(desc.className).toContain('max-w-xs')
    })

    it('renders CTA button when actionLabel and onAction provided', async () => {
      const onAction = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <EmptyState
          variant="page"
          icon={TrendingUp}
          heading="No platforms"
          actionLabel="Add Platform"
          onAction={onAction}
        />,
      )
      const button = screen.getByRole('button', { name: 'Add Platform' })
      expect(button).toBeInTheDocument()
      await user.click(button)
      expect(onAction).toHaveBeenCalledOnce()
    })

    it('does not render CTA when onAction is not provided', () => {
      renderWithProviders(
        <EmptyState
          variant="page"
          icon={TrendingUp}
          heading="No platforms"
          actionLabel="Add Platform"
        />,
      )
      expect(screen.queryByRole('button', { name: 'Add Platform' })).not.toBeInTheDocument()
    })

    it('does not render CTA when actionLabel is not provided', () => {
      const onAction = vi.fn()
      renderWithProviders(
        <EmptyState variant="page" icon={TrendingUp} heading="No platforms" onAction={onAction} />,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('applies centered layout classes', () => {
      const { container } = renderWithProviders(
        <EmptyState variant="page" icon={TrendingUp} heading="Test" />,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('flex-col')
      expect(wrapper.className).toContain('items-center')
      expect(wrapper.className).toContain('justify-center')
      expect(wrapper.className).toContain('py-16')
      expect(wrapper.className).toContain('text-center')
    })

    it('renders icon with accent styling', () => {
      const { container } = renderWithProviders(
        <EmptyState variant="page" icon={TrendingUp} heading="Test" />,
      )
      const svg = container.querySelector('svg')
      expect(svg?.classList.toString()).toContain('w-8')
      expect(svg?.classList.toString()).toContain('h-8')
      expect(svg?.classList.toString()).toContain('text-accent-600')
      expect(svg?.classList.toString()).toContain('dark:text-accent-400')
    })
  })

  describe('section variant', () => {
    it('renders gray icon without circle', () => {
      const { container } = renderWithProviders(
        <EmptyState variant="section" icon={Receipt} description="No transactions recorded yet" />,
      )
      const svg = container.querySelector('svg')
      expect(svg?.classList.toString()).toContain('w-6')
      expect(svg?.classList.toString()).toContain('h-6')
      expect(svg?.classList.toString()).toContain('text-base-300')
      expect(svg?.classList.toString()).toContain('dark:text-base-500')
      // No circle wrapper
      expect(container.querySelector('.rounded-full')).toBeNull()
    })

    it('renders message text', () => {
      renderWithProviders(
        <EmptyState variant="section" icon={Receipt} description="No transactions recorded yet" />,
      )
      const msg = screen.getByText('No transactions recorded yet')
      expect(msg.className).toContain('text-sm')
      expect(msg.className).toContain('text-base-300')
      expect(msg.className).toContain('dark:text-base-500')
    })

    it('does not render CTA button', () => {
      renderWithProviders(
        <EmptyState variant="section" icon={Receipt} description="No data" />,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('applies section layout classes', () => {
      const { container } = renderWithProviders(
        <EmptyState variant="section" icon={Receipt} description="Empty" />,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('py-8')
      expect(wrapper.className).toContain('px-4')
      expect(wrapper.className).toContain('text-center')
    })

    it('renders icon as aria-hidden', () => {
      const { container } = renderWithProviders(
        <EmptyState variant="section" icon={Receipt} description="Empty" />,
      )
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    })
  })
})
