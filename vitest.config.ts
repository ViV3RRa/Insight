import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      include: ['**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          'src/test/**',
          '**/*.d.ts',
          'src/main.tsx',
          'vite.config.ts',
          'vitest.config.ts',
          'tailwind.config.*',
          'postcss.config.*',
        ],
        thresholds: {
          'src/utils/': {
            lines: 100,
          },
          'src/services/': {
            lines: 90,
          },
          'src/components/shared/': {
            lines: 90,
          },
          'src/stores/': {
            lines: 90,
          },
        },
      },
    },
  }),
)
