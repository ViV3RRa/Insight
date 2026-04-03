import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, VIEWPORT } from './utils'
import {
  generateId,
  buildEntity,
  buildList,
  buildSettings,
} from './factories'
import { createPocketBaseMock } from './mocks/pbMock'
import { withFakeTimers } from './setup'
import { axe } from 'vitest-axe'

describe('Test Infrastructure Smoke Tests', () => {
  describe('renderWithProviders', () => {
    it('renders a component with all providers', () => {
      renderWithProviders(<div data-testid="test-element">Hello</div>)
      expect(screen.getByTestId('test-element')).toHaveTextContent('Hello')
    })

    it('supports initialEntries for routing', () => {
      renderWithProviders(<div>Routed</div>, {
        initialEntries: ['/test-route'],
      })
      expect(screen.getByText('Routed')).toBeInTheDocument()
    })
  })

  describe('Factory base infrastructure', () => {
    it('generateId returns unique strings', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
    })

    it('buildEntity merges defaults with overrides', () => {
      const entity = buildEntity(
        { name: 'default', value: 1 },
        { name: 'override' },
      )
      expect(entity).toEqual({ name: 'override', value: 1 })
    })

    it('buildList creates correct number of entities', () => {
      type TestItem = { id: string; name: string }
      const list = buildList<TestItem>(
        (overrides) => buildEntity({ id: generateId(), name: 'item' }, overrides),
        3,
      )
      expect(list).toHaveLength(3)
      // Each should have a unique id
      const ids = list.map((item) => item.id)
      expect(new Set(ids).size).toBe(3)
    })
  })

  describe('Settings factory', () => {
    it('produces a valid Settings object with defaults', () => {
      const settings = buildSettings()
      expect(settings.id).toBeTruthy()
      expect(settings.userId).toBeTruthy()
      expect(settings.dateFormat).toBe('YYYY-MM-DD')
      expect(settings.theme).toBe('light')
      expect(settings.demoMode).toBe(false)
      expect(settings.created).toBeTruthy()
      expect(settings.updated).toBeTruthy()
    })

    it('accepts overrides', () => {
      const settings = buildSettings({ theme: 'dark', demoMode: true })
      expect(settings.theme).toBe('dark')
      expect(settings.demoMode).toBe(true)
    })
  })

  describe('MSW intercepts requests', () => {
    it('returns empty list for collection records', async () => {
      const response = await fetch('/api/collections/test/records')
      const data = await response.json()
      expect(data.items).toEqual([])
      expect(data.totalItems).toBe(0)
    })

    it('returns auth response for login', async () => {
      const response = await fetch(
        '/api/collections/users/auth-with-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: 'test@example.com',
            password: 'password',
          }),
        },
      )
      const data = await response.json()
      expect(data.token).toBe('mock-jwt-token')
      expect(data.record.email).toBe('test@example.com')
    })
  })

  describe('PocketBase mock', () => {
    it('provides collection methods', async () => {
      const pb = createPocketBaseMock()
      const result = await pb.collection('test').getList()
      expect(result.items).toEqual([])
      expect(pb.collection('test').getList).toHaveBeenCalled()
    })

    it('has a valid authStore', () => {
      const pb = createPocketBaseMock()
      expect(pb.authStore.isValid).toBe(true)
      expect(pb.authStore.token).toBeTruthy()
      expect(pb.authStore.record.email).toBe('test@example.com')
    })
  })

  describe('vitest-axe', () => {
    it('toHaveNoViolations matcher is available', async () => {
      const { container } = renderWithProviders(
        <button type="button">Accessible Button</button>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Viewport constants', () => {
    it('exports expected breakpoints', () => {
      expect(VIEWPORT.MOBILE_S).toBe(320)
      expect(VIEWPORT.MOBILE_M).toBe(375)
      expect(VIEWPORT.TABLET).toBe(768)
      expect(VIEWPORT.DESKTOP).toBe(1024)
    })
  })

  describe('withFakeTimers helper', () => {
    it('sets the system time to the given date', async () => {
      await withFakeTimers('2026-06-15T12:00:00Z', async () => {
        expect(new Date().toISOString()).toBe('2026-06-15T12:00:00.000Z')
      })
      // After withFakeTimers, real timers should be restored
      const now = Date.now()
      expect(now).toBeGreaterThan(0)
    })
  })
})
