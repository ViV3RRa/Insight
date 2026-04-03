import { generateId, buildEntity } from './base'
import type { Settings } from '@/types/settings'

const settingsDefaults: Settings = {
  id: '',
  userId: '',
  dateFormat: 'yyyy-MM-dd',
  theme: 'light',
  demoMode: false,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-01-01T00:00:00.000Z',
}

/** Builds a valid Settings test object with sensible defaults */
export function buildSettings(overrides?: Partial<Settings>): Settings {
  return buildEntity(
    {
      ...settingsDefaults,
      id: generateId(),
      userId: generateId(),
    },
    overrides,
  )
}
