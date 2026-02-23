import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    // Required for TypeScript experimental decorators support
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    globals: true,
  },
})
