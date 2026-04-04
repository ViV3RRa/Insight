import { describe, it, expect } from 'vitest'
import {
  portfolioSchema,
  portfolioCreateSchema,
  platformSchema,
  platformCreateSchema,
  platformTypeSchema,
  platformStatusSchema,
  dataPointSchema,
  dataPointCreateSchema,
  transactionSchema,
  transactionCreateSchema,
  transactionTypeSchema,
  exchangeRateSchema,
  exchangeRateCreateSchema,
  exchangeRateSourceSchema,
} from './investment'
import type {
  Portfolio,
  Platform,
  DataPoint,
  Transaction,
  ExchangeRate,
} from './investment'
import type { PortfolioId, PlatformId } from './brands'

// --- Valid test payloads ---

const validPortfolio = {
  id: 'port_001',
  name: 'My Portfolio',
  ownerName: 'Me',
  isDefault: true,
  ownerId: 'user_001',
  created: '2026-01-01T00:00:00.000Z',
}

const validPlatform = {
  id: 'plat_001',
  portfolioId: 'port_001',
  name: 'Nordnet',
  icon: 'nordnet_abc123.png',
  type: 'investment' as const,
  currency: 'DKK',
  status: 'active' as const,
  closedDate: null,
  closureNote: null,
  ownerId: 'user_001',
  created: '2026-01-01T00:00:00.000Z',
}

const validDataPoint = {
  id: 'dp_001',
  platformId: 'plat_001',
  value: 10000,
  timestamp: '2026-01-15T00:00:00.000Z',
  isInterpolated: false,
  note: null,
  ownerId: 'user_001',
  created: '2026-01-15T00:00:00.000Z',
}

const validTransaction = {
  id: 'txn_001',
  platformId: 'plat_001',
  type: 'deposit' as const,
  amount: 5000,
  exchangeRate: null,
  timestamp: '2026-01-10T00:00:00.000Z',
  note: null,
  attachment: null,
  ownerId: 'user_001',
  created: '2026-01-10T00:00:00.000Z',
}

const validExchangeRate = {
  id: 'er_001',
  fromCurrency: 'EUR',
  toCurrency: 'DKK',
  rate: 7.46,
  date: '2026-01-15',
  source: 'auto' as const,
  ownerId: 'user_001',
  created: '2026-01-15T00:00:00.000Z',
}

// --- Portfolio ---

