<template>
  <ready-stock-list />

  <section class="inputs">
    <div class="input inputs_loco">
      <div class="input_container">
        <h2 class="input_header">LOKOMOTYWA / ZESP. TRAKCYJNY</h2>
        <div class="input_radio">
          <button
            v-for="label in locoLabels"
            :key="label.id"
            @click="onLocoPowerChange(label.id)"
            :class="{ checked: store.chosenLocoPower == label.id }"
            data-ignore-outside="1"
          >
            {{ label.title }}
          </button>
        </div>

        <div class="input_list type">
          <select
            id="loco-select"
            ref="loco-select"
            v-model="store.chosenLoco"
            @change="onLocoTypeChange"
            data-select="loco"
            data-ignore-outside="1"
          >
            <option :value="null" disabled>Wybierz pojazd z listy</option>
            <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
              {{ loco.supportersOnly ? '*S*' : '' }}
              {{ loco.type }}
            </option>
          </select>

          <button class="btn--add" @click="addVehicle" title="Dodaj pojazd">
            <img :src="icons.add" alt="add vehicle" data-ignore-outside="1" />
          </button>

          <!-- <button class="btn--swap" @click="prepareSwapVehicles" title="Zamień pojazdy">
            <img :src="icons.swap" alt="swap vehicle" />
          </button> -->
        </div>

        <div>
          <button class="btn" @click="setReadyStockList(true)"><b>REALNE ZESTAWIENIA</b></button>
        </div>

        <div class="input_checkbox">
          <button @click="onShowSupporterChange" :class="{ checked: this.store.showSupporter }" data-ignore-outside="1">
            Pokaż tylko pojazdy dla supporterów
          </button>
        </div>
      </div>
    </div>

    <div class="spacer"></div>

    <div class="input inputs_car">
      <div class="input_container">
        <h2 class="input_header">RODZAJ WAGONU</h2>
        <div class="input_radio">
          <button
            v-for="label in carLabels"
            :key="label.id"
            @click="onCarUseTypeChange(label.id)"
            :class="{ checked: store.chosenCarUseType == label.id }"
            data-ignore-outside="1"
          >
            {{ label.title }}
          </button>
        </div>

        <div class="input_list type">
          <select
            id="car-select"
            ref="car-select"
            v-model="store.chosenCar"
            @change="onCarTypeChange"
            data-select="car"
            data-ignore-outside="1"
          >
            <option :value="null" disabled>Wybierz wagon z listy</option>
            <option v-for="car in carOptions" :value="car" :key="car.type">
              {{ car.supportersOnly ? '*S*' : '' }}
              {{ car.type }}
            </option>
          </select>

          <button class="btn--add" @click="addVehicle" title="Dodaj pojazd">
            <img :src="icons.add" alt="add vehicle" data-ignore-outside="1" />
          </button>

          <!-- <button class="btn--swap" @click="prepareSwapVehicles" title="Zamień pojazdy">
            <img :src="icons.swap" alt="swap vehicle" />
          </button> -->
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
          >
            <option :value="null" v-if="!store.chosenCar || !store.chosenCar.loadable">brak dostępnych ładunków</option>
            <option :value="null" v-else>próżny</option>

            <option v-for="cargo in store.chosenCar?.cargoList" :value="cargo" :key="cargo.id">
              {{ cargo.id }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ICarWagon, ILocomotive, IStore } from '@/types';
import { defineComponent, inject, provide, ref } from 'vue';

import ReadyStockList from '@/components/ReadyStockList.vue';

