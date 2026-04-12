import { z } from 'zod'
import pb from './pb'
import {
  exchangeRateSchema,
  type ExchangeRate,
  type ExchangeRateCreate,
} from '@/types/investment'
import { isNotFoundError } from './errors'

const COLLECTION = 'exchange_rates'

/** PocketBase stores dates as full datetimes. Normalize a YYYY-MM-DD date for filter matching. */
function dateFilter(field: string, op: string, date: string): string {
  // If already has time component, use as-is
  if (date.includes(' ') || date.includes('T')) return `${field} ${op} "${date}"`
  // For equality, use a range to match any time on that date
  if (op === '=') return `${field} >= "${date} 00:00:00.000Z" && ${field} < "${date} 23:59:59.999Z"`
  // For <= or >=, append appropriate time
  if (op === '<=') return `${field} <= "${date} 23:59:59.999Z"`
  if (op === '>=') return `${field} >= "${date} 00:00:00.000Z"`
  return `${field} ${op} "${date}"`
}

function getUserId(): string {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')
  return userId
}

export async function getAll(): Promise<ExchangeRate[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}"`,
    sort: '-date',
  })
  return z.array(exchangeRateSchema).parse(records)
}

export async function getByDateRange(
  fromCurrency: string,
  start: string,
  end: string,
): Promise<ExchangeRate[]> {
  const userId = getUserId()
  const records = await pb.collection(COLLECTION).getFullList({
    filter: `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && ${dateFilter('date', '>=', start)} && ${dateFilter('date', '<=', end)}`,
    sort: '-date',
  })
  return z.array(exchangeRateSchema).parse(records)
}

export async function getOne(id: string): Promise<ExchangeRate> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  return exchangeRateSchema.parse(record)
}

export async function create(data: ExchangeRateCreate): Promise<ExchangeRate> {
  const userId = getUserId()
  const record = await pb.collection(COLLECTION).create({
    ...data,
    ownerId: userId,
  })
  return exchangeRateSchema.parse(record)
}

export async function update(
  id: string,
  data: Partial<ExchangeRateCreate>,
): Promise<ExchangeRate> {
  const userId = getUserId()
  // Verify ownership
  const existing = await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  const parsed = exchangeRateSchema.parse(existing)

  // If updating an auto-fetched rate, change source to manual
  const updateData = parsed.source === 'auto'
    ? { ...data, source: 'manual' as const }
    : data

  const record = await pb.collection(COLLECTION).update(id, updateData)
  return exchangeRateSchema.parse(record)
}

export async function remove(id: string): Promise<void> {
  const userId = getUserId()
  // Verify ownership
  await pb.collection(COLLECTION).getFirstListItem(
    `id = "${id}" && ownerId = "${userId}"`,
  )
  await pb.collection(COLLECTION).delete(id)
}

// In-memory cache to avoid repeated network calls for the same rate.
// Stores resolved values AND in-flight promises to deduplicate concurrent requests.
const rateCache = new Map<string, number | null>()
const inflightRequests = new Map<string, Promise<number | null>>()

export function getRate(
  fromCurrency: string,
  toCurrency: string,
  date: string,
): Promise<number | null> {
  if (fromCurrency === toCurrency) return Promise.resolve(1.0)

  const cacheKey = `${fromCurrency}|${toCurrency}|${date}`
  if (rateCache.has(cacheKey)) return Promise.resolve(rateCache.get(cacheKey)!)

  // Deduplicate concurrent requests for the same rate
  if (inflightRequests.has(cacheKey)) return inflightRequests.get(cacheKey)!

  const promise = getRateInternal(fromCurrency, toCurrency, date, cacheKey)
    .finally(() => inflightRequests.delete(cacheKey))
  inflightRequests.set(cacheKey, promise)
  return promise
}

async function getRateInternal(
  fromCurrency: string,
  toCurrency: string,
  date: string,
  cacheKey: string,
): Promise<number | null> {

  const userId = getUserId()

  // Exact date match
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "${toCurrency}" && ${dateFilter('date', '=', date)}`,
    )
    const parsed = exchangeRateSchema.parse(record)
    rateCache.set(cacheKey, parsed.rate)
    return parsed.rate
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // No exact match — try nearest prior
  }

  // Nearest prior date
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "${toCurrency}" && ${dateFilter('date', '<=', date)}`,
      { sort: '-date' },
    )
    const parsed = exchangeRateSchema.parse(record)
    rateCache.set(cacheKey, parsed.rate)
    return parsed.rate
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // No stored rate — try auto-fetch
  }

  // Auto-fetch from frankfurter API
  const result = await fetchRate(fromCurrency, date)
  if (result) {
    await storeRate(fromCurrency, result.rate, result.date)
    rateCache.set(cacheKey, result.rate)
    return result.rate
  }
  rateCache.set(cacheKey, null)
  return null
}

/** Fetch a rate from the frankfurter API. Does NOT store it — callers handle persistence. */
export async function fetchRate(
  fromCurrency: string,
  date: string,
): Promise<{ rate: number; date: string } | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v1/${date}?from=${fromCurrency}&to=DKK`,
    )
    if (!response.ok) {
      console.warn(`Failed to fetch exchange rate: ${response.status}`)
      return null
    }

    const data = await response.json()
    const rate = data.rates?.DKK
    if (typeof rate !== 'number') {
      console.warn('Unexpected exchange rate response format')
      return null
    }

    return { rate, date: data.date ?? date }
  } catch (error) {
    console.warn('Exchange rate fetch failed:', error)
    return null
  }
}

/** Store a rate in PocketBase. Returns false if it already exists. */
async function storeRate(
  fromCurrency: string,
  rate: number,
  date: string,
): Promise<boolean> {
  const userId = pb.authStore.model?.id
  if (!userId) return false

  // Check existence using getList (avoids SDK throwing on empty results)
  const existing = await pb.collection(COLLECTION).getList(1, 1, {
    filter: `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && ${dateFilter('date', '=', date)}`,
    skipTotal: true,
  })
  if (existing.items.length > 0) return false

  try {
    await pb.collection(COLLECTION).create({
      fromCurrency,
      toCurrency: 'DKK',
      rate,
      date,
      source: 'auto',
      ownerId: userId,
    })
    return true
  } catch {
    return false
  }
}

export async function fetchMonthlyRates(fromCurrency: string): Promise<void> {
  if (fromCurrency === 'DKK') return

  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const userId = getUserId()

  // Check if rate already exists
  try {
    await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && ${dateFilter('date', '=', firstOfMonth)}`,
    )
    return
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
  }

  const result = await fetchRate(fromCurrency, firstOfMonth)
  if (result) await storeRate(fromCurrency, result.rate, result.date)
}

export async function fetchTransactionDayRate(
  fromCurrency: string,
  date: string,
): Promise<void> {
  if (fromCurrency === 'DKK') return

  const userId = getUserId()

  // Check if rate already exists
  try {
    await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && ${dateFilter('date', '=', date)}`,
    )
    // Rate exists, nothing to do
    return
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // Rate doesn't exist — fetch it
  }

  const result = await fetchRate(fromCurrency, date)
  if (result) await storeRate(fromCurrency, result.rate, result.date)
}
