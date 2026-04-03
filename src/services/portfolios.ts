import { z } from 'zod'
import pb from './pb'
import {
  portfolioSchema,
  type Portfolio,
  type PortfolioCreate,
} from '@/types/investment'

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

  // Unset current default
  try {
    const current = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && isDefault = true`,
    )
    await pb.collection(COLLECTION).update(current.id, { isDefault: false })
  } catch {
    // No current default — proceed
  }

  // Set new default
  const record = await pb.collection(COLLECTION).update(id, { isDefault: true })
  return portfolioSchema.parse(record)
}
