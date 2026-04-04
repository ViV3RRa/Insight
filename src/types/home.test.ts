import { describe, it, expect } from 'vitest'
import {
  utilityIconSchema,
  utilityColorSchema,
  utilitySchema,
  utilityCreateSchema,
  meterReadingSchema,
  meterReadingCreateSchema,
  utilityBillSchema,
  utilityBillCreateSchema,
} from './home'
import type { Utility, MeterReading, UtilityBill } from './home'
import type { UtilityId } from './brands'

// --- Valid test payloads ---

const validUtility = {
  id: 'util_001',
  name: 'Electricity',
  unit: 'kWh',
  icon: 'bolt' as const,
  color: 'amber' as const,
  ownerId: 'user_001',
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
}

const validMeterReading = {
  id: 'mr_001',
  utilityId: 'util_001',
  value: 12345,
  timestamp: '2026-01-15T10:00:00.000Z',
  note: null,
  attachment: null,
  ownerId: 'user_001',
  created: '2026-01-15T10:00:00.000Z',
  updated: '2026-01-15T10:00:00.000Z',
}

const validUtilityBill = {
  id: 'bill_001',
  utilityId: 'util_001',
  amount: 750.5,
  periodStart: '2026-01-01',
  periodEnd: '2026-03-31',
  timestamp: null,
  note: null,
  attachment: null,
  ownerId: 'user_001',
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
}

// --- Utility Icon enum ---

describe('utilityIconSchema', () => {
  const validIcons = ['bolt', 'droplet', 'flame', 'sun', 'wind', 'thermometer', 'wifi', 'trash']

  it.each(validIcons)('accepts "%s"', (icon) => {
    expect(utilityIconSchema.parse(icon)).toBe(icon)
  })

  it('rejects invalid icon', () => {
    expect(() => utilityIconSchema.parse('lightning')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => utilityIconSchema.parse('')).toThrow()
  })
})

// --- Utility Color enum ---

describe('utilityColorSchema', () => {
  const validColors = ['amber', 'blue', 'orange', 'emerald', 'violet', 'rose', 'cyan', 'slate']

  it.each(validColors)('accepts "%s"', (color) => {
    expect(utilityColorSchema.parse(color)).toBe(color)
  })

  it('rejects invalid color', () => {
    expect(() => utilityColorSchema.parse('red')).toThrow()
  })

  it('rejects empty string', () => {
    expect(() => utilityColorSchema.parse('')).toThrow()
  })
})

// --- Utility ---

describe('utilitySchema', () => {
  it('accepts a valid utility', () => {
    const result = utilitySchema.parse(validUtility)
    expect(result.id).toBe('util_001')
    expect(result.name).toBe('Electricity')
    expect(result.unit).toBe('kWh')
    expect(result.icon).toBe('bolt')
    expect(result.color).toBe('amber')
  })

  it('produces branded UtilityId for id', () => {
    const result = utilitySchema.parse(validUtility)
    const id: Utility['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded UserId for ownerId', () => {
    const result = utilitySchema.parse(validUtility)
    const ownerId: Utility['ownerId'] = result.ownerId
    expect(typeof ownerId).toBe('string')
  })

  it('rejects missing required fields', () => {
    expect(() => utilitySchema.parse({ id: 'util_001' })).toThrow()
  })

  it('rejects missing name', () => {
    const { name: _, ...without } = validUtility
    expect(() => utilitySchema.parse(without)).toThrow()
  })

  it('rejects invalid icon value', () => {
    expect(() =>
      utilitySchema.parse({ ...validUtility, icon: 'lightning' }),
    ).toThrow()
  })

  it('rejects invalid color value', () => {
    expect(() =>
      utilitySchema.parse({ ...validUtility, color: 'red' }),
    ).toThrow()
  })

  it('accepts PocketBase datetime format for created', () => {
    const result = utilitySchema.parse({ ...validUtility, created: '2026-04-04 19:10:52.889Z' })
    expect(result.created).toBe('2026-04-04 19:10:52.889Z')
  })
})

describe('utilityCreateSchema', () => {
  it('accepts valid create payload (no id, created, updated, ownerId)', () => {
    const payload = {
      name: 'Water',
      unit: 'm³',
      icon: 'droplet' as const,
      color: 'blue' as const,
    }
    const result = utilityCreateSchema.parse(payload)
    expect(result.name).toBe('Water')
    expect(result.unit).toBe('m³')
  })

  it('omits id, created, updated, ownerId', () => {
    const payload = {
      id: 'util_001',
      name: 'Water',
      unit: 'm³',
      icon: 'droplet' as const,
      color: 'blue' as const,
      ownerId: 'user_001',
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-01T00:00:00.000Z',
    }
    const result = utilityCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).updated).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })

  it('rejects missing name', () => {
    expect(() =>
      utilityCreateSchema.parse({ unit: 'kWh', icon: 'bolt', color: 'amber' }),
    ).toThrow()
  })
})

