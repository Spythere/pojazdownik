<template>
  <div class="card">
    <div class="card_wrapper" ref="cardWrapper" tabindex="0">
      <h1>LOSUJ SKŁAD</h1>

      <div class="random-stock-selections">
        <h3>WŁAŚCIWOŚCI SKŁADU</h3>

        <div class="max-values">
          <span>
            <label for="stock-mass">Maks. masa (t)</label>
            <input type="number" id="stock-mass" v-model="maxStockMass" />
          </span>

          <span>
            <label for="stock-mass">Maks. długość (m)</label>
            <input type="number" id="stock-mass" v-model="maxStockLength" />
          </span>

          <span>
            <label for="stock-count">Maks. liczba wagonów</label>
            <input type="number" id="stock-count" v-model="maxStockCount" />
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-top: 1em">
          <div class="select-box locos">
            <h3>LOKOMOTYWA</h3>

            <select v-model="chosenLocomotive">
              <option :value="undefined">Wybierz lokomotywę</option>
              <option v-for="loco in store.locoDataList.filter((l) => !l.type.includes('EN'))" :value="loco">
                {{ loco.type }}
              </option>
            </select>
          </div>

          <div class="car-preview">
            <div class="image-wrapper">
              <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>
              <img
                v-if="randomFocusedWagonVariant"
                :src="randomFocusedWagonVariant.imageSrc"
                :alt="randomFocusedWagonVariant.type"
              />

              <span class="preview-message" v-if="!randomFocusedWagonVariant"
                >WYBIERZ POJAZD LUB WAGON, BY ZOBACZYĆ JEGO PODGLĄD</span
              >
              <span class="preview-message info" v-else>
                {{ randomFocusedWagonVariant.type }} (1 z {{ focusedCarWagon!.availableCars.length }})
              </span>
            </div>
          </div>
        </div>

        <div class="select-box carwagons">
          <h3>
            WAGONY

            <button class="btn btn--text" @click="showRules = !showRules">[ zasady dodawania wagonów ]</button>
          </h3>

          <div class="rules" v-if="showRules">
            <ul>
              <li>
                nazwy wagonów w pierwszym polu muszą zaczynać się typem konstrukcyjnym (np. <i>111a</i> lub
                <i>203V</i>), wariantem np. <i>111a Grafitti 1</i> lub jego początkiem, np. <i>111a PKPIC</i> (wtedy
                losowanie obejmuje wszystkie dostępne wagony o takim początku)
              </li>
              <li>
                ładunki w drugim polu można wybrać po uprzednim wpisaniu typu konstrukcyjnego wagonu towarowego
                (zakładając, że je posiada)
              </li>
              <li>
                liczba na trzecim polu - domyślnie 10 - to waga (szansa) wylosowania wagonu. Im większa waga, tym
                większe prawdopodobieństwo
              </li>
              <li>liczba wariantów obejmująca losowanie danego wagonu pokazana jest na końcu rzędu</li>
            </ul>
          </div>

          <ul class="carwagon-list">
            <li class="text--accent" style="font-weight: bold">
              <div>Typ wagonu</div>
              <div>Ładunek</div>
              <div>Szansa (waga)</div>
              <div>Warianty</div>
              <div>Usuń</div>
            </li>

            <li v-for="(stockWagon, i) in chosenCarWagonList">
              <div>
                <input
                  class="carwagon-type g-input"
                  type="text"
                  list="types-datalist"
                  v-model="stockWagon.stockString"
                  @input="onCarWagonTypeInput(stockWagon)"
                  @focus="onCarWagonTypeFocus(stockWagon)"
                />

                <datalist id="types-datalist">
                  <option v-for="carOptionType in allCarOptionsList" :value="carOptionType">{{ carOptionType }}</option>
                </datalist>
              </div>

              <div>
                <select class="carwagon-cargo" v-model="stockWagon.chosenCargo">
                  <option :value="undefined">brak</option>

                  <option value="random" v-if="stockWagon.availableCargo && stockWagon.availableCargo.length > 0">
                    losowo
                  </option>

                  <option v-for="cargo in stockWagon.availableCargo" :value="cargo">
                    {{ cargo.id }}
                  </option>
                </select>
              </div>

              <div>
                <span class="carwagon-chance">
                  <input type="number" v-model="stockWagon.chance" max="100" min="1" />
                </span>
              </div>

              <div class="variant-count">{{ stockWagon.availableCars.length }}</div>

              <div class="carwagon-remove">
                <button @click="removeFromRandomStockList(i)">
                  <img :src="getIcon('remove-icon')" alt="remove" />
                </button>
              </div>
            </li>
          </ul>

          <button class="btn btn--outline" @click="addToRandomStockList">+ DODAJ NOWY WAGON</button>
        </div>
      </div>

      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="generateRandomStock">LOSUJ SKŁAD!</button>
      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="store.isRandomizerCardOpen = false">
        ZAMKNIJ
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ICargo, ICarWagon, ILocomotive, IStock, IVehicleData } from '../types';

