import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@processbridge/shared': resolve(__dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'dist',
  },
});
