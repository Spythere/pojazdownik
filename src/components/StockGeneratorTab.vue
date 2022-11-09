<template>
  <div class="stock-generator">
    <div class="stock_actions">
      <h2>GENERATOR SKŁADU TOWAROWEGO</h2>
      <button class="btn" @click="() => (store.stockSectionMode = 'stock-list')">POWRÓT DO LISTY &gt;</button>
    </div>

    <div class="generator_content">
      <h2>WŁAŚCIWOŚCI SKŁADU</h2>

      <div class="generator_attributes">
        <label>
          Maksymalna masa (t)
          <input type="number" v-model="maxMass" step="100" max="4000" min="0" />
        </label>

        <label>
          Maks. długość (m)
          <input type="number" v-model="maxLength" step="25" max="650" min="0" />
        </label>

        <label>
          Maks. liczba wagonów
          <input type="number" v-model="maxCarCount" step="1" max="60" min="1" />
        </label>
      </div>

      <h2>ŁADUNEK</h2>
      <p>Wybierz ładunki, którymi chcesz wypełnić dostępne wagony:</p>

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

      <h2>WAGONY Z WYBRANYMI ŁADUNKAMI</h2>

      <b v-if="computedChosenCarTypes.size == 0">
        Wybierz co najmniej jeden ładunek, aby zobaczyć wagony, które go posiadają
      </b>

      <p v-else>
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

      <div class="generator_actions" v-if="computedChosenCarTypes.size != 0">
        <button class="btn" @click="generateStock">WYGENERUJ</button>
        <button class="btn">WYGENERUJ PRÓŻNE WAGONY</button>

        <button class="btn" @click="resetChosenCargo">ZRESETUJ ŁADUNKI</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import generatorData from '../data/generatorData.json';
import stockMixin from '../mixins/stockMixin';
import { ICargo, ICarWagon } from '../types';

export default defineComponent({
  name: 'stock-generator',

  setup() {
    return {
      store: useStore(),
    };
  },

  mixins: [stockMixin],

  data() {
    return {
      generatorData,
      chosenCarTypes: [] as string[],
      excludedCarTypes: [] as string[],

      chosenCargoTypes: [] as string[],

      previewTimeout: -1,

      maxMass: 3000,
      maxLength: 650,
      maxCarCount: 50,
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

    resetChosenCargo() {
      this.chosenCargoTypes.length = 0;
      this.chosenCarTypes.length = 0;
      this.excludedCarTypes.length = 0;
    },

    generateStock() {
      const generatedChosenStockList = this.chosenCargoTypes.reduce((acc, type) => {
        this.generatorData.cargo[type as keyof typeof this.generatorData.cargo]
          .filter((c) => !this.excludedCarTypes.includes(c.split(':')[0]))
          .forEach((c) => {
            const [type, cargoType] = c.split(':');
            const carWagonObjs = this.store.carDataList.filter((cw) => cw.type.startsWith(type));
            const cargoObjs = [] as (ICargo | undefined)[];

            if (cargoType == 'all') cargoObjs.push(...carWagonObjs[0]?.cargoList);
            else if (cargoType) cargoObjs.push(carWagonObjs[0]?.cargoList.find((cargo) => cargo.id == cargoType));
            else cargoObjs.push(undefined);

            carWagonObjs.forEach((cw) => {
              console.log(cw, cargoType);

              cargoObjs.forEach((cargoObj) => {
                acc.push({ carWagon: cw, cargo: cargoObj });
              });
            });
          });

        return acc;
      }, [] as { carWagon: ICarWagon; cargo?: ICargo }[]);

      this.store.stockList.length = this.store.stockList[0]?.isLoco ? 1 : 0;

      new Array(this.maxCarCount).fill(0).forEach(() => {
        const { carWagon, cargo } = generatedChosenStockList[~~(Math.random() * generatedChosenStockList.length)];

        if (this.store.totalMass + (cargo?.totalMass || carWagon.mass) > this.maxMass) return;
        if (this.store.totalLength + carWagon.length > this.maxLength) return;

        this.addCarWagon(carWagon, cargo);
      });

      this.store.stockSectionMode = 'stock-list';
    },

    previewCar(type: string) {
      const c = this.store.carDataList.find((c) => c.type.startsWith(type)) || null;

      this.store.chosenVehicle = c;
      this.store.chosenCar = c;
      this.store.chosenLoco = null;
      this.store.chosenCargo = null;

      if (c) this.store.chosenCarUseType = c?.useType;
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
  align-items: center;

  h2 {
    margin: 0;
    color: white;
    font-size: 1.35em;
  }

  button {
    margin-left: auto;
  }
}

.stock-generator {
  height: 100%;
}

.generator_content {
  margin-top: 1em;
  height: 100%;
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

.generator_actions {
  display: grid;
  gap: 0.5em;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 2em;

  button {
    background-color: #4b4b4b;

    padding: 0.5em;
    font-weight: bold;
  }
}
</style>