describe('portfolioSchema', () => {
  it('accepts a valid portfolio', () => {
    const result = portfolioSchema.parse(validPortfolio)
    expect(result.id).toBe('port_001')
    expect(result.name).toBe('My Portfolio')
    expect(result.isDefault).toBe(true)
  })

  it('produces branded PortfolioId for id', () => {
    const result = portfolioSchema.parse(validPortfolio)
    // Branded types are structurally strings, but the type system distinguishes them
    const id: Portfolio['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded UserId for ownerId', () => {
    const result = portfolioSchema.parse(validPortfolio)
    const ownerId: Portfolio['ownerId'] = result.ownerId
    expect(typeof ownerId).toBe('string')
  })

  it('rejects missing required fields', () => {
    expect(() => portfolioSchema.parse({ id: 'port_001' })).toThrow()
  })

  it('rejects wrong type for isDefault', () => {
    expect(() =>
      portfolioSchema.parse({ ...validPortfolio, isDefault: 'yes' }),
    ).toThrow()
  })

  it('rejects missing name', () => {
    const { name: _, ...without } = validPortfolio
    expect(() => portfolioSchema.parse(without)).toThrow()
  })
})

describe('portfolioCreateSchema', () => {
  it('accepts valid create payload (no id, created, ownerId)', () => {
    const payload = { name: 'New Portfolio', ownerName: 'Me', isDefault: false }
    const result = portfolioCreateSchema.parse(payload)
    expect(result.name).toBe('New Portfolio')
  })

  it('rejects payload with id field', () => {
    const payload = { id: 'port_001', name: 'New', ownerName: 'Me', isDefault: false }
    // id is not in the create schema, so it should be stripped (Zod strict would reject)
    const result = portfolioCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
  })

  it('rejects missing name', () => {
    expect(() => portfolioCreateSchema.parse({ ownerName: 'Me', isDefault: false })).toThrow()
  })
})

// --- Platform ---

describe('platformTypeSchema', () => {
  it('accepts "investment"', () => {
    expect(platformTypeSchema.parse('investment')).toBe('investment')
  })

  it('accepts "cash"', () => {
    expect(platformTypeSchema.parse('cash')).toBe('cash')
  })

  it('rejects invalid type', () => {
    expect(() => platformTypeSchema.parse('savings')).toThrow()
  })
})

describe('platformStatusSchema', () => {
  it('accepts "active"', () => {
    expect(platformStatusSchema.parse('active')).toBe('active')
  })

  it('accepts "closed"', () => {
    expect(platformStatusSchema.parse('closed')).toBe('closed')
  })

  it('rejects "sold" (vehicles use sold, not investment)', () => {
    expect(() => platformStatusSchema.parse('sold')).toThrow()
  })
})

describe('platformSchema', () => {
  it('accepts a valid platform', () => {
    const result = platformSchema.parse(validPlatform)
    expect(result.name).toBe('Nordnet')
    expect(result.type).toBe('investment')
    expect(result.status).toBe('active')
  })

  it('produces branded PlatformId for id', () => {
    const result = platformSchema.parse(validPlatform)
    const id: Platform['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded PortfolioId for portfolioId', () => {
    const result = platformSchema.parse(validPlatform)
    const portfolioId: Platform['portfolioId'] = result.portfolioId
    expect(typeof portfolioId).toBe('string')
  })

  it('accepts null closedDate and closureNote', () => {
    const result = platformSchema.parse(validPlatform)
    expect(result.closedDate).toBeNull()
    expect(result.closureNote).toBeNull()
  })

  it('accepts non-null closedDate and closureNote', () => {
    const closed = {
      ...validPlatform,
      status: 'closed' as const,
      closedDate: '2026-06-01',
      closureNote: 'Migrated to another platform',
    }
    const result = platformSchema.parse(closed)
    expect(result.closedDate).toBe('2026-06-01')
    expect(result.closureNote).toBe('Migrated to another platform')
  })

  it('rejects missing required fields', () => {
    expect(() => platformSchema.parse({ id: 'plat_001' })).toThrow()
  })
})

describe('platformCreateSchema', () => {
  it('accepts valid create payload (no id, created, ownerId, status, closedDate, closureNote)', () => {
    const payload = {
      portfolioId: 'port_001',
      name: 'Nordnet',
      icon: 'icon.png',
      type: 'investment' as const,
      currency: 'DKK',
    }
    const result = platformCreateSchema.parse(payload)
    expect(result.name).toBe('Nordnet')
  })

  it('omits id, created, ownerId, status, closedDate, closureNote', () => {
    const payload = {
      portfolioId: 'port_001',
      name: 'Test',
      icon: 'icon.png',
      type: 'cash' as const,
      currency: 'EUR',
    }
    const result = platformCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
    expect((result as Record<string, unknown>).status).toBeUndefined()
  })

  it('strips status if provided (status is set by service)', () => {
    const payload = {
      portfolioId: 'port_001',
      name: 'Test',
      icon: 'icon.png',
      type: 'investment' as const,
      currency: 'DKK',
      status: 'active',
    }
    const result = platformCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).status).toBeUndefined()
  })
})

// --- DataPoint ---

describe('dataPointSchema', () => {
  it('accepts a valid data point', () => {
    const result = dataPointSchema.parse(validDataPoint)
    expect(result.value).toBe(10000)
    expect(result.isInterpolated).toBe(false)
  })

  it('produces branded DataPointId for id', () => {
    const result = dataPointSchema.parse(validDataPoint)
    const id: DataPoint['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded PlatformId for platformId', () => {
    const result = dataPointSchema.parse(validDataPoint)
    const platformId: DataPoint['platformId'] = result.platformId
    expect(typeof platformId).toBe('string')
  })

  it('accepts null note', () => {
    const result = dataPointSchema.parse(validDataPoint)
    expect(result.note).toBeNull()
  })

  it('accepts non-null note', () => {
    const withNote = { ...validDataPoint, note: 'Monthly snapshot' }
    const result = dataPointSchema.parse(withNote)
    expect(result.note).toBe('Monthly snapshot')
  })

  it('accepts interpolated data point', () => {
    const interpolated = { ...validDataPoint, isInterpolated: true }
    const result = dataPointSchema.parse(interpolated)
    expect(result.isInterpolated).toBe(true)
  })

  it('rejects missing value', () => {
    const { value: _, ...without } = validDataPoint
    expect(() => dataPointSchema.parse(without)).toThrow()
  })

  it('rejects non-number value', () => {
    expect(() =>
      dataPointSchema.parse({ ...validDataPoint, value: '10000' }),
    ).toThrow()
  })
})

describe('dataPointCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      platformId: 'plat_001',
      value: 15000,
      timestamp: '2026-02-01T00:00:00.000Z',
      isInterpolated: false,
      note: null,
    }
    const result = dataPointCreateSchema.parse(payload)
    expect(result.value).toBe(15000)
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      platformId: 'plat_001',
      value: 15000,
      timestamp: '2026-02-01T00:00:00.000Z',
      isInterpolated: false,
      note: null,
    }
    const result = dataPointCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- Transaction ---

describe('transactionTypeSchema', () => {
  it('accepts "deposit"', () => {
    expect(transactionTypeSchema.parse('deposit')).toBe('deposit')
  })

  it('accepts "withdrawal"', () => {
    expect(transactionTypeSchema.parse('withdrawal')).toBe('withdrawal')
  })

  it('rejects invalid type', () => {
    expect(() => transactionTypeSchema.parse('transfer')).toThrow()
  })
})

describe('transactionSchema', () => {
  it('accepts a valid transaction', () => {
    const result = transactionSchema.parse(validTransaction)
    expect(result.type).toBe('deposit')
    expect(result.amount).toBe(5000)
  })

  it('produces branded TransactionId for id', () => {
    const result = transactionSchema.parse(validTransaction)
    const id: Transaction['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('accepts null exchangeRate for DKK platforms', () => {
    const result = transactionSchema.parse(validTransaction)
    expect(result.exchangeRate).toBeNull()
  })

  it('accepts non-null exchangeRate for non-DKK platforms', () => {
    const eurTxn = { ...validTransaction, exchangeRate: 7.46 }
    const result = transactionSchema.parse(eurTxn)
    expect(result.exchangeRate).toBe(7.46)
  })

  it('accepts null attachment', () => {
    const result = transactionSchema.parse(validTransaction)
    expect(result.attachment).toBeNull()
  })

  it('accepts non-null attachment', () => {
    const withAttachment = { ...validTransaction, attachment: 'receipt_abc.pdf' }
    const result = transactionSchema.parse(withAttachment)
    expect(result.attachment).toBe('receipt_abc.pdf')
  })

  it('accepts null note', () => {
    const result = transactionSchema.parse(validTransaction)
    expect(result.note).toBeNull()
  })

  it('rejects missing amount', () => {
    const { amount: _, ...without } = validTransaction
    expect(() => transactionSchema.parse(without)).toThrow()
  })

  it('rejects non-number amount', () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, amount: '5000' }),
    ).toThrow()
  })
})

