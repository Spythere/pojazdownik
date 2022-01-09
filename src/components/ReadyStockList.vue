<template>
  <div class="ready-stock-list" v-if="isOpen">
    <div class="top-sticky">
      <button class="btn btn--text exit" @click="exit">&lt; POWRÓT</button>

      <div class="header">
        <h1>
          REALNE ZESTAWIENIA
          <div>by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a></div>
        </h1>
        <p>
          {{ isMobile ? 'Przytrzymaj zestawienie' : 'Kliknij na zestawienie prawym przyciskiem myszy' }}, aby zobaczyć je
          na stronie <i>vagonweb.cz</i>
        </p>
        <input type="text" tabindex="0" v-model="searchedReadyStockName" placeholder="Szukaj zestawienia..." />
      </div>
    </div>

    <ul v-if="responseStatus == 'loaded'">
      <li
        v-for="(stock, key) in computedReadyStockList"
        :key="key"
        tabindex="0"
        @contextmenu="openPreview($event, stock.type, stock.number)"
        @click="choseStock(stock.name, stock.type, stock.number, stock.stockString)"
        @keydown.space="openPreview($event, stock.type, stock.number)"
        @keydown.enter="choseStock(stock.name, stock.type, stock.number, stock.stockString)"
      >
        <img v-if="stock.type != 'iR' && stock.type != 'RE'" :src="icons[stock.type]" alt="" />
        <span v-else>{{ stock.type }}</span>

        <b class="text--accent"> {{ stock.name }}</b>
        <div>{{ stock.number }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ICarWagon, ILocomotive, IStore } from '@/types';
import { defineComponent, inject } from 'vue';

interface ReadyStockList {
  [key: string]: { stockString: string; type: string; number: string; name: string };
}

interface ResponseJSONData {
  [key: string]: string;
}

export default defineComponent({
  setup() {
    return {
      isOpen: inject('isReadyStockListOpen'),
      store: inject('Store') as IStore,
      locoDataList: inject('locoDataList') as ILocomotive[],
      carDataList: inject('carDataList') as ICarWagon[],
      isLocomotive: inject('isLocomotive') as (vehicle: ILocomotive | ICarWagon) => vehicle is ILocomotive,
    };
  },

  data: () => ({
    responseStatus: 'loading',
    isMobile: 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) ? true : false,

    readyStockList: {} as ReadyStockList,
    searchedReadyStockName: '',

    icons: {
      EIC: require('@/assets/EIC.png'),
      IC: require('@/assets/IC.svg'),
      TLK: require('@/assets/TLK.png'),
    } as { [key: string]: string },
  }),

  computed: {
    computedReadyStockList() {
      if (this.searchedReadyStockName == null) return this.readyStockList;

      let filtered: ReadyStockList = {};

      for (let key in this.readyStockList) {
        if (key.toLocaleLowerCase().includes(this.searchedReadyStockName.toLocaleLowerCase()))
          filtered[key] = this.readyStockList[key];
      }

      return filtered;
    },
  },

  methods: {
    exit() {
      this.isOpen = false;
    },

    openPreview(e: Event, type: string, number: string) {
      e.preventDefault();

      const isRegio = type == 'RE' || type == 'iR';

      const zeme = isRegio ? 'PREG' : 'PKPIC';
      const rok = isRegio ? '&rok=2013' : '';

      const url = `https://www.vagonweb.cz/razeni/vlak.php?zeme=${zeme}&kategorie=${type}&cislo=${number}${rok}`;

      window.open(url);
    },

    choseStock(name: string, type: string, number: string, stockString: string) {
      const stockArray = stockString.split(';');

      this.store.stockList.length = 0;
      this.store.chosenCar = null;
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;

      this.store.swapVehicles = false;

      this.store.chosenRealStockName = `${type} ${number} ${name}`;

      stockArray.forEach((type, i) => {
        let vehicle;
        if (i == 0) vehicle = this.locoDataList.find((loco) => loco.type == stockArray[0]);
        else vehicle = this.carDataList.find((car) => car.type == type);

        this.addVehicle(vehicle);
      });

      this.exit();
    },

    addVehicle(vehicle: ILocomotive | ICarWagon | undefined) {
      if (!vehicle) return;

      const stockObj = {
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: this.isLocomotive(vehicle),
        cargo: undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        useType: this.isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
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
    const readyStockJSONData: ResponseJSONData = await (await fetch('https://spythere.github.io/api/readyStockTest.json')).json();

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

      this.readyStockList[stockKey] = {
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
.exit {
  padding: 1em 0;
  font-size: 1.2em;
}

input {
  min-width: 250px;

  &::placeholder {
    font-size: 0.9em;
    text-align: center;
  }
}

.ready-stock-list {
  position: fixed;
  z-index: 101;

  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  background: #333;
  border-radius: 1em;

  height: 85vh;
  max-width: 1000px;
  width: 90vw;

  padding: 0 1em;

  overflow-y: auto;

  .top-sticky {
    position: sticky;
    top: 0;
    background: #333;
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

    margin-bottom: 1em;
  }

  ul li {
    padding: 0.5em;

    cursor: pointer;

    background: #444;

    img {
      max-width: 1.5em;
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
