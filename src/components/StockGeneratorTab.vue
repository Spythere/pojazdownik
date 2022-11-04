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
      <p>Wagony posiadające wybrane ładunki. Kliknij na pojazd, aby został wyłączony z losowania.</p>

      <div class="generator_vehicles">
        <button :data-chosen="true" class="btn" v-for="car in chosenCarTypes" @click="previewCar(car)">
          {{ car }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import generatorData from '../data/generatorData.json';
import { ICarWagon } from '../types';

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
      chosenCarTypes: new Set() as Set<string>,
      chosenCargoTypes: [] as string[],
    };
  },

  methods: {
    previewCar(type: string) {
      this.store.chosenCar = this.store.carDataList.find((c) => c.constructionType == type) || null;
      this.store.chosenVehicle = this.store.chosenCar;
    },

    toggleCargoChosen(cargoType: string, vehicles: string[]) {
      if (this.chosenCargoTypes.includes(cargoType)) {
        vehicles.forEach((v) => {
          const [type] = v.split(':');
          this.chosenCarTypes.delete(type);
        });

        this.chosenCargoTypes.splice(this.chosenCargoTypes.indexOf(cargoType), 1);
        return;
      }

      this.chosenCargoTypes.push(cargoType);

      vehicles.forEach((v) => {
        const [type] = v.split(':');
        const cars = this.store.carDataList.filter((c) => c.constructionType == type);

        this.chosenCarTypes.add(type);
      });
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

.generator_cargo, .generator_vehicles {
  display: grid;
  gap: 0.5em;
  grid-template-columns: repeat(4, 1fr);
  
  button {
    padding: 0.5em;
  
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
  
    background-color: $secondaryColor;
  
    &[data-chosen='true'] {
      background-color: $accentColor;
      color: black;
    }
  }
}

</style>
