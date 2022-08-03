<template>
  <div class="card">
    <div class="card_wrapper" ref="cardWrapper" tabindex="0">
      <h1>LOSUJ SKŁAD</h1>

      <div class="car-preview">
        <div class="image-wrapper">
          <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>
          <img v-if="focusedCar" :src="focusedCar?.imageSrc" :alt="focusedCar.type" />

          <span class="preview-message" v-else>WYBIERZ POJAZD LUB WAGON, BY ZOBACZYĆ JEGO PODGLĄD</span>
        </div>

        <b class="text--accent" v-if="focusedCar">
          {{ focusedCar.type.split('_')[0] }} {{ focusedCar.type.split('_')[2] }}
        </b>
      </div>

      <div class="random-stock-selections">
        <div class="select-box locos">
          <h3>LOKOMOTYWA</h3>

          <select>
            <option value="test">Test</option>
          </select>
        </div>

        <div class="select-box carwagons">
          <h3>WAGONY</h3>

          <ul class="carwagons-list">
            <li>
              <select class="select-type">
                <option value="test">Test</option>
              </select>

              <select class="select-paint">
                <option value="test">Test</option>
              </select>

              <select class="select-cargo">
                <option value="test">Test</option>
              </select>
              
              <input class="carwagon-chance" type="number" value="5" max="100" min="1" />
            </li>
          </ul>
        </div>
      </div>

      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="randomize">LOSUJ SKŁAD!</button>
      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="store.isRandomizerCardOpen = false">
        ZAMKNIJ
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import carUsage from '../data/carUsage.json';
import { ICarWagon, ILocomotive, ICargo, IStock } from '../types';

import randomizeIcon from '../assets/randomize-icon.svg';
import { useStore } from '../store';

