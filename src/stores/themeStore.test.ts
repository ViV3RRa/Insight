import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store to default state
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('insight-theme')
  })

  it('has light theme as default', () => {
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('setTheme("dark") sets theme to dark and adds dark class', () => {
    useThemeStore.getState().setTheme('dark')

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme("light") sets theme to light and removes dark class', () => {
    useThemeStore.getState().setTheme('dark')
    useThemeStore.getState().setTheme('light')

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme switches from light to dark', () => {
    useThemeStore.getState().toggleTheme()

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleTheme switches from dark to light', () => {
    useThemeStore.getState().setTheme('dark')
    useThemeStore.getState().toggleTheme()

    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleTheme round-trips correctly', () => {
    const { toggleTheme } = useThemeStore.getState()
    toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
    toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
    toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('persists theme to localStorage', () => {
    useThemeStore.getState().setTheme('dark')

    const stored = JSON.parse(localStorage.getItem('insight-theme') ?? '{}')
    expect(stored.state.theme).toBe('dark')
  })
})
