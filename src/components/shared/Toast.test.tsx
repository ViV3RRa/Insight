import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, fireEvent, act } from '@/test/utils'
import { ToastRenderer } from './Toast'
import { useToastStore, toast } from '@/stores/toastStore'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useToastStore', () => {
    it('adds a success toast', () => {
      const id = toast.success('Saved successfully')
      expect(id).toBeTruthy()
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0]).toMatchObject({
        variant: 'success',
        message: 'Saved successfully',
      })
    })

    it('adds an info toast', () => {
      toast.info('Rate updated')
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0]?.variant).toBe('info')
    })

    it('adds an error toast', () => {
      toast.error('Something went wrong')
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0]?.variant).toBe('error')
    })

    it('adds an undo toast with callback', () => {
      const onUndo = vi.fn()
      toast.undo('Item deleted', onUndo)
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0]?.variant).toBe('undo')
      expect(toasts[0]?.onUndo).toBe(onUndo)
    })

    it('removes a toast by id', () => {
      const id = toast.success('Test')
      expect(useToastStore.getState().toasts).toHaveLength(1)
      useToastStore.getState().removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('supports multiple toasts', () => {
      toast.success('First')
      toast.error('Second')
      toast.info('Third')
      expect(useToastStore.getState().toasts).toHaveLength(3)
    })
  })

  describe('ToastRenderer', () => {
    it('renders nothing when no toasts', () => {
      const { container } = renderWithProviders(<ToastRenderer />)
      expect(container.firstChild).toBeNull()
    })

    it('renders a success toast with CheckCircle icon', () => {
      act(() => {
        toast.success('Data point saved')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Data point saved')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders an info toast', () => {
      act(() => {
        toast.info('Exchange rate updated')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Exchange rate updated')).toBeInTheDocument()
    })

    it('renders an error toast', () => {
      act(() => {
        toast.error('Failed to save')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Failed to save')).toBeInTheDocument()
    })

    it('renders an undo toast with Undo button', () => {
      const onUndo = vi.fn()
      act(() => {
        toast.undo('Transaction deleted', onUndo)
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Transaction deleted')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
    })

    it('renders multiple toasts stacked', () => {
      act(() => {
        toast.success('First')
        toast.error('Second')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      const statuses = screen.getAllByRole('status')
      expect(statuses).toHaveLength(2)
    })

    it('auto-dismisses after 4 seconds', () => {
      act(() => {
        toast.success('Auto dismiss me')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Auto dismiss me')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(screen.queryByText('Auto dismiss me')).not.toBeInTheDocument()
    })

    it('dismisses on close button click', () => {
      act(() => {
        toast.success('Close me')
      })
      renderWithProviders(<ToastRenderer />)
      expect(screen.getByText('Close me')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Dismiss'))
      expect(screen.queryByText('Close me')).not.toBeInTheDocument()
    })

    it('calls onUndo and dismisses when Undo is clicked', () => {
      const onUndo = vi.fn()
      act(() => {
        toast.undo('Deleted item', onUndo)
      })
      renderWithProviders(<ToastRenderer />)

      fireEvent.click(screen.getByText('Undo'))
      expect(onUndo).toHaveBeenCalledOnce()
      expect(screen.queryByText('Deleted item')).not.toBeInTheDocument()
    })

    it('applies correct container positioning classes', () => {
      act(() => {
        toast.success('Position test')
      })
      renderWithProviders(<ToastRenderer />)
      const container = screen.getByRole('status').parentElement
      expect(container?.className).toContain('fixed')
      expect(container?.className).toContain('bottom-6')
      expect(container?.className).toContain('left-1/2')
      expect(container?.className).toContain('-translate-x-1/2')
      expect(container?.className).toContain('z-[70]')
      expect(container?.className).toContain('pointer-events-none')
    })

    it('applies dark mode classes on toast element', () => {
      act(() => {
        toast.success('Dark mode test')
      })
      renderWithProviders(<ToastRenderer />)
      const toastEl = screen.getByRole('status')
      expect(toastEl.className).toContain('bg-base-900')
      expect(toastEl.className).toContain('dark:bg-base-100')
      expect(toastEl.className).toContain('text-white')
      expect(toastEl.className).toContain('dark:text-base-900')
    })

    it('applies animate-toast-in class', () => {
      act(() => {
        toast.success('Animate test')
      })
      renderWithProviders(<ToastRenderer />)
      const toastEl = screen.getByRole('status')
      expect(toastEl.className).toContain('animate-toast-in')
    })

    it('has aria-live on container', () => {
      act(() => {
        toast.success('Accessible')
      })
      renderWithProviders(<ToastRenderer />)
      const container = screen.getByRole('status').parentElement
      expect(container?.getAttribute('aria-live')).toBe('polite')
    })
  })
})
