<template>
  <section class="inputs-section">
    <div class="input inputs_loco">
      <div class="input_container">
        <h2 class="input_header">WYBIERZ POJAZDY / WAGONY</h2>

        <div class="input_list type">
          <select
            id="locomotives-list"
            v-model="store.chosenLoco"
            @focus="onVehicleSelect('loco')"
            @input="onVehicleSelect('loco')"
            @keydown.enter="addVehicle"
            @keydown.backspace="removeVehicle"
          >
            <option :value="null" disabled>Wybierz pojazd trakcyjny</option>
            <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
              {{ loco.type }}
            </option>
          </select>
        </div>

        <div class="input_list type">
          <select
            id="carwagons-list"
            v-model="store.chosenCar"
            @focus="onVehicleSelect('car')"
            @input="onVehicleSelect('car')"
            @keydown.enter="addVehicle"
            @keydown.backspace="removeVehicle"
          >
            <option :value="null" disabled>Wybierz wagon</option>

            <option v-for="car in carOptions" :value="car" :key="car.type">
              {{ car.type }}
            </option>
          </select>
        </div>

        <div class="input_list cargo">
          <select
            id="cargo-select"
            :disabled="
              (store.chosenCar && !store.chosenCar.loadable) ||
              (store.chosenCar && store.chosenCar.useType == 'car-passenger') ||
              !store.chosenCar
            "
            data-select="cargo"
            data-ignore-outside="1"
            v-model="store.chosenCargo"
            @focus="onVehicleSelect('car')"
            @input="onVehicleSelect('car')"
            @keydown.enter="addVehicle"
            @keydown.backspace="removeVehicle"
          >
            <option :value="null" v-if="!store.chosenCar || !store.chosenCar.loadable">brak dostępnych ładunków</option>
            <option :value="null" v-else>próżny</option>

            <option v-for="cargo in store.chosenCar?.cargoList" :value="cargo" :key="cargo.id">
              {{ cargo.id }}
            </option>
          </select>
        </div>

        <div class="input_actions">
          <button class="btn" @click="addVehicle">DODAJ NOWY</button>
          <button
            class="btn"
            @click="switchVehicles"
            :disabled="store.chosenStockListIndex == -1"
            :data-disabled="store.chosenStockListIndex == -1"
          >
            ZAMIEŃ ZA
            <b class="text--accent">
              {{ store.chosenStockListIndex == -1 ? '' : `${store.chosenStockListIndex + 1}.` }}
            </b>
          </button>

          <button class="btn" @click="setReadyStockList(true)"><b>REALNE ZESTAWIENIA</b></button>
          <ready-stock-list />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ReadyStockList from './ReadyStockList.vue';
import { IStock } from '../types';
import imageMixin from '../mixins/imageMixin';
import { useStore } from '../store';
import { isLocomotive } from '../utils/vehicleUtils';

export default defineComponent({
  components: {
    ReadyStockList,
  },

  mixins: [imageMixin],

  data: () => ({
    chosenLocomotiveType: '',
    chosenCarWagonType: '',
  }),

  setup() {
    const store = useStore();

    return {
      store,
    };
  },

  // mounted() {
  //   document.addEventListener('keydown', (ev) => {
  //     const keyName = ev.key.toLowerCase();
  //     if (keyName == 'enter') {
  //       ev.preventDefault();
  //       this.addVehicle();
  //     }

  //     if (keyName == 'backspace') {
  //       if (this.store.stockList.length == 0) return;

  //       const lastStock = this.store.stockList.slice(-1)[0];

  //       if (lastStock.count > 1) lastStock.count--;
  //       else this.store.stockList.splice(-1);
  //     }
  //   });
  // },

  computed: {
    locoOptions() {
      return this.store.locoDataList.sort((a, b) => (a.type > b.type ? 1 : -1));
    },

    carOptions() {
      return this.store.carDataList.sort((a, b) => (a.type > b.type ? 1 : -1));
    },
  },

  methods: {
    prepareSwapVehicles() {
      this.store.swapVehicles = true;
    },

    setReadyStockList(bool = false) {
      this.store.isRealStockListCardOpen = bool;
    },

    onVehicleSelect(type: 'loco' | 'car') {
      this.$nextTick(() => {
        if (!this.store.chosenLoco && !this.store.chosenCar) return;

        this.store.chosenVehicle = type == 'loco' ? this.store.chosenLoco : this.store.chosenCar;
      });
    },

    removeVehicle() {
      if (this.store.stockList.length == 0) return;

      const lastStock = this.store.stockList.slice(-1)[0];

      if (lastStock.count > 1) lastStock.count--;
      else this.store.stockList.splice(-1);
    },

    switchVehicles() {
      if (this.store.chosenStockListIndex == -1) return;

      const vehicle = this.store.chosenVehicle;

      if (!vehicle) return;

      const stockObj: IStock = {
        useType: isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: isLocomotive(vehicle),
        cargo:
          !isLocomotive(vehicle) && vehicle.loadable && this.store.chosenCargo ? this.store.chosenCargo : undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        supportersOnly: vehicle.supportersOnly,
      };

      this.store.stockList[this.store.chosenStockListIndex] = stockObj;
    },

    addVehicle() {
      const vehicle = this.store.chosenVehicle;

      if (!vehicle) return;

      const stockObj: IStock = {
        useType: isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: isLocomotive(vehicle),
        cargo:
          !isLocomotive(vehicle) && vehicle.loadable && this.store.chosenCargo ? this.store.chosenCargo : undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        supportersOnly: vehicle.supportersOnly,
      };

      const previousStock =
        this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;

      if (isLocomotive(vehicle) && previousStock && previousStock.type == vehicle.type) {
        this.store.stockList[this.store.stockList.length - 1].count++;
        return;
      }

      if (
        !isLocomotive(vehicle) &&
        previousStock &&
        previousStock.type == vehicle.type &&
        previousStock.cargo?.id == this.store.chosenCargo?.id
      ) {
        this.store.stockList[this.store.stockList.length - 1].count++;

        return;
      }

      if (isLocomotive(vehicle) && this.store.stockList.length > 0 && !this.store.stockList[0].isLoco)
        this.store.stockList.unshift(stockObj);
      else this.store.stockList.push(stockObj);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/global';

.inputs-section {
  display: flex;
  justify-content: space-between;

  grid-row: 1;
  grid-column: 1;

  &_car {
    &.disabled {
      opacity: 0.75;
      pointer-events: none;
    }
  }
}

.input {
  &_header {
    margin-bottom: 1em;
  }

  &_list {
    margin: 0.5em 0;
    display: flex;

    select:focus {
      border-color: $accentColor;
    }
  }

  &_list button {
    margin-left: 0.5em;
    font-weight: bold;

    &:hover img {
      border-color: $accentColor;
    }

    &:focus img {
      border-color: $accentColor;
    }

    img {
      border: 2px solid white;
      padding: 0.25em;

      height: 2.35em;

      vertical-align: middle;
    }
  }

  &_actions {
    display: flex;
    flex-wrap: wrap;

    button {
      margin: 0.5em 0.5em 0 0;
    }
  }
}

@media screen and (max-width: $breakpointMd) {
  .inputs-section {
    flex-direction: column;
  }

  .input {
    justify-content: center;

    margin: 1em 0;

    _header {
      text-align: center;
    }

    &_container > * {
      display: flex;
      justify-content: center;
    }
  }
}
</style>

