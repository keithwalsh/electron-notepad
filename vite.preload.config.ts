import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    sourcemap: true,
    target: 'node20',
    outDir: 'out/preload',
    lib: {
      entry: 'src/preload.ts',
      formats: ['cjs'],
      fileName: () => 'index.js'
    },
    rollupOptions: {
      external: ['electron', ...builtinModules]
    }
  }
});


