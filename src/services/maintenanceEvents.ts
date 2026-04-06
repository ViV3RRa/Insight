import { z } from 'zod'
import pb from './pb'
import {
  maintenanceEventSchema,
  type MaintenanceEvent,
  type MaintenanceEventCreate,
} from '@/types/vehicles'

const COLLECTION = 'maintenance_events'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByVehicle(vehicleId: string): Promise<MaintenanceEvent[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && vehicleId = "${vehicleId}"`,
    sort: '-date',
  })
  return z.array(maintenanceEventSchema).parse(records)
}

export async function getOne(id: string): Promise<MaintenanceEvent> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return maintenanceEventSchema.parse(record)
}

export async function create(data: MaintenanceEventCreate | FormData): Promise<MaintenanceEvent> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    data.set('ownerId', userId)
    body = data
  } else {
    body = { ...data, ownerId: userId }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return maintenanceEventSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<MaintenanceEventCreate> | FormData,
): Promise<MaintenanceEvent> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return maintenanceEventSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export function getReceiptUrl(event: MaintenanceEvent): string | null {
  if (!event.receipt) return null
  return pb.files.getUrl(event, event.receipt)
}
