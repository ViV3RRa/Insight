import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAll, getOne, create, update, remove } from './utilities'
import { buildUtility } from '@/test/factories'

const mockGetFullList = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('./pb', () => ({
  default: {
    authStore: {
      model: { id: 'user_001' },
    },
    collection: () => ({
      getFullList: mockGetFullList,
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    }),
  },
}))

describe('utilities service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('returns utilities filtered by ownerId, sorted by name', async () => {
      const utilities = [
        buildUtility({ name: 'Electricity', ownerId: 'user_001' as never }),
        buildUtility({ name: 'Water', ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(utilities)

      const result = await getAll()

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'ownerId = "user_001"',
        sort: 'name',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no utilities exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getAll()

      expect(result).toEqual([])
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getAll()).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('rejects invalid data through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }]
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getAll()).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single utility by id and ownerId', async () => {
      const utility = buildUtility({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(utility)

      const result = await getOne(utility.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${utility.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(utility.id)
    })

    it('parses response through Zod schema', async () => {
      mockGetFirstListItem.mockResolvedValueOnce({ id: 123 })

      await expect(getOne('bad_id')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('sets ownerId and passes data correctly', async () => {
      const data = {
        name: 'Electricity',
        unit: 'kWh',
        icon: 'bolt' as const,
        color: 'amber' as const,
      }
      const created = buildUtility({
        ...data,
        ownerId: 'user_001' as never,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith({
        ...data,
        ownerId: 'user_001',
      })
      expect(result.name).toBe('Electricity')
      expect(result.unit).toBe('kWh')
    })

    it('rejects invalid response through Zod schema', async () => {
      const data = {
        name: 'Gas',
        unit: 'm³',
        icon: 'flame' as const,
        color: 'orange' as const,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 })

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership then updates fields', async () => {
      const utility = buildUtility({ ownerId: 'user_001' as never })
      const updated = { ...utility, name: 'Updated Name' }
      mockGetFirstListItem.mockResolvedValueOnce(utility)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(utility.id, { name: 'Updated Name' })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${utility.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(utility.id, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })

    it('throws when utility not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { name: 'Hack' })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('verifies ownership then deletes', async () => {
      const utility = buildUtility({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(utility)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(utility.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${utility.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(utility.id)
    })

    it('throws when utility not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })
})
