<template>
  <div class="card">
    <div class="card_wrapper" ref="cardWrapper" tabindex="0">
      <h1>LOSUJ SKŁAD</h1>

      <!-- <div class="car-preview">
        <div class="image-wrapper">
          <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>
          <img v-if="focusedCar" :src="focusedCar?.imageSrc" :alt="focusedCar.type" />

          <span class="preview-message" v-else>WYBIERZ POJAZD LUB WAGON, BY ZOBACZYĆ JEGO PODGLĄD</span>
        </div>

        <b class="text--accent" v-if="focusedCar">
          {{ focusedCar.type.split('_')[0] }} {{ focusedCar.type.split('_')[2] }}
        </b>
      </div> -->

      <div class="random-stock-selections">
        <div class="select-box locos">
          <h3>LOKOMOTYWA</h3>

          <select v-model="chosenLocomotive">
            <option :value="undefined">Wybierz lokomotywę</option>
            <option v-for="loco in store.locoDataList.filter((l) => !l.type.includes('EN'))" :value="loco">
              {{ loco.type }}
            </option>
          </select>
        </div>

        <div class="select-box carwagons">
          <h3>WAGONY</h3>

          <div class="rules">
            <button v-if="showRules" class="btn btn--outline" style="margin-bottom: 0.5em" @click="showRules = false">
              Ukryj zasady dodawania wagonów
            </button>

            <button v-else class="btn btn--outline" @click="showRules = true">Pokaż zasady dodawania wagonów</button>

            <ul v-if="showRules" class="rules-list">
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
            <li v-for="(stockWagon, i) in chosenCarWagonList">
              <input
                class="carwagon-type g-input"
                type="text"
                list="types-datalist"
                v-model="stockWagon.stockString"
                @input="onCarWagonTypeInput(stockWagon)"
              />

              <datalist id="types-datalist">
                <option v-for="carOptionType in allCarOptionsList" :value="carOptionType">{{ carOptionType }}</option>
              </datalist>

              <select class="carwagon-cargo" v-model="stockWagon.chosenCargo">
                <option :value="undefined">bez ładunku</option>

                <option value="random" v-if="stockWagon.availableCargo && stockWagon.availableCargo.length > 0">
                  losowo
                </option>

                <option v-for="cargo in stockWagon.availableCargo" :value="cargo">
                  {{ cargo.id }}
                </option>
              </select>

              <span class="carwagon-chance">
                <input type="number" v-model="stockWagon.chance" max="100" min="1" />
              </span>

              <div>Warianty: {{ stockWagon.availableCars.length }}</div>
            </li>
          </ul>

          <button class="btn btn--outline" @click="addCarWagon">+ DODAJ NOWY WAGON</button>
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
    randomStockMass: 650,
    randomStockLength: 350,

    chosenCarWagonList: [] as RandomStockCarWagon[],
    chosenLocomotive: undefined as ILocomotive | undefined,

    showRules: false,
    // isPreviewLoading: false,
  }),

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

      return list.sort((a, b) => a > b ? 1 : -1);
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
    },

    addCarWagon() {
      const randomStockCarWagon: RandomStockCarWagon = {
        stockString: '111a PKPIC',
        chance: 10,
        chosenCargo: undefined,
        availableCargo: undefined,
        availableCars: this.store.carDataList.filter((car) => car.type.startsWith('111a_PKPIC')),
      };

      this.chosenCarWagonList.push(randomStockCarWagon);
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

    // getRandomStockItem() {
    //   const totalChancePot = this.chosenCarWagonList.reduce((total, car) => {
    //     total += car.chance;
    //     return total;
    //   }, 0);

    //   let rand = Math.random() * totalChancePot;
    //   let randomCarWagon: RandomStockCarWagon | undefined = undefined;

    //   for (let wagonItem of this.chosenCarWagonList) {
    //     if (rand < wagonItem.chance) {
    //       randomCarWagon = { ...wagonItem };
    //       break;
    //     }

    //     rand -= wagonItem.chance;
    //   }

    //   return randomCarWagon!;
    // },

    // randomize() {
    //   if (this.chosenCarTypes.length == 0) {
    //     alert('Wybierz przynajmniej jeden rodzaj wagonów!');
    //     return;
    //   }

    //   if (this.randomStockLength <= 20) {
    //     alert('Długość składu musi być większa niż 20m!');
    //     return;
    //   }

    //   if (this.randomStockMass <= 100) {
    //     alert('Masa składu musi być większa niż 100t!');
    //     return;
    //   }

    //   if (this.randomStockLength > 650) {
    //     alert('Długość składu nie może przekraczać 650m dla pociągów towarowych!');
    //     return;
    //   }

    //   let totalStockLength = 0;
    //   let totalStockMass = 0;

    //   if (this.store.stockList.length == 0 || !this.store.stockList[0].isLoco) {
    //     this.store.stockList.length = 0;

    //     let locoSet = this.store.locoDataList.filter((loco) => loco.power == 'loco-e' || loco.power == 'loco-s');

    //     if (this.chosenCarTypes.some((car) => this.cargoTypes.includes(car)))
    //       locoSet = locoSet.filter((loco) => !loco.type.startsWith('EP'));

    //     const randLoco = locoSet[Math.floor(Math.random() * locoSet.length)];

    //     this.addLoco(randLoco);
    //   } else this.store.stockList.length = 1;

    //   totalStockLength += this.store.stockList[0].length;
    //   totalStockMass += this.store.stockList[0].mass;

    //   let availableCarsSet = this.store.carDataList.filter((cargoCar) => {
    //     if (cargoCar.supportersOnly) return false;

    //     if (this.chosenCarTypes.find((carType) => cargoCar.type.includes(carType))) return true;

    //     return false;
    //   });

    //   while (totalStockLength < this.randomStockLength && totalStockMass < this.randomStockMass) {
    //     const randCarIndex = Math.floor(Math.random() * availableCarsSet.length);

    //     const randCar = availableCarsSet[randCarIndex];

    //     // const count = Math.random() < 0.25 ? Math.floor(Math.random() * 2) + 1 : 1;
    //     const count = 1;

    //     if (randCar.length * count + totalStockLength >= this.randomStockLength) break;

    //     let randCargo = undefined;
    //     let randNum =
    //       this.chosenCargoFillMode == 'cargo-filled'
    //         ? 1
    //         : this.chosenCargoFillMode == 'cargo-empty'
    //         ? 0
    //         : Math.random();
    //     if (randCar.cargoList.length != 0 && randNum >= 0.6)
    //       randCargo = randCar.cargoList[Math.floor(Math.random() * randCar.cargoList.length)];

    //     if ((randCargo?.totalMass || randCar.mass) * count + totalStockMass >= this.randomStockMass) break;

    //     for (let i = 0; i < count; i++) this.addCar(randCar, randCargo);

    //     totalStockLength += randCar.length * count;
    //     totalStockMass += randCargo?.totalMass || randCar.mass;
    //   }

    //   this.store.chosenStockListIndex = -1;
    //   this.store.chosenVehicle = null;

    //   this.store.isRandomizerCardOpen = false;
    // },
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
  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;

  b {
    font-size: 1.3em;
  }

  .image-wrapper {
    position: relative;
    width: 300px;
    height: 180px;

    border: 1px solid white;
    margin-bottom: 1em;

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
    }

    img {
      width: 100%;
      height: 100%;
    }
  }
}

.carwagon-list li {
  margin: 0.5em 0;

  display: flex;
  align-items: center;

  > * {
    margin-right: 0.5em;
  }

  input.carwagon-type {
    width: auto;
  }

  select.carwagon-cargo {
    max-width: 150px;
  }
  .carwagon-chance {
    input {
      font-weight: bold;
      width: auto;
    }
  }
}

.random-stock-selections {
  text-align: left;

  .select-box {
    padding: 0.5em 0;
  }
}

@media screen and (max-width: 600px) {
  .car-preview .image-wrapper {
    width: 20em;
    height: 13em;
  }
}
</style>

