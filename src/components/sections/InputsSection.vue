<template>
  <section class="inputs-section">
    <div class="input_container">
      <h2 class="input_header">{{ $t('inputs.title') }}</h2>

      <div class="input_list type">
        <div class="vehicle-types locos">
          <button
            v-for="locoType in locomotiveTypeList"
            :key="locoType.id"
            class="btn btn--choice"
            :data-selected="locoType.id == store.chosenLocoPower"
            @click="selectLocoType(locoType.id)"
          >
            {{ $t(`inputs.${locoType.id}`) }}
          </button>
        </div>

        <select
          id="locomotives-list"
          v-model="store.chosenLoco"
          @focus="previewVehicleByType('loco')"
          @change="previewVehicleByType('loco')"
          @keydown.enter.prevent="addOrSwitchVehicle"
          @keydown.backspace="removeVehicle"
        >
          <option :value="null" disabled>
            {{ $t('inputs.input-vehicle') }}
          </option>
          <option v-for="loco in locoOptions" :value="loco" :key="loco.type">{{ loco.type }}<b v-if="loco.isSponsorsOnly">*</b></option>
        </select>
      </div>

      <div class="input_list type">
        <div class="vehicle-types carwagons">
          <button
            v-for="carType in carTypeList"
            :key="carType.id"
            class="btn btn--choice"
            :data-selected="carType.id == store.chosenCarUseType"
            @click="selectCarWagonType(carType.id)"
          >
            {{ $t(`inputs.${carType.id}`) }}
          </button>
        </div>

        <select
          id="carwagons-list"
          v-model="store.chosenCar"
          @focus="previewVehicleByType('car')"
          @change="previewVehicleByType('car')"
          @keydown.enter.prevent="addOrSwitchVehicle"
          @keydown.backspace="removeVehicle"
        >
          <option :value="null" disabled>
            {{ $t('inputs.input-carwagon') }}
          </option>

          <option v-for="car in carOptions" :value="car" :key="car.type">{{ car.type }}<b v-if="car.isSponsorsOnly">*</b></option>
        </select>
      </div>

      <div class="input_list cargo">
        <label for="cargo-select">{{ $t('inputs.cargo-title') }}</label>
        <select
          id="cargo-select"
          :disabled="
            (store.chosenCar && !store.chosenCar.loadable) || (store.chosenCar && store.chosenCar.useType == 'car-passenger') || !store.chosenCar
          "
          data-select="cargo"
          data-ignore-outside="1"
          v-model="store.chosenCargo"
          @focus="previewVehicleByType('cargo')"
          @change="previewVehicleByType('cargo')"
          @keydown.enter.prevent="addOrSwitchVehicle"
          @keydown.backspace="removeVehicle"
        >
          <option :value="null" v-if="!store.chosenCar || !store.chosenCar.loadable">
            {{ $t('inputs.no-cargo-available') }}
          </option>
          <option :value="null" v-else>{{ $t('inputs.cargo-empty') }}</option>

          <option v-for="cargo in store.chosenCar?.cargoList" :value="cargo" :key="cargo.id">
            {{ cargo.id }}
          </option>
        </select>
      </div>

      <div class="input_actions">
        <button class="btn" @click="addVehicle(store.chosenVehicle, store.chosenCargo)">
          {{ $t('inputs.action-add') }}
        </button>
        <button class="btn" @click="switchVehicles" :disabled="store.chosenStockListIndex == -1" :data-disabled="store.chosenStockListIndex == -1">
          {{ $t('inputs.action-swap') }}
          <b class="text--accent">
            {{ store.chosenStockListIndex == -1 ? '' : `${store.chosenStockListIndex + 1}.` }}
          </b>
        </button>

        <button class="btn" @click="store.isRealStockListCardOpen = true">
          <b>{{ $t('inputs.real-stock') }}</b>
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import imageMixin from '../../mixins/imageMixin';
import { useStore } from '../../store';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import stockMixin from '../../mixins/stockMixin';

export default defineComponent({
  mixins: [imageMixin, stockPreviewMixin, stockMixin],

  data: () => ({
    store: useStore(),
    locomotiveTypeList: [
      {
        id: 'loco-e',
        desc: 'ELEKTRYCZNE',
      },
      {
        id: 'loco-s',
        desc: 'SPALINOWE',
      },
      {
        id: 'loco-ezt',
        desc: 'ELEKTR. ZESPOŁY TRAKCYJNE',
      },
      {
        id: 'loco-szt',
        desc: 'SPAL. ZESPOŁY TRAKCYJNE',
      },
    ],

    carTypeList: [
      {
        id: 'car-passenger',
        desc: 'PASAŻERSKIE',
      },
      {
        id: 'car-cargo',
        desc: 'TOWAROWE',
      },
    ],
  }),

  computed: {
    locoOptions() {
      return this.store.locoDataList
        .slice()
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((loco) => loco.power == this.store.chosenLocoPower);
    },

    carOptions() {
      return this.store.carDataList
        .slice()
        .sort((a, b) => (a.type > b.type ? 1 : -1))
        .filter((car) => car.useType == this.store.chosenCarUseType);
    },
  },

  methods: {
    prepareSwapVehicles() {
      this.store.swapVehicles = true;
    },

    addOrSwitchVehicle() {
      if (!this.store.chosenVehicle) return;

      if (this.store.chosenStockListIndex == -1) this.addVehicle(this.store.chosenVehicle, this.store.chosenCargo);
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

      const stockObject = this.getStockObject(vehicle, this.store.chosenCargo);
      this.store.stockList[this.store.chosenStockListIndex] = stockObject;
    },

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

        this.store.chosenCargo = this.store.chosenCar?.cargoList.find((cargo) => cargo.id == this.store.chosenCargo?.id) || null;
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global';

.inputs-section {
  display: flex;
  justify-content: center;

  grid-row: 2;
  grid-column: 1;
}

.input_container {
  width: 100%;
  max-width: 380px;
}

.input_header {
  margin-bottom: 1em;
}

button.btn--choice {
  font-size: 0.9em;
  padding: 0.3em 0.6em;

  &[data-selected='true'] {
    background-color: $accentColor;
    color: black;
  }

  transition: all 120ms ease;
}

.input_list {
  margin: 0.5em 0;

  select {
    width: 100%;
  }

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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5em;

  button:nth-child(3) {
    grid-column: 1 / 3;
  }
}

.vehicle-types {
  display: flex;
  gap: 0.25em;

  margin-bottom: 0.5em;
}

@media screen and (max-width: $breakpointMd) {
  .inputs-section {
    justify-content: center;
    text-align: center;
  }

  .vehicle-types {
    justify-content: center;
  }
}
</style>
