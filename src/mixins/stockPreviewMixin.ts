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
      const vehicleRef = stock.vehicleRef;

      this.store.chosenVehicle = vehicleRef;

      if (isTractionUnit(vehicleRef)) {
        this.store.chosenLoco = vehicleRef;
        this.store.chosenCargo = null;
        this.store.chosenLocoGroup = vehicleRef.group as LocoGroupType;
      } else {
        this.store.chosenCar = vehicleRef;
        this.store.chosenCargo = stock.cargo || null;
        this.store.chosenCarGroup = vehicleRef.group as WagonGroupType;
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
