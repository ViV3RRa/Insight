import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAuthStore, mockAuthWithPassword } = vi.hoisted(() => {
  const mockAuthStore = {
    isValid: false,
    token: '',
    model: null as Record<string, unknown> | null,
    clear: vi.fn(),
    onChange: vi.fn(() => vi.fn()),
  }
  const mockAuthWithPassword = vi.fn()
  return { mockAuthStore, mockAuthWithPassword }
})

vi.mock('./pb', () => ({
  default: {
    authStore: mockAuthStore,
    collection: vi.fn(() => ({
      authWithPassword: mockAuthWithPassword,
    })),
  },
}))

import {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  onAuthChange,
  getAuthToken,
} from './auth'
import pb from './pb'

describe('PocketBase client', () => {
  it('exports a PocketBase instance with authStore and collection', () => {
    expect(pb.authStore).toBeDefined()
    expect(pb.collection).toBeDefined()
  })
})

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.isValid = false
    mockAuthStore.token = ''
    mockAuthStore.model = null
  })

  describe('login', () => {
    it('calls authWithPassword on the users collection', async () => {
      const mockRecord = { id: '123', email: 'test@example.com' }
      mockAuthWithPassword.mockResolvedValue(mockRecord)

      const result = await login('test@example.com', 'password123')

      expect(pb.collection).toHaveBeenCalledWith('users')
      expect(mockAuthWithPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      )
      expect(result).toEqual(mockRecord)
    })

    it('propagates errors from PocketBase', async () => {
      mockAuthWithPassword.mockRejectedValue(
        new Error('Invalid credentials'),
      )

      await expect(login('bad@example.com', 'wrong')).rejects.toThrow(
        'Invalid credentials',
      )
    })
  })

  describe('logout', () => {
    it('clears the auth store', () => {
      logout()
      expect(mockAuthStore.clear).toHaveBeenCalledOnce()
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when not authenticated', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('returns true when authenticated', () => {
      mockAuthStore.isValid = true
      expect(isAuthenticated()).toBe(true)
    })
  })

  describe('getCurrentUser', () => {
    it('returns null when not authenticated', () => {
      expect(getCurrentUser()).toBeNull()
    })

    it('returns the user record when authenticated', () => {
      const user = { id: '123', email: 'test@example.com' }
      mockAuthStore.model = user
      expect(getCurrentUser()).toEqual(user)
    })
  })

  describe('onAuthChange', () => {
    it('registers a callback and returns an unsubscribe function', () => {
      const callback = vi.fn()
      const unsubscribe = onAuthChange(callback)

      expect(mockAuthStore.onChange).toHaveBeenCalledWith(callback)
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('getAuthToken', () => {
    it('returns empty string when not authenticated', () => {
      expect(getAuthToken()).toBe('')
    })

    it('returns the token when authenticated', () => {
      mockAuthStore.token = 'test-token-abc'
      expect(getAuthToken()).toBe('test-token-abc')
    })
  })
})
