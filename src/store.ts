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
} from './types/common.types';
import { defineStore } from 'pinia';
import {
  acceptableWeight,
  carDataList,
  isTractionUnit,
  isTrainPassenger,
  locoDataList,
  maxStockSpeed,
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

    storageStockList: [] as IStock[][],

    swapVehicles: false,

    chosenStockListIndex: -1,

    vehiclePreviewSrc: '',

    isRandomizerCardOpen: false,
    isRealStockListCardOpen: false,

    vehiclesData: undefined as IVehicleData[] | undefined,

    lastFocusedElement: null as HTMLElement | null,

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

    stockSupportsColdStart: (state) => {
      if (state.stockList.length == 0) return false;

      if (!isTractionUnit(state.stockList[0].vehicleRef)) return false;
      else if (state.stockList.length > 1) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesData?.find((vehicle) => vehicle.name == headingLoco.vehicleRef.type)?.group
          .locoProps?.coldStart ?? false
      );
    },

    stockSupportsDoubleManning: (state) => {
      if (state.stockList.length == 0) return false;
      if (!isTractionUnit(state.stockList[0].vehicleRef)) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesData?.find((vehicle) => vehicle.name == headingLoco.vehicleRef.type)?.group
          .locoProps?.doubleManned ?? false
      );
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

    handleRouting() {
      if (window.location.search.includes('trainId=')) {
        const trainId = window.location.search;
      }
    },
  },
});
