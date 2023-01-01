<template>
  <div class="real-stock-card g-card" v-if="store.isRealStockListCardOpen">
    <div class="g-card_bg" @click="store.isRealStockListCardOpen = false"></div>

    <div class="card_content">
      <div class="top-sticky">
        <button class="btn btn--text exit-btn" @click="store.isRealStockListCardOpen = false">&lt; POWRÓT</button>

        <div class="header">
          <h1>
            REALNE ZESTAWIENIA
            <div>by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a></div>
          </h1>
          <p>
            Pełne informacje o zestawieniach dostępne na stronie
            <a href="http://bocznica.eu/files/archiwum/2021r_2021-11-04.html" target="_blank">bocznica.eu</a> (stan na
            listopad 2021r.)
          </p>

          <input type="text" tabindex="0" v-model="searchedReadyStockName" placeholder="Szukaj zestawienia..." />
        </div>
      </div>

      <ul v-if="responseStatus == 'loaded'">
        <li
          v-for="(stock, key) in computedReadyStockList"
          :key="key"
          tabindex="0"
          @click="choseStock(stock.name, stock.type, stock.number, stock.stockString)"
          @keydown.enter="choseStock(stock.name, stock.type, stock.number, stock.stockString)"
        >
          <img :src="getIconURL(stock.type)" :alt="stock.type" />

          <b class="text--accent"> {{ stock.name }}</b>
          <div>{{ stock.number }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Vehicle, IStock, IReadyStockList } from '../../types';

import { useStore } from '../../store';
import { isLocomotive } from '../../utils/vehicleUtils';
import imageMixin from '../../mixins/imageMixin';

interface ResponseJSONData {
  [key: string]: string;
}

export default defineComponent({
  mixins: [imageMixin],

  setup() {
    return {
      store: useStore(),
    };
  },

  data: () => ({
    responseStatus: 'loading',
    isMobile: 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) ? true : false,

    searchedReadyStockName: '',
  }),

  computed: {
    computedReadyStockList() {
      if (this.searchedReadyStockName == null) return this.store.readyStockList;

      let filtered: IReadyStockList = {};

      for (let key in this.store.readyStockList) {
        if (key.toLocaleLowerCase().includes(this.searchedReadyStockName.toLocaleLowerCase()))
          filtered[key] = this.store.readyStockList[key];
      }

      return filtered;
    },
  },

  methods: {
    getImageUrl(name: string) {
      return new URL(`./dir/${name}.png`, import.meta.url).href;
    },

    choseStock(name: string, type: string, number: string, stockString: string) {
      const stockArray = stockString.split(';');

      this.store.stockList.length = 0;
      this.store.chosenVehicle = null;
      this.store.chosenCar = null;
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;
      this.store.chosenStockListIndex = -1;

      this.store.swapVehicles = false;

      stockArray.forEach((type, i) => {
        let vehicle: Vehicle | null = null;
        if (i == 0) vehicle = this.store.locoDataList.find((loco) => loco.type == stockArray[0]) || null;
        else vehicle = this.store.carDataList.find((car) => car.type == type) || null;

        this.addVehicle(vehicle);
      });

      this.store.isRealStockListCardOpen = false;
    },

    addVehicle(vehicle: Vehicle | null) {
      if (!vehicle) return;

      const stockObj: IStock = {
        id: `${Date.now() + this.store.stockList.length}`,
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: isLocomotive(vehicle),
        cargo: undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        useType: isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
        supportersOnly: vehicle.supportersOnly,
      };

      const previousStock =
        this.store.stockList.length > 0 ? this.store.stockList[this.store.stockList.length - 1] : null;

      if (previousStock && previousStock.type == vehicle.type) {
        this.store.stockList[this.store.stockList.length - 1].count++;
        return;
      }

      this.store.stockList.push(stockObj);
    },
  },

  async mounted() {
    const readyStockJSONData: ResponseJSONData = await (
      await fetch(`https://spythere.github.io/api/readyStock.json?t=${Math.floor(Date.now() / 60000)}`)
    ).json();

    if (!readyStockJSONData) {
      this.responseStatus = 'error';
      return;
    }

    for (let stockKey in readyStockJSONData) {
      const splittedKey = stockKey.split(' ');

      let name = '';
      for (let i = 2; i < splittedKey.length; i++) {
        name += ' ' + splittedKey[i];
      }

      this.store.readyStockList[stockKey] = {
        type: splittedKey[0],
        number: splittedKey[1].replace(/_/g, '/'),
        name,
        stockString: readyStockJSONData[stockKey],
      };
    }

    this.responseStatus = 'loaded';
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.exit-btn {
  font-size: 1.2em;
  margin: 0.5em 0;
}

input {
  width: 100%;
  max-width: 250px;

  &::placeholder {
    font-size: 0.9em;
    text-align: center;
  }
}

.card_content {
  background-color: #1c1c1c;
  border-radius: 1em;

  height: 85vh;
  max-width: 1000px;
  width: 90vw;

  padding: 0 1em;

  overflow-y: auto;
  z-index: 100;

  .top-sticky {
    position: sticky;
    top: 0;
    background: #1c1c1c;
  }

  .header {
    padding-bottom: 1.5em;
    padding-top: 0.5em;

    text-align: center;
    font-size: 1.3em;

    h1 {
      line-height: 0.9em;
      margin: 0.5em 0;

      div {
        font-size: 0.65em;
        color: #ccc;
      }
    }

    p {
      margin: 1em 0;
      color: #999;
      font-size: 0.95em;
    }
  }

  ul {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1em;

    @media screen and (max-width: 700px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media screen and (max-width: 550px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media screen and (max-width: 400px) {
      grid-template-columns: repeat(1, 1fr);
    }

    margin-bottom: 1em;
  }

  ul li {
    padding: 0.5em;

    cursor: pointer;

    background: #2b2b2b;

    img {
      height: 0.85em;
    }

    span {
      color: #999;
      font-weight: bold;
    }

    &:hover {
      background: #222;
    }

    &:focus {
      outline: 1px solid white;
    }
  }
}
</style>

