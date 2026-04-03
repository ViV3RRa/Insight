import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW server instance for tests — started/stopped in setup.ts */
export const server = setupServer(...handlers)
