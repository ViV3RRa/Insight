import { create } from 'zustand'
import type { Settings } from '@/types/settings'

interface SettingsState {
  dateFormat: Settings['dateFormat']
  theme: Settings['theme']
  demoMode: Settings['demoMode']
  isHydrated: boolean
  hydrate: (settings: Pick<Settings, 'dateFormat' | 'theme' | 'demoMode'>) => void
  setDateFormat: (format: Settings['dateFormat']) => void
  setTheme: (theme: Settings['theme']) => void
  setDemoMode: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  dateFormat: 'yyyy-MM-dd',
  theme: 'light',
  demoMode: false,
  isHydrated: false,
  hydrate: (settings) => set({ ...settings, isHydrated: true }),
  setDateFormat: (dateFormat) => set({ dateFormat }),
  setTheme: (theme) => set({ theme }),
  setDemoMode: (demoMode) => set({ demoMode }),
}))