export default defineComponent({
  components: {
    ReadyStockList,
  },
  setup() {
    const store = inject('Store') as IStore;

    const isReadyStockListOpen = ref(false);

    provide('isReadyStockListOpen', isReadyStockListOpen);

    return {
      store,
      isReadyStockListOpen,
      locoDataList: inject('locoDataList') as ILocomotive[],
      carDataList: inject('carDataList') as ICarWagon[],
      isTrainPassenger: inject('isTrainPassenger') as boolean,
      totalLength: inject('totalLength') as number,
      totalMass: inject('totalMass') as number,
      maxStockSpeed: inject('maxStockSpeed') as number,
      maxAllowedSpeed: inject('maxAllowedSpeed') as number,
      isLocomotive: inject('isLocomotive') as (vehicle: ILocomotive | ICarWagon) => vehicle is ILocomotive,
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

      // if (keyName == 'arrowdown') {
      //   const chosenVehicle = this.store.chosenCar || this.store.chosenLoco;

      //   if(!chosenVehicle) return;

      //   ev.preventDefault();

      // }
    });

    this.onLocoPowerChange('loco-e');
    this.onCarUseTypeChange('car-passenger');
  },

  data: () => ({
    icons: {
      add: require('@/assets/add-icon.svg'),
      swap: require('@/assets/swap-icon.svg'),
    },
    locoLabels: [
      {
        id: 'loco-e',
        title: 'ELEKTROWÓZ',
      },
      {
        id: 'loco-s',
        title: 'SPALINOWÓZ',
      },
      {
        id: 'loco-ezt',
        title: 'EZT',
      },
      {
        id: 'loco-szt',
        title: 'SZT',
      },
    ],

    carLabels: [
      {
        id: 'car-passenger',
        title: 'PASAŻERSKI',
      },
      {
        id: 'car-cargo',
        title: 'TOWAROWY',
      },
    ],
  }),

  computed: {
    locoOptions() {
      return this.locoDataList
        .filter((loco) => loco.power == this.store.chosenLocoPower)
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .sort((a) => (a.supportersOnly ? 1 : -1));
    },

    carOptions() {
      return this.carDataList
        .filter((car) => car.useType == this.store.chosenCarUseType)
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .sort((a) => (a.supportersOnly ? 1 : -1));
    },
  },

  methods: {
    prepareSwapVehicles() {
      this.store.swapVehicles = true;
    },

    setReadyStockList(bool = false) {
      this.isReadyStockListOpen = bool;
    },

    onShowSupporterChange() {
      this.store.showSupporter = !this.store.showSupporter;

      if (this.store.showSupporter) {
        const chosenVehicle = this.store.chosenCar || this.store.chosenLoco;

        if (!chosenVehicle) return;

        if (!chosenVehicle.supportersOnly) {
          this.store.chosenCar = null;
          this.store.chosenLoco = null;
        }
      }
    },

    onLocoPowerChange(inputId: string) {
      this.store.chosenLoco = null;
      this.store.imageLoading = false;

      this.store.chosenLocoPower = inputId;
      // this.store.chosenStockListIndex = -1;

      (this.$refs['loco-select'] as HTMLElement).focus();
    },

    onCarUseTypeChange(inputId: string) {
      this.store.chosenCar = null;
      this.store.imageLoading = false;

      this.store.chosenCarUseType = inputId;
      // this.store.chosenStockListIndex = -1;

      if (inputId == 'car-passenger') this.store.chosenCargo = null;
    },

    onCarTypeChange() {
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;
      // this.store.chosenStockListIndex = -1;

      this.store.imageLoading = true;
    },

    onLocoTypeChange() {
      this.store.chosenCargo = null;
      this.store.chosenCar = null;
      // this.store.chosenStockListIndex = -1

      this.store.imageLoading = true;
    },

    addVehicle() {
      const vehicle = this.store.chosenCar || this.store.chosenLoco;

      if (!vehicle) return;

      const stockObj = {
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: this.isLocomotive(vehicle),
        cargo:
          !this.isLocomotive(vehicle) && vehicle.loadable && this.store.chosenCargo
            ? this.store.chosenCargo
            : undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        useType: this.isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
        supportersOnly: vehicle.supportersOnly,
      };

      if (this.store.chosenStockListIndex != -1) {
        let currentStock = this.store.stockList[this.store.chosenStockListIndex];

        if (this.isLocomotive(vehicle) && currentStock && currentStock.type == vehicle.type) {
          this.store.stockList[this.store.chosenStockListIndex].count++;
          return;
        }

        if (
          !this.isLocomotive(vehicle) &&
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

      if (this.isLocomotive(vehicle) && previousStock && previousStock.type == vehicle.type) {
        this.store.stockList[this.store.stockList.length - 1].count++;
        return;
      }

      if (
        !this.isLocomotive(vehicle) &&
        previousStock &&
        previousStock.type == vehicle.type &&
        previousStock.cargo?.id == this.store.chosenCargo?.id
      ) {
        this.store.stockList[this.store.stockList.length - 1].count++;

        return;
      }

      if (this.isLocomotive(vehicle) && this.store.stockList.length > 0 && !this.store.stockList[0].isLoco)
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

  &_radio {
    button {
      padding: 0.25em 0.55em;
      margin-right: 0.5em;
      border: 2px solid white;
      color: white;
      font-size: 1em;
    }

    button:focus {
      color: $accentColor;
    }

    button.checked {
      border-color: $accentColor;
      color: $accentColor;
      font-weight: bold;
    }
  }

  &_checkbox {
    margin: 1em 0;

    padding: 0 1.5em;

    button {
      position: relative;
      color: #999;

      &::before {
        content: '';
        width: 1.5ch;
        height: 1.5ch;

        display: block;

        position: absolute;
        bottom: 0.2ch;
        left: -1.5em;

        background-color: #999;
      }

      &.checked {
        color: white;
        font-weight: bold;

        &::before {
          background-color: $accentColor;
        }
      }

      &:focus {
        outline: 1px solid $accentColor;
      }
    }
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
    font-size: 0.8em;

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

    &_radio,
    &_list,
    &_checkbox {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
