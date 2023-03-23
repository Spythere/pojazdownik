<template>
  <div class="real-stock-card g-card" v-show="store.isRealStockListCardOpen">
    <div class="g-card_bg" @click="store.isRealStockListCardOpen = false"></div>

    <div class="card_content">
      <div>
        <button class="btn exit-btn" @click="store.isRealStockListCardOpen = false">&lt; POWRÓT</button>

        <div class="header">
          <!-- <h1>
            REALNE ZESTAWIENIA
            <div>by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a></div>
          </h1>
          <p>
            Pełne informacje o zestawieniach dostępne na stronie
            <a href="http://bocznica.eu/files/archiwum/2021r_2021-11-04.html" target="_blank">bocznica.eu</a> (stan na
            listopad 2021r.)
          </p> -->

          <input type="text" tabindex="0" v-model="searchedReadyStockName" placeholder="Szukaj zestawienia..." />
        </div>
      </div>

      <ul class="list" v-if="responseStatus == 'loaded'">
        <li
          v-for="(rStock, key) in computedReadyStockList"
          :key="key"
          tabindex="0"
          @click="chooseStock(rStock.stockString)"
          @keydown.enter="chooseStock(rStock.stockString)"
        >
          <div class="desc">
            <img :src="getIconURL(rStock.type)" :alt="rStock.type" />

            <b class="text--accent"> {{ rStock.name }}</b>
            <div>{{ rStock.number }}</div>
          </div>

          <div class="thumbnails" ref="thumbnailsRef">
            <div v-for="stockItem in rStock.stockString.split(';')">
              <span>
                <!-- <span>{{ stockItem }}</span> -->
                <img
                  :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockItem}.png`"
                  :alt="rStock.type"
                  :title="rStock.type"
                />
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Vehicle, IReadyStockList } from '../../types';

import { useStore } from '../../store';
import imageMixin from '../../mixins/imageMixin';
import stockMixin from '../../mixins/stockMixin';

interface ResponseJSONData {
  [key: string]: string;
}

export default defineComponent({
  mixins: [imageMixin, stockMixin],

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

    chooseStock(stockString: string) {
      this.loadStockFromString(stockString);
      this.store.isRealStockListCardOpen = false;
    },
  },

  async mounted() {
    const readyStockJSONData: ResponseJSONData = await (
      await fetch(`https://spythere.github.io/api/td2/data/readyStock.json?t=${Math.floor(Date.now() / 60000)}`)
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

  height: 90vh;
  max-width: 1000px;
  width: 90vw;

  padding: 0 1em;

  overflow-y: auto;
  z-index: 100;
}

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
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  li {
    display: grid;
    grid-template-columns: 1fr 2fr;

    .desc {
      cursor: pointer;
      padding: 0.5em;
    }

    .thumbnails {
      display: flex;
      align-items: flex-end;

      overflow: auto;
      padding: 0.5em;

      img {
        // width: 150px;
        height: 100%;
        max-height: 20px;
        vertical-align: middle;
      }
    }

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

