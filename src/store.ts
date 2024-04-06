import {
  IVehiclesAPI,
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
  isTrainPassenger,
  locoDataList,
  maxStockSpeed,
  totalLength,
  totalWeight,
} from './utils/vehicleUtils';
import http from './http';
import i18n from './i18n-setup';

export const useStore = defineStore({
  id: 'store',
  state: () => ({
    chosenCar: null as ICarWagon | null,
    chosenLoco: null as ILocomotive | null,
    chosenCargo: null as ICargo | null,
    chosenVehicle: null as IVehicle | null,

    isColdStart: false,
    isDoubleManned: false,

    imageLoading: false,

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

    vehiclesAPIData: undefined as IVehiclesAPI | undefined,

    lastFocusedElement: null as HTMLElement | null,
  }),

  getters: {
    locoDataList: (state) => locoDataList(state.vehiclesAPIData),
    carDataList: (state) => carDataList(state.vehiclesAPIData),
    vehicleDataList: (state) => [
      ...locoDataList(state.vehiclesAPIData),
      ...carDataList(state.vehiclesAPIData),
    ],
    totalWeight: (state) => totalWeight(state.stockList),
    totalLength: (state) => totalLength(state.stockList),
    maxStockSpeed: (state) => maxStockSpeed(state.stockList),
    isTrainPassenger: (state) => isTrainPassenger(state.stockList),
    acceptableWeight: (state) => acceptableWeight(state.stockList),

    realCompositionList: (state) => {
      if (!state.vehiclesAPIData) return [];

      return Object.keys(state.vehiclesAPIData.realCompositions).reduce<IRealComposition[]>(
        (acc, key) => {
          const [type, number, ...name] = key.split(' ');

          const obj = {
            number: number.replace(/_/g, '/'),
            name: name.join(' '),
            stockString: state.vehiclesAPIData!.realCompositions[key],
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
      if (!state.stockList[0].isLoco) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesAPIData?.vehicleProps.find(
          (stock) => stock.type == headingLoco.constructionType
        )?.coldStart ?? false
      );
    },

    stockSupportsDoubleManning: (state) => {
      if (state.stockList.length == 0) return false;
      if (!state.stockList[0].isLoco) return false;

      const headingLoco = state.stockList[0];

      return (
        state.vehiclesAPIData?.vehicleProps.find(
          (stock) => stock.type == headingLoco.constructionType
        )?.doubleManned ?? false
      );
    },
  },

  actions: {
    async fetchVehiclesAPI() {
      try {
        const vehiclesData = (await http.get<IVehiclesAPI>('/vehiclesData')).data;
        this.vehiclesAPIData = vehiclesData;

        console.log(vehiclesData);
      } catch (error) {
        console.error(error);
      }
    },

    async setupAPIData() {
      await this.fetchVehiclesAPI();
      this.mergeBackendTranslations();
    },

    async mergeBackendTranslations() {
      if (!this.vehiclesAPIData) return;

      i18n.global.mergeLocaleMessage('pl', this.vehiclesAPIData.vehicleLocales.pl);
      i18n.global.mergeLocaleMessage('en', this.vehiclesAPIData.vehicleLocales.en);
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
