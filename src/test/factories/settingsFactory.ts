import { generateId, buildEntity } from './base'

export interface Settings {
  id: string
  userId: string
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY'
  theme: 'light' | 'dark'
  demoMode: boolean
  created: string
  updated: string
}

const settingsDefaults: Settings = {
  id: '',
  userId: '',
  dateFormat: 'YYYY-MM-DD',
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
