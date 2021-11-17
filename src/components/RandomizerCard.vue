<template>
  <div class="card">
    <!-- <button class="btn" @click="closeCard">X</button> -->

    <div class="wrapper">
      <h1>LOSUJ SKŁAD TOWAROWY <img :src="icons.randomize" alt="losuj skład" /></h1>

      <h3>
        Skład zostanie dołączony do dodanej na liście lokomotywy czołowej bądź wygenerowany z losową w przypadku jej
        braku
      </h3>

      <div class="car-preview">
        <div class="image-wrapper">
          <div v-if="isPreviewLoading" class="loading">ŁADOWANIE...</div>
          <img v-if="focusedCar" :src="focusedCar?.imageSrc" :alt="focusedCar.type" @load="onPreviewLoaded" />
        </div>
        <b class="text--accent" v-if="focusedCar">
          {{ focusedCar.type.split('_')[0] }} {{ focusedCar.type.split('_')[2] }}
        </b>
        <b v-else>Podgląd typu wagonu</b>

        <div v-if="focusedCar">{{ cargoUsage[focusedCar.type.split('_')[0]] }}</div>
        <div v-else>Najedź na rodzaj wagonu aby wyświetlić informacje</div>
      </div>

      <div class="car-choice">
        <p>Dobierz rodzaje wagonów</p>
        <div>
          <button
            class="btn choice-btn"
            v-for="carType in cargoTypeList"
            :key="carType"
            @click="toggleCarType(carType)"
            @mouseenter="displayPreview(carType)"
            :class="{ chosen: chosenCarTypes.includes(carType) }"
          >
            {{ carType }}
          </button>
        </div>
      </div>

      <div class="length-choice">
        <p>Wybierz preferowaną długość składu (m) i (opcjonalnie) max. masę (t)</p>
        <input
          type="number"
          v-model="chosenLength"
          name="length"
          max="650"
          min="20"
          step="10"
          title="Długość składu (m)"
        />
        <input
          type="number"
          v-model="chosenMass"
          name="length"
          max="2500"
          min="100"
          step="100"
          title="Masa składu (t)"
        />
      </div>

      <div style="margin: 1em 0">
        <button
          class="btn choice-btn"
          :class="{ chosen: includeSupporterVehicles }"
          @click="
            () => {
              includeSupporterVehicles = !includeSupporterVehicles;
            }
          "
        >
          DOŁĄCZ POJAZDY DLA SUPPORTERÓW
        </button>
      </div>

      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="randomize">LOSUJ SKŁAD!</button>
      <button class="btn" style="font-size: 1.15em; margin-top: 2em" @click="closeCard">ZAMKNIJ</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ICargo, ICarWagon, ILocomotive, IStore } from '@/types';
import { ComputedRef, defineComponent, inject } from 'vue';

