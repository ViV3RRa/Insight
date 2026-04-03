import { generateId, buildEntity } from './base'
import type {
  Portfolio,
  Platform,
  DataPoint,
  Transaction,
  ExchangeRate,
} from '@/types/investment'

const portfolioDefaults: Portfolio = {
  id: '' as Portfolio['id'],
  name: 'Test Portfolio',
  ownerName: 'Test User',
  isDefault: false,
  ownerId: '' as Portfolio['ownerId'],
  created: '2026-01-01T00:00:00.000Z',
}

export function buildPortfolio(overrides?: Partial<Portfolio>): Portfolio {
  return buildEntity(
    {
      ...portfolioDefaults,
      id: generateId() as Portfolio['id'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Portfolio['ownerId'],
    },
    overrides,
  )
}

const platformDefaults: Platform = {
  id: '' as Platform['id'],
  portfolioId: '' as Platform['portfolioId'],
  name: 'Test Platform',
  icon: 'icon_test.png',
  type: 'investment',
  currency: 'DKK',
  status: 'active',
  closedDate: null,
  closureNote: null,
  ownerId: '' as Platform['ownerId'],
  created: '2026-01-01T00:00:00.000Z',
}

export function buildPlatform(overrides?: Partial<Platform>): Platform {
  return buildEntity(
    {
      ...platformDefaults,
      id: generateId() as Platform['id'],
      portfolioId: (overrides?.portfolioId ?? generateId()) as Platform['portfolioId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Platform['ownerId'],
    },
    overrides,
  )
}

const dataPointDefaults: DataPoint = {
  id: '' as DataPoint['id'],
  platformId: '' as DataPoint['platformId'],
  value: 10000,
  timestamp: '2026-01-15T00:00:00.000Z',
  isInterpolated: false,
  note: null,
  ownerId: '' as DataPoint['ownerId'],
  created: '2026-01-15T00:00:00.000Z',
}

export function buildDataPoint(overrides?: Partial<DataPoint>): DataPoint {
  return buildEntity(
    {
      ...dataPointDefaults,
      id: generateId() as DataPoint['id'],
      platformId: (overrides?.platformId ?? generateId()) as DataPoint['platformId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as DataPoint['ownerId'],
    },
    overrides,
  )
}

const transactionDefaults: Transaction = {
  id: '' as Transaction['id'],
  platformId: '' as Transaction['platformId'],
  type: 'deposit',
  amount: 5000,
  exchangeRate: null,
  timestamp: '2026-01-10T00:00:00.000Z',
  note: null,
  attachment: null,
  ownerId: '' as Transaction['ownerId'],
  created: '2026-01-10T00:00:00.000Z',
}

export function buildTransaction(overrides?: Partial<Transaction>): Transaction {
  return buildEntity(
    {
      ...transactionDefaults,
      id: generateId() as Transaction['id'],
      platformId: (overrides?.platformId ?? generateId()) as Transaction['platformId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Transaction['ownerId'],
    },
    overrides,
  )
}

const exchangeRateDefaults: ExchangeRate = {
  id: '' as ExchangeRate['id'],
  fromCurrency: 'EUR',
  toCurrency: 'DKK',
  rate: 7.46,
  date: '2026-01-15',
  source: 'auto',
  ownerId: '' as ExchangeRate['ownerId'],
  created: '2026-01-15T00:00:00.000Z',
}

export function buildExchangeRate(overrides?: Partial<ExchangeRate>): ExchangeRate {
  return buildEntity(
    {
      ...exchangeRateDefaults,
      id: generateId() as ExchangeRate['id'],
      ownerId: (overrides?.ownerId ?? 'user_001') as ExchangeRate['ownerId'],
    },
    overrides,
  )
}
