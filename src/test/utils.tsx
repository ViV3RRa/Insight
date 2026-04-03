import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import type { ReactElement, ReactNode } from 'react'

/** Viewport width constants for responsive testing */
export const VIEWPORT = {
  MOBILE_S: 320,
  MOBILE_M: 375,
  TABLET: 768,
  DESKTOP: 1024,
} as const

/** Creates a QueryClient configured for testing (no retries, instant GC) */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries']
  queryClient?: QueryClient
}

/**
 * Renders a component wrapped with all required providers:
 * - QueryClientProvider (fresh client per test unless provided)
 * - MemoryRouter (with optional initialEntries)
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions = {},
) {
  const {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Re-export everything from RTL so tests can import from one place
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
