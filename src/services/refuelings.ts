import { z } from 'zod'
import pb from './pb'
import {
  refuelingSchema,
  type Refueling,
  type RefuelingCreate,
} from '@/types/vehicles'

const COLLECTION = 'refuelings'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getAll(): Promise<Refueling[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}"`,
    sort: '-date',
  })
  return z.array(refuelingSchema).parse(records)
}

export async function getByVehicle(vehicleId: string): Promise<Refueling[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && vehicleId = "${vehicleId}"`,
    sort: '-date',
  })
  return z.array(refuelingSchema).parse(records)
}

export async function getOne(id: string): Promise<Refueling> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return refuelingSchema.parse(record)
}

type RefuelingCreateInput = Omit<RefuelingCreate, 'totalCost'> & { totalCost?: number }

export async function create(data: RefuelingCreateInput | FormData): Promise<Refueling> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    data.set('ownerId', userId)
    body = data
  } else {
    const totalCost = data.totalCost ?? data.fuelAmount * data.costPerUnit
    body = { ...data, totalCost, ownerId: userId }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return refuelingSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<RefuelingCreate> | FormData,
): Promise<Refueling> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return refuelingSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export function getReceiptUrl(refueling: Refueling): string | null {
  if (!refueling.receipt) return null
  return pb.files.getUrl(refueling, refueling.receipt)
}

export function getTripCounterPhotoUrl(refueling: Refueling): string | null {
  if (!refueling.tripCounterPhoto) return null
  return pb.files.getUrl(refueling, refueling.tripCounterPhoto)
}
