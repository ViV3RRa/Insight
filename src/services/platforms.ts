import { z } from 'zod'
import pb from './pb'
import {
  platformSchema,
  type Platform,
  type PlatformCreate,
} from '@/types/investment'

const COLLECTION = 'platforms'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByPortfolio(portfolioId: string): Promise<Platform[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && portfolioId = "${portfolioId}"`,
    sort: '-status,name,-closedDate',
  })
  return z.array(platformSchema).parse(records)
}

export async function getOne(id: string): Promise<Platform> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return platformSchema.parse(record)
}

export async function create(data: PlatformCreate | FormData): Promise<Platform> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    data.set('status', 'active')
    data.set('closedDate', '')
    data.set('closureNote', '')
    data.set('ownerId', userId)
    body = data
  } else {
    body = {
      ...data,
      status: 'active',
      closedDate: null,
      closureNote: null,
      ownerId: userId,
    }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return platformSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<PlatformCreate>,
): Promise<Platform> {
  if ('type' in data) {
    throw new Error('Cannot change platform type after creation')
  }
  if ('currency' in data) {
    throw new Error('Cannot change platform currency after creation')
  }

  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return platformSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export async function closePlatform(
  id: string,
  closedDate: string,
  closureNote?: string,
): Promise<Platform> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, {
    status: 'closed',
    closedDate,
    closureNote: closureNote ?? null,
  })
  return platformSchema.parse(record)
}

export async function reopenPlatform(id: string): Promise<Platform> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, {
    status: 'active',
    closedDate: null,
    closureNote: null,
  })
  return platformSchema.parse(record)
}

export async function getActivePlatforms(portfolioId: string): Promise<Platform[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && portfolioId = "${portfolioId}" && status = "active"`,
    sort: 'name',
  })
  return z.array(platformSchema).parse(records)
}

export async function getClosedPlatforms(portfolioId: string): Promise<Platform[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && portfolioId = "${portfolioId}" && status = "closed"`,
    sort: '-closedDate',
  })
  return z.array(platformSchema).parse(records)
}

export async function getInvestmentPlatforms(portfolioId: string): Promise<Platform[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && portfolioId = "${portfolioId}" && status = "active" && type = "investment"`,
    sort: 'name',
  })
  return z.array(platformSchema).parse(records)
}

export async function getCashPlatforms(portfolioId: string): Promise<Platform[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && portfolioId = "${portfolioId}" && status = "active" && type = "cash"`,
    sort: 'name',
  })
  return z.array(platformSchema).parse(records)
}

export function getPlatformIconUrl(platform: Platform): string {
  return pb.files.getUrl(platform, platform.icon)
}
