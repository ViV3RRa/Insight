import { useState, useEffect } from 'react'
import { Share, Plus, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone) return

    // Check if dismissed this session
    if (sessionStorage.getItem('pwa-install-dismissed')) return

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    if (isIOSDevice) {
      // Show iOS instructions after a short delay
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Chrome: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Hide on successful install
    const appInstalledHandler = () => setShowPrompt(false)
    window.addEventListener('appinstalled', appInstalledHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', appInstalledHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') setShowPrompt(false)
      } catch (error) {
        console.warn('PWA install prompt failed:', error)
      } finally {
        setDeferredPrompt(null)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('pwa-install-dismissed', '1')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 right-3 left-3 z-50 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80">
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-xl border border-base-200 dark:border-base-700 p-4 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-base-300 hover:text-base-500 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-4 h-4 text-accent-600" />
          <span className="text-sm font-semibold text-base-900 dark:text-white">Install Insight</span>
        </div>

        {isIOS ? (
          <>
            <p className="text-xs text-base-400 mb-3">
              Add Insight to your home screen for the best experience:
            </p>
            <div className="space-y-2 text-xs text-base-500 dark:text-base-400">
              <div className="flex items-center gap-2">
                <Share className="w-3.5 h-3.5 shrink-0" />
                <span>Tap the <strong>Share</strong> button</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Select <strong>Add to Home Screen</strong></span>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-base-400 mb-3">
              Install Insight as an app for quick access and a better experience.
            </p>
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Install app
            </button>
          </>
        )}
      </div>
    </div>
  )
}
