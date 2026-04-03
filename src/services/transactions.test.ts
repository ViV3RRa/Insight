import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByPlatform,
  getByPlatformInRange,
  getOne,
  create,
  update,
  remove,
  getNetDeposits,
  getDepositSum,
  getByPortfolio,
  getByPortfolioInRange,
  getAttachmentUrl,
} from './transactions'
import { buildTransaction } from '@/test/factories/investmentFactory'
import type { Transaction } from '@/types/investment'

const mockGetFullList = vi.fn()
const mockGetOne = vi.fn()
const mockGetFirstListItem = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockGetUrl = vi.fn()

vi.mock('./pb', () => ({
  default: {
    authStore: {
      model: { id: 'user_001' },
    },
    collection: () => ({
      getFullList: mockGetFullList,
      getOne: mockGetOne,
      getFirstListItem: mockGetFirstListItem,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
    }),
    files: {
      getUrl: (...args: unknown[]) => mockGetUrl(...args),
    },
  },
}))

const PLATFORM_ID = 'plat_001'
const PLATFORM_ID_2 = 'plat_002'

describe('transactions service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByPlatform', () => {
    it('returns transactions sorted by timestamp ascending', async () => {
      const t1 = buildTransaction({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-10T00:00:00.000Z',
      })
      const t2 = buildTransaction({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-02-10T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([t1, t2])

      const result = await getByPlatform(PLATFORM_ID)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && platformId = "${PLATFORM_ID}"`,
        sort: 'timestamp',
      })
      expect(result).toEqual([t1, t2])
    })

    it('returns empty array when no transactions exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByPlatform(PLATFORM_ID)

      expect(result).toEqual([])
    })
  })

  describe('getByPlatformInRange', () => {
    it('filters by date range', async () => {
      const t = buildTransaction({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([t])

      const result = await getByPlatformInRange(
        PLATFORM_ID,
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && platformId = "${PLATFORM_ID}" && timestamp >= "2026-01-01T00:00:00.000Z" && timestamp <= "2026-01-31T23:59:59.999Z"`,
        sort: 'timestamp',
      })
      expect(result).toEqual([t])
    })
  })

  describe('getOne', () => {
    it('returns a single transaction by id', async () => {
      const t = buildTransaction({ platformId: PLATFORM_ID as any })
      mockGetFirstListItem.mockResolvedValueOnce(t)

      const result = await getOne(t.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${t.id}" && ownerId = "user_001"`,
      )
      expect(result).toEqual(t)
    })
  })

  describe('create', () => {
    it('sets ownerId on create', async () => {
      const input = {
        platformId: PLATFORM_ID as any,
        type: 'deposit' as const,
        amount: 5000,
        exchangeRate: null,
        timestamp: '2026-01-10T00:00:00.000Z',
        note: null,
        attachment: null,
      }
      const created = buildTransaction({
        ...input,
        ownerId: 'user_001' as any,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(input as any)

      expect(mockCreate).toHaveBeenCalledWith({
        ...input,
        ownerId: 'user_001',
      })
      expect(result.ownerId).toBe('user_001')
    })

    it('validates amount > 0 and rejects zero', async () => {
      const input = {
        platformId: PLATFORM_ID as any,
        type: 'deposit' as const,
        amount: 0,
        exchangeRate: null,
        timestamp: '2026-01-10T00:00:00.000Z',
        note: null,
        attachment: null,
      }

      await expect(create(input as any)).rejects.toThrow('Amount must be positive')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('validates amount > 0 and rejects negative', async () => {
      const input = {
        platformId: PLATFORM_ID as any,
        type: 'deposit' as const,
        amount: -100,
        exchangeRate: null,
        timestamp: '2026-01-10T00:00:00.000Z',
        note: null,
        attachment: null,
      }

      await expect(create(input as any)).rejects.toThrow('Amount must be positive')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('accepts FormData and sets ownerId', async () => {
      const formData = new FormData()
      formData.set('platformId', PLATFORM_ID)
      formData.set('type', 'deposit')
      formData.set('amount', '5000')

      const created = buildTransaction({
        platformId: PLATFORM_ID as any,
        ownerId: 'user_001' as any,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result).toEqual(created)
    })
  })

  describe('update', () => {
    it('updates a transaction', async () => {
      const existing = buildTransaction({
        platformId: PLATFORM_ID as any,
        amount: 5000,
      })
      const updated = { ...existing, amount: 7000 }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(existing.id, { amount: 7000 })

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, { amount: 7000 })
      expect(result.amount).toBe(7000)
    })

    it('validates amount > 0 when amount is being changed', async () => {
      const existing = buildTransaction({
        platformId: PLATFORM_ID as any,
      })
      mockGetFirstListItem.mockResolvedValueOnce(existing)

      await expect(update(existing.id, { amount: 0 })).rejects.toThrow(
        'Amount must be positive',
      )
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('accepts FormData for update', async () => {
      const existing = buildTransaction({
        platformId: PLATFORM_ID as any,
      })
      const formData = new FormData()
      formData.set('amount', '8000')

      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce({ ...existing, amount: 8000 })

      const result = await update(existing.id, formData)

      expect(mockUpdate).toHaveBeenCalledWith(existing.id, formData)
      expect(result.amount).toBe(8000)
    })

    it('allows update without amount field', async () => {
      const existing = buildTransaction({
        platformId: PLATFORM_ID as any,
      })
      const updated = { ...existing, note: 'updated note' }
      mockGetFirstListItem.mockResolvedValueOnce(existing)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(existing.id, { note: 'updated note' })

      expect(result.note).toBe('updated note')
    })
  })

  describe('remove', () => {
    it('deletes a transaction after verifying ownership', async () => {
      const t = buildTransaction({ platformId: PLATFORM_ID as any })
      mockGetFirstListItem.mockResolvedValueOnce(t)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(t.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${t.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(t.id)
    })
  })

  describe('getNetDeposits', () => {
    it('correctly computes deposits minus withdrawals', async () => {
      const deposit = buildTransaction({
        platformId: PLATFORM_ID as any,
        type: 'deposit',
        amount: 10000,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      const withdrawal = buildTransaction({
        platformId: PLATFORM_ID as any,
        type: 'withdrawal',
        amount: 3000,
        timestamp: '2026-01-20T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([deposit, withdrawal])

      const result = await getNetDeposits(
        PLATFORM_ID,
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(result).toBe(7000) // 10000 - 3000
    })

    it('returns 0 when no transactions in range', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getNetDeposits(
        PLATFORM_ID,
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(result).toBe(0)
    })
  })

  describe('getDepositSum', () => {
    it('returns sum of deposit amounts only', async () => {
      const deposit1 = buildTransaction({
        platformId: PLATFORM_ID as any,
        type: 'deposit',
        amount: 5000,
        timestamp: '2026-01-10T00:00:00.000Z',
      })
      const deposit2 = buildTransaction({
        platformId: PLATFORM_ID as any,
        type: 'deposit',
        amount: 3000,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      const withdrawal = buildTransaction({
        platformId: PLATFORM_ID as any,
        type: 'withdrawal',
        amount: 2000,
        timestamp: '2026-01-20T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([deposit1, deposit2, withdrawal])

      const result = await getDepositSum(
        PLATFORM_ID,
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(result).toBe(8000) // 5000 + 3000, withdrawal excluded
    })
  })

  describe('getByPortfolio', () => {
    it('returns transactions across multiple platforms', async () => {
      const t1 = buildTransaction({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-10T00:00:00.000Z',
      })
      const t2 = buildTransaction({
        platformId: PLATFORM_ID_2 as any,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([t1, t2])

      const result = await getByPortfolio('portfolio_001', [
        PLATFORM_ID,
        PLATFORM_ID_2,
      ])

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && (platformId = "${PLATFORM_ID}" || platformId = "${PLATFORM_ID_2}")`,
        sort: 'timestamp',
      })
      expect(result).toEqual([t1, t2])
    })

    it('returns empty array for empty platformIds', async () => {
      const result = await getByPortfolio('portfolio_001', [])

      expect(mockGetFullList).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('getByPortfolioInRange', () => {
    it('returns filtered transactions across platforms in date range', async () => {
      const t = buildTransaction({
        platformId: PLATFORM_ID as any,
        timestamp: '2026-01-15T00:00:00.000Z',
      })
      mockGetFullList.mockResolvedValueOnce([t])

      const result = await getByPortfolioInRange(
        'portfolio_001',
        [PLATFORM_ID],
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && (platformId = "${PLATFORM_ID}") && timestamp >= "2026-01-01T00:00:00.000Z" && timestamp <= "2026-01-31T23:59:59.999Z"`,
        sort: 'timestamp',
      })
      expect(result).toEqual([t])
    })

    it('returns empty array for empty platformIds', async () => {
      const result = await getByPortfolioInRange(
        'portfolio_001',
        [],
        '2026-01-01T00:00:00.000Z',
        '2026-01-31T23:59:59.999Z',
      )

      expect(mockGetFullList).not.toHaveBeenCalled()
      expect(result).toEqual([])
    })
  })

  describe('getAttachmentUrl', () => {
    it('returns URL when attachment exists', () => {
      const t = buildTransaction({
        attachment: 'receipt.pdf',
      }) as Transaction
      mockGetUrl.mockReturnValueOnce('http://localhost:8090/api/files/transactions/123/receipt.pdf')

      const result = getAttachmentUrl(t)

      expect(mockGetUrl).toHaveBeenCalledWith(t, 'receipt.pdf')
      expect(result).toBe('http://localhost:8090/api/files/transactions/123/receipt.pdf')
    })

    it('returns null when no attachment', () => {
      const t = buildTransaction({ attachment: null }) as Transaction

      const result = getAttachmentUrl(t)

      expect(mockGetUrl).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('error handling', () => {
    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getByPlatform(PLATFORM_ID)).rejects.toThrow('Not authenticated')
      await expect(create({} as any)).rejects.toThrow('Not authenticated')
      await expect(getNetDeposits(PLATFORM_ID, '', '')).rejects.toThrow(
        'Not authenticated',
      )

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('throws on malformed response (Zod parsing)', async () => {
      const invalidRecord = { id: 123, amount: 'not a number' }
      mockGetFullList.mockResolvedValueOnce([invalidRecord])

      await expect(getByPlatform(PLATFORM_ID)).rejects.toThrow()
    })
  })
})
