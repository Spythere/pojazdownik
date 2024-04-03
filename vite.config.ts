import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 2137,
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        suppressWarnings: true,
        enabled: true,
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,jpg,png,svg,img,woff,woff2}'],

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
            urlPattern: /^https:\/\/static.spythere.eu\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spythere-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // <== 1 day
              },
              cacheableResponse: {
                statuses: [200, 302],
              },
            },
          },
        ],
      },
    }),
  ],
});
