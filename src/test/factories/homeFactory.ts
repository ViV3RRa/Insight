import { generateId, buildEntity } from './base'
import type { Utility, MeterReading, UtilityBill } from '@/types/home'

const utilityDefaults: Utility = {
  id: '' as Utility['id'],
  name: 'Electricity',
  unit: 'kWh',
  icon: 'bolt',
  color: 'amber',
  ownerId: '' as Utility['ownerId'],
  created: '2026-01-01T00:00:00.000Z',
}

export function buildUtility(overrides?: Partial<Utility>): Utility {
  return buildEntity(
    {
      ...utilityDefaults,
      id: generateId() as Utility['id'],
      ownerId: (overrides?.ownerId ?? 'user_001') as Utility['ownerId'],
    },
    overrides,
  )
}

const meterReadingDefaults: MeterReading = {
  id: '' as MeterReading['id'],
  utilityId: '' as MeterReading['utilityId'],
  value: 1234,
  timestamp: '2026-01-15T10:00:00.000Z',
  note: null,
  attachment: null,
  ownerId: '' as MeterReading['ownerId'],
  created: '2026-01-15T10:00:00.000Z',
}

export function buildMeterReading(overrides?: Partial<MeterReading>): MeterReading {
  return buildEntity(
    {
      ...meterReadingDefaults,
      id: generateId() as MeterReading['id'],
      utilityId: (overrides?.utilityId ?? generateId()) as MeterReading['utilityId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as MeterReading['ownerId'],
    },
    overrides,
  )
}

const utilityBillDefaults: UtilityBill = {
  id: '' as UtilityBill['id'],
  utilityId: '' as UtilityBill['utilityId'],
  amount: 500,
  periodStart: '2026-01-01',
  periodEnd: '2026-01-31',
  timestamp: null,
  note: null,
  attachment: null,
  ownerId: '' as UtilityBill['ownerId'],
  created: '2026-01-01T00:00:00.000Z',
}

export function buildUtilityBill(overrides?: Partial<UtilityBill>): UtilityBill {
  return buildEntity(
    {
      ...utilityBillDefaults,
      id: generateId() as UtilityBill['id'],
      utilityId: (overrides?.utilityId ?? generateId()) as UtilityBill['utilityId'],
      ownerId: (overrides?.ownerId ?? 'user_001') as UtilityBill['ownerId'],
    },
    overrides,
  )
}
