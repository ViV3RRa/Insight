import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      console.log('SW registered:', registration.scope)

      // Check for updates immediately
      await registration.update()

      // Poll for updates every 60 seconds
      let updateFailCount = 0
      setInterval(() => {
        registration.update().catch((error) => {
          updateFailCount++
          if (updateFailCount === 1 || updateFailCount % 10 === 0) {
            console.warn(`SW update check failed (attempt ${updateFailCount}):`, error)
          }
        })
      }, 60_000)
    } catch (error) {
      console.warn('SW registration failed:', error)
    }
  })
}
