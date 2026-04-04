import { getRate } from '@/services/exchangeRates'

export async function convertToDKK(
  amount: number,
  currency: string,
  date: string,
): Promise<number | null> {
  if (currency === 'DKK') return amount
  const rate = await getRate(currency, 'DKK', date)
  if (rate === null) return null
  return amount * rate
}

export async function convertFromDKK(
  amount: number,
  currency: string,
  date: string,
): Promise<number | null> {
  if (currency === 'DKK') return amount
  const rate = await getRate(currency, 'DKK', date)
  if (rate === null) return null
  return amount / rate
}

export async function convertToDKKBatch(
  items: Array<{ amount: number; currency: string; date: string }>,
): Promise<Array<number | null>> {
  // Deduplicate rate lookups
  const rateMap = new Map<string, number | null>()
  const uniquePairs: Array<{ currency: string; date: string }> = []
  const seen = new Set<string>()

  for (const item of items) {
    if (item.currency === 'DKK') continue
    const key = `${item.currency}|${item.date}`
    if (!seen.has(key)) {
      seen.add(key)
      uniquePairs.push({ currency: item.currency, date: item.date })
    }
  }

  // Fetch unique rates
  for (const { currency, date } of uniquePairs) {
    const key = `${currency}|${date}`
    const rate = await getRate(currency, 'DKK', date)
    rateMap.set(key, rate)
  }

  // Apply rates
  return items.map((item) => {
    if (item.currency === 'DKK') return item.amount
    const key = `${item.currency}|${item.date}`
    const rate = rateMap.get(key)
    if (rate === null || rate === undefined) return null
    return item.amount * rate
  })
}

export async function getDKKEquivalent(
  amount: number,
  currency: string,
  date: string,
): Promise<{ dkk: number; rate: number } | null> {
  if (currency === 'DKK') return { dkk: amount, rate: 1.0 }
  const rate = await getRate(currency, 'DKK', date)
  if (rate === null) return null
  return { dkk: amount * rate, rate }
}
