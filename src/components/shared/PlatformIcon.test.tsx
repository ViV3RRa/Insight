import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/utils'
import { PlatformIcon } from './PlatformIcon'

describe('PlatformIcon', () => {
  describe('with image', () => {
    it('renders image with correct src and alt', () => {
      renderWithProviders(
        <PlatformIcon name="Nordnet" imageUrl="https://example.com/icon.png" />,
      )

      const img = screen.getByRole('img', { name: 'Nordnet' })
      expect(img).toHaveAttribute('src', 'https://example.com/icon.png')
      expect(img).toHaveAttribute('alt', 'Nordnet')
    })

    it('applies object-cover class to image', () => {
      renderWithProviders(
        <PlatformIcon name="Nordnet" imageUrl="https://example.com/icon.png" />,
      )

      const img = screen.getByRole('img', { name: 'Nordnet' })
      expect(img.className).toContain('object-cover')
    })

    it('switches to fallback on image error', () => {
      renderWithProviders(
        <PlatformIcon name="Nordnet" imageUrl="https://example.com/bad.png" />,
      )

      const img = screen.getByRole('img', { name: 'Nordnet' })
      fireEvent.error(img)

      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      expect(screen.getByText('N')).toBeInTheDocument()
    })
  })

  describe('fallback (no image)', () => {
    it('shows first letter of name', () => {
      renderWithProviders(<PlatformIcon name="Nordnet" />)

      expect(screen.getByText('N')).toBeInTheDocument()
    })

    it('uppercases the first letter', () => {
      renderWithProviders(<PlatformIcon name="mintos" />)

      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('applies custom color from prop', () => {
      renderWithProviders(<PlatformIcon name="Nordnet" color="#ff0000" />)

      const fallback = screen.getByText('N').closest('div')!
      expect(fallback.style.backgroundColor).toBe('rgb(255, 0, 0)')
    })

    it('generates deterministic color from name when no color prop', () => {
      const { container: container1 } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )
      const bg1 = container1.firstElementChild!.getAttribute('style')

      const { container: container2 } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )
      const bg2 = container2.firstElementChild!.getAttribute('style')

      expect(bg1).toBe(bg2)
    })

    it('applies font-semibold and text-white', () => {
      renderWithProviders(<PlatformIcon name="Nordnet" />)

      const fallback = screen.getByText('N').closest('div')!
      expect(fallback.className).toContain('font-semibold')
      expect(fallback.className).toContain('text-white')
    })
  })

  describe('sizes', () => {
    it('renders sm size by default (w-5 h-5)', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('w-5')
      expect(wrapper.className).toContain('h-5')
    })

    it('renders sm fallback text at text-[10px]', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" size="sm" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('text-[10px]')
    })

    it('renders md size (w-7 h-7)', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" size="md" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('w-7')
      expect(wrapper.className).toContain('h-7')
    })

    it('renders md fallback text at text-xs', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" size="md" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('text-xs')
    })

    it('renders lg size (w-10 h-10)', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" size="lg" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('w-10')
      expect(wrapper.className).toContain('h-10')
    })

    it('renders lg fallback text at text-sm', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" size="lg" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('text-sm')
    })

    it('renders image at sm size', () => {
      const { container } = renderWithProviders(
        <PlatformIcon
          name="Nordnet"
          imageUrl="https://example.com/icon.png"
          size="sm"
        />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('w-5')
      expect(wrapper.className).toContain('h-5')
    })

    it('renders image at lg size', () => {
      const { container } = renderWithProviders(
        <PlatformIcon
          name="Nordnet"
          imageUrl="https://example.com/icon.png"
          size="lg"
        />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('w-10')
      expect(wrapper.className).toContain('h-10')
    })
  })

  describe('common styling', () => {
    it('applies rounded-full and shadow', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('rounded-full')
      expect(wrapper.className).toContain('shadow')
    })

    it('applies ring classes for light and dark mode', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('ring-1')
      expect(wrapper.className).toContain('ring-black/10')
      expect(wrapper.className).toContain('dark:ring-white/10')
    })

    it('applies flex-shrink-0', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('flex-shrink-0')
    })

    it('applies overflow-hidden on image variant', () => {
      const { container } = renderWithProviders(
        <PlatformIcon name="Nordnet" imageUrl="https://example.com/icon.png" />,
      )

      const wrapper = container.firstElementChild!
      expect(wrapper.className).toContain('overflow-hidden')
    })
  })
})
