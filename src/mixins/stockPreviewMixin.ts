import { defineComponent } from 'vue';
import { useStore } from '../store';
import { ICarWagon, ILocomotive, IStock, IVehicle } from '../types';
import { isLocomotive } from '../utils/vehicleUtils';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  computed: {},

  methods: {
    previewStock(stock: IStock) {
      if (this.store.chosenVehicle?.imageSrc != stock.imgSrc) this.store.imageLoading = true;

      if (stock.isLoco) {
        const chosenLoco = this.store.locoDataList.find((v) => v.type == stock.type) || null;
        this.store.chosenVehicle = chosenLoco;
        this.store.chosenLoco = chosenLoco;
        this.store.chosenCargo = null;
        this.store.chosenLocoPower = stock.useType;
      } else {
        const chosenCar = this.store.carDataList.find((v) => v.type == stock.type) || null;
        this.store.chosenVehicle = chosenCar;
        this.store.chosenCar = chosenCar;

        this.store.chosenCargo = stock.cargo || null;
        this.store.chosenCarUseType = stock.useType;
      }
    },

    previewLocomotive(loco: ILocomotive) {
      this.store.chosenLoco = loco;
      this.store.chosenVehicle = loco;
      this.store.chosenLocoPower = loco.power;
    },

    previewCarWagon(carWagon: ICarWagon) {
      this.store.chosenCar = carWagon;
      this.store.chosenCarUseType = carWagon.useType;
      this.store.chosenVehicle = carWagon;

      this.store.chosenCargo = null;
    },

    previewVehicle(vehicle: IVehicle) {
      if (isLocomotive(vehicle)) this.previewLocomotive(vehicle);
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
