import { vi } from 'vitest'

interface ListResult<T> {
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: T[]
}

function emptyList<T>(): ListResult<T> {
  return { page: 1, perPage: 30, totalPages: 0, totalItems: 0, items: [] }
}

function createCollectionMock() {
  return {
    getList: vi.fn().mockResolvedValue(emptyList()),
    getOne: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(true),
  }
}

type CollectionMock = ReturnType<typeof createCollectionMock>

/** Mock PocketBase client for unit tests that bypass HTTP */
export function createPocketBaseMock() {
  const collections = new Map<string, CollectionMock>()

  const pb = {
    authStore: {
      isValid: true,
      token: 'mock-jwt-token',
      record: {
        id: 'user_001',
        email: 'test@example.com',
        name: 'Test User',
      },
      onChange: vi.fn(),
      clear: vi.fn(),
    },

    collection(name: string): CollectionMock {
      if (!collections.has(name)) {
        collections.set(name, createCollectionMock())
      }
      return collections.get(name)!
    },
  }

  return pb
}

export type PocketBaseMock = ReturnType<typeof createPocketBaseMock>
