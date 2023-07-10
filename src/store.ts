import { IStore } from './types';
import { defineStore } from 'pinia';
import {
  acceptableMass,
  carDataList,
  chosenRealStock,
  isTrainPassenger,
  locoDataList,
  maxStockSpeed,
  totalLength,
  totalMass,
} from './utils/vehicleUtils';

export const useStore = defineStore({
  id: 'store',
  state: () =>
    ({
      chosenCar: null,
      chosenLoco: null,
      chosenCargo: null,
      chosenVehicle: null,

      showSupporter: false,
      imageLoading: false,

      chosenLocoPower: 'loco-e',
      chosenCarUseType: 'car-passenger',

      stockList: [],
      cargoOptions: [],

      readyStockList: [],

      swapVehicles: false,

      chosenStockListIndex: -1,
      chosenRealStockName: undefined,

      vehiclePreviewSrc: '',

      stockSectionMode: 'wiki-list',

      isRandomizerCardOpen: false,
      isRealStockListCardOpen: false,

      stockData: undefined,
    } as IStore),

  getters: {
    locoDataList: (state) => locoDataList(state),
    carDataList: (state) => carDataList(state),
    totalMass: (state) => totalMass(state),
    totalLength: (state) => totalLength(state),
    maxStockSpeed: (state) => maxStockSpeed(state),
    isTrainPassenger: (state) => isTrainPassenger(state),
    chosenRealStock: (state) => chosenRealStock(state),
    acceptableMass: (state) => acceptableMass(state),
  },

  actions: {
    async fetchStockInfoData() {
      const stockData = await (await fetch(`https://spythere.github.io/api/td2/data/stockInfo.json`)).json();
      this.stockData = stockData;
    },

    handleRouting() {
      switch (window.location.pathname) {
        case '/numgnr':
          this.stockSectionMode = 'number-generator';
          break;
        case '/stockgnr':
          this.stockSectionMode = 'stock-generator';
          break;
        default:
          break;
      }
    },
  },
});

