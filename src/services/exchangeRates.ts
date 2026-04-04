import { z } from 'zod'
import pb from './pb'
import {
  exchangeRateSchema,
  type ExchangeRate,
  type ExchangeRateCreate,
} from '@/types/investment'
import { isNotFoundError } from './errors'

const COLLECTION = 'exchange_rates'

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
    filter: `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && date >= "${start}" && date <= "${end}"`,
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

export async function getRate(
  fromCurrency: string,
  toCurrency: string,
  date: string,
): Promise<number | null> {
  // DKK-to-DKK (or any same-currency): no lookup needed
  if (fromCurrency === toCurrency) return 1.0

  const userId = getUserId()

  // Exact date match
  try {
    const record = await pb.collection(COLLECTION).getFirstListItem(
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "${toCurrency}" && date = "${date}"`,
    )
    const parsed = exchangeRateSchema.parse(record)
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
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "${toCurrency}" && date <= "${date}"`,
      { sort: '-date' },
    )
    const parsed = exchangeRateSchema.parse(record)
    return parsed.rate
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // No stored rate — try auto-fetch
  }

  // Auto-fetch from frankfurter.app
  return fetchRate(fromCurrency, date)
}

export async function fetchRate(
  fromCurrency: string,
  date: string,
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/${date}?from=${fromCurrency}&to=DKK`,
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

    // Store the auto-fetched rate
    const userId = pb.authStore.model?.id
    if (userId) {
      await pb.collection(COLLECTION).create({
        fromCurrency,
        toCurrency: 'DKK',
        rate,
        date: data.date ?? date,
        source: 'auto',
        ownerId: userId,
      })
    }

    return rate
  } catch (error) {
    console.warn('Exchange rate fetch failed:', error)
    return null
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
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && date = "${firstOfMonth}"`,
    )
    // Rate exists, nothing to do
    return
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // Rate doesn't exist — fetch it
  }

  await fetchRate(fromCurrency, firstOfMonth)
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
      `ownerId = "${userId}" && fromCurrency = "${fromCurrency}" && toCurrency = "DKK" && date = "${date}"`,
    )
    // Rate exists, nothing to do
    return
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // Rate doesn't exist — fetch it
  }

  await fetchRate(fromCurrency, date)
}
