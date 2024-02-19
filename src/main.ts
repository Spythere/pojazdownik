import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import i18n from "./i18n-setup";
const pinia = createPinia();

createApp(App).use(pinia).use(i18n).mount("#app");