import { useStore } from '../store';
import stockMixin from '../mixins/stockMixin';

interface RandomStockCarWagon {
  stockString: string;
  chance: number;

  availableCars: ICarWagon[];
  availableCargo?: ICargo[];
  chosenCargo?: ICargo;
}

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      store,
    };
  },

  mixins: [stockMixin],

  activated() {
    (this.$refs['cardWrapper'] as any).focus();
  },

  data: () => ({
    maxStockMass: 650,
    maxStockLength: 350,
    maxStockCount: 30,

    chosenCarWagonList: [] as RandomStockCarWagon[],
    chosenLocomotive: undefined as ILocomotive | undefined,

    showRules: false,
    isPreviewLoading: false,
    focusedCarWagon: undefined as RandomStockCarWagon | undefined,
    randomFocusedWagonVariant: undefined as ICarWagon | undefined,
  }),

  watch: {
    'focusedCarWagon.availableCars': {
      handler(cars?: RandomStockCarWagon['availableCars'], prevCars?: RandomStockCarWagon['availableCars']) {
        const prevAvailableCarsStr = prevCars?.map((car) => car.type).join(',') || '';
        const availableCarsStr = cars?.map((car) => car.type).join(',') || '';

        if (prevAvailableCarsStr != availableCarsStr) {
          this.randomFocusedWagonVariant =
            this.focusedCarWagon?.availableCars[~~(Math.random() * this.focusedCarWagon.availableCars.length)];
        }
      },
    },
  },

  computed: {
    allCarOptionsList() {
      const list: string[] = [];

      this.store.carDataList.forEach((carData) => {
        const splittedTypeList = carData.type.split('_');

        for (let i = 0; i < splittedTypeList.length; i++) {
          const typeToCheck = carData.type
            .split('_', i + 1)
            .join('_')
            .replace(/_/g, ' ');

          if (!list.includes(typeToCheck)) list.push(typeToCheck);
        }
      });

      return list.sort((a, b) => (a > b ? 1 : -1));
    },
  },

  methods: {
    onCarWagonTypeInput(carWagon: RandomStockCarWagon) {
      const constructionType = carWagon.stockString.split(' ')[0];

      const carWagonObj = this.store.carDataList.find((car) => car.constructionType == constructionType);

      const allAvailableCars = this.store.carDataList.filter((car) =>
        car.type.startsWith(carWagon.stockString.replace(/ /g, '_'))
      );

      carWagon.availableCars = allAvailableCars;
      carWagon.availableCargo = carWagonObj?.cargoList || undefined;

      if (!carWagonObj?.cargoList) {
        carWagon.chosenCargo = undefined;
      }

      // this.onCarWagonTypeFocus(carWagon);
    },

    onCarWagonTypeFocus(carWagon: RandomStockCarWagon) {
      const prevVariantsCount = this.focusedCarWagon?.availableCars.length || 0;

      this.focusedCarWagon = carWagon;

      if (prevVariantsCount != carWagon.availableCars.length)
        this.randomFocusedWagonVariant =
          this.focusedCarWagon.availableCars[~~(Math.random() * this.focusedCarWagon.availableCars.length)];
    },

    addToRandomStockList() {
      const randTypeList = this.allCarOptionsList.filter((carOption) =>
        /1|2/g.test(carOption.split(' ').length.toString())
      );
      const randType = randTypeList[Math.floor(Math.random() * randTypeList.length)];

      const randomStockCarWagon: RandomStockCarWagon = {
        stockString: randType,
        chance: 10,
        chosenCargo: undefined,
        availableCargo: undefined,
        availableCars: this.store.carDataList.filter((car) => car.type.startsWith(randType.replace(/ /g, '_'))),
      };

      this.chosenCarWagonList.push(randomStockCarWagon);
    },

    removeFromRandomStockList(index: number) {
      this.chosenCarWagonList.splice(index, 1);
    },

    generateRandomStock() {
      let totalLength = 0;
      let totalMass = 0;

      let generatedStockList: IStock[] = [];

      // if (!this.chosenLocomotive) return;
      if (this.chosenCarWagonList.length == 0) return;

      // generatedStockList.push(this.getStockObject(this.chosenLocomotive));
      // totalLength += this.chosenLocomotive.length;
      // totalMass += this.chosenLocomotive.mass;

      while (generatedStockList.length < 25) {
        const randCarWagon = this.getRandomCarWagon();

        generatedStockList.push(this.getStockObject(randCarWagon));

        totalLength += randCarWagon.length;
        totalMass += randCarWagon.mass;
      }

      console.log(generatedStockList);
    },

    getRandomCarWagon(): ICarWagon {
      const totalChancePot = this.chosenCarWagonList.reduce((total, car) => {
        total += car.chance;
        return total;
      }, 0);

      let rand = Math.random() * totalChancePot;
      let randCarWagon: ICarWagon | undefined = undefined;

      for (let wagonItem of this.chosenCarWagonList) {
        if (rand < wagonItem.chance) {
          randCarWagon = { ...wagonItem.availableCars[Math.floor(Math.random() * wagonItem.availableCars.length)] };
          break;
        }

        rand -= wagonItem.chance;
      }

      return randCarWagon!;
    },

    getIcon(name: string) {
      return new URL(`../assets/${name}.svg`, import.meta.url).href;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/global.scss';

.card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  overflow: auto;
  max-height: 95vh;

  z-index: 100;

  border: 2px solid white;

  width: 700px;
  padding: 0.5em 1em;

  height: 90vh;
  max-height: 900px;

  background: #111;

  @media screen and (max-width: 700px) {
    width: 95%;
  }

  border-radius: 1em;
}

h1 {
  text-align: center;
  color: $accentColor;
}

h3 {
  color: $accentColor;
  margin: 0 0 0.5em 0;
}

.rules {
  margin: 0.5em 0;

  ul {
    list-style: inside;
    border: 1px solid $accentColor;
    padding: 0.5em;
  }
}

.car-preview {
  position: relative;
  width: 300px;
  height: 200px;

  border: 1px solid white;

  .loading {
    position: absolute;
    left: 0;
    bottom: 0;

    width: 100%;
    padding: 0.5em 0;

    z-index: 102;

    background-color: rgba(black, 0.75);
  }

  .preview-message {
    font-weight: bold;
    text-align: center;
    position: absolute;
    bottom: 0.5em;
    left: 50%;
    transform: translateX(-50%);

    width: 100%;

    &.info {
      background-color: #111111dd;
    }
  }

  img {
    width: 100%;
    height: auto;
  }
}

.carwagon-list li {
  margin: 0.5em 0;

  display: grid;
  grid-template-columns: 3fr 2fr 1fr 1fr 2em;
  gap: 0 0.5em;
  align-items: center;

  input,
  select,
  .variant-count {
    width: 100%;
    height: 35px;
  }

  .carwagon-chance input {
    font-weight: bold;
  }

  .carwagon-remove {
    display: flex;
    justify-content: center;
    align-items: center;

    button img {
      width: 1.15em;
      vertical-align: middle;
    }
  }

  .variant-count {
    display: flex;
    align-items: center;
    font-weight: bold;
  }
}

.random-stock-selections {
  text-align: left;

  .select-box {
    padding: 0.5em 0;
  }
}

.max-values {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  label {
    display: block;
  }

  input {
    width: auto;
    margin: 0.25em 0.5em 0 0;
  }
}

@media screen and (max-width: 600px) {
  .car-preview .image-wrapper {
    width: 20em;
    height: 13em;
  }
}
</style>

