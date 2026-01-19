import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.join(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@common': path.resolve(__dirname, 'src/common'),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // 如果端口被占用，报错而不是使用其他端口
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
});
