<template>
  <section class="inputs-section">
    <div class="input_container">
      <h2 class="input_header">WYBIERZ POJAZDY / WAGONY</h2>

      <div class="input_list type">
        <div class="vehicle-types locos">
          <button
            v-for="locoType in locomotiveTypeList"
            class="btn--choice"
            :data-selected="locoType.id == store.chosenLocoPower"
            @click="selectLocoType(locoType.id)"
          >
            {{ locoType.value }}
          </button>
        </div>

        <select
          id="locomotives-list"
          v-model="store.chosenLoco"
          @focus="onVehicleSelect('loco')"
          @change="onVehicleSelect('loco')"
          @keydown.enter.prevent="addOrSwitchVehicle"
          @keydown.backspace="removeVehicle"
        >
          <option :value="null" disabled>Wybierz pojazd trakcyjny</option>
          <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
            {{ loco.type }}
          </option>
        </select>
      </div>

      <div class="input_list type">
        <div class="vehicle-types carwagons">
          <button
            v-for="carType in carTypeList"
            class="btn--choice"
            :data-selected="carType.id == store.chosenCarUseType"
            @click="selectCarWagonType(carType.id)"
          >
            {{ carType.value }}
          </button>
        </div>

        <select
          id="carwagons-list"
          v-model="store.chosenCar"
          @focus="onVehicleSelect('car')"
          @change="onVehicleSelect('car')"
          @keydown.enter.prevent="addOrSwitchVehicle"
          @keydown.backspace="removeVehicle"
        >
          <option :value="null" disabled>Wybierz wagon</option>

          <option v-for="car in carOptions" :value="car" :key="car.type">
            {{ car.type }}
          </option>
        </select>
      </div>

      <div class="input_list cargo">
        <label for="cargo-select">Ładunek (tylko wybrane towarowe)</label>
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
          @change="onVehicleSelect('car')"
          @keydown.enter.prevent="addOrSwitchVehicle"
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

        <button class="btn" @click="store.isRealStockListCardOpen = true"><b>REALNE ZESTAWIENIA</b></button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { IStock } from '../types';
import imageMixin from '../mixins/imageMixin';
import { useStore } from '../store';
import { isLocomotive } from '../utils/vehicleUtils';

interface ILocoType {
  id: string;
  value: string;
  desc: string;
}

export default defineComponent({
  mixins: [imageMixin],

  data: () => ({
    locomotiveTypeList: [
      {
        id: 'loco-e',
        value: 'ELEKTR',
        desc: 'ELEKTRYCZNE',
      },
      {
        id: 'loco-s',
        value: 'SPAL',
        desc: 'SPALINOWE',
      },
      {
        id: 'loco-ezt',
        value: 'EZT',
        desc: 'ELEKTR. ZESPOŁY TRAKCYJNE',
      },
      {
        id: 'loco-szt',
        value: 'SZT',
        desc: 'SPAL. ZESPOŁY TRAKCYJNE',
      },
    ] as ILocoType[],

    carTypeList: [
      {
        id: 'car-passenger',
        value: 'PAS',
        desc: 'PASAŻERSKIE',
      },
      {
        id: 'car-cargo',
        value: 'TOW',
        desc: 'TOWAROWE',
      },
    ],
  }),

  setup() {
    const store = useStore();

    return {
      store,
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

    prepareSwapVehicles() {
      this.store.swapVehicles = true;
    },

    onVehicleSelect(type: 'loco' | 'car') {
      this.$nextTick(() => {
        if (!this.store.chosenLoco && !this.store.chosenCar) return;

        this.store.chosenVehicle = type == 'loco' ? this.store.chosenLoco : this.store.chosenCar;
      });
    },

    addOrSwitchVehicle() {
      if (this.store.chosenStockListIndex == -1) this.addVehicle();
      else this.switchVehicles();
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
        id: `${Date.now()}`,
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
        id: `${Date.now()}`,
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

  grid-row: 2;
  grid-column: 1;
}

.input_header {
  margin-bottom: 1em;
}

.btn--choice {
  margin-right: 0.5em;
  font-weight: bold;

  background-color: #444;

  &[data-selected='true'] {
    background-color: $accentColor;
    color: black;
  }

  transition: all 120ms ease;
}

.input_list {
  margin: 0.5em 0;

  label {
    display: block;

    font-weight: bold;
    color: $accentColor;
    margin-bottom: 0.3em;
  }

  select:focus {
    border-color: $accentColor;
  }
}

.input_actions {
  display: flex;
  flex-wrap: wrap;

  button {
    margin: 0.5em 0.5em 0 0;
  }
}

.vehicle-types {
  margin-bottom: 0.5em;
}

@media screen and (max-width: $breakpointMd) {
  .inputs-section {
    justify-content: center;
    text-align: center;
  }

  .input_actions {
    justify-content: center;
  }
}
</style>

