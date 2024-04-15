import { defineComponent } from 'vue';
import { useStore } from '../store';
import { ICarWagon, ILocomotive, IStock, IVehicle, LocoGroupType, WagonGroupType } from '../types';
import { isTractionUnit } from '../utils/vehicleUtils';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  computed: {},

  methods: {
    previewStock(stock: IStock) {
      if (stock.isLoco) {
        const chosenLoco = this.store.locoDataList.find((v) => v.type == stock.type) || null;
        this.store.chosenVehicle = chosenLoco;
        this.store.chosenLoco = chosenLoco;
        this.store.chosenCargo = null;
        this.store.chosenLocoGroup = stock.group as LocoGroupType;
      } else {
        const chosenCar = this.store.carDataList.find((v) => v.type == stock.type) || null;
        this.store.chosenVehicle = chosenCar;
        this.store.chosenCar = chosenCar;

        this.store.chosenCargo = stock.cargo || null;
        this.store.chosenCarGroup = stock.group as WagonGroupType;
      }
    },

    previewLocomotive(loco: ILocomotive) {
      this.store.chosenLoco = loco;
      this.store.chosenVehicle = loco;
      this.store.chosenLocoGroup = loco.group;
    },

    previewCarWagon(carWagon: ICarWagon) {
      this.store.chosenCar = carWagon;
      this.store.chosenCarGroup = carWagon.group;
      this.store.chosenVehicle = carWagon;

      this.store.chosenCargo = null;
    },

    previewVehicle(vehicle: IVehicle) {
      if (isTractionUnit(vehicle)) this.previewLocomotive(vehicle);
      else this.previewCarWagon(vehicle);
    },

    resetPreview() {
      this.store.chosenVehicle = null;
      this.store.chosenCar = null;
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;
    },
  },
});
