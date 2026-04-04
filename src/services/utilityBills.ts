import { z } from 'zod'
import pb from './pb'
import {
  utilityBillSchema,
  type UtilityBill,
  type UtilityBillCreate,
} from '@/types/home'

const COLLECTION = 'utility_bills'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByUtility(utilityId: string): Promise<UtilityBill[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && utilityId = "${utilityId}"`,
    sort: '-periodStart',
  })
  return z.array(utilityBillSchema).parse(records)
}

export async function getOne(id: string): Promise<UtilityBill> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return utilityBillSchema.parse(record)
}

export async function create(data: UtilityBillCreate | FormData): Promise<UtilityBill> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    const periodStart = data.get('periodStart') as string | null
    const periodEnd = data.get('periodEnd') as string | null
    if (periodStart && periodEnd && periodEnd < periodStart) {
      throw new Error('periodEnd must be >= periodStart')
    }
    data.set('ownerId', userId)
    body = data
  } else {
    if (data.periodEnd < data.periodStart) {
      throw new Error('periodEnd must be >= periodStart')
    }
    body = { ...data, ownerId: userId }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return utilityBillSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<UtilityBillCreate> | FormData,
): Promise<UtilityBill> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  if (!(data instanceof FormData) && data.periodStart && data.periodEnd) {
    if (data.periodEnd < data.periodStart) {
      throw new Error('periodEnd must be >= periodStart')
    }
  }
  const record = await pb.collection(COLLECTION).update(id, data)
  return utilityBillSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export function getAttachmentUrl(bill: UtilityBill): string | null {
  if (!bill.attachment) return null
  return pb.files.getUrl(bill, bill.attachment)
}
