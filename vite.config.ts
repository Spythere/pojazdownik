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

      workbox: {
        // globPatterns: ['**/*.{js,css,html,png,svg,img}'],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rj.td2.info.pl\/dist\/img\/thumbnails\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'swdr-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // <== 7 days
              },
              cacheableResponse: {
                statuses: [404],
              },
            },
          },
        ],
      },
    }),
  ],
});


