import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Unit tests are co-located as *.test.ts. Playwright's specs are *.spec.ts
    // under tests/, so the two suites never collide.
    include: ['{components,lib,app}/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
    pool: 'vmForks',
  },
})
