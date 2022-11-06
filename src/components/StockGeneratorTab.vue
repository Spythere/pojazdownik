<template>
  <div class="stock-generator">
    <div class="stock_actions">
      <button class="btn" @click="() => (store.stockSectionMode = 'stock-list')">LISTA SKŁADU</button>
    </div>

    <div class="generator_content">
      <h2>WŁAŚCIWOŚCI SKŁADU</h2>

      <div class="generator_attributes">
        <label>
          Maksymalna masa (t)
          <input type="number" value="650" step="5" />
        </label>

        <label>
          Maksymalna długość (m)
          <input type="number" value="350" step="25" />
        </label>
      </div>

      <h2>ŁADUNEK</h2>

      <div class="generator_cargo">
        <button
          class="btn"
          :data-chosen="chosenCargoTypes.includes(k)"
          v-for="(v, k) in generatorData.cargo"
          @click="toggleCargoChosen(k, v)"
        >
          {{ k }}
        </button>
      </div>

      <h2>WYBRANE WAGONY</h2>
      <p>
        Wagony posiadające wybrane ładunki. Najedź na nazwę, aby zobaczyć podgląd wagonu. Kliknij, aby wyłączyć z
        losowania (tylko podświetlone nazwy będą uwzględnione).
      </p>

      <div class="generator_vehicles">
        <button
          :data-chosen="true"
          :data-excluded="excludedCarTypes.includes(carType)"
          class="btn"
          v-for="carType in computedChosenCarTypes"
          :key="carType"
          @mouseover="onMouseHover(carType)"
          @mouseleave="onMouseLeave"
          @click="toggleCarExclusion(carType)"
        >
          {{ carType }}

          <!-- <span>X</span> -->
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import generatorData from '../data/generatorData.json';

export default defineComponent({
  name: 'stock-generator',

  setup() {
    return {
      store: useStore(),
    };
  },

  data() {
    return {
      generatorData,
      chosenCarTypes: [] as string[],
      excludedCarTypes: [] as string[],

      chosenCargoTypes: [] as string[],

      previewTimeout: -1,
    };
  },

  computed: {
    computedChosenCarTypes() {
      return new Set<string>(this.chosenCarTypes.sort((c1, c2) => (c1 > c2 ? 1 : -1)));
    },
  },

  methods: {
    onMouseHover(type: string) {
      window.clearTimeout(this.previewTimeout);

      this.previewTimeout = window.setTimeout(() => {
        this.previewCar(type);
      }, 400);
    },

    onMouseLeave() {
      window.clearTimeout(this.previewTimeout);
    },

    previewCar(type: string) {
      const c = this.store.carDataList.find((c) => c.type.startsWith(type)) || null;

      this.store.chosenVehicle = c;
      this.store.chosenCar = c;
      this.store.chosenLoco = null;
      this.store.chosenCargo = null;

      if (c) this.store.chosenCarUseType = c?.useType;

      // this.store.chosenVehicle = this.store.chosenCar;
    },

    toggleCargoChosen(cargoType: string, vehicles: string[]) {
      if (this.chosenCargoTypes.includes(cargoType)) {
        vehicles.forEach((v) => {
          const [type] = v.split(':');
          this.chosenCarTypes.splice(this.chosenCarTypes.indexOf(type), 1);
        });

        this.chosenCargoTypes.splice(this.chosenCargoTypes.indexOf(cargoType), 1);
        return;
      }

      this.chosenCargoTypes.push(cargoType);

      vehicles.forEach((v) => {
        const [type] = v.split(':');
        // const cars = this.store.carDataList.filter((c) => c.constructionType == type);

        this.chosenCarTypes.push(type);
      });
    },

    toggleCarExclusion(type: string) {
      if (!this.excludedCarTypes.includes(type)) this.excludedCarTypes.push(type);
      else this.excludedCarTypes = this.excludedCarTypes.filter((c) => c != type);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/global.scss';

.stock_actions {
  justify-content: flex-end;
}
.generator_content {
  margin-top: 1em;
}

h2 {
  margin: 1em 0;
}

.generator_attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;

  label {
    display: flex;
    flex-direction: column;
  }

  input {
    margin-top: 0.5em;
    max-width: 200px;
  }
}

.generator_cargo,
.generator_vehicles {
  display: grid;
  gap: 0.5em;
  grid-template-columns: repeat(4, 1fr);

  button {
    position: relative;
    padding: 0.5em;

    text-align: center;
    text-transform: uppercase;
    font-weight: bold;

    background-color: $secondaryColor;

    &[data-chosen='true'] {
      background-color: $accentColor;
      color: black;

      box-shadow: 0 0 5px 1px $accentColor;
    }

    &[data-excluded='true'] {
      background-color: gray;
      box-shadow: none;
    }

    span {
      position: absolute;
      right: 0;
      top: 50%;
      padding: 5px;

      transform: translate(-8px, -50%);
      background-color: $bgColor;
      color: white;
    }
  }
}
</style>
