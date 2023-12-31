import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.spec.ts'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    coverage: {
      provider: 'v8',
      clean: true,
      all: false,
      cleanOnRerun: true,
      reporter: ['cobertura', 'text', 'html'],
      include: ['lib/*'],
    },
  },
});
