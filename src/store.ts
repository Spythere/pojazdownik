import {
  IVehiclesAPIResponse,
  ICarWagon,
  ILocomotive,
  ICargo,
  IVehicle,
  IStock,
  IRealComposition,
  LocoGroupType,
  WagonGroupType,
  IVehicleData,
  StorageStockEntry,
} from './types/common.types';
import { defineStore } from 'pinia';
import {
  acceptableWeight,
  carDataList,
  isTractionUnit,
  isTrainPassenger,
  locoDataList,
  maxStockSpeed,
  stockSupportsColdStart,
  stockSupportsDoubleManning,
  totalLength,
  totalWeight,
} from './utils/vehicleUtils';

import i18n from './i18n-setup';
import http from './http';

import realCompositionsJSON from './data/realCompositions.json';

export const useStore = defineStore({
  id: 'store',
  state: () => ({
    chosenCar: null as ICarWagon | null,
    chosenLoco: null as ILocomotive | null,
    chosenCargo: null as ICargo | null,
    chosenVehicle: null as IVehicle | null,

    isColdStart: false,
    isDoubleManned: false,

    chosenLocoGroup: 'loco-electric' as LocoGroupType,
    chosenCarGroup: 'wagon-passenger' as WagonGroupType,

    stockList: [] as IStock[],
    cargoOptions: [] as any[][],

    swapVehicles: false,

    chosenStockListIndex: -1,

    vehiclePreviewSrc: '',

    isRandomizerCardOpen: false,
    isRealStockListCardOpen: false,

    vehiclesData: undefined as IVehicleData[] | undefined,

    lastFocusedElement: null as HTMLElement | null,

    storageStockData: {} as Record<string, StorageStockEntry>,
    chosenStorageStockName: '',

    compatibleSimulatorVersion: '2024.3.1',
  }),

  getters: {
    locoDataList: (state) => locoDataList(state.vehiclesData),
    carDataList: (state) => carDataList(state.vehiclesData),
    vehicleDataList: (state) => [
      ...locoDataList(state.vehiclesData),
      ...carDataList(state.vehiclesData),
    ],
    totalWeight: (state) => totalWeight(state.stockList),
    totalLength: (state) => totalLength(state.stockList),
    maxStockSpeed: (state) => maxStockSpeed(state.stockList),
    isTrainPassenger: (state) => isTrainPassenger(state.stockList),
    acceptableWeight: (state) => acceptableWeight(state.stockList),

    stockSupportsColdStart: (state) => stockSupportsColdStart(state.stockList),
    stockSupportsDoubleManning: (state) => stockSupportsDoubleManning(state.stockList),

    stockString: (state) => {
      if (state.stockList.length == 0) return '';

      const coldStartActive = stockSupportsColdStart(state.stockList);
      const doubleManningActive = stockSupportsDoubleManning(state.stockList);

      return state.stockList
        .map((stock, i) => {
          let stockTypeStr =
            isTractionUnit(stock.vehicleRef) || !stock.cargo
              ? stock.vehicleRef.type
              : `${stock.vehicleRef.type}:${stock.cargo.id}`;

          if (i == 0)
            return `${stockTypeStr},${coldStartActive ? 'c' : ''}${doubleManningActive ? 'd' : ''}`;

          return stockTypeStr;
        })
        .join(';');
    },

    realCompositionList: (state) => {
      if (!state.vehiclesData) return [];

      return Object.keys(realCompositionsJSON).reduce<IRealComposition[]>((acc, key) => {
        const [type, number, ...name] = key.split(' ');

        const obj = {
          number: number.replace(/_/g, '/'),
          name: name.join(' '),
          stockString: realCompositionsJSON[key as keyof typeof realCompositionsJSON],
          type,
        };

        acc.push({
          stockId: `${obj.type} ${obj.number} ${obj.name}`,
          ...obj,
        });

        return acc;
      }, []);
    },
  },

  actions: {
    async fetchVehiclesAPI() {
      try {
        const vehiclesData = (await http.get<IVehiclesAPIResponse>('/api/getVehicles')).data;
        this.vehiclesData = vehiclesData;
      } catch (error) {
        console.error(error);
      }
    },

    async setupAPIData() {
      await this.fetchVehiclesAPI();
    },
  },
});
