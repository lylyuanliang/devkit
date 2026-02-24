import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@devkit/shared': path.resolve(__dirname, '../shared/src'),
      '@devkit/kafka-tool': path.resolve(__dirname, '../tools/kafka-tool/src/index.ts'),
      '@devkit/core/backend': path.resolve(__dirname, './src/backend'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  optimizeDeps: {
    exclude: ['@tauri-apps/api'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    rollupOptions: {
      external: ['@tauri-apps/api', '@tauri-apps/api/tauri'],
      output: {
        globals: {
          '@tauri-apps/api': 'window.__TAURI__',
          '@tauri-apps/api/tauri': 'window.__TAURI__',
        },
      },
    },
  },
  root: '.',
})


