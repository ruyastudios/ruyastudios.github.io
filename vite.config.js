import { defineConfig } from 'vite';

const buildTime = Date.now();

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-${buildTime}.js`,
        chunkFileNames: `assets/[name]-${buildTime}.js`,
        assetFileNames: `assets/[name]-${buildTime}.[ext]`,
      },
    },
  },
});
