import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';

const pinia = createPinia();

const updateSW = registerSW({
  onOfflineReady() {},
  
  onNeedRefresh() {
    console.log('Need refresh!');
  },
});

createApp(App).use(pinia).mount('#app');

