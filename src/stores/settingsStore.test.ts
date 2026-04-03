import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useSettingsStore.setState({
      dateFormat: 'yyyy-MM-dd',
      theme: 'light',
      demoMode: false,
      isHydrated: false,
    })
  })

  it('has correct initial state', () => {
    const state = useSettingsStore.getState()
    expect(state.dateFormat).toBe('yyyy-MM-dd')
    expect(state.theme).toBe('light')
    expect(state.demoMode).toBe(false)
    expect(state.isHydrated).toBe(false)
  })

  describe('hydrate', () => {
    it('sets all values and marks as hydrated', () => {
      useSettingsStore.getState().hydrate({
        dateFormat: 'dd/MM/yyyy',
        theme: 'dark',
        demoMode: true,
      })

      const state = useSettingsStore.getState()
      expect(state.dateFormat).toBe('dd/MM/yyyy')
      expect(state.theme).toBe('dark')
      expect(state.demoMode).toBe(true)
      expect(state.isHydrated).toBe(true)
    })

    it('sets isHydrated to true even with default values', () => {
      useSettingsStore.getState().hydrate({
        dateFormat: 'yyyy-MM-dd',
        theme: 'light',
        demoMode: false,
      })

      expect(useSettingsStore.getState().isHydrated).toBe(true)
    })
  })

  describe('setDateFormat', () => {
    it('updates dateFormat', () => {
      useSettingsStore.getState().setDateFormat('dd/MM/yyyy')
      expect(useSettingsStore.getState().dateFormat).toBe('dd/MM/yyyy')
    })

    it('updates back to default format', () => {
      useSettingsStore.getState().setDateFormat('dd/MM/yyyy')
      useSettingsStore.getState().setDateFormat('yyyy-MM-dd')
      expect(useSettingsStore.getState().dateFormat).toBe('yyyy-MM-dd')
    })
  })

  describe('setTheme', () => {
    it('updates theme to dark', () => {
      useSettingsStore.getState().setTheme('dark')
      expect(useSettingsStore.getState().theme).toBe('dark')
    })

    it('updates theme to light', () => {
      useSettingsStore.getState().setTheme('dark')
      useSettingsStore.getState().setTheme('light')
      expect(useSettingsStore.getState().theme).toBe('light')
    })
  })

  describe('setDemoMode', () => {
    it('enables demo mode', () => {
      useSettingsStore.getState().setDemoMode(true)
      expect(useSettingsStore.getState().demoMode).toBe(true)
    })

    it('disables demo mode', () => {
      useSettingsStore.getState().setDemoMode(true)
      useSettingsStore.getState().setDemoMode(false)
      expect(useSettingsStore.getState().demoMode).toBe(false)
    })
  })

  it('does not affect other state when updating a single field', () => {
    useSettingsStore.getState().hydrate({
      dateFormat: 'dd/MM/yyyy',
      theme: 'dark',
      demoMode: true,
    })

    useSettingsStore.getState().setDateFormat('yyyy-MM-dd')

    const state = useSettingsStore.getState()
    expect(state.dateFormat).toBe('yyyy-MM-dd')
    expect(state.theme).toBe('dark')
    expect(state.demoMode).toBe(true)
    expect(state.isHydrated).toBe(true)
  })
})
