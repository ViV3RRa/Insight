import { z } from 'zod'
import pb from './pb'
import {
  meterReadingSchema,
  type MeterReading,
  type MeterReadingCreate,
} from '@/types/home'

const COLLECTION = 'meter_readings'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByUtility(utilityId: string): Promise<MeterReading[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && utilityId = "${utilityId}"`,
    sort: '-timestamp',
  })
  return z.array(meterReadingSchema).parse(records)
}

export async function getOne(id: string): Promise<MeterReading> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return meterReadingSchema.parse(record)
}

export async function create(data: MeterReadingCreate | FormData): Promise<MeterReading> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    data.set('ownerId', userId)
    body = data
  } else {
    body = { ...data, ownerId: userId }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return meterReadingSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<MeterReadingCreate> | FormData,
): Promise<MeterReading> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return meterReadingSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export function getAttachmentUrl(reading: MeterReading): string | null {
  if (!reading.attachment) return null
  return pb.files.getUrl(reading, reading.attachment)
}
