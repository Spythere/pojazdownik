<template>
  <section class="inputs">
    <div class="input inputs_loco">
      <div class="input_container">
        <h2 class="input_header">WYBIERZ POJAZDY / WAGONY</h2>

        <div class="input_list type">
          <select
            id="locomotives-list"
            v-model="store.chosenLoco"
            @focus="onVehicleSelect('loco')"
            @input="onVehicleSelect('loco')"
          >
            <option :value="null" disabled>Wybierz pojazd trakcyjny</option>
            <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
              {{ loco.type }}
            </option>
          </select>

          <button class="btn" @click="addVehicle" title="Dodaj pojazd">DODAJ</button>
        </div>

        <div class="input_list type">
          <select
            id="carwagons-list"
            v-model="store.chosenCar"
            @focus="onVehicleSelect('car')"
            @input="onVehicleSelect('car')"
          >
            <option :value="null" disabled>Wybierz wagon</option>

            <option v-for="car in carOptions" :value="car" :key="car.type">
              {{ car.type }}
            </option>
          </select>
        </div>

        <div class="input_ready-stock">
          <button class="btn" @click="setReadyStockList(true)"><b>REALNE ZESTAWIENIA</b></button>
          <ready-stock-list />
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject, provide, ref } from 'vue';

import ReadyStockList from './ReadyStockList.vue';
import { IStore, ILocomotive, ICarWagon, IStock } from '../types';
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

    const isReadyStockListOpen = ref(false);

    provide('isReadyStockListOpen', isReadyStockListOpen);

    return {
      store,
      isReadyStockListOpen,
    };
  },

  mounted() {
    document.addEventListener('keydown', (ev) => {
      const keyName = ev.key.toLowerCase();
      if (keyName == 'enter') {
        ev.preventDefault();
        this.addVehicle();
      }

      if (keyName == 'backspace') {
        if (this.store.stockList.length == 0) return;

        const lastStock = this.store.stockList.slice(-1)[0];

        if (lastStock.count > 1) lastStock.count--;
        else this.store.stockList.splice(-1);
      }
    });
  },

  computed: {
    locoOptions() {
      return this.store.locoDataList
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .sort((a) => (a.supportersOnly ? 1 : -1));
    },

    carOptions() {
      return this.store.carDataList.sort((a, b) => (a.type > b.type ? 1 : -1)).sort((a) => (a.supportersOnly ? 1 : -1));
    },
  },

  methods: {
    prepareSwapVehicles() {
      this.store.swapVehicles = true;
    },

    setReadyStockList(bool = false) {
      this.isReadyStockListOpen = bool;
    },

    onVehicleSelect(type: 'loco' | 'car') {
      this.$nextTick(() => {
        if (!this.store.chosenLoco && !this.store.chosenCar) return;

        this.store.chosenVehicle = type == 'loco' ? this.store.chosenLoco : this.store.chosenCar;
      });
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

      if (this.store.chosenStockListIndex != -1) {
        let currentStock = this.store.stockList[this.store.chosenStockListIndex];

        if (isLocomotive(vehicle) && currentStock && currentStock.type == vehicle.type) {
          this.store.stockList[this.store.chosenStockListIndex].count++;
          return;
        }

        if (
          !isLocomotive(vehicle) &&
          currentStock &&
          currentStock.type == vehicle.type &&
          currentStock.cargo?.id == this.store.chosenCargo?.id
        ) {
          this.store.stockList[this.store.chosenStockListIndex].count++;

          return;
        }

        this.store.stockList[this.store.chosenStockListIndex] = stockObj;
        return;
      }

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

.inputs {
  display: flex;
  justify-content: space-between;

  &_car {
    &.disabled {
      opacity: 0.75;
      pointer-events: none;
    }
  }

  @media screen and (max-width: 800px) {
    flex-direction: column;
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

  @media screen and (max-width: 800px) {
    justify-content: center;

    margin: 1em 0;

    &_header {
      text-align: center;
    }

    &_container > * {
      display: flex;
      justify-content: center;
    }
  }
}
</style>