type CargoFillModeType = 'cargo-random' | 'cargo-filled' | 'cargo-empty';

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      store,

      carTypeList: store.carDataList
        .sort((a, b) => (b.useType == 'car-passenger' ? 1 : -1))
        .reduce((list, car) => {
          const type = car.type.split('_')[0];

          if (list.includes(type)) return list;

          list.push(type);

          return list;
        }, [] as string[]),
    };
  },

  activated() {
    (this.$refs['cardWrapper'] as any).focus();
  },

  computed: {
    passengerCarTypeList() {
      return this.store.carDataList
        .reduce((list, car) => {
          if (car.useType != 'car-passenger') return list;

          const type = car.type.split('_')[0];
          if (!list.includes(type)) list.push(type);

          return list;
        }, [] as string[])
        .sort((a, b) => (a > b ? 1 : -1));
    },

    cargoCarTypeList() {
      return this.store.carDataList
        .reduce((list, car) => {
          if (car.useType != 'car-cargo') return list;

          const type = car.type.split('_')[0];
          if (!list.includes(type)) list.push(type);

          return list;
        }, [] as string[])
        .sort((a, b) => (a > b ? 1 : -1));
    },
  },

  data: () => ({
    randomStockMass: 650,
    randomStockLength: 350,
    chosenCarTypes: [] as string[],

    cargoFillModeList: [
      {
        id: 'cargo-random',
        value: 'LOSOWO',
      },
      {
        id: 'cargo-filled',
        value: 'ŁADOWNE',
      },
      {
        id: 'cargo-empty',
        value: 'PRÓŻNE',
      },
    ] as { id: CargoFillModeType; value: string }[],

    chosenCargoFillMode: 'cargo-random' as CargoFillModeType,

    icons: {
      randomize: randomizeIcon,
    },

    focusedCar: null as ICarWagon | null,
    isPreviewLoading: false,

    cargoTypes: [
      '203V',
      '208Kf',
      '209c',
      '29R',
      '304C',
      '304Ca',
      '401Ka',
      '401Zb',
      '408S',
      '412W',
      '412Z',
      '424Z',
      '426S',
      '429W',
      '441V',
      '504a',
      '612a',
      '627Z',
    ],

    carUsage: carUsage as { [key: string]: string },
  }),

  methods: {
    displayPreview(carType: string) {
      const list = this.store.carDataList.filter((car) => car.type.includes(carType));
      const randIndex = Math.floor(Math.random() * list.length);

      if (this.focusedCar?.type == list[randIndex].type) return;

      this.focusedCar = list[randIndex];
    },

    changeCargoFillMode(mode: CargoFillModeType) {
      this.chosenCargoFillMode = mode;
    },

    randomize() {
      if (this.chosenCarTypes.length == 0) {
        alert('Wybierz przynajmniej jeden rodzaj wagonów!');
        return;
      }

      if (this.randomStockLength <= 20) {
        alert('Długość składu musi być większa niż 20m!');
        return;
      }

      if (this.randomStockMass <= 100) {
        alert('Masa składu musi być większa niż 100t!');
        return;
      }

      if (this.randomStockLength > 650) {
        alert('Długość składu nie może przekraczać 650m dla pociągów towarowych!');
        return;
      }

      let totalStockLength = 0;
      let totalStockMass = 0;

      if (this.store.stockList.length == 0 || !this.store.stockList[0].isLoco) {
        this.store.stockList.length = 0;

        let locoSet = this.store.locoDataList.filter((loco) => loco.power == 'loco-e' || loco.power == 'loco-s');

        if (this.chosenCarTypes.some((car) => this.cargoTypes.includes(car)))
          locoSet = locoSet.filter((loco) => !loco.type.startsWith('EP'));

        const randLoco = locoSet[Math.floor(Math.random() * locoSet.length)];

        this.addLoco(randLoco);
      } else this.store.stockList.length = 1;

      totalStockLength += this.store.stockList[0].length;
      totalStockMass += this.store.stockList[0].mass;

      let availableCarsSet = this.store.carDataList.filter((cargoCar) => {
        if (cargoCar.supportersOnly) return false;

        if (this.chosenCarTypes.find((carType) => cargoCar.type.includes(carType))) return true;

        return false;
      });

      while (totalStockLength < this.randomStockLength && totalStockMass < this.randomStockMass) {
        const randCarIndex = Math.floor(Math.random() * availableCarsSet.length);

        const randCar = availableCarsSet[randCarIndex];

        // const count = Math.random() < 0.25 ? Math.floor(Math.random() * 2) + 1 : 1;
        const count = 1;

        if (randCar.length * count + totalStockLength >= this.randomStockLength) break;

        let randCargo = undefined;
        let randNum =
          this.chosenCargoFillMode == 'cargo-filled'
            ? 1
            : this.chosenCargoFillMode == 'cargo-empty'
            ? 0
            : Math.random();
        if (randCar.cargoList.length != 0 && randNum >= 0.6)
          randCargo = randCar.cargoList[Math.floor(Math.random() * randCar.cargoList.length)];

        if ((randCargo?.totalMass || randCar.mass) * count + totalStockMass >= this.randomStockMass) break;

        for (let i = 0; i < count; i++) this.addCar(randCar, randCargo);

        totalStockLength += randCar.length * count;
        totalStockMass += randCargo?.totalMass || randCar.mass;
      }

      this.store.chosenStockListIndex = -1;
      this.store.chosenVehicle = null;

      this.store.isRandomizerCardOpen = false;
    },

    toggleCarType(carType: string) {
      if (this.chosenCarTypes.includes(carType)) this.chosenCarTypes.splice(this.chosenCarTypes.indexOf(carType), 1);
      else this.chosenCarTypes.push(carType);
    },

    addLoco(loco: ILocomotive) {
      const previousStock =
        this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;

      if (previousStock && previousStock.type == loco.type) {
        this.store.stockList[this.store.stockList.length - 1].count++;
        return;
      }

      const stockObj: IStock = {
        id: `${Date.now() + this.store.stockList.length}`,
        type: loco.type,
        length: loco.length,
        mass: loco.mass,
        maxSpeed: loco.maxSpeed,
        isLoco: true,
        cargo: undefined,
        count: 1,
        imgSrc: loco.imageSrc,
        useType: loco.power,
        supportersOnly: loco.supportersOnly,
      };

      if (this.store.stockList.length > 0 && !this.store.stockList[0].isLoco) this.store.stockList.unshift(stockObj);
      else this.store.stockList.push(stockObj);
    },

    addCar(car: ICarWagon, cargo?: ICargo) {
      const previousStock =
        this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;

      if (previousStock && previousStock.type == car.type && previousStock.cargo?.id == cargo?.id) {
        this.store.stockList[this.store.stockList.length - 1].count++;

        return;
      }

      const stockObj: IStock = {
        id: `${Date.now() + this.store.stockList.length}`,
        type: car.type,
        length: car.length,
        mass: car.mass,
        maxSpeed: car.maxSpeed,
        isLoco: false,
        cargo: car.loadable && cargo ? cargo : undefined,
        count: 1,
        imgSrc: car.imageSrc,
        useType: car.useType,
        supportersOnly: car.supportersOnly,
      };

      this.store.stockList.push(stockObj);
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

  background: #242424;

  @media screen and (max-width: 700px) {
    width: 95%;
  }

  border-radius: 1em;
}

p {
  font-size: 1.2em;
}

h1 {
  text-align: center;
  color: $accentColor;
}

h3 {
  color: $accentColor;
  margin: 0 0 0.5em 0;
}

.car-choice div {
  display: grid;

  grid-template-columns: repeat(6, 1fr);
  justify-content: center;

  @media screen and (max-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
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

.random-stock-selections {
  text-align: left;

  .select-box {
    padding: 0.5em 0;
  }
}

ul.carwagons-list li select {
  margin: 0.5em 0.5em 0 0;
  &.select-type {
    width: 80px;
  }

  &.select-paint {
    width: 150px;
  }

  &.select-cargo {
    width: 100px;
  }
}

input.carwagon-chance {
    background-color: $accentColor;
    border: none;
    font-weight: bold;
}

@media screen and (max-width: 600px) {
  .car-preview .image-wrapper {
    width: 20em;
    height: 13em;
  }
}
</style>

