import '@testing-library/jest-dom'
import 'vitest-axe/extend-expect'
import * as matchers from 'vitest-axe/matchers'
import { expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { server } from './mocks/server'

// Extend vitest matchers with vitest-axe
expect.extend(matchers)

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// --- Global browser API mocks ---

// matchMedia mock (defaults to desktop / light mode)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ResizeObserver mock (required by Recharts)
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// IntersectionObserver mock (for lazy loading)
class IntersectionObserverMock {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}
window.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver

// URL.createObjectURL mock (for file upload previews)
URL.createObjectURL = vi.fn(() => 'blob:mock-url')
URL.revokeObjectURL = vi.fn()

// --- Exported helpers ---

/**
 * Run a test callback with fake timers set to a specific date.
 * Automatically restores real timers when done.
 */
export async function withFakeTimers(
  date: string,
  fn: () => Promise<void>,
): Promise<void> {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(date))
  try {
    await fn()
  } finally {
    vi.useRealTimers()
  }
}
