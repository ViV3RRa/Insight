import pb from './pb'
import { settingsSchema, type Settings, type SettingsCreate } from '@/types/settings'
import { isNotFoundError } from './errors'

const DEFAULTS: SettingsCreate = {
  dateFormat: 'yyyy-MM-dd',
  theme: 'light',
  demoMode: false,
}

export async function getOrCreateSettings(): Promise<Settings> {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')

  try {
    const record = await pb.collection('settings').getFirstListItem(`userId="${userId}"`)
    return settingsSchema.parse(record)
  } catch (error: unknown) {
    if (!isNotFoundError(error)) {
      throw error
    }
    // No settings found — create with defaults
    const record = await pb.collection('settings').create({ ...DEFAULTS, userId })
    return settingsSchema.parse(record)
  }
}

export async function updateSettings(data: Partial<SettingsCreate>): Promise<Settings> {
  const userId = pb.authStore.model?.id
  if (!userId) throw new Error('Not authenticated')

  const existing = await pb.collection('settings').getFirstListItem(`userId="${userId}"`)
  const record = await pb.collection('settings').update(existing.id, data)
  return settingsSchema.parse(record)
}
