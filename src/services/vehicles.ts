import { z } from 'zod'
import pb from './pb'
import { vehicleSchema, type Vehicle, type VehicleCreate } from '@/types/vehicles'

const COLLECTION = 'vehicles'

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getAll(): Promise<Vehicle[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}"`,
  })
  const vehicles = z.array(vehicleSchema).parse(records)

  // Sort: active first (alphabetical by name), then sold (by saleDate descending)
  return vehicles.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1
    }
    if (a.status === 'sold') {
      return (b.saleDate ?? '').localeCompare(a.saleDate ?? '')
    }
    return a.name.localeCompare(b.name)
  })
}

export async function getOne(id: string): Promise<Vehicle> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return vehicleSchema.parse(record)
}

export async function create(data: VehicleCreate | FormData): Promise<Vehicle> {
  const userId = getUserId()
  let body: FormData | Record<string, unknown>
  if (data instanceof FormData) {
    data.set('ownerId', userId)
    body = data
  } else {
    body = {
      ...data,
      ownerId: userId,
    }
  }
  const record = await pb.collection(COLLECTION).create(body)
  return vehicleSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<VehicleCreate> | FormData,
): Promise<Vehicle> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, data)
  return vehicleSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

export async function markAsSold(
  id: string,
  saleDate: string,
  salePrice?: number,
  saleNote?: string,
): Promise<Vehicle> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, {
    status: 'sold',
    saleDate,
    salePrice: salePrice ?? null,
    saleNote: saleNote ?? null,
  })
  return vehicleSchema.parse(record)
}

export async function reactivateVehicle(id: string): Promise<Vehicle> {
  const userId = getUserId()
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const record = await pb.collection(COLLECTION).update(id, {
    status: 'active',
    saleDate: null,
    salePrice: null,
    saleNote: null,
  })
  return vehicleSchema.parse(record)
}

export function getVehiclePhotoUrl(vehicle: Vehicle): string | null {
  if (!vehicle.photo) return null
  // Construct URL manually because Zod-parsed records lack collectionId
  return `${pb.baseUrl}/api/files/${COLLECTION}/${vehicle.id}/${vehicle.photo}`
}

export async function getActiveVehicles(): Promise<Vehicle[]> {
  const vehicles = await getAll()
  return vehicles.filter((v) => v.status === 'active')
}

export async function getSoldVehicles(): Promise<Vehicle[]> {
  const vehicles = await getAll()
  return vehicles.filter((v) => v.status === 'sold')
}
