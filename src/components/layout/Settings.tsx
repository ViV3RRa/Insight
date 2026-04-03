import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrCreateSettings, updateSettings } from '@/services/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { useThemeStore } from '@/stores/themeStore'
import type { Settings as SettingsType } from '@/types/settings'

const DATE_FORMATS = ['yyyy-MM-dd', 'dd/MM/yyyy'] as const

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked
          ? 'bg-accent-600 dark:bg-accent-500'
          : 'bg-base-200 dark:bg-base-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function Settings() {
  const queryClient = useQueryClient()
  const settingsStore = useSettingsStore()
  const themeStore = useThemeStore()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getOrCreateSettings,
  })

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  // Hydrate settings store when data arrives
  useEffect(() => {
    if (settings) {
      settingsStore.hydrate({
        dateFormat: settings.dateFormat,
        theme: settings.theme,
        demoMode: settings.demoMode,
      })
    }
  }, [settings]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleDateFormatChange(format: SettingsType['dateFormat']) {
    settingsStore.setDateFormat(format)
    mutation.mutate({ dateFormat: format })
  }

  function handleThemeChange(isDark: boolean) {
    const theme = isDark ? 'dark' : 'light'
    settingsStore.setTheme(theme)
    themeStore.setTheme(theme)
    mutation.mutate({ theme })
  }

  function handleDemoModeChange(enabled: boolean) {
    settingsStore.setDemoMode(enabled)
    mutation.mutate({ demoMode: enabled })
  }

  if (isLoading) {
    return (
      <div data-testid="settings-loading" className="space-y-4">
        <div className="h-8 w-32 bg-base-200 dark:bg-base-700 rounded animate-pulse" />
        <div className="h-48 bg-base-200 dark:bg-base-700 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const currentTheme = settingsStore.theme

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6 text-base-900 dark:text-white">
        Settings
      </h1>

      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-5 space-y-5">
        {/* Date format */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-base-900 dark:text-white">
            Date format
          </span>
          <div className="flex rounded-lg bg-base-100 dark:bg-base-700 p-0.5">
            {DATE_FORMATS.map((format) => (
              <button
                key={format}
                onClick={() => handleDateFormatChange(format)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  settingsStore.dateFormat === format
                    ? 'bg-white dark:bg-base-600 shadow-sm text-base-900 dark:text-white'
                    : 'text-base-400'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-base-100 dark:border-base-700" />

        {/* Theme */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-base-900 dark:text-white">
            Dark mode
          </span>
          <Toggle
            checked={currentTheme === 'dark'}
            onChange={handleThemeChange}
            label="Dark mode"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-base-100 dark:border-base-700" />

        {/* Home currency */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-base-900 dark:text-white">
            Home currency
          </span>
          <span className="text-sm text-base-500 dark:text-base-400">DKK</span>
        </div>

        {/* Divider */}
        <div className="border-t border-base-100 dark:border-base-700" />

        {/* Demo mode */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-base-900 dark:text-white">
            Demo mode
          </span>
          <Toggle
            checked={settingsStore.demoMode}
            onChange={handleDemoModeChange}
            label="Demo mode"
          />
        </div>
      </div>
    </div>
  )
}
