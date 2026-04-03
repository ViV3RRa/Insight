import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrCreateSettings, updateSettings } from './settings'
import { buildSettings } from '@/test/factories'

// Mock PocketBase
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()

vi.mock('./pb', () => ({
  default: {
    authStore: {
      model: { id: 'user_001' },
    },
    collection: () => ({
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
    }),
  },
}))

describe('settings service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrCreateSettings', () => {
    it('returns existing settings when found', async () => {
      const existing = buildSettings({ userId: 'user_001' })
      mockGetFirstListItem.mockResolvedValueOnce(existing)

      const result = await getOrCreateSettings()

      expect(mockGetFirstListItem).toHaveBeenCalledWith('userId="user_001"')
      expect(result).toEqual(existing)
    })

    it('creates default settings when none found', async () => {
      const created = buildSettings({
        userId: 'user_001',
        dateFormat: 'yyyy-MM-dd',
        theme: 'light',
        demoMode: false,
      })
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))
      mockCreate.mockResolvedValueOnce(created)

      const result = await getOrCreateSettings()

      expect(mockCreate).toHaveBeenCalledWith({
        dateFormat: 'yyyy-MM-dd',
        theme: 'light',
        demoMode: false,
        userId: 'user_001',
      })
      expect(result).toEqual(created)
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getOrCreateSettings()).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('parses response through Zod schema', async () => {
      const invalidRecord = { id: 123, userId: 'user_001' } // id should be string
      mockGetFirstListItem.mockResolvedValueOnce(invalidRecord)

      await expect(getOrCreateSettings()).rejects.toThrow()
    })
  })

  describe('updateSettings', () => {
    it('updates settings with partial data', async () => {
      const existing = buildSettings({ userId: 'user_001' })
      const updated = { ...existing, dateFormat: 'dd/MM/yyyy' as const }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await updateSettings({ dateFormat: 'dd/MM/yyyy' })

      expect(mockGetFirstListItem).toHaveBeenCalledWith('userId="user_001"')
      expect(mockUpdate).toHaveBeenCalledWith(existing.id, { dateFormat: 'dd/MM/yyyy' })
      expect(result.dateFormat).toBe('dd/MM/yyyy')
    })

    it('updates theme setting', async () => {
      const existing = buildSettings({ userId: 'user_001', theme: 'light' })
      const updated = { ...existing, theme: 'dark' as const }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await updateSettings({ theme: 'dark' })

      expect(result.theme).toBe('dark')
    })

    it('updates demoMode setting', async () => {
      const existing = buildSettings({ userId: 'user_001', demoMode: false })
      const updated = { ...existing, demoMode: true }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await updateSettings({ demoMode: true })

      expect(result.demoMode).toBe(true)
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(updateSettings({ theme: 'dark' })).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })
  })
})
