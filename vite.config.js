import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  plugins: [
    {
      name: 'copy-cname',
      writeBundle() {
        const cnameSrc = path.resolve(__dirname, 'public/CNAME');
        const cnameDest = path.resolve(__dirname, 'docs/CNAME');
        if (fs.existsSync(cnameSrc)) {
          fs.copyFileSync(cnameSrc, cnameDest);
          console.log('✓ CNAME copied to docs/');
        }
      }
    }
  ]
});
