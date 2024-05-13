import {
  IVehiclesData,
  ICarWagon,
  ILocomotive,
  ICargo,
  IVehicle,
  IStock,
  IRealComposition,
  LocoGroupType,
  WagonGroupType,
} from './types';
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

    stockSectionMode: 'stock-list',

    isRandomizerCardOpen: false,
    isRealStockListCardOpen: false,

    vehiclesData: undefined as IVehiclesData | undefined,

    lastFocusedElement: null as HTMLElement | null,
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

      return Object.keys(state.vehiclesData.realCompositions).reduce<IRealComposition[]>(
        (acc, key) => {
          const [type, number, ...name] = key.split(' ');

          const obj = {
            number: number.replace(/_/g, '/'),
            name: name.join(' '),
            stockString: state.vehiclesData!.realCompositions[key],
            type,
          };

          acc.push({
            stockId: `${obj.type} ${obj.number} ${obj.name}`,
            ...obj,
          });

          return acc;
        },
        []
      );
    },

    stockSupportsColdStart: (state) => {
      if (state.stockList.length == 0) return false;

      if (!isTractionUnit(state.stockList[0].vehicleRef)) return false;
      else if (state.stockList.length > 1) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesData?.vehicleProps.find(
          (stock) => stock.type == headingLoco.vehicleRef.constructionType
        )?.coldStart ?? false
      );
    },

    stockSupportsDoubleManning: (state) => {
      if (state.stockList.length == 0) return false;
      if (!isTractionUnit(state.stockList[0].vehicleRef)) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesData?.vehicleProps.find(
          (stock) => stock.type == headingLoco.vehicleRef.constructionType
        )?.doubleManned ?? false
      );
    },
  },

  actions: {
    async fetchVehiclesAPI() {
      try {
        const vehiclesData = (await http.get<IVehiclesData>('/vehicles')).data;
        this.vehiclesData = vehiclesData;
      } catch (error) {
        console.error(error);
      }
    },

    async setupAPIData() {
      await this.fetchVehiclesAPI();
      this.mergeBackendTranslations();
    },

    async mergeBackendTranslations() {
      if (!this.vehiclesData) return;

      i18n.global.mergeLocaleMessage('pl', this.vehiclesData.vehicleLocales.pl);
      i18n.global.mergeLocaleMessage('en', this.vehiclesData.vehicleLocales.en);
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
