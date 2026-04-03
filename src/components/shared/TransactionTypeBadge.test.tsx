import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { TransactionTypeBadge } from './TransactionTypeBadge'

describe('TransactionTypeBadge', () => {
  describe('deposit type', () => {
    it('renders deposit labels', () => {
      renderWithProviders(<TransactionTypeBadge type="deposit" />)

      expect(screen.getByText('Deposit')).toBeInTheDocument()
      expect(screen.getByText('Dep.')).toBeInTheDocument()
    })

    it('applies emerald color classes', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="deposit" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('bg-emerald-50')
      expect(badge.className).toContain('text-emerald-700')
    })

    it('applies dark mode classes', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="deposit" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('dark:bg-emerald-900/30')
      expect(badge.className).toContain('dark:text-emerald-400')
    })

    it('uses responsive visibility classes for labels', () => {
      renderWithProviders(<TransactionTypeBadge type="deposit" />)

      const desktopLabel = screen.getByText('Deposit')
      const mobileLabel = screen.getByText('Dep.')

      expect(desktopLabel.className).toContain('hidden')
      expect(desktopLabel.className).toContain('sm:inline')
      expect(mobileLabel.className).toContain('sm:hidden')
    })
  })

  describe('withdrawal type', () => {
    it('renders withdrawal labels', () => {
      renderWithProviders(<TransactionTypeBadge type="withdrawal" />)

      expect(screen.getByText('Withdrawal')).toBeInTheDocument()
      expect(screen.getByText('Wdl.')).toBeInTheDocument()
    })

    it('applies rose color classes', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="withdrawal" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('bg-rose-50')
      expect(badge.className).toContain('text-rose-700')
    })

    it('applies dark mode classes', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="withdrawal" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('dark:bg-rose-900/30')
      expect(badge.className).toContain('dark:text-rose-400')
    })

    it('uses responsive visibility classes for labels', () => {
      renderWithProviders(<TransactionTypeBadge type="withdrawal" />)

      const desktopLabel = screen.getByText('Withdrawal')
      const mobileLabel = screen.getByText('Wdl.')

      expect(desktopLabel.className).toContain('hidden')
      expect(desktopLabel.className).toContain('sm:inline')
      expect(mobileLabel.className).toContain('sm:hidden')
    })
  })

  describe('badge shape', () => {
    it('uses pill shape styling', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="deposit" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('rounded-full')
      expect(badge.className).toContain('px-2')
      expect(badge.className).toContain('py-0.5')
      expect(badge.className).toContain('text-xs')
      expect(badge.className).toContain('font-medium')
    })

    it('uses inline-flex layout', () => {
      const { container } = renderWithProviders(<TransactionTypeBadge type="withdrawal" />)

      const badge = container.firstElementChild!
      expect(badge.className).toContain('inline-flex')
      expect(badge.className).toContain('items-center')
    })
  })
})
