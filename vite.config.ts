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
      scss: { additionalData: `@use '@/styles/global';`, silenceDeprecations: ['legacy-js-api'] },
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

      includeAssets: ['/images/*.{png,svg,jpg}', '/fonts/*.{woff,woff2,ttf}'],

      devOptions: { suppressWarnings: true, enabled: true },

      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,jpg,png,svg,img,woff,woff2}'],

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
