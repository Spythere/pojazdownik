import { createApp, Directive } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import {
  Store,
  isLocomotive,
  locoDataList,
  carDataList,
  totalLength,
  totalMass,
  maxAllowedSpeed,
  maxStockSpeed,
  isTrainPassenger,
  warnings,
} from './store';

const clickOutsideDirective: Directive = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };

    document.addEventListener('click', el.clickOutsideEvent);
  },
};

const pinia = createPinia();

createApp(App)
  .use(pinia)
//   .provide('Store', Store)
//   .provide('isLocomotive', isLocomotive)
//   .provide('locoDataList', locoDataList)
//   .provide('carDataList', carDataList)
//   .provide('totalMass', totalMass)
//   .provide('totalLength', totalLength)
//   .provide('maxStockSpeed', maxStockSpeed)
//   .provide('maxAllowedSpeed', maxAllowedSpeed)
//   .provide('isTrainPassenger', isTrainPassenger)
//   .provide('warnings', warnings)
//   .directive('click-outside', clickOutsideDirective)
  .mount('#app');

