<template>
  <div class="stock-generator tab">
    <div class="tab_header">
      <h2>GENERATOR SKŁADU TOWAROWEGO</h2>
      <button class="btn" @click="() => (store.stockSectionMode = 'stock-list')">POWRÓT DO LISTY &gt;</button>
    </div>

    <div class="tab_content">
      <h2>WŁAŚCIWOŚCI SKŁADU</h2>

      <div class="tab_attributes">
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
          :data-chosen="chosenCargoTypes.includes(k as string)"
          v-for="(v, k) in store.stockData?.generator.cargo"
          @click="toggleCargoChosen(k as string, v)"
        >
          {{ k }}
        </button>
      </div>

      <h2>WAGONY Z WYBRANYMI ŁADUNKAMI</h2>

      <div class="generator_warning">
        <span v-if="computedChosenCarTypes.size == 0">
          Wybierz co najmniej jeden ładunek, aby zobaczyć wagony, które go posiadają!
        </span>

        <span v-else>
          Wagony posiadające wybrane ładunki. Najedź na nazwę, aby zobaczyć podgląd wagonu. Kliknij, aby wyłączyć z
          losowania (tylko podświetlone nazwy będą uwzględnione).
        </span>
      </div>

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

      <hr />

      <div class="tab_actions">
        <button class="btn" :data-disabled="computedChosenCarTypes.size == 0" @click="generateStock()">
          WYGENERUJ
        </button>
        <button class="btn" :data-disabled="computedChosenCarTypes.size == 0" @click="generateStock(true)">
          WYGENERUJ PRÓŻNE WAGONY
        </button>

        <button class="btn" :data-disabled="computedChosenCarTypes.size == 0" @click="resetChosenCargo">
          ZRESETUJ ŁADUNKI
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import stockMixin from '../mixins/stockMixin';
import { ICargo, ICarWagon } from '../types';

export default defineComponent({
  name: 'stock-generator',

  mixins: [stockMixin],

  data() {
    return {
      chosenCarTypes: [] as string[],
      excludedCarTypes: [] as string[],

      chosenCargoTypes: [] as string[],

      previewTimeout: -1,

      maxMass: 3000,
      maxLength: 650,
      maxCarCount: 50,

      store: useStore(),
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

    generateStock(empty = false) {
      const generatedChosenStockList = this.chosenCargoTypes.reduce((acc, type) => {
        this.store.stockData?.generator.cargo[type]
          .filter((c) => !this.excludedCarTypes.includes(c.split(':')[0]))
          .forEach((c) => {
            const [type, cargoType] = c.split(':');

            const carWagonObjs = this.store.carDataList.filter((cw) => cw.type.startsWith(type));
            const cargoObjs = [] as (ICargo | undefined)[];

            if (!cargoType || empty) cargoObjs.push(undefined);
            else if (cargoType == 'all') cargoObjs.push(...carWagonObjs[0]?.cargoList);
            else cargoObjs.push(carWagonObjs[0]?.cargoList.find((cargo) => cargo.id == cargoType));

            carWagonObjs.forEach((cw) => {
              cargoObjs.forEach((cargoObj) => {
                const chosenStock = acc.find((a) => a.constructionType.includes(cw.constructionType));

                if (!chosenStock)
                  acc.push({
                    constructionType: cw.constructionType,
                    carPool: [{ carWagon: cw, cargo: cargoObj }],
                  });
                else chosenStock.carPool.push({ carWagon: cw, cargo: cargoObj });
              });
            });
          });

        return acc;
      }, [] as { constructionType: string; carPool: { carWagon: ICarWagon; cargo?: ICargo }[] }[]);

      this.store.stockList.length = this.store.stockList[0]?.isLoco ? 1 : 0;

      new Array(this.maxCarCount).fill(0).forEach(() => {
        const randomStockType = generatedChosenStockList[~~(Math.random() * generatedChosenStockList.length)];
        const { carWagon, cargo } = randomStockType.carPool[~~(Math.random() * randomStockType.carPool.length)];

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
@import '../styles/tab.scss';



h2 {
  margin: 1em 0;
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

.generator_vehicles {
  margin-top: 1em;
}

hr {
  height: 3px;
  background-color: white;
  outline: none;

  margin: 15px 0;
}

.generator_warning {
  background-color: $accentColor;
  padding: 0.5em;
  text-align: justify;
  font-weight: bold;
  color: black;
}

@media only screen and (max-width: 470px) {
  .generator_cargo,
  .generator_vehicles {
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  }
}
</style>

