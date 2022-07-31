<template>
  <div class="card">
    <div class="wrapper" ref="cardWrapper" tabindex="0">
      <!-- <h1>LOSUJ SKŁAD <img :src="icons.randomize" alt="losuj skład" /></h1>

      <h3>
        Skład zostanie dołączony do dodanej na liście lokomotywy czołowej bądź wygenerowany z losową w przypadku jej
        braku
      </h3> -->

      <div class="car-preview">
        <div class="image-wrapper">
          <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>
          <img v-if="focusedCar" :src="focusedCar?.imageSrc" :alt="focusedCar.type" />
        </div>
        <b class="text--accent" v-if="focusedCar">
          {{ focusedCar.type.split('_')[0] }} {{ focusedCar.type.split('_')[2] }}
        </b>
        <b v-else>Podgląd typu wagonu</b>

        <div v-if="focusedCar">{{ carUsage[focusedCar.type.split('_')[0]] }}</div>
        <div v-else>Najedź na rodzaj wagonu aby wyświetlić informacje</div>
      </div>

      <div class="car-choice">
        <p>Dobierz rodzaje wagonów</p>
        <div>
          <button
            class="btn choice-btn"
            v-for="carType in passengerCarTypeList"
            :key="carType"
            @click="toggleCarType(carType)"
            @mouseenter="displayPreview(carType)"
            @focus="displayPreview(carType)"
            :data-selected="chosenCarTypes.includes(carType)"
          >
            {{ carType }}
          </button>
        </div>

        <div style="margin-top: 0.5em">
          <button
            class="btn choice-btn"
            v-for="carType in cargoCarTypeList"
            :key="carType"
            @click="toggleCarType(carType)"
            @mouseenter="displayPreview(carType)"
            @focus="displayPreview(carType)"
            :data-selected="chosenCarTypes.includes(carType)"
          >
            {{ carType }}
          </button>
        </div>
      </div>

      <div class="length-choice">
        <p>Wybierz preferowaną długość składu (m) i (opcjonalnie) max. masę (t)</p>
        <input
          type="number"
          v-model="randomStockLength"
          name="length"
          max="650"
          min="20"
          step="10"
          title="Długość składu (m)"
        />
        <input
          type="number"
          v-model="randomStockMass"
          name="mass"
          max="4000"
          min="100"
          step="100"
          title="Masa składu (t)"
        />
      </div>

      <div class="cargo-filling g-choice" style="margin: 1em 0">
        <button
          class="btn choice-btn"
          v-for="mode in cargoFillModeList"
          :data-selected="mode.id == chosenCargoFillMode"
          @click="changeCargoFillMode(mode.id)"
        >
          {{ mode.value }}
        </button>
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
    randomStockMass: 1500,
    randomStockLength: 650,
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
        id: `${Date.now()+this.store.stockList.length}`,
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
        id: `${Date.now()+this.store.stockList.length}`,
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

  display: flex;
  justify-content: center;

  text-align: center;

  border: 2px solid white;

  width: 700px;
  padding: 2em 1em;

  background: rgba(black, 0.95);

  @media screen and (max-width: 700px) {
    width: 95%;
  }

  border-radius: 1em;
}

p {
  font-size: 1.2em;
}

h1 {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  margin: 0;

  img {
    margin-left: 0.5em;
    width: 2em;
  }
}

h3 {
  margin: 0 0 2em 0;
  color: #999;
}

button,
input {
  margin: 0.25em;
}

input {
  font-size: 1.2em;
}

.car-choice div {
  display: grid;

  grid-template-columns: repeat(6, 1fr);
  justify-content: center;

  @media screen and (max-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

button.choice-btn {
  color: gray;
  border-color: gray;

  &[data-selected='true'] {
    color: $accentColor;
    border-color: $accentColor;
  }

  &:focus-visible {
    border-color: white;
  }

  user-select: none;
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

    img {
      width: 100%;
      height: 100%;
    }
  }
}

@media screen and (max-width: 600px) {
  .car-preview .image-wrapper {
    width: 20em;
    height: 13em;
  }
}
</style>

