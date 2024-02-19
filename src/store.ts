import { IStockData, IStore } from './types';
import { defineStore } from 'pinia';
import {
  acceptableMass as acceptableWeight,
  carDataList,
  chosenRealStock,
  isTrainPassenger,
  locoDataList,
  maxStockSpeed,
  totalLength,
  totalWeight,
} from './utils/vehicleUtils';
import http from './http';

export const useStore = defineStore({
  id: 'store',
  state: () =>
    ({
      chosenCar: null,
      chosenLoco: null,
      chosenCargo: null,
      chosenVehicle: null,

      isColdStart: false,
      isDoubleManned: false,

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

      stockSectionMode: 'stock-list',

      isRandomizerCardOpen: false,
      isRealStockListCardOpen: false,

      stockData: undefined,

      lastFocusedElement: null,
    }) as IStore,

  getters: {
    locoDataList: (state) => locoDataList(state),
    carDataList: (state) => carDataList(state),
    vehicleDataList: (state) => [...locoDataList(state), ...carDataList(state)],
    totalWeight: (state) => totalWeight(state),
    totalLength: (state) => totalLength(state),
    maxStockSpeed: (state) => maxStockSpeed(state),
    isTrainPassenger: (state) => isTrainPassenger(state),
    chosenRealStock: (state) => chosenRealStock(state),
    acceptableWeight: (state) => acceptableWeight(state),

    stockSupportsColdStart: (state) => {
      if (state.stockList.length == 0) return false;
      if (!state.stockList[0].isLoco) return false;

      const headingLoco = state.stockList[0];

      return state.stockData?.props.find((stock) => stock.type == headingLoco.constructionType)?.coldStart ?? false;
    },

    stockSupportsDoubleManning: (state) => {
      if (state.stockList.length == 0) return false;
      if (!state.stockList[0].isLoco) return false;

      const headingLoco = state.stockList[0];

      return state.stockData?.props.find((stock) => stock.type == headingLoco.constructionType)?.doubleManned ?? false;
    },
  },

  actions: {
    async fetchStockInfoData() {
      const stockData = (await http.get<IStockData>('td2/data/stockInfo.json')).data;
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
        case '/vehicles':
          this.stockSectionMode = 'wiki-list';
          break;
        default:
          break;
      }
    },
  },
});
