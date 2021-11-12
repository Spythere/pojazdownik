import { createApp } from "vue";
import App from "./App.vue";

import { ICargo, ICarWagon, ILocomotive, IStock, IStore } from "./types";
import { reactive } from "@vue/reactivity";

const Store: IStore = reactive({
    chosenCar: null as ICarWagon | null,
    chosenLoco: null as ILocomotive | null,
    chosenCargo: null as ICargo | null,

    showSupporter: false,
    imageLoading: false,

    chosenLocoPower: "loco-e",
    chosenCarUseType: "car-passenger",

    stockList: [] as IStock[],
    cargoOptions: [] as any[][],
})

createApp(App)
    .provide('Store', Store)
    .mount("#app");