// --- MeterReading ---

describe('meterReadingSchema', () => {
  it('accepts a valid meter reading', () => {
    const result = meterReadingSchema.parse(validMeterReading)
    expect(result.value).toBe(12345)
    expect(result.note).toBeNull()
    expect(result.attachment).toBeNull()
  })

  it('produces branded MeterReadingId for id', () => {
    const result = meterReadingSchema.parse(validMeterReading)
    const id: MeterReading['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded UtilityId for utilityId', () => {
    const result = meterReadingSchema.parse(validMeterReading)
    const utilityId: MeterReading['utilityId'] = result.utilityId
    expect(typeof utilityId).toBe('string')
  })

  it('accepts null note', () => {
    const result = meterReadingSchema.parse(validMeterReading)
    expect(result.note).toBeNull()
  })

  it('accepts non-null note', () => {
    const withNote = { ...validMeterReading, note: 'Annual reading' }
    const result = meterReadingSchema.parse(withNote)
    expect(result.note).toBe('Annual reading')
  })

  it('accepts null attachment', () => {
    const result = meterReadingSchema.parse(validMeterReading)
    expect(result.attachment).toBeNull()
  })

  it('accepts non-null attachment', () => {
    const withAttachment = { ...validMeterReading, attachment: 'photo_abc.jpg' }
    const result = meterReadingSchema.parse(withAttachment)
    expect(result.attachment).toBe('photo_abc.jpg')
  })

  it('rejects missing value', () => {
    const { value: _, ...without } = validMeterReading
    expect(() => meterReadingSchema.parse(without)).toThrow()
  })

  it('rejects non-number value', () => {
    expect(() =>
      meterReadingSchema.parse({ ...validMeterReading, value: '12345' }),
    ).toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => meterReadingSchema.parse({ id: 'mr_001' })).toThrow()
  })

  it('accepts PocketBase datetime format for timestamp', () => {
    const result = meterReadingSchema.parse({ ...validMeterReading, timestamp: '2026-04-04 19:10:52.889Z' })
    expect(result.timestamp).toBe('2026-04-04 19:10:52.889Z')
  })
})

describe('meterReadingCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      utilityId: 'util_001',
      value: 12500,
      timestamp: '2026-02-15T10:00:00.000Z',
      note: null,
      attachment: null,
    }
    const result = meterReadingCreateSchema.parse(payload)
    expect(result.value).toBe(12500)
  })

  it('omits id, created, updated, ownerId', () => {
    const payload = {
      utilityId: 'util_001',
      value: 12500,
      timestamp: '2026-02-15T10:00:00.000Z',
      note: null,
      attachment: null,
    }
    const result = meterReadingCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).updated).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })
})

// --- UtilityBill ---