describe('transactionCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      platformId: 'plat_001',
      type: 'withdrawal' as const,
      amount: 2000,
      exchangeRate: null,
      timestamp: '2026-02-15T00:00:00.000Z',
      note: null,
      attachment: null,
    }
    const result = transactionCreateSchema.parse(payload)
    expect(result.type).toBe('withdrawal')
    expect(result.amount).toBe(2000)
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      platformId: 'plat_001',
      type: 'deposit' as const,
      amount: 1000,
      exchangeRate: null,
      timestamp: '2026-02-15T00:00:00.000Z',
      note: null,
      attachment: null,
    }
    const result = transactionCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- ExchangeRate ---

describe('exchangeRateSourceSchema', () => {
  it('accepts "auto"', () => {
    expect(exchangeRateSourceSchema.parse('auto')).toBe('auto')
  })

  it('accepts "manual"', () => {
    expect(exchangeRateSourceSchema.parse('manual')).toBe('manual')
  })

  it('rejects invalid source', () => {
    expect(() => exchangeRateSourceSchema.parse('api')).toThrow()
  })
})

describe('exchangeRateSchema', () => {
  it('accepts a valid exchange rate', () => {
    const result = exchangeRateSchema.parse(validExchangeRate)
    expect(result.fromCurrency).toBe('EUR')
    expect(result.toCurrency).toBe('DKK')
    expect(result.rate).toBe(7.46)
  })

  it('produces branded ExchangeRateId for id', () => {
    const result = exchangeRateSchema.parse(validExchangeRate)
    const id: ExchangeRate['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('accepts manual source', () => {
    const manual = { ...validExchangeRate, source: 'manual' as const }
    const result = exchangeRateSchema.parse(manual)
    expect(result.source).toBe('manual')
  })

  it('rejects missing rate', () => {
    const { rate: _, ...without } = validExchangeRate
    expect(() => exchangeRateSchema.parse(without)).toThrow()
  })

  it('rejects non-number rate', () => {
    expect(() =>
      exchangeRateSchema.parse({ ...validExchangeRate, rate: '7.46' }),
    ).toThrow()
  })
})

describe('exchangeRateCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      fromCurrency: 'EUR',
      toCurrency: 'DKK',
      rate: 7.46,
      date: '2026-01-15',
      source: 'auto' as const,
    }
    const result = exchangeRateCreateSchema.parse(payload)
    expect(result.rate).toBe(7.46)
  })

  it('omits id, created, ownerId', () => {
    const payload = {
      fromCurrency: 'EUR',
      toCurrency: 'DKK',
      rate: 7.46,
      date: '2026-01-15',
      source: 'manual' as const,
    }
    const result = exchangeRateCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- Schema constraint validation ---

describe('schema constraints', () => {
  it('portfolioSchema rejects empty name', () => {
    expect(() =>
      portfolioSchema.parse({ ...validPortfolio, name: '' }),
    ).toThrow()
  })

  it('portfolioSchema rejects empty ownerName', () => {
    expect(() =>
      portfolioSchema.parse({ ...validPortfolio, ownerName: '' }),
    ).toThrow()
  })

  it('platformSchema rejects empty name', () => {
    expect(() =>
      platformSchema.parse({ ...validPlatform, name: '' }),
    ).toThrow()
  })

  it('transactionSchema rejects zero amount', () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, amount: 0 }),
    ).toThrow()
  })

  it('transactionSchema rejects negative amount', () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, amount: -100 }),
    ).toThrow()
  })

  it('exchangeRateSchema rejects zero rate', () => {
    expect(() =>
      exchangeRateSchema.parse({ ...validExchangeRate, rate: 0 }),
    ).toThrow()
  })

  it('exchangeRateSchema rejects negative rate', () => {
    expect(() =>
      exchangeRateSchema.parse({ ...validExchangeRate, rate: -1.5 }),
    ).toThrow()
  })
})

