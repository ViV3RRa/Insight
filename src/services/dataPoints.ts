import { z } from 'zod'
import pb from './pb'
import {
  dataPointSchema,
  type DataPoint,
  type DataPointCreate,
} from '@/types/investment'
import { isNotFoundError } from './errors'

const COLLECTION = 'data_points'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getByPlatform(platformId: string): Promise<DataPoint[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && platformId = "${platformId}"`,
    sort: 'timestamp',
  })
  return z.array(dataPointSchema).parse(records)
}

export async function getByPlatformInRange(
  platformId: string,
  start: string,
  end: string,
): Promise<DataPoint[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && platformId = "${platformId}" && timestamp >= "${start}" && timestamp <= "${end}"`,
    sort: 'timestamp',
  })
  return z.array(dataPointSchema).parse(records)
}

export async function getOne(id: string): Promise<DataPoint> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return dataPointSchema.parse(record)
}

export async function create(data: DataPointCreate): Promise<DataPoint> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    isInterpolated: data.isInterpolated ?? false,
    timestamp: data.timestamp ?? new Date().toISOString(),
    ownerId: userId,
  })
  // TODO: Wire interpolation orchestration (US-051, Sprint 7)
  return dataPointSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<DataPointCreate>,
): Promise<DataPoint> {
  const userId = getUserId()
  // Verify ownership
  const existing = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const parsed = dataPointSchema.parse(existing)

  // If user is updating an interpolated point, mark as user-provided
  const updateData =
    parsed.isInterpolated && data.isInterpolated === undefined
      ? { ...data, isInterpolated: false }
      : data

  const record = await pb.collection(COLLECTION).update(id, updateData)
  // TODO: Wire interpolation orchestration (US-051, Sprint 7)
  return dataPointSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
  // TODO: Wire interpolation orchestration (US-051, Sprint 7)
}

export async function getLatest(platformId: string): Promise<DataPoint | null> {
  const userId = getUserId()
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && platformId = "${platformId}"`,
      { sort: '-timestamp' },
    )
    return dataPointSchema.parse(record)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return null
    }
    throw error
  }
}

export async function getLatestBefore(
  platformId: string,
  date: string,
): Promise<DataPoint | null> {
  const userId = getUserId()
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && platformId = "${platformId}" && timestamp <= "${date}"`,
      { sort: '-timestamp' },
    )
    return dataPointSchema.parse(record)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return null
    }
    throw error
  }
}

export async function getEarliestAfter(
  platformId: string,
  date: string,
): Promise<DataPoint | null> {
  const userId = getUserId()
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && platformId = "${platformId}" && timestamp > "${date}"`,
      { sort: 'timestamp' },
    )
    return dataPointSchema.parse(record)
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      return null
    }
    throw error
  }
}

export async function getMonthEndValue(
  platformId: string,
  year: number,
  month: number,
): Promise<DataPoint | null> {
  // month is 1-based (1=Jan, 2=Feb, ...).
  // new Date(year, month, 0) uses JS 0-based month: month=1 → Feb, day=0 → last day of Jan.
  const lastDay = new Date(year, month, 0)
  lastDay.setHours(23, 59, 59, 999)
  const date = lastDay.toISOString()
  return getLatestBefore(platformId, date)
}