export default defineComponent({
  setup() {
    const isCardOpen = inject('isCardOpen') as boolean;
    const store = inject('Store') as IStore;

    const carDataList = inject('carDataList') as ComputedRef<ICarWagon[]>;

    return {
      isCardOpen,
      store,
      locoDataList: inject('locoDataList') as ILocomotive[],
      chosenLength: inject('chosenLength') as number,
      chosenMass: inject('chosenMass') as number,
      cargoCarList: carDataList.value.filter((car) => car.useType == 'car-cargo'),
      cargoTypeList: carDataList.value.reduce((list, car) => {
        const type = car.type.split('_')[0];

        if (car.useType != 'car-cargo' || list.includes(type)) return list;

        list.push(type);

        return list;
      }, [] as string[]),

      chosenLocoType: inject('chosenLocoType') as string,
      chosenCarTypes: inject('chosenCarTypes') as string[],

      includeSupporterVehicles: inject('includeSupporterVehicles') as boolean,
    };
  },

  data: () => ({
    icons: {
      randomize: require('@/assets/randomize-icon.svg'),
    },

    focusedCar: null as ICarWagon | null,
    isPreviewLoading: false,

    cargoUsage: {
      '203V': 'kruszywo, kamień wapienny, odpady kopalniane',
      '208Kf': 'drobnica, ładunki sypkie',
      '209c': 'wagon techniczny',
      '29R': 'produkty naftowe',
      '304Ca': 'pojazd specjalny',
      '401Ka': 'drobnica, ładunki sypkie',
      '401Zb': 'ładunki sypkie o dużej masie usypowej',
      '408S': 'cement, wapno, popioły lotne, żużel',
      '412W': 'drobnica, kruszywo, węgiel',
      '412Z': 'kontenery',
      '424Z': 'ładunki skupione, pojazdy, dłużyca',
      '426S': 'drobnica',
      '429W': 'towary masowe odporne na warunki atmosferyczne (węgiel, ruda)',
      '441V': 'węgiel kamienny, żwir',
      '627Z': 'kontenery',
    } as { [key: string]: string },
  }),

  methods: {
    closeCard() {
      this.isCardOpen = false;
    },

    displayPreview(carType: string) {
      const list = this.cargoCarList.filter((car) => car.type.includes(carType));
      const randIndex = Math.floor(Math.random() * list.length);

      if (this.focusedCar?.type == list[randIndex].type) return;

      this.focusedCar = list[randIndex];
      this.isPreviewLoading = true;
    },

    onPreviewLoaded() {
      this.isPreviewLoading = false;
    },

    randomize() {
      if (this.chosenCarTypes.length == 0) {
        alert('Wybierz przynajmniej jeden rodzaj wagonów!');
        return;
      }

      if (this.chosenLength <= 20) {
        alert('Długość składu musi być większa niż 20m!');
        return;
      }

      if (this.chosenMass <= 100) {
        alert('Masa składu musi być większa niż 100t!');
        return;
      }

      if (this.chosenMass > 2500) {
        alert('Masa składu nie powinna przekraczać 2500t!');
        return;
      }

      if (this.chosenLength > 650) {
        alert('Długość składu nie może przekraczać 650m dla pociągów towarowych!');
        return;
      }

      let totalStockLength = 0;
      let totalStockMass = 0;

      if (this.store.stockList.length == 0 || !this.store.stockList[0].isLoco) {
        this.store.stockList.length = 0;

        const locoSet = this.locoDataList
          .filter((loco) => !loco.type.startsWith('EP') && (loco.power == 'loco-e' || loco.power == 'loco-s'))
          .filter((loco) => (!this.includeSupporterVehicles && loco.supportersOnly ? false : true));

        const randLoco = locoSet[Math.floor(Math.random() * locoSet.length)];

        this.addLoco(randLoco);
      } else this.store.stockList.length = 1;

      totalStockLength += this.store.stockList[0].length;
      totalStockMass += this.store.stockList[0].mass;

      let availableCarsSet = this.cargoCarList.filter((cargoCar) => {
        if (!this.includeSupporterVehicles && cargoCar.supportersOnly) return false;

        if (this.chosenCarTypes.find((carType) => cargoCar.type.includes(carType))) return true;

        return false;
      });

      while (totalStockLength < this.chosenLength && totalStockMass < this.chosenMass) {
        const randCarIndex = Math.floor(Math.random() * availableCarsSet.length);

        const randCar = availableCarsSet[randCarIndex];

        // const count = Math.random() < 0.25 ? Math.floor(Math.random() * 2) + 1 : 1;
        const count = 1;

        if (randCar.length * count + totalStockLength >= this.chosenLength) break;

        let randCargo = undefined;
        let randNum = Math.random();
        if (randCar.cargoList.length != 0 && randNum >= 0.6)
          randCargo = randCar.cargoList[Math.floor(Math.random() * randCar.cargoList.length)];

        if ((randCargo?.totalMass || randCar.mass) * count + totalStockMass >= this.chosenMass) break;

        for (let i = 0; i < count; i++) this.addCar(randCar, randCargo);

        totalStockLength += randCar.length * count;
        totalStockMass += randCargo?.totalMass || randCar.mass;
      }

      this.isCardOpen = false;
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

      const stockObj = {
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

      const stockObj = {
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
/* @import url('../styles/global.scss'); */

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

button.choice-btn {
  color: gray;
  border-color: gray;

  &:hover,
  *:focus {
    color: white;
    border-color: white;
  }

  user-select: none;
}

button.chosen {
  border-color: gold;
  color: gold;
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
