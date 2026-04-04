import { z } from 'zod'
import pb from './pb'
import { utilitySchema, type Utility, type UtilityCreate } from '@/types/home'

const COLLECTION = 'utilities'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getAll(): Promise<Utility[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}"`,
    sort: 'name',
  })
  return z.array(utilitySchema).parse(records)
}

export async function getOne(id: string): Promise<Utility> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return utilitySchema.parse(record)
}

export async function create(data: UtilityCreate): Promise<Utility> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    ownerId: userId,
  })
  return utilitySchema.parse(record)
}

export async function update(id: string, data: Partial<UtilityCreate>): Promise<Utility> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return utilitySchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}
