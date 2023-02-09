import { defineComponent } from 'vue';
import { useStore } from '../store';
import { ICargo, ICarWagon, ILocomotive, IStock, Vehicle } from '../types';
import { isLocomotive } from '../utils/vehicleUtils';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  methods: {
    getStockId() {
      return `${Math.random().toString(36).slice(5)}`;
    },

    getStockObject(vehicle: Vehicle, cargo?: ICargo | null, count = 1): IStock {
      const isLoco = isLocomotive(vehicle);

      return {
        id: this.getStockId(),
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco,
        cargo: !isLoco && vehicle.loadable && cargo ? cargo : undefined,
        count,
        imgSrc: vehicle.imageSrc,
        useType: isLoco ? vehicle.power : vehicle.useType,
        supportersOnly: false,
      };
    },

    addVehicle(vehicle: Vehicle | null, cargo?: ICargo | null) {
      if (!vehicle) return;

      const stock = this.getStockObject(vehicle, cargo);

      if (stock.isLoco && !this.store.stockList[0]?.isLoco) this.store.stockList.unshift(stock);
      else this.store.stockList.push(stock);
    },

    addLocomotive(loco: ILocomotive) {
      // const previousStock =
      //   this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;
      // if (previousStock && previousStock.type == loco.type) {
      //   this.store.stockList[this.store.stockList.length - 1].count++;
      //   return;
      // }

      const stockObj = this.getStockObject(loco);

      if (this.store.stockList.length > 0 && !this.store.stockList[0].isLoco) this.store.stockList.unshift(stockObj);
      else this.store.stockList.push(stockObj);
    },

    addCarWagon(car: ICarWagon, cargo?: ICargo) {
      // const previousStock =
      //   this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;

      // if (previousStock && previousStock.type == car.type && previousStock.cargo?.id == cargo?.id) {
      //   this.store.stockList[this.store.stockList.length - 1].count++;

      //   return;
      // }

      const stockObj = this.getStockObject(car, cargo);

      this.store.stockList.push(stockObj);
    },

    loadStockFromString(stockString: string) {
      const stockArray = stockString.split(';');

      this.store.stockList.length = 0;
      this.store.chosenVehicle = null;
      this.store.chosenCar = null;
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;
      this.store.chosenStockListIndex = -1;

      this.store.swapVehicles = false;

      stockArray.forEach((type, i) => {
        let vehicle: Vehicle | null = null;
        if (i == 0) vehicle = this.store.locoDataList.find((loco) => loco.type == stockArray[0]) || null;
        else vehicle = this.store.carDataList.find((car) => car.type == type) || null;

        this.addVehicle(vehicle);
      });
    },
  },
});

