import { defineComponent } from 'vue';
import { useStore } from '../store';
import { IStock, Vehicle } from '../types';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  computed: {
    locoOptions() {
      return this.store.locoDataList
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((loco) => loco.power == this.store.chosenLocoPower);
    },

    carOptions() {
      return this.store.carDataList
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((car) => car.useType == this.store.chosenCarUseType);
    },
  },

  methods: {
    selectLocoType(locoTypeId: string) {
      this.store.chosenLocoPower = locoTypeId;
      this.store.chosenVehicle = this.locoOptions[0];
      this.store.chosenLoco = this.locoOptions[0];
    },

    selectCarWagonType(carWagonTypeId: string) {
      this.store.chosenCarUseType = carWagonTypeId;
      this.store.chosenVehicle = this.carOptions[0];
      this.store.chosenCar = this.carOptions[0];
      this.store.chosenCargo = null;
    },

    previewVehicleByType(type: 'loco' | 'car' | 'cargo') {
      this.$nextTick(() => {
        if (!this.store.chosenLoco && !this.store.chosenCar) return;

        this.store.chosenVehicle = type == 'loco' ? this.store.chosenLoco : this.store.chosenCar;

        this.store.chosenCargo =
          this.store.chosenCar?.cargoList.find((cargo) => cargo.id == this.store.chosenCargo?.id) || null;
      });
    },

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

    resetPreview() {
        this.store.chosenVehicle = null;
        this.store.chosenCar = null;
        this.store.chosenCargo = null;
        this.store.chosenLoco = null;
    }
  },
});



