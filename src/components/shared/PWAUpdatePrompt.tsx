import { useState, useEffect } from 'react'
import { RefreshCw, Download } from 'lucide-react'

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg)

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true)
                }
              })
            }
          })

          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
              setShowUpdatePrompt(true)
            }
          })

          if (reg.waiting) {
            setShowUpdatePrompt(true)
          }
        }
      })
    }
  }, [])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })
      } else {
        window.location.reload()
      }
    } catch {
      setIsUpdating(false)
    }
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80">
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-xl border border-base-200 dark:border-base-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-accent-600" />
          <span className="text-sm font-semibold text-base-900 dark:text-white">Update available</span>
        </div>
        <p className="text-xs text-base-400 mb-3">
          A new version of Insight is ready with improvements and fixes.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...</>
            ) : (
              <><RefreshCw className="w-3.5 h-3.5" /> Update now</>
            )}
          </button>
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="flex-1 px-3 py-2 text-xs font-medium text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
