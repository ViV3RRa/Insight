import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByPortfolio,
  getOne,
  create,
  update,
  remove,
  closePlatform,
  reopenPlatform,
  getActivePlatforms,
  getClosedPlatforms,
  getInvestmentPlatforms,
  getCashPlatforms,
  getPlatformIconUrl,
} from './platforms'
import { buildPlatform } from '@/test/factories'

// Mock PocketBase
const mockGetFullList = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockGetUrl = vi.fn()

vi.mock('./pb', () => ({
  default: {
    baseUrl: 'http://localhost:8090',
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
    files: {
      getUrl: (...args: unknown[]) => mockGetUrl(...args),
    },
  },
  getFileUrl: (collection: string, recordId: string, filename: string) =>
    `http://localhost:8090/api/files/${collection}/${recordId}/${filename}`,
}))

const portfolioId = 'portfolio_001'

describe('platforms service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByPortfolio', () => {
    it('returns platforms filtered by portfolioId and ownerId', async () => {
      const platforms = [
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
        }),
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(platforms)

      const result = await getByPortfolio(portfolioId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && portfolioId = "${portfolioId}"`,
        sort: '-status,name,-closedDate',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no platforms exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByPortfolio(portfolioId)

      expect(result).toEqual([])
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getByPortfolio(portfolioId)).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('parses response through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }] // id must be string
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getByPortfolio(portfolioId)).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single platform by id and ownerId', async () => {
      const platform = buildPlatform({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(platform)

      const result = await getOne(platform.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${platform.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(platform.id)
    })
  })

  describe('create', () => {
    it('sets ownerId and status to active automatically', async () => {
      const data = {
        portfolioId: portfolioId as never,
        name: 'Nordnet',
        icon: 'nordnet.png',
        type: 'investment' as const,
        currency: 'DKK',
      }
      const created = buildPlatform({
        ...data,
        ownerId: 'user_001' as never,
        status: 'active',
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          status: 'active',
          closedDate: null,
          closureNote: null,
        }),
      )
      expect(result.status).toBe('active')
    })

    it('parses created record through Zod schema', async () => {
      const data = {
        portfolioId: portfolioId as never,
        name: 'Test',
        icon: 'test.png',
        type: 'investment' as const,
        currency: 'DKK',
      }
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('updates mutable fields after verifying ownership', async () => {
      const platform = buildPlatform({ ownerId: 'user_001' as never })
      const updated = { ...platform, name: 'Updated Name' }
      mockGetFirstListItem.mockResolvedValueOnce(platform)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(platform.id, { name: 'Updated Name' })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${platform.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(platform.id, { name: 'Updated Name' })
      expect(result.name).toBe('Updated Name')
    })

    it('rejects changes to type field', async () => {
      await expect(
        update('platform_001', { type: 'cash' } as Partial<never>),
      ).rejects.toThrow('Cannot change platform type after creation')

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('rejects changes to currency field', async () => {
      await expect(
        update('platform_001', { currency: 'EUR' } as Partial<never>),
      ).rejects.toThrow('Cannot change platform currency after creation')

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('throws when platform not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { name: 'Hack' })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('deletes a platform after verifying ownership', async () => {
      const platform = buildPlatform({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(platform)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(platform.id)

      expect(mockDelete).toHaveBeenCalledWith(platform.id)
    })

    it('throws when platform not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('closePlatform', () => {
    it('sets status to closed with closedDate and closureNote', async () => {
      const platform = buildPlatform({ ownerId: 'user_001' as never })
      const closed = {
        ...platform,
        status: 'closed',
        closedDate: '2026-03-15T00:00:00.000Z',
        closureNote: 'Moved funds',
      }
      mockGetFirstListItem.mockResolvedValueOnce(platform)
      mockUpdate.mockResolvedValueOnce(closed)

      const result = await closePlatform(
        platform.id,
        '2026-03-15T00:00:00.000Z',
        'Moved funds',
      )

      expect(mockUpdate).toHaveBeenCalledWith(platform.id, {
        status: 'closed',
        closedDate: '2026-03-15T00:00:00.000Z',
        closureNote: 'Moved funds',
      })
      expect(result.status).toBe('closed')
    })

    it('sets closureNote to null when not provided', async () => {
      const platform = buildPlatform({ ownerId: 'user_001' as never })
      const closed = {
        ...platform,
        status: 'closed',
        closedDate: '2026-03-15T00:00:00.000Z',
        closureNote: null,
      }
      mockGetFirstListItem.mockResolvedValueOnce(platform)
      mockUpdate.mockResolvedValueOnce(closed)

      await closePlatform(platform.id, '2026-03-15T00:00:00.000Z')

      expect(mockUpdate).toHaveBeenCalledWith(platform.id, {
        status: 'closed',
        closedDate: '2026-03-15T00:00:00.000Z',
        closureNote: null,
      })
    })
  })

  describe('reopenPlatform', () => {
    it('sets status to active and clears closedDate and closureNote', async () => {
      const platform = buildPlatform({
        ownerId: 'user_001' as never,
        status: 'closed',
        closedDate: '2026-03-15T00:00:00.000Z',
        closureNote: 'Old note',
      })
      const reopened = {
        ...platform,
        status: 'active',
        closedDate: null,
        closureNote: null,
      }
      mockGetFirstListItem.mockResolvedValueOnce(platform)
      mockUpdate.mockResolvedValueOnce(reopened)

      const result = await reopenPlatform(platform.id)

      expect(mockUpdate).toHaveBeenCalledWith(platform.id, {
        status: 'active',
        closedDate: null,
        closureNote: null,
      })
      expect(result.status).toBe('active')
      expect(result.closedDate).toBeNull()
      expect(result.closureNote).toBeNull()
    })
  })

  describe('getActivePlatforms', () => {
    it('returns only active platforms for a portfolio', async () => {
      const active = [
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
          status: 'active',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(active)

      const result = await getActivePlatforms(portfolioId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && portfolioId = "${portfolioId}" && status = "active"`,
        sort: 'name',
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.status).toBe('active')
    })
  })

  describe('getClosedPlatforms', () => {
    it('returns only closed platforms for a portfolio', async () => {
      const closed = [
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
          status: 'closed',
          closedDate: '2026-03-01T00:00:00.000Z',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(closed)

      const result = await getClosedPlatforms(portfolioId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && portfolioId = "${portfolioId}" && status = "closed"`,
        sort: '-closedDate',
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.status).toBe('closed')
    })
  })

  describe('getInvestmentPlatforms', () => {
    it('returns only active investment-type platforms', async () => {
      const investments = [
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
          status: 'active',
          type: 'investment',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(investments)

      const result = await getInvestmentPlatforms(portfolioId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && portfolioId = "${portfolioId}" && status = "active" && type = "investment"`,
        sort: 'name',
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('investment')
    })
  })

  describe('getCashPlatforms', () => {
    it('returns only active cash-type platforms', async () => {
      const cash = [
        buildPlatform({
          portfolioId: portfolioId as never,
          ownerId: 'user_001' as never,
          status: 'active',
          type: 'cash',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(cash)

      const result = await getCashPlatforms(portfolioId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && portfolioId = "${portfolioId}" && status = "active" && type = "cash"`,
        sort: 'name',
      })
      expect(result).toHaveLength(1)
      expect(result[0]!.type).toBe('cash')
    })
  })

  describe('getPlatformIconUrl', () => {
    it('returns the file URL for the platform icon', () => {
      const platform = buildPlatform({ icon: 'nordnet.png' })

      const url = getPlatformIconUrl(platform)

      expect(url).toBe(`http://localhost:8090/api/files/platforms/${platform.id}/nordnet.png`)
    })
  })
})
