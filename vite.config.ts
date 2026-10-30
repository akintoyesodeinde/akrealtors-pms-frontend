/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { buildSync } from 'esbuild';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function ensureTestLucideBundle(): string {
  const outFile = path.resolve(__dirname, 'node_modules/.tmp/lucide-react-test.mjs');
  if (!fs.existsSync(outFile)) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    buildSync({
      entryPoints: [path.resolve(__dirname, 'node_modules/lucide-react/dist/esm/lucide-react.js')],
      outfile: outFile,
      bundle: true,
      format: 'esm',
      external: ['react'],
      logLevel: 'silent',
    });
  }
  return outFile;
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias:
      mode === 'test'
        ? {
            'lucide-react': ensureTestLucideBundle(),
          }
        : undefined,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'axios'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    fileParallelism: false,
    testTimeout: 30000,
  },
}));
