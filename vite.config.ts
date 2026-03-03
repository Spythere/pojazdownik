import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: { port: 2138 },
  preview: { port: 4138 },
  css: {
    preprocessorOptions: {
      scss: { silenceDeprecations: ['legacy-js-api'] },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',

      devOptions: { suppressWarnings: true, enabled: true },

      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,woff,woff2,ttf}', '**/*.{png,jpg,jpeg,svg,webp,gif}'],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.spythere\.eu\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'spythere-cache' },
          },
        ],
      },
    }),
  ],
});
