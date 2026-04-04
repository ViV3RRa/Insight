import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getByUtility,
  getOne,
  create,
  update,
  remove,
  getAttachmentUrl,
} from './utilityBills'
import { buildUtilityBill } from '@/test/factories'

// Mock PocketBase
const mockGetFullList = vi.fn()
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

const utilityId = 'utility_001'

describe('utilityBills service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByUtility', () => {
    it('returns bills filtered by utilityId and ownerId, sorted by -periodStart', async () => {
      const bills = [
        buildUtilityBill({
          utilityId: utilityId as never,
          ownerId: 'user_001' as never,
          periodStart: '2026-02-01',
          periodEnd: '2026-02-28',
        }),
        buildUtilityBill({
          utilityId: utilityId as never,
          ownerId: 'user_001' as never,
          periodStart: '2026-01-01',
          periodEnd: '2026-01-31',
        }),
      ]
      mockGetFullList.mockResolvedValueOnce(bills)

      const result = await getByUtility(utilityId)

      expect(mockGetFullList).toHaveBeenCalledWith({
        filter: `ownerId = "user_001" && utilityId = "${utilityId}"`,
        sort: '-periodStart',
      })
      expect(result).toHaveLength(2)
    })

    it('returns empty array when no bills exist', async () => {
      mockGetFullList.mockResolvedValueOnce([])

      const result = await getByUtility(utilityId)

      expect(result).toEqual([])
    })

    it('throws when not authenticated', async () => {
      const { default: pb } = await import('./pb')
      const original = pb.authStore.model
      // @ts-expect-error -- setting to null for test
      pb.authStore.model = null

      await expect(getByUtility(utilityId)).rejects.toThrow('Not authenticated')

      // @ts-expect-error -- restoring original for test
      pb.authStore.model = original
    })

    it('parses response through Zod schema', async () => {
      const invalidRecords = [{ id: 123 }] // id must be string
      mockGetFullList.mockResolvedValueOnce(invalidRecords)

      await expect(getByUtility(utilityId)).rejects.toThrow()
    })
  })

  describe('getOne', () => {
    it('returns a single bill by id and ownerId', async () => {
      const bill = buildUtilityBill({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(bill)

      const result = await getOne(bill.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${bill.id}" && ownerId = "user_001"`,
      )
      expect(result.id).toBe(bill.id)
    })
  })

  describe('create', () => {
    it('sets ownerId and returns parsed bill with plain object', async () => {
      const data = {
        utilityId: utilityId as never,
        amount: 750,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        timestamp: null,
        note: null,
        attachment: null,
      }
      const created = buildUtilityBill({
        ...data,
        ownerId: 'user_001' as never,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(data)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'user_001',
          amount: 750,
        }),
      )
      expect(result.amount).toBe(750)
    })

    it('sets ownerId on FormData and passes to PocketBase', async () => {
      const formData = new FormData()
      formData.set('utilityId', utilityId)
      formData.set('amount', '500')
      formData.set('periodStart', '2026-01-01')
      formData.set('periodEnd', '2026-01-31')

      const created = buildUtilityBill({
        utilityId: utilityId as never,
        ownerId: 'user_001' as never,
      })
      mockCreate.mockResolvedValueOnce(created)

      const result = await create(formData)

      expect(formData.get('ownerId')).toBe('user_001')
      expect(mockCreate).toHaveBeenCalledWith(formData)
      expect(result.id).toBe(created.id)
    })

    it('throws error when periodEnd < periodStart with plain object', async () => {
      const data = {
        utilityId: utilityId as never,
        amount: 500,
        periodStart: '2026-02-01',
        periodEnd: '2026-01-15',
        timestamp: null,
        note: null,
        attachment: null,
      }

      await expect(create(data)).rejects.toThrow('periodEnd must be >= periodStart')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('throws error when periodEnd < periodStart with FormData', async () => {
      const formData = new FormData()
      formData.set('periodStart', '2026-02-01')
      formData.set('periodEnd', '2026-01-15')

      await expect(create(formData)).rejects.toThrow('periodEnd must be >= periodStart')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('parses created record through Zod schema', async () => {
      const data = {
        utilityId: utilityId as never,
        amount: 500,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        timestamp: null,
        note: null,
        attachment: null,
      }
      mockCreate.mockResolvedValueOnce({ id: 123 }) // invalid

      await expect(create(data)).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('verifies ownership and updates with plain object', async () => {
      const bill = buildUtilityBill({ ownerId: 'user_001' as never })
      const updated = { ...bill, amount: 900 }
      mockGetFirstListItem.mockResolvedValueOnce(bill)
      mockUpdate.mockResolvedValueOnce(updated)

      const result = await update(bill.id, { amount: 900 })

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${bill.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(bill.id, { amount: 900 })
      expect(result.amount).toBe(900)
    })

    it('verifies ownership and passes FormData to update', async () => {
      const bill = buildUtilityBill({ ownerId: 'user_001' as never })
      const formData = new FormData()
      formData.set('amount', '800')
      mockGetFirstListItem.mockResolvedValueOnce(bill)
      mockUpdate.mockResolvedValueOnce({ ...bill, amount: 800 })

      const result = await update(bill.id, formData)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${bill.id}" && ownerId = "user_001"`,
      )
      expect(mockUpdate).toHaveBeenCalledWith(bill.id, formData)
      expect(result.amount).toBe(800)
    })

    it('throws error when periodEnd < periodStart', async () => {
      const bill = buildUtilityBill({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(bill)

      await expect(
        update(bill.id, { periodStart: '2026-02-01', periodEnd: '2026-01-15' }),
      ).rejects.toThrow('periodEnd must be >= periodStart')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('throws when bill not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(update('other_id', { amount: 999 })).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('deletes a bill after verifying ownership', async () => {
      const bill = buildUtilityBill({ ownerId: 'user_001' as never })
      mockGetFirstListItem.mockResolvedValueOnce(bill)
      mockDelete.mockResolvedValueOnce(undefined)

      await remove(bill.id)

      expect(mockGetFirstListItem).toHaveBeenCalledWith(
        `id = "${bill.id}" && ownerId = "user_001"`,
      )
      expect(mockDelete).toHaveBeenCalledWith(bill.id)
    })

    it('throws when bill not owned by user', async () => {
      mockGetFirstListItem.mockRejectedValueOnce(new Error('Not found'))

      await expect(remove('other_id')).rejects.toThrow()
    })
  })

  describe('getAttachmentUrl', () => {
    it('returns URL when attachment exists', () => {
      const bill = buildUtilityBill({ attachment: 'invoice.pdf' })
      mockGetUrl.mockReturnValueOnce(
        'http://localhost:8090/api/files/utility_bills/abc/invoice.pdf',
      )

      const url = getAttachmentUrl(bill)

      expect(mockGetUrl).toHaveBeenCalledWith(bill, 'invoice.pdf')
      expect(url).toBe('http://localhost:8090/api/files/utility_bills/abc/invoice.pdf')
    })

    it('returns null when no attachment', () => {
      const bill = buildUtilityBill({ attachment: null })

      const url = getAttachmentUrl(bill)

      expect(url).toBeNull()
      expect(mockGetUrl).not.toHaveBeenCalled()
    })
  })
})
