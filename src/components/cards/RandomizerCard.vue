<template>
  <div class="randomizer-card g-card" v-if="store.isRandomizerCardOpen">
    <div class="g-card_bg" @click="store.isRandomizerCardOpen = false"></div>

    <div class="card_content">
      <transition name="slide-top">
        <div class="warning-message" v-if="warningMessage">{{ warningMessage }}</div>
      </transition>

      <div class="card_wrapper" ref="cardWrapper" tabindex="0">
        <h1><img :src="getIconURL('randomize')" alt="ikona losowania" /> LOSUJ SKŁAD</h1>

        <div class="random-stock-selections">
          <div class="first-row">
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
          </div>

          <div class="second-row">
            <div class="select-box locos">
              <h3>LOKOMOTYWA</h3>

              <select
                v-model="chosenLocomotive"
                @change="onLocomotivePreviewSelect()"
                @focus="onLocomotivePreviewSelect()"
              >
                <option :value="undefined">Wybierz lokomotywę</option>
                <option v-for="loco in store.locoDataList.filter((l) => !l.type.includes('EN'))" :value="loco">
                  {{ loco.type }}
                </option>
              </select>
            </div>

            <div class="car-preview">
              <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>

              <span class="preview-message" v-if="!previewVehicle">
                WYBIERZ POJAZD LUB WAGON, BY ZOBACZYĆ JEGO PODGLĄD
              </span>

              <img v-else :src="previewVehicle.imageSrc" :alt="previewVehicle.type" />

              <span class="preview-message info" v-if="previewVehicle">
                <button @click="prevPreviewIndex">&lt;</button>

                <span>
                  {{ previewVehicle.type }}
                  {{
                    isLocomotive(previewVehicle)
                      ? ''
                      : `(${previewIndex + 1} z ${focusedCarWagon?.availableCars.length})`
                  }}
                </span>

                <button @click="nextPreviewIndex">&gt;</button>
              </span>
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
                  <b class="text--accent">Typ wagonu</b> musi zaczynać się typem konstrukcyjnym (np. <i>111a</i> lub
                  <i>203V</i>), wariantem np. <i>111a Grafitti 1</i> lub jego początkiem, np. <i>111a PKPIC</i> (wtedy
                  losowanie obejmuje wszystkie dostępne warianty typu o takim początku)
                </li>
                <li>
                  <b class="text--accent">Ładunek</b> można wybrać po uprzednim wpisaniu typu konstrukcyjnego wagonu
                  towarowego (zakładając, że je posiada)
                </li>
                <li>
                  <b class="text--accent">Szansa</b> (waga) określa prawdopodobieństwo wylosowania danego typu wagonu.
                  Im większa liczba względem reszty wag, tym bardziej prawdopodobne, że zostanie on wybrany
                </li>
                <li>
                  <b class="text--accent">Warianty</b> pokazują liczbę możliwych wagonów w puli w ramach losowania
                  danego typu
                </li>
              </ul>
            </div>

            <div class="list-wrapper">
              <ul class="carwagon-list">
                <li class="text--accent" style="font-weight: bold">
                  <div>Typ wagonu</div>
                  <div>Ładunek</div>
                  <div>Szansa</div>
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
                      placeholder="Kliknij, aby dodać wagon..."
                    />
                    <datalist id="types-datalist">
                      <option value="">Wybierz wagon</option>
                      <option v-for="carOptionType in allCarOptionsList" :value="carOptionType">
                        {{ carOptionType }}
                      </option>
                    </datalist>
                  </div>
                  <div>
                    <select class="carwagon-cargo" v-model="stockWagon.chosenCargo">
                      <option :value="undefined">brak</option>
                      <option
                        :value="{ id: 'random', totalMass: 0 }"
                        v-if="stockWagon.availableCargo && stockWagon.availableCargo.length > 0"
                      >
                        losowy
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
                      <img :src="getIconURL('remove')" alt="remove" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <button class="btn btn--outline" @click="addToRandomStockList">+ NOWY WAGON</button>
          </div>
        </div>

        <div class="stock-actions">
          <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="generateRandomStock">
            LOSUJ SKŁAD!
          </button>
          <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="store.isRandomizerCardOpen = false">
            ZAMKNIJ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ICargo, ICarWagon, ILocomotive, Vehicle } from '../../types';

