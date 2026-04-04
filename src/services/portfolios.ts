import { z } from 'zod'
import pb from './pb'
import {
  portfolioSchema,
  type Portfolio,
  type PortfolioCreate,
} from '@/types/investment'
import { isNotFoundError } from './errors'

const COLLECTION = 'portfolios'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getAll(): Promise<Portfolio[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}"`,
    sort: 'created',
  })
  return z.array(portfolioSchema).parse(records)
}

export async function getOne(id: string): Promise<Portfolio> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return portfolioSchema.parse(record)
}

export async function create(data: PortfolioCreate): Promise<Portfolio> {
  const userId = getUserId()
  const existing = await getAll()
  const isDefault = existing.length === 0 ? true : data.isDefault

  // If creating a new default and other portfolios exist, unset the current default
  if (isDefault && existing.length > 0) {
    const currentDefault = existing.find((p) => p.isDefault)
    if (currentDefault) {
      await pb.collection(COLLECTION).update(currentDefault.id, { isDefault: false })
    }
  }

  const record = await pb.collection(COLLECTION).create({
    ...data,
    isDefault,
    ownerId: userId,
  })
  return portfolioSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<PortfolioCreate>,
): Promise<Portfolio> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return portfolioSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  const portfolio = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const parsed = portfolioSchema.parse(portfolio)
  if (parsed.isDefault) {
    throw new Error('Cannot delete the default portfolio')
  }
  await pb.collection(COLLECTION).delete(id)
}

export async function getDefault(): Promise<Portfolio> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `ownerId = "${userId}" && isDefault = true`,
  )
  return portfolioSchema.parse(record)
}

export async function setDefault(id: string): Promise<Portfolio> {
  const userId = getUserId()

  // Verify the target portfolio belongs to the current user
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )

  // Unset current default
  let oldDefaultId: string | null = null
  try {
    const current = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && isDefault = true`,
    )
    await pb.collection(COLLECTION).update(current.id, { isDefault: false })
    oldDefaultId = current.id
  } catch (error: unknown) {
    // Only swallow "not found" errors, re-throw everything else
    if (!isNotFoundError(error)) {
      throw error
    }
    // No current default — proceed
  }

  // Set new default, with rollback on failure
  try {
    const record = await pb.collection(COLLECTION).update(id, { isDefault: true })
    return portfolioSchema.parse(record)
  } catch (error: unknown) {
    // Attempt to restore the old default if step 2 fails
    if (oldDefaultId) {
      try {
        await pb.collection(COLLECTION).update(oldDefaultId, { isDefault: true })
      } catch {
        // Best-effort rollback — if this also fails, throw the original error
      }
    }
    throw error
  }
}
