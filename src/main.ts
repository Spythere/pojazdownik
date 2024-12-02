import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import i18n from './i18n-setup';
import router from './router';
const pinia = createPinia();

createApp(App).use(pinia).use(i18n).use(router).mount('#app');
