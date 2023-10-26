import { defineComponent } from "vue";
import { useStore } from "../store";
import { ICargo, ICarWagon, ILocomotive, IStock, Vehicle } from "../types";
import { isLocomotive } from "../utils/vehicleUtils";

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
        isSponsorsOnly: vehicle.isSponsorsOnly,
        constructionType: vehicle.constructionType,
      };
    },

    addVehicle(vehicle: Vehicle | null, cargo?: ICargo | null) {
      if (!vehicle) return;

      const stock = this.getStockObject(vehicle, cargo);

      if (stock.isLoco && !this.store.stockList[0]?.isLoco)
        this.store.stockList.unshift(stock);
      else this.store.stockList.push(stock);
    },

    addLocomotive(loco: ILocomotive) {
      const stockObj = this.getStockObject(loco);

      if (this.store.stockList.length > 0 && !this.store.stockList[0].isLoco)
        this.store.stockList.unshift(stockObj);
      else this.store.stockList.push(stockObj);
    },

    addCarWagon(car: ICarWagon, cargo?: ICargo) {
      const stockObj = this.getStockObject(car, cargo);

      this.store.stockList.push(stockObj);
    },

    loadStockFromString(stockString: string) {
      const stockArray = stockString.trim().split(";");

      this.store.stockList.length = 0;
      this.store.chosenVehicle = null;
      this.store.chosenCar = null;
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;
      this.store.chosenStockListIndex = -1;

      this.store.swapVehicles = false;

      stockArray.forEach((type, i) => {
        let vehicle: Vehicle | null = null;
        let vehicleCargo: ICargo | null = null;

        if (/^(EU|EP|ET|SM|EN|2EN|SN)/.test(type)) {
          const [locoType, coldStart] = type.split(",");
          vehicle =
            this.store.locoDataList.find((loco) => loco.type == locoType) ||
            null;

          if (i == 0 && coldStart == "c") this.store.isColdStart = true;
        } else {
          const [carType, cargo] = type.split(":");
          vehicle =
            this.store.carDataList.find((car) => car.type == carType) || null;

          if (cargo)
            vehicleCargo =
              vehicle?.cargoList.find((c) => c.id == cargo) || null;
        }

        if (!vehicle) console.log("Brak pojazdu:", type);

        this.addVehicle(vehicle, vehicleCargo);
      });
    },
  },
});
