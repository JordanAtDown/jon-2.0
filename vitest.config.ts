import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  test: {
    globals: true,
    testTimeout: 50000,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/'],
    },
    // Enable log for test
    env: {
      NODE_ENV: 'test',
      LEVEL: 'warn',
    },
  },
});