import { useStore } from '../../store';
import stockMixin from '../../mixins/stockMixin';
import imageMixin from '../../mixins/imageMixin';
import { isLocomotive } from '../../utils/vehicleUtils';

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

  mixins: [stockMixin, imageMixin],

  activated() {
    (this.$refs['cardWrapper'] as any).focus();
  },

  data: () => ({
    maxStockMass: 650,
    maxStockLength: 350,
    maxStockCount: 30,

    chosenCarWagonList: [] as RandomStockCarWagon[],
    chosenLocomotive: undefined as ILocomotive | undefined,

    warningMessage: '',

    showRules: false,
    isPreviewLoading: false,

    focusedCarWagon: undefined as RandomStockCarWagon | undefined,
    randomFocusedWagonVariant: undefined as ICarWagon | undefined,

    previewVehicle: undefined as Vehicle | undefined,
    previewIndex: 0,
  }),

  watch: {
    'focusedCarWagon.availableCars': {
      handler(cars?: RandomStockCarWagon['availableCars'], prevCars?: RandomStockCarWagon['availableCars']) {
        const prevAvailableCarsStr = prevCars?.map((car) => car.type).join(',') || '';
        const availableCarsStr = cars?.map((car) => car.type).join(',') || '';

        if (prevAvailableCarsStr != availableCarsStr || (this.previewVehicle && isLocomotive(this.previewVehicle))) {
          this.previewIndex = 0;
          this.randomFocusedWagonVariant = this.focusedCarWagon?.availableCars[this.previewIndex];
          //~~(Math.random() * this.focusedCarWagon.availableCars.length)

          this.previewVehicle = this.randomFocusedWagonVariant;
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
    isLocomotive,

    nextPreviewIndex() {
      if (!this.focusedCarWagon || (this.previewVehicle && isLocomotive(this.previewVehicle))) return;
      if (this.previewIndex > this.focusedCarWagon.availableCars.length - 2) return;

      this.randomFocusedWagonVariant = this.focusedCarWagon.availableCars[++this.previewIndex];
      this.previewVehicle = this.randomFocusedWagonVariant;
    },

    prevPreviewIndex() {
      if (!this.focusedCarWagon || (this.previewVehicle && isLocomotive(this.previewVehicle))) return;
      if (this.previewIndex == 0) return;

      this.randomFocusedWagonVariant = this.focusedCarWagon.availableCars[--this.previewIndex];
      this.previewVehicle = this.randomFocusedWagonVariant;
    },

    onLocomotivePreviewSelect() {
      this.previewVehicle = this.chosenLocomotive;
    },

    onCarWagonTypeInput(carWagon: RandomStockCarWagon) {
      const constructionType = carWagon.stockString.split(' ')[0];

      const carWagonObj = this.store.carDataList.find((car) => car.constructionType == constructionType);

      const allAvailableCars = this.store.carDataList.filter(
        (car) => car.type.startsWith(carWagon.stockString.replace(/ /g, '_')) && carWagon.stockString.length != 0
      );

      carWagon.availableCars = allAvailableCars;
      carWagon.availableCargo = carWagonObj?.cargoList || undefined;

      if (!carWagonObj?.cargoList) {
        carWagon.chosenCargo = undefined;
      }
    },

    onCarWagonTypeFocus(carWagon: RandomStockCarWagon) {
      this.focusedCarWagon = carWagon;
      this.previewVehicle = this.randomFocusedWagonVariant;
    },

    addToRandomStockList() {
      const randTypeList = this.allCarOptionsList.filter((carOption) =>
        /1|2/g.test(carOption.split(' ').length.toString())
      );
      // const randType = randTypeList[Math.floor(Math.random() * randTypeList.length)];

      const randomStockCarWagon: RandomStockCarWagon = {
        stockString: '',
        chance: 10,
        chosenCargo: undefined,
        availableCargo: undefined,
        availableCars: [],
      };

      this.chosenCarWagonList.push(randomStockCarWagon);
    },

    removeFromRandomStockList(index: number) {
      this.chosenCarWagonList.splice(index, 1);
    },

    validateCarWagonList() {
      return (
        this.chosenCarWagonList.length > 0 &&
        this.chosenCarWagonList.every((carWagon) => carWagon.availableCars.length > 0)
      );
    },

    generateRandomStock() {
      let totalLength = 0;
      let totalMass = 0;

      if (!this.chosenLocomotive) {
        this.warningMessage = 'Nie wybrano lokomotywy!';
        return;
      }

      if (!this.validateCarWagonList()) {
        this.warningMessage = 'Wpisano niepoprawne wartości w liście wagonów!';
        return;
      }

      this.store.stockList.length = 0;
      this.addLocomotive(this.chosenLocomotive);
      totalLength += this.chosenLocomotive.length;
      totalMass += this.chosenLocomotive.mass;

      while (true) {
        const { carWagon, cargo } = this.getRandomStock();
        const totalMassAfter = totalMass + (cargo?.totalMass || carWagon.mass);
        const totalLengthAfter = totalLength + carWagon.length;

        if (
          this.store.stockList.length > this.maxStockCount ||
          totalLengthAfter > this.maxStockLength ||
          totalMassAfter > this.maxStockMass
        )
          break;

        this.addCarWagon(carWagon, cargo);

        totalLength = totalLengthAfter;
        totalMass = totalMassAfter;
      }

      this.store.isRandomizerCardOpen = false;
      this.warningMessage = '';
    },

    getRandomStock(): { carWagon: ICarWagon; cargo?: ICargo } {
      const totalChancePot = this.chosenCarWagonList.reduce((total, car) => {
        total += car.chance;
        return total;
      }, 0);

      let rand = Math.random() * totalChancePot;
      let randCarWagon: ICarWagon | undefined = undefined;
      let randCargo: ICargo | undefined = undefined;

      for (let wagonItem of this.chosenCarWagonList) {
        if (rand < wagonItem.chance) {
          randCarWagon = { ...wagonItem.availableCars[Math.floor(Math.random() * wagonItem.availableCars.length)] };
          randCargo =
            wagonItem.chosenCargo?.id == 'random'
              ? { ...wagonItem.availableCargo![~~(Math.random() * wagonItem.availableCargo!.length)] }
              : wagonItem.chosenCargo;

          break;
        }

        rand -= wagonItem.chance;
      }

      return { carWagon: randCarWagon!, cargo: randCargo };
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

h1 {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 2.5em;
  text-align: center;

  img {
    width: 1.75em;
    margin-right: 0.25em;
  }
}

h3 {
  color: $accentColor;
  margin: 0 0 0.5em 0;
}



.card_content {
  overflow-y: hidden;
  border: 2px solid white;

  width: 95vw;
  max-width: 750px;

  height: 90vh;
  max-height: 900px;

  background-color: #111;

  border-radius: 1em;

  z-index: 99;

  .card_wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    padding: 0.5em 1em;
  }
}

.warning-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;

  z-index: 101;

  font-size: 1.2em;

  text-align: center;
  padding: 0.25em;

  background-color: #b2222288;
}

.random-stock-selections {
  text-align: left;

  .select-box {
    padding: 0.5em 0;
  }
}

.first-row > .max-values {
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

.second-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 1em;

  .car-preview {
    position: relative;
    width: 300px;
    height: 180px;
    margin: 0 auto;

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
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);

      width: 100%;

      padding: 0.5em;

      &.info {
        button {
          font-size: 1.2em;
        }

        background-color: #111111dd;

        display: flex;
        justify-content: space-between;
        text-align: center;
      }
    }

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.rules {
  margin: 0.5em 0;

  ul {
    list-style: inside;
    border: 1px solid $accentColor;
    padding: 0.5em;
  }
}

.list-wrapper {
  overflow: auto;
}

.carwagon-list li {
  margin: 0.5em 0;
  min-width: 450px;

  display: grid;
  grid-template-columns: 3fr 2fr 1fr 1fr 3em;
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

.stock-actions {
  display: flex;
  justify-content: center;

  margin-top: auto;
  padding: 1em 0;

  .btn {
    margin-right: 0.5em;
  }
}

@media screen and (max-width: 600px) {
  .car-preview {
    width: 20em;
    height: 13em;
  }

  h3 {
    text-align: center;
  }

  .select-box {
    margin: 0.5em auto;
  }

  .max-values {
    justify-content: center;

    span {
      margin: 0.25em;
    }
  }
}
</style>

