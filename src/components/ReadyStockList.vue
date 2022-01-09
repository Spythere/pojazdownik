<template>
  <div class="ready-stock-list" v-if="isOpen">
    <button class="btn--text exit" @click="exit">POWRÓT</button>
    <div class="header">
      <h1>
        REALNE ZESTAWIENIA
        <div>by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a></div>
      </h1>
      <p>
        {{ isMobile ? 'Przytrzymaj zestawienie' : 'Kliknij na zestawienie prawym przyciskiem myszy' }}, aby zobaczyć je
        na stronie <i>vagonweb.cz</i>
      </p>

      <input type="text" v-model="chosenStock" placeholder="Szukaj zestawienia..." />
    </div>

    <ul v-if="responseStatus == 'loaded'">
      <li
        v-for="(v, k) in computedList"
        :key="k"
        @contextmenu="openPreview($event, v.type, v.number)"
        @click="choseStock(v.name, v.type, v.number, v.stockString)"
      >
        <img v-if="v.type != 'iR' && v.type != 'RE'" :src="icons[v.type]" alt="" />
        <span v-else>{{ v.type }}</span>

        <b class="text--accent"> {{ v.name }}</b>
        <div>{{ v.number }}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ICarWagon, ILocomotive, IStore } from '@/types';
import { defineComponent, inject } from 'vue';

interface List {
  [key: string]: { stockString: string; type: string; number: string; name: string };
}

interface Response {
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
    chosenStock: '',
    isMobile: 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) ? true : false,

    readyStockList: {} as List,

    icons: {
      EIC: require('@/assets/EIC.png'),
      IC: require('@/assets/IC.svg'),
      TLK: require('@/assets/TLK.png'),
    } as { [key: string]: string },
  }),

  computed: {
    computedList() {
      if (this.chosenStock == '') return this.readyStockList;

      let filtered: List = {};

      for (let key in this.readyStockList) {
        if (key.toLocaleLowerCase().includes(this.chosenStock.toLocaleLowerCase()))
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
      const cislo = number.replace(/_/g, '/');

      const url = `https://www.vagonweb.cz/razeni/vlak.php?zeme=${zeme}&kategorie=${type}&cislo=${cislo}${rok}`;

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
    const response: Response = await (await fetch('https://spythere.github.io/api/readyStockTest.json')).json();

    if (!response) {
      this.responseStatus = 'error';
      return;
    }

    for (let key in response) {
      const splittedKey = key.split(' ');

      let name = '';
      for (let i = 2; i < splittedKey.length; i++) {
        name += ' ' + splittedKey[i];
      }

      this.readyStockList[key] = {
        type: splittedKey[0],
        number: splittedKey[1].replace(/_/g, '/'),
        name,
        stockString: response[key],
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

  .header {
    position: sticky;
    top: 0;

    background: #333;
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
  }
}
</style>
