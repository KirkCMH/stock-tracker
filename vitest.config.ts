import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'composables/**/*.ts',
        'server/utils/**/*.ts',
        'server/services/finmind.ts',
      ],
      // Thresholds cover pure functions only; Nuxt composable wrappers
      // and HTTP functions require integration tests (not counted here).
      thresholds: {
        lines: 45,
        functions: 35,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(process.cwd(), '.'),
    },
  },
})
