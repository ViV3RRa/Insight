import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAll,
  getOne,
  create,
  update,
  remove,
  getDefault,
  setDefault,
} from './portfolios'
import { buildPortfolio } from '@/test/factories'

// Mock PocketBase
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

describe('portfolios service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('returns portfolios filtered by ownerId and sorted by created', async () => {
      const portfolios = [
        buildPortfolio({ ownerId: 'user_001' as never }),
        buildPortfolio({ ownerId: 'user_001' as never }),
      ]
      mockGetFullList.mockResolvedValueOnce(portfolios)

      const result = await getAll()

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: 'ownerId = "user_001"',
        sort: 'created',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no portfolios exist', async () => {
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

    it('parses response through Zod schema', async () => {
      const invalidRecord = [{ id: 123, name: 'Bad' }] // id should be string
      mockGetFullList.mockResolvedValueOnce(invalidRecord)

      await expect(getAll()).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single portfolio by id and ownerId', async () => {
      const portfolio = buildPortfolio({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(portfolio)

      const result = await getOne(portfolio.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${portfolio.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(portfolio.id)
    })

    it('throws when portfolio not found', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(getOne('nonexistent')).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('sets ownerId automatically', async () => {
      const data = { name: 'My Portfolio', ownerName: 'Test', isDefault: false }
      const created = buildPortfolio({ ...data, ownerId: 'user_001' as never })
      mockGetFullList.mockResolvedValueOnce([buildPortfolio()])
      mockCreate.mockResolvedValueOnce(created)

      await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: 'user_001' }),
      )
    })

    it('auto-sets isDefault to true when first portfolio', async () => {
      const data = { name: 'First', ownerName: 'Test', isDefault: false }
      const created = buildPortfolio({
        ...data,
        isDefault: true,
        ownerId: 'user_001' as never,
      })
      mockGetFullList.mockResolvedValueOnce([]) // no existing portfolios
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: true, ownerId: 'user_001' }),
      )
      expect(result.isDefault).toBe(true)
    })

    it('preserves isDefault value when not the first portfolio', async () => {
      const data = { name: 'Second', ownerName: 'Test', isDefault: false }
      const created = buildPortfolio({ ...data, ownerId: 'user_001' as never })
      mockGetFullList.mockResolvedValueOnce([buildPortfolio()]) // existing portfolio
      mockCreate.mockResolvedValueOnce(created)

      await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ isDefault: false }),
      )
    })

    it('parses created record through Zod schema', async () => {
      const data = { name: 'Test', ownerName: 'User', isDefault: false }
      mockGetFullList.mockResolvedValueOnce([])
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid — id must be string

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates portfolio fields after verifying ownership', async () => {
      const portfolio = buildPortfolio({ ownerId: 'user_001' as never })
      const updated = { ...portfolio, name: 'Updated Name' }
      mockGetFirstListItem.mockResolvedValueOnce(portfolio)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(portfolio.id, { name: 'Updated Name' })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${portfolio.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(portfolio.id, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })

    it('throws when portfolio not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { name: 'Hack' })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('deletes a non-default portfolio', async () => {
      const portfolio = buildPortfolio({
        isDefault: false,
        ownerId: 'user_001' as never,
      })
      mockGetFirstListItem.mockResolvedValueOnce(portfolio)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(portfolio.id)

      expect(mockDelete).toHaveBeenCalledWith(portfolio.id)
    })

    it('throws when trying to delete the default portfolio', async () => {
      const portfolio = buildPortfolio({
        isDefault: true,
        ownerId: 'user_001' as never,
      })
      mockGetFirstListItem.mockResolvedValueOnce(portfolio)

      await expect(remove(portfolio.id)).rejects.toThrow(
        'Cannot delete the default portfolio',
      )
      expect(mockDelete).not.toHaveBeenCalled()
    })

    it('throws when portfolio not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('getDefault', () => {
    it('returns the portfolio with isDefault=true', async () => {
      const portfolio = buildPortfolio({
        isDefault: true,
        ownerId: 'user_001' as never,
      })
      mockGetFirstListItem.mockResolvedValueOnce(portfolio)

      const result = await getDefault()

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        'ownerId = "user_001" && isDefault = true',
      )
      expect(result.isDefault).toBe(true)
    })

    it('throws when no default portfolio exists', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(getDefault()).rejects.toThrow()
    })
  })

  describe('setDefault', () => {
    it('unsets previous default and sets new default', async () => {
      const oldDefault = buildPortfolio({
        isDefault: true,
        ownerId: 'user_001' as never,
      })
      const newDefault = buildPortfolio({
        isDefault: true,
        ownerId: 'user_001' as never,
      })

      // First call: find current default
      mockGetFirstListItem.mockResolvedValueOnce(oldDefault)
      // First update: unset old default
      mockUpdate.mockResolvedValueOnce({ ...oldDefault, isDefault: false })
      // Second update: set new default
      mockUpdate.mockResolvedValueOnce(newDefault)

      const result = await setDefault(newDefault.id)

      expect(mockUpdate).toHaveBeenCalledWith(oldDefault.id, { isDefault: false })
      expect(mockUpdate).toHaveBeenCalledWith(newDefault.id, { isDefault: true })
      expect(result.isDefault).toBe(true)
    })

    it('sets default even when no previous default exists', async () => {
      const portfolio = buildPortfolio({
        isDefault: true,
        ownerId: 'user_001' as never,
      })

      // No current default found
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))
      // Set new default
      mockUpdate.mockResolvedValueOnce(portfolio)

      const result = await setDefault(portfolio.id)

      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith(portfolio.id, { isDefault: true })
      expect(result.isDefault).toBe(true)
    })
  })
})
