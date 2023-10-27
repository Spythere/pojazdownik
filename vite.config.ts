import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 2137,
  },
  resolve: {
    alias: {
      $fonts: resolve('/fonts'),
      $images: resolve('/images'),
    },
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        suppressWarnings: true,
        enabled: true,
        type: 'classic',
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,img,woff,woff2}'],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rj.td2.info.pl\/dist\/img\/thumbnails\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'swdr-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [0, 200, 404],
              },
            },
          },
          {
            urlPattern: /^https:\/\/spythere.github.io\/api\/td2\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spythere-api-cache',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
