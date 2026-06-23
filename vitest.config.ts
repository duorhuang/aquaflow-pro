import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'ECC/**'],
    pool: 'threads',
    fileParallelism: true,
    maxWorkers: 4,
    isolate: true,
    // @ts-expect-error: Vitest 4 top-level pool config type mismatch
    threads: {
      singleThread: false,
      timeout: 300000, // 5 minutes timeout for worker startup
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
