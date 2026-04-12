import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/127\.0\.0\.1:8090\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pocketbase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400, // 24 hours
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Insight',
        short_name: 'Insight',
        description: 'Personal metrics platform',
        theme_color: '#161816',
        background_color: '#f0f2f0',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
