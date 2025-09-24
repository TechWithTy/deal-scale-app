import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    isolate: true,
    include: [
      'lib/stores/user/_tests/**/*.spec.ts',
      'lib/stores/user/_tests/**/*.test.ts',
    ],
    setupFiles: ['lib/stores/user/_tests/_steps/setup.ts'],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
      "@root": path.resolve(rootDir, "."),
    },
  },
});
