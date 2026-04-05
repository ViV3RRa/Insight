import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { UtilityIcon } from './UtilityIcon'
import type { UtilityIcon as UtilityIconType, UtilityColor } from '@/types/home'

describe('UtilityIcon', () => {
  const allIcons: UtilityIconType[] = [
    'bolt',
    'droplet',
    'flame',
    'sun',
    'wind',
    'thermometer',
    'wifi',
    'trash',
  ]

  const allColors: UtilityColor[] = [
    'amber',
    'blue',
    'orange',
    'emerald',
    'violet',
    'rose',
    'cyan',
    'slate',
  ]

  describe('icon rendering', () => {
    it.each(allIcons)('renders an SVG for icon "%s"', (icon) => {
      const { container } = renderWithProviders(
        <UtilityIcon icon={icon} color="amber" />,
      )
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('color classes', () => {
    const expectedColors: Record<UtilityColor, { bg: string; text: string }> = {
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
      },
      violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
      },
      rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-600',
      },
      slate: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
      },
    }

    it.each(allColors)('applies correct bg class for color "%s"', (color) => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color={color} />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain(expectedColors[color].bg)
    })

    it.each(allColors)('applies correct text class for color "%s"', (color) => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color={color} />,
      )
      const svg = container.querySelector('svg') as SVGElement
      expect(svg.getAttribute('class')).toContain(expectedColors[color].text)
    })
  })

  describe('dark mode classes', () => {
    it.each([
      ['amber', 'dark:bg-amber-900/30', 'dark:text-amber-400'],
      ['blue', 'dark:bg-blue-900/30', 'dark:text-blue-400'],
      ['orange', 'dark:bg-orange-900/30', 'dark:text-orange-400'],
      ['emerald', 'dark:bg-emerald-900/30', 'dark:text-emerald-400'],
      ['violet', 'dark:bg-violet-900/30', 'dark:text-violet-400'],
      ['rose', 'dark:bg-rose-900/30', 'dark:text-rose-400'],
      ['cyan', 'dark:bg-cyan-900/30', 'dark:text-cyan-400'],
      ['slate', 'dark:bg-slate-800/50', 'dark:text-slate-400'],
    ] as [UtilityColor, string, string][])(
      'includes dark mode classes for color "%s"',
      (color, darkBg, darkText) => {
        const { container } = renderWithProviders(
          <UtilityIcon icon="bolt" color={color} />,
        )
        const wrapper = container.firstElementChild as HTMLElement
        const svg = container.querySelector('svg') as SVGElement
        expect(wrapper.className).toContain(darkBg)
        expect(svg.getAttribute('class')).toContain(darkText)
      },
    )
  })

  describe('size variants', () => {
    it('renders sm size with w-6 h-6 container and w-3.5 h-3.5 icon', () => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color="amber" size="sm" />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      const svg = container.querySelector('svg') as SVGElement
      expect(wrapper.className).toContain('w-6')
      expect(wrapper.className).toContain('h-6')
      expect(svg.getAttribute('class')).toContain('w-3.5')
      expect(svg.getAttribute('class')).toContain('h-3.5')
    })

    it('renders md size with w-8 h-8 container and w-4 h-4 icon', () => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color="amber" size="md" />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      const svg = container.querySelector('svg') as SVGElement
      expect(wrapper.className).toContain('w-8')
      expect(wrapper.className).toContain('h-8')
      expect(svg.getAttribute('class')).toContain('w-4')
      expect(svg.getAttribute('class')).toContain('h-4')
    })

    it('renders lg size with w-10 h-10 container and w-5 h-5 icon', () => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color="amber" size="lg" />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      const svg = container.querySelector('svg') as SVGElement
      expect(wrapper.className).toContain('w-10')
      expect(wrapper.className).toContain('h-10')
      expect(svg.getAttribute('class')).toContain('w-5')
      expect(svg.getAttribute('class')).toContain('h-5')
    })

    it('defaults to md size when no size prop is provided', () => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color="amber" />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      const svg = container.querySelector('svg') as SVGElement
      expect(wrapper.className).toContain('w-8')
      expect(wrapper.className).toContain('h-8')
      expect(svg.getAttribute('class')).toContain('w-4')
      expect(svg.getAttribute('class')).toContain('h-4')
    })
  })

  describe('container structure', () => {
    it('renders with rounded-lg and flex centering classes', () => {
      const { container } = renderWithProviders(
        <UtilityIcon icon="bolt" color="amber" />,
      )
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.className).toContain('rounded-lg')
      expect(wrapper.className).toContain('flex')
      expect(wrapper.className).toContain('items-center')
      expect(wrapper.className).toContain('justify-center')
    })
  })
})