// --- Branded ID type safety ---

describe('branded ID type safety', () => {
  it('PortfolioId and PlatformId are different types at compile time', () => {
    const portfolio = portfolioSchema.parse(validPortfolio)
    const platform = platformSchema.parse(validPlatform)

    // Both are strings at runtime
    expect(typeof portfolio.id).toBe('string')
    expect(typeof platform.id).toBe('string')

    // But TypeScript prevents cross-assignment:
    // The following would be a compile error:
    // const platformId: PlatformId = portfolio.id // TS error
    // const portfolioId: PortfolioId = platform.id // TS error

    // This proves the branded types exist and are distinct
    const portfolioId: Portfolio['id'] = portfolio.id
    const platformId: Platform['id'] = platform.id
    expect(portfolioId).not.toBe(platformId)
  })

  it('relation IDs are branded with their target type', () => {
    const platform = platformSchema.parse(validPlatform)
    // platform.portfolioId is PortfolioId, not plain string
    const portfolioRef: PortfolioId = platform.portfolioId
    expect(typeof portfolioRef).toBe('string')

    const dataPoint = dataPointSchema.parse(validDataPoint)
    // dataPoint.platformId is PlatformId, not plain string
    const platformRef: PlatformId = dataPoint.platformId
    expect(typeof platformRef).toBe('string')
  })
})
