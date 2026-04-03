import { z } from 'zod'
import pb from './pb'
import {
  transactionSchema,
  type Transaction,
  type TransactionCreate,
} from '@/types/investment'

const COLLECTION = 'transactions'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByPlatform(platformId: string): Promise<Transaction[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && platformId = "${platformId}"`,
    sort: 'timestamp',
  })
  return z.array(transactionSchema).parse(records)
}

export async function getByPlatformInRange(
  platformId: string,
  start: string,
  end: string,
): Promise<Transaction[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && platformId = "${platformId}" && timestamp >= "${start}" && timestamp <= "${end}"`,
    sort: 'timestamp',
  })
  return z.array(transactionSchema).parse(records)
}

export async function getOne(id: string): Promise<Transaction> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return transactionSchema.parse(record)
}

export async function create(
  data: TransactionCreate | FormData,
): Promise<Transaction> {
  const userId = getUserId()

  if (data instanceof FormData) {
    data.set('ownerId', userId)
    const record = await pb.collection(COLLECTION).create(data)
    return transactionSchema.parse(record)
  }

  if (data.amount <= 0) {
    throw new Error('Amount must be positive')
  }

  const record = await pb.collection(COLLECTION).create({
    ...data,
    ownerId: userId,
  })
  return transactionSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<TransactionCreate> | FormData,
): Promise<Transaction> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )

  if (data instanceof FormData) {
    const record = await pb.collection(COLLECTION).update(id, data)
    return transactionSchema.parse(record)
  }

  if (data.amount !== undefined && data.amount <= 0) {
    throw new Error('Amount must be positive')
  }

  const record = await pb.collection(COLLECTION).update(id, data)
  return transactionSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export async function getNetDeposits(
  platformId: string,
  start: string,
  end: string,
): Promise<number> {
  const transactions = await getByPlatformInRange(platformId, start, end)
  return transactions.reduce((sum, t) => {
    return t.type === 'deposit' ? sum + t.amount : sum - t.amount
  }, 0)
}

export async function getDepositSum(
  platformId: string,
  start: string,
  end: string,
): Promise<number> {
  const transactions = await getByPlatformInRange(platformId, start, end)
  return transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0)
}

export async function getByPortfolio(
  _portfolioId: string,
  platformIds: string[],
): Promise<Transaction[]> {
  if (platformIds.length === 0) return []
  const userId = getUserId()
  const platformFilter = platformIds
    .map((id) => `platformId = "${id}"`)
    .join(' || ')
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && (${platformFilter})`,
    sort: 'timestamp',
  })
  return z.array(transactionSchema).parse(records)
}

export async function getByPortfolioInRange(
  _portfolioId: string,
  platformIds: string[],
  start: string,
  end: string,
): Promise<Transaction[]> {
  if (platformIds.length === 0) return []
  const userId = getUserId()
  const platformFilter = platformIds
    .map((id) => `platformId = "${id}"`)
    .join(' || ')
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && (${platformFilter}) && timestamp >= "${start}" && timestamp <= "${end}"`,
    sort: 'timestamp',
  })
  return z.array(transactionSchema).parse(records)
}

export function getAttachmentUrl(transaction: Transaction): string | null {
  if (!transaction.attachment) return null
  return pb.files.getUrl(transaction, transaction.attachment)
}