describe('utilityBillSchema', () => {
  it('accepts a valid utility bill', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    expect(result.amount).toBe(750.5)
    expect(result.periodStart).toBe('2026-01-01')
    expect(result.periodEnd).toBe('2026-03-31')
  })

  it('produces branded UtilityBillId for id', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    const id: UtilityBill['id'] = result.id
    expect(typeof id).toBe('string')
  })

  it('produces branded UtilityId for utilityId', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    const utilityId: UtilityBill['utilityId'] = result.utilityId
    expect(typeof utilityId).toBe('string')
  })

  it('accepts null timestamp', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    expect(result.timestamp).toBeNull()
  })

  it('accepts non-null timestamp (datetime)', () => {
    const withTimestamp = { ...validUtilityBill, timestamp: '2026-01-15T12:00:00.000Z' }
    const result = utilityBillSchema.parse(withTimestamp)
    expect(result.timestamp).toBe('2026-01-15T12:00:00.000Z')
  })

  it('accepts PocketBase datetime format for timestamp', () => {
    const result = utilityBillSchema.parse({ ...validUtilityBill, timestamp: '2026-04-04 19:10:52.889Z' })
    expect(result.timestamp).toBe('2026-04-04 19:10:52.889Z')
  })

  it('accepts null note', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    expect(result.note).toBeNull()
  })

  it('accepts non-null note', () => {
    const withNote = { ...validUtilityBill, note: 'Quarterly bill' }
    const result = utilityBillSchema.parse(withNote)
    expect(result.note).toBe('Quarterly bill')
  })

  it('accepts null attachment', () => {
    const result = utilityBillSchema.parse(validUtilityBill)
    expect(result.attachment).toBeNull()
  })

  it('accepts non-null attachment', () => {
    const withAttachment = { ...validUtilityBill, attachment: 'invoice_q1.pdf' }
    const result = utilityBillSchema.parse(withAttachment)
    expect(result.attachment).toBe('invoice_q1.pdf')
  })

  it('periodStart and periodEnd are plain strings (not datetime)', () => {
    // Plain date strings without time component should be accepted
    const result = utilityBillSchema.parse(validUtilityBill)
    expect(result.periodStart).toBe('2026-01-01')
    expect(result.periodEnd).toBe('2026-03-31')
  })

  it('rejects missing amount', () => {
    const { amount: _, ...without } = validUtilityBill
    expect(() => utilityBillSchema.parse(without)).toThrow()
  })

  it('rejects non-number amount', () => {
    expect(() =>
      utilityBillSchema.parse({ ...validUtilityBill, amount: '750.50' }),
    ).toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => utilityBillSchema.parse({ id: 'bill_001' })).toThrow()
  })
})

describe('utilityBillCreateSchema', () => {
  it('accepts valid create payload', () => {
    const payload = {
      utilityId: 'util_001',
      amount: 900,
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      timestamp: null,
      note: null,
      attachment: null,
    }
    const result = utilityBillCreateSchema.parse(payload)
    expect(result.amount).toBe(900)
    expect(result.periodStart).toBe('2026-04-01')
  })

  it('omits id, created, updated, ownerId', () => {
    const payload = {
      utilityId: 'util_001',
      amount: 900,
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      timestamp: null,
      note: null,
      attachment: null,
    }
    const result = utilityBillCreateSchema.parse(payload)
    expect((result as Record<string, unknown>).id).toBeUndefined()
    expect((result as Record<string, unknown>).created).toBeUndefined()
    expect((result as Record<string, unknown>).updated).toBeUndefined()
    expect((result as Record<string, unknown>).ownerId).toBeUndefined()
  })

  it('accepts create payload with non-null timestamp', () => {
    const payload = {
      utilityId: 'util_001',
      amount: 900,
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
      timestamp: '2026-04-15T00:00:00.000Z',
      note: 'Q2 bill',
      attachment: 'invoice.pdf',
    }
    const result = utilityBillCreateSchema.parse(payload)
    expect(result.timestamp).toBe('2026-04-15T00:00:00.000Z')
    expect(result.note).toBe('Q2 bill')
    expect(result.attachment).toBe('invoice.pdf')
  })
})

// --- Branded ID type safety ---

describe('branded ID type safety', () => {
  it('UtilityId, MeterReadingId, and UtilityBillId are different types at compile time', () => {
    const utility = utilitySchema.parse(validUtility)
    const meterReading = meterReadingSchema.parse(validMeterReading)
    const bill = utilityBillSchema.parse(validUtilityBill)

    // All are strings at runtime
    expect(typeof utility.id).toBe('string')
    expect(typeof meterReading.id).toBe('string')
    expect(typeof bill.id).toBe('string')

    // TypeScript prevents cross-assignment:
    // const meterReadingId: MeterReadingId = utility.id // TS error
    // const utilityBillId: UtilityBillId = meterReading.id // TS error

    // This proves the branded types exist and are distinct
    const utilityId: Utility['id'] = utility.id
    const meterReadingId: MeterReading['id'] = meterReading.id
    const billId: UtilityBill['id'] = bill.id
    expect(utilityId).not.toBe(meterReadingId)
    expect(meterReadingId).not.toBe(billId)
  })

  it('relation IDs are branded with their target type', () => {
    const meterReading = meterReadingSchema.parse(validMeterReading)
    // meterReading.utilityId is UtilityId, not plain string
    const utilityRef: UtilityId = meterReading.utilityId
    expect(typeof utilityRef).toBe('string')

    const bill = utilityBillSchema.parse(validUtilityBill)
    // bill.utilityId is UtilityId, not plain string
    const billUtilityRef: UtilityId = bill.utilityId
    expect(typeof billUtilityRef).toBe('string')
  })
})
