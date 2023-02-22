<template>
  <div class="stock-generator tab">
    <div class="tab_header">
      <h2>GENERATOR SKŁADU TOWAROWEGO</h2>
    </div>

    <div class="tab_content">
      <div>
        <h2>WŁAŚCIWOŚCI SKŁADU</h2>

        <b class="text--accent">
          &lArr; Dodaj lokomotywę na pierwsze miejsce listy, aby uwzględnić ją przy losowaniu składu!
        </b>

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
      </div>

      <div>
        <h2>ŁADUNEK</h2>
        <b>Wybierz ładunki, którymi chcesz wypełnić dostępne wagony:</b>
      </div>

      <div class="generator_cargo">
        <button
          class="btn"
          :data-chosen="chosenCargoTypes.includes(k.toString())"
          v-for="(v, k) in store.stockData?.generator.cargo"
          @click="toggleCargoChosen(k.toString(), v)"
        >
          {{ k }}
        </button>
      </div>

      <div>
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
      </div>

      <div class="generator_vehicles" v-if="computedChosenCarTypes.size != 0">
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
import { useStore } from '../../store';

import stockMixin from '../../mixins/stockMixin';
import { ICargo, ICarWagon } from '../../types';
import warningsMixin from '../../mixins/warningsMixin';

export default defineComponent({
  name: 'stock-generator',

  mixins: [stockMixin, warningsMixin],

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

      const headingLoco = this.store.stockList[0]?.isLoco ? this.store.stockList[0] : undefined;

      this.store.stockList.length = headingLoco ? 1 : 0;
      const maxMass = this.store.acceptableMass || this.maxMass;

      new Array(this.maxCarCount).fill(0).forEach(() => {
        const randomStockType = generatedChosenStockList[~~(Math.random() * generatedChosenStockList.length)];
        const { carWagon, cargo } = randomStockType.carPool[~~(Math.random() * randomStockType.carPool.length)];

        if (this.store.totalMass + (cargo?.totalMass || carWagon.mass) > maxMass) return;
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
@import '../../styles/global.scss';
@import '../../styles/tab.scss';

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

.tab_content {
  display: flex;
  flex-direction: column;
  gap: 1em;
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
