import { IStore } from './types';
import { defineStore } from 'pinia';
import { carDataList, chosenRealStock, isTrainPassenger, locoDataList, maxStockSpeed, totalLength, totalMass } from './utils/vehicleUtils';


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

      readyStockList: {},

      swapVehicles: false,

      chosenStockListIndex: -1,
      chosenRealStockName: undefined,

      vehiclePreviewSrc: '',

      isRandomizerCardOpen: false,
      isRealStockListCardOpen: false,


    } as IStore),

  getters: {
    locoDataList: (state) => locoDataList(state),
    carDataList: (state) => carDataList(state),
    totalMass: (state) => totalMass(state),
    totalLength: (state) => totalLength(state),
    maxStockSpeed: (state) => maxStockSpeed(state),
    isTrainPassenger: (state) => isTrainPassenger(state),
    chosenRealStock: (state) => chosenRealStock(state)
  },
});


