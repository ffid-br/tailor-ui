import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// Sem plugin do Tailwind de propósito: o pacote não gera CSS utilitário
// (ver README, "Por que não embutimos Tailwind"). As classes ficam como texto
// no JS e o Tailwind do app as gera via `@source`.
export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'], exclude: ['src/**/*.test.*', 'src/test'], outDir: 'dist/types', entryRoot: 'src' }),
  ],
  publicDir: false,
  build: {
    lib: {
      entry: resolve('src/index.ts'),
      name: 'TailorUI',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'framer-motion': 'Motion',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
});
