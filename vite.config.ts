import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ]
    }
  },
  resolve: { alias: { phaser: path.resolve(__dirname, 'node_modules/phaser/dist/phaser-arcade-physics.min.js') } }
});
