import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  build: {
    outDir: '../../out/renderer/main_window',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: false
  }
});


