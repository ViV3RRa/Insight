import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  describe('card variant', () => {
    it('renders AlertTriangle icon in rose circle', () => {
      const { container } = renderWithProviders(
        <ErrorState variant="card" title="Failed to load" message="Something went wrong." />,
      )
      const circle = container.querySelector('.rounded-full') as HTMLElement
      expect(circle).toBeTruthy()
      expect(circle.className).toContain('w-12')
      expect(circle.className).toContain('h-12')
      expect(circle.className).toContain('bg-rose-50')
      expect(circle.className).toContain('dark:bg-rose-900/30')

      const svg = circle.querySelector('svg')
      expect(svg?.classList.toString()).toContain('w-6')
      expect(svg?.classList.toString()).toContain('h-6')
      expect(svg?.classList.toString()).toContain('text-rose-500')
    })

    it('renders title with correct styling', () => {
      renderWithProviders(
        <ErrorState variant="card" title="Failed to load data" message="Try again." />,
      )
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Failed to load data')
      expect(heading.className).toContain('text-sm')
      expect(heading.className).toContain('font-semibold')
      expect(heading.className).toContain('text-base-900')
      expect(heading.className).toContain('dark:text-white')
    })

    it('renders message text', () => {
      renderWithProviders(
        <ErrorState variant="card" title="Error" message="Something went wrong while fetching." />,
      )
      const msg = screen.getByText('Something went wrong while fetching.')
      expect(msg.className).toContain('text-sm')
      expect(msg.className).toContain('text-base-400')
      expect(msg.className).toContain('max-w-xs')
    })

    it('renders retry button when onRetry provided', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <ErrorState variant="card" title="Error" message="Failed." onRetry={onRetry} />,
      )
      const button = screen.getByRole('button', { name: /retry/i })
      expect(button).toBeInTheDocument()
      await user.click(button)
      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('does not render retry button when onRetry not provided', () => {
      renderWithProviders(
        <ErrorState variant="card" title="Error" message="Failed." />,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('applies card layout classes', () => {
      const { container } = renderWithProviders(
        <ErrorState variant="card" title="Error" message="Failed." />,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('py-8')
      expect(wrapper.className).toContain('px-4')
      expect(wrapper.className).toContain('text-center')
    })
  })

  describe('page variant', () => {
    it('renders WifiOff icon in base circle', () => {
      const { container } = renderWithProviders(
        <ErrorState variant="page" title="Can't reach the server" message="Not responding." />,
      )
      const circle = container.querySelector('.rounded-full') as HTMLElement
      expect(circle).toBeTruthy()
      expect(circle.className).toContain('w-16')
      expect(circle.className).toContain('h-16')
      expect(circle.className).toContain('bg-base-100')
      expect(circle.className).toContain('dark:bg-base-700')

      const svg = circle.querySelector('svg')
      expect(svg?.classList.toString()).toContain('w-8')
      expect(svg?.classList.toString()).toContain('h-8')
      expect(svg?.classList.toString()).toContain('text-base-400')
    })

    it('renders title with page styling', () => {
      renderWithProviders(
        <ErrorState variant="page" title="Can't reach the server" message="Not responding." />,
      )
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent("Can't reach the server")
      expect(heading.className).toContain('text-lg')
      expect(heading.className).toContain('font-semibold')
    })

    it('renders server URL in monospace', () => {
      renderWithProviders(
        <ErrorState
          variant="page"
          title="Can't reach the server"
          message="Not responding."
          serverUrl="https://pocketbase.example.com"
        />,
      )
      const url = screen.getByText('https://pocketbase.example.com')
      expect(url.className).toContain('font-mono-data')
      expect(url.className).toContain('text-xs')
      expect(url.className).toContain('text-base-300')
      expect(url.className).toContain('dark:text-base-500')
    })

    it('does not render server URL when not provided', () => {
      renderWithProviders(
        <ErrorState variant="page" title="Error" message="Server down." />,
      )
      expect(screen.queryByText(/pocketbase/)).not.toBeInTheDocument()
    })

    it('renders primary retry button when onRetry provided', async () => {
      const onRetry = vi.fn()
      const user = userEvent.setup()
      renderWithProviders(
        <ErrorState
          variant="page"
          title="Server error"
          message="Not responding."
          onRetry={onRetry}
        />,
      )
      const button = screen.getByRole('button', { name: /try again/i })
      expect(button).toBeInTheDocument()
      await user.click(button)
      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('does not render retry button when onRetry not provided', () => {
      renderWithProviders(
        <ErrorState variant="page" title="Error" message="Failed." />,
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('centers vertically with min-h-[60vh]', () => {
      const { container } = renderWithProviders(
        <ErrorState variant="page" title="Error" message="Failed." />,
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('min-h-[60vh]')
      expect(wrapper.className).toContain('justify-center')
    })

    it('renders message with correct max-width', () => {
      renderWithProviders(
        <ErrorState variant="page" title="Error" message="The server is not responding." />,
      )
      const msg = screen.getByText('The server is not responding.')
      expect(msg.className).toContain('max-w-sm')
    })

    it('renders icons as aria-hidden', () => {
      const { container } = renderWithProviders(
        <ErrorState variant="page" title="Error" message="Failed." onRetry={vi.fn()} />,
      )
      const svgs = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(svgs.length).toBeGreaterThanOrEqual(1)
    })
  })
})
