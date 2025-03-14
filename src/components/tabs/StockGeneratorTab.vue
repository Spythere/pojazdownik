<template>
  <div class="stock-generator tab">
    <div class="tab_content">
      <div>
        <h2>{{ $t('stockgen.properties-title') }}</h2>

        <b class="text--accent">
          {{ $t('stockgen.properties-desc') }}
        </b>

        <div class="inputs">
          <label>
            <span>{{ $t('stockgen.input-mass') }}</span>
            <input type="number" v-model="maxTons" step="100" max="4000" min="0" />
          </label>

          <label>
            <span>{{ $t('stockgen.input-length') }}</span>
            <input type="number" v-model="maxLength" step="25" max="650" min="0" />
          </label>

          <label>
            <span>{{ $t('stockgen.input-carcount') }}</span>
            <input type="number" v-model="maxCarCount" step="1" max="60" min="1" />
          </label>
        </div>

        <!-- <hr style="margin: 1em 0" /> -->

        <!-- <div class="generator_options">
          <Checkbox v-model="isCarGroupingEnabled">Grupuj wylosowane wagony (ustawia podobne wagony obok siebie w składzie)</Checkbox>
        </div>  -->
      </div>

      <div>
        <h2>{{ $t('stockgen.cargo-title') }}</h2>
        <b>{{ $t('stockgen.cargo-desc') }}</b>
      </div>

      <div class="generator_cargo">
        <button
          v-for="cargo in computedCargoData"
          :key="cargo.name"
          class="btn"
          :data-chosen="chosenCargoTypes.includes(cargo.name)"
          @click="toggleCargoChosen(cargo.name, cargo.cargoList)"
        >
          {{ $t(`cargo.${cargo.name}`) }}
        </button>
      </div>

      <div>
        <h2>{{ $t('stockgen.chosen-title') }}</h2>

        <div class="generator_warning">
          <span v-if="computedChosenCarTypes.size == 0">
            {{ $t('stockgen.chosen-empty-warning') }}
          </span>

          <span v-else>
            {{ $t('stockgen.chosen-warning') }}
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
        <button
          class="btn"
          :data-disabled="computedChosenCarTypes.size == 0"
          @click="generateStock()"
        >
          {{ $t('stockgen.action-generate') }}
        </button>

        <button
          class="btn"
          :data-disabled="computedChosenCarTypes.size == 0"
          @click="generateStock(true)"
        >
          {{ $t('stockgen.action-generate-empty') }}
        </button>

        <button
          class="btn"
          :data-disabled="computedChosenCarTypes.size == 0"
          @click="resetChosenCargo"
        >
          {{ $t('stockgen.action-reset') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';

import stockMixin from '../../mixins/stockMixin';
import { ICargo, ICarWagon, IStock } from '../../types/common.types';
import { isTractionUnit } from '../../utils/vehicleUtils';

import generatorDataJSON from '../../data/generatorData.json';

export default defineComponent({
  name: 'stock-generator',
  mixins: [stockMixin],

  data() {
    return {
      chosenCarTypes: [] as string[],
      excludedCarTypes: [] as string[],

      chosenCargoTypes: [] as string[],

      previewTimeout: -1,

      maxTons: 3000,
      maxLength: 650,
      maxCarCount: 50,

      isCarGroupingEnabled: false,

      store: useStore(),
    };
  },

  computed: {
    computedChosenCarTypes() {
      return new Set<string>(this.chosenCarTypes.slice().sort((c1, c2) => (c1 > c2 ? 1 : -1)));
    },

    computedCargoData() {
      const cargoGeneratorData = generatorDataJSON.cargo;

      return Object.keys(cargoGeneratorData)
        .sort((v1, v2) => this.$t(`cargo.${v1}`).localeCompare(this.$t(`cargo.${v2}`)))
        .map((v) => ({
          name: v,
          cargoList: cargoGeneratorData[v as keyof typeof generatorDataJSON.cargo],
        }));
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

    // WIP
    groupStock(stockList: IStock[]) {
      if (!this.isCarGroupingEnabled) return false;

      stockList.sort((s1, s2) => {
        return (s1.vehicleRef.constructionType + s1.cargo?.id).localeCompare(
          s2.vehicleRef.constructionType + s2.cargo?.id
        );
      });
    },

    generateStock(empty = false) {
      const generatedChosenStockList = this.chosenCargoTypes.reduce(
        (acc, type) => {
          generatorDataJSON.cargo[type as keyof typeof generatorDataJSON.cargo]
            .filter((c) => !this.excludedCarTypes.includes(c.split(':')[0]))
            .forEach((c) => {
              const [type, cargoType] = c.split(':');

              const carWagonObjs = this.store.carDataList.filter((cw) => cw.type.startsWith(type));
              const cargoObjs = [] as (ICargo | undefined)[];

              if (!cargoType || empty) cargoObjs.push(undefined);
              else if (cargoType == 'all') cargoObjs.push(...carWagonObjs[0]!.cargoTypes);
              else
                cargoObjs.push(carWagonObjs[0]?.cargoTypes.find((cargo) => cargo.id == cargoType));

              carWagonObjs.forEach((cw) => {
                cargoObjs.forEach((cargoObj) => {
                  const chosenStock = acc.find((a) =>
                    a.constructionType.includes(cw.constructionType)
                  );

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
        },
        [] as { constructionType: string; carPool: { carWagon: ICarWagon; cargo?: ICargo }[] }[]
      );

      let bestGeneration: { stockList: IStock[]; value: number } = { stockList: [], value: 0 };

      for (let i = 0; i < 10; i++) {
        this.store.stockList.splice(
          this.store.stockList.length > 0 && isTractionUnit(this.store.stockList[0].vehicleRef)
            ? 1
            : 0
        );

        let carCount = 0;
        const maxWeight =
          this.store.acceptableWeight > 0
            ? Math.min(this.store.acceptableWeight, this.maxTons * 1000)
            : this.maxTons * 1000;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const randomStockType =
            generatedChosenStockList[~~(Math.random() * generatedChosenStockList.length)];
          const { carWagon, cargo } =
            randomStockType.carPool[~~(Math.random() * randomStockType.carPool.length)];

          if (
            this.store.totalWeight + (carWagon.weight + (cargo?.weight ?? 0)) > maxWeight ||
            this.store.totalLength + carWagon.length > this.maxLength ||
            carCount >= this.maxCarCount
          ) {
            break;
          }

          this.addCarWagon(carWagon, cargo);
          carCount++;
        }

        const currentGenerationValue = this.store.totalLength + this.store.totalWeight + carCount;

        if (bestGeneration.value < currentGenerationValue) {
          bestGeneration.stockList = this.store.stockList;
          bestGeneration.value = currentGenerationValue;
        }
      }

      const bestStockList = bestGeneration.stockList;

      this.store.stockList = bestGeneration.stockList;
      this.groupStock(bestStockList);
      this.$router.push('/');
    },

    previewCar(type: string) {
      const c = this.store.carDataList.find((c) => c.type.startsWith(type)) || null;

      this.store.chosenVehicle = c;
      this.store.chosenCar = c;
      this.store.chosenLoco = null;
      this.store.chosenCargo = null;

      if (c) this.store.chosenCarGroup = c?.group;
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
@use '@/styles/tab';

h2 {
  margin-top: 0;
  margin-bottom: 0.5em;
}

.generator_cargo,
.generator_vehicles {
  display: grid;
  gap: 0.5em;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));

  button {
    position: relative;
    padding: 0.5em;

    text-align: center;
    text-transform: uppercase;
    font-weight: bold;

    background-color: global.$secondaryColor;

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
      background-color: global.$bgColor;
      color: white;
    }
  }
}

.tab_content {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12em, 1fr));

  flex-wrap: wrap;
  gap: 0.5em;
}

.inputs > label {
  display: flex;
  flex-direction: column;
  gap: 0.25em;

  span {
    color: #ccc;
  }

  input[type='text'] {
    background-color: white;
  }
}

.generator_options {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.generator_warning {
  background-color: global.$accentColor;
  padding: 0.5em;
  text-align: justify;
  font-weight: bold;
  color: black;
}
</style>
