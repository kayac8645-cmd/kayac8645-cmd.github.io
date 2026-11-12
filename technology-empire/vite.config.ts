import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Served from a GitHub Pages subfolder (…github.io/empire/), so all asset
// URLs are relative. Production build lands in ../empire next to this project.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../empire',
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'd3', test: /node_modules[\\/](d3-[a-z-]+|internmap|topojson-client|world-atlas)[\\/]/, priority: 30 },
            { name: 'recharts', test: /node_modules[\\/](recharts|victory-vendor|decimal\.js-light|es-toolkit|immer|reselect|@reduxjs|react-redux|redux|eventemitter3|clsx|tiny-invariant)[\\/]/, priority: 20 },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    testTimeout: 60_000,
  },
})
