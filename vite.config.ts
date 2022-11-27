import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // workbox: {
      //   globPatterns: ['**/*.{js,css,html,png,svg,img}'],
      //   runtimeCaching: [
      //     {
      //       urlPattern: new RegExp(`^https://spythere.github.io/api\/.*`),
      //       handler: 'NetworkFirst',
      //       options: {
      //         cacheName: 'github-api-cache',
      //         expiration: {
      //           maxEntries: 400,
      //           maxAgeSeconds: 60 * 60 * 24 * 30, // <== 30 days
      //         },
      //         cacheableResponse: {
      //           statuses: [0, 200],
      //         },
      //       },
      //     },
      //   ],
      // },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});

