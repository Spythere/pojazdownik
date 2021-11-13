import { createApp } from "vue";
import App from "./App.vue";

import { Store, locoDataList, carDataList, totalLength, totalMass, maxAllowedSpeed, maxStockSpeed, isTrainPassenger, warnings } from "./store";

createApp(App)
    .provide('Store', Store)
    .provide('locoDataList', locoDataList)
    .provide('carDataList', carDataList)
    .provide('totalMass', totalMass)
    .provide('totalLength', totalLength)
    .provide('maxStockSpeed', maxStockSpeed)
    .provide('maxAllowedSpeed', maxAllowedSpeed)
    .provide('isTrainPassenger', isTrainPassenger)
    .provide('warnings', warnings)
    .mount("#app");
