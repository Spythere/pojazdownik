<template>
  <div class="real-stock-card g-card">
    <div class="g-card_bg" @click="store.isRealStockListCardOpen = false"></div>

    <div class="card_content">
      <div class="card_nav">
        <div class="top-pane">
          <h1>
            ZESTAWIENIA REALNE by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a>
          </h1>
          <button class="btn exit-btn" @click="store.isRealStockListCardOpen = false">&Cross;</button>
        </div>

        <div class="filters">
          <input
            list="readyStockDataList"
            ref="search"
            v-model="searchedReadyStockName"
            placeholder="Szukaj zestawienia po nazwie"
          />

          <datalist id="readyStockDataList">
            <option v-for="stock in store.readyStockList" :value="stock.name">
              {{ stock.type }} {{ stock.number }} {{ stock.name }}
            </option>
          </datalist>

          <input
            list="readyStockStringList"
            v-model="searchedReadyStockString"
            placeholder="Szukaj zestawienia po pojazdach"
          />

          <datalist id="readyStockStringList">
            <option v-for="stock in store.readyStockList" :value="stock.stockString">{{stock.stockString}}</option>
          </datalist>
        </div>
      </div>

      <ul class="card_list" ref="list" @scroll="onListScroll">
        <li
          v-for="rStock in computedReadyStockList"
          :key="rStock.stockId"
          :data-last-selected="store.chosenRealStockName === rStock.stockId"
        >
          <div class="stock-title" tabindex="0" @click="chooseStock(rStock)" @keydown.enter="chooseStock(rStock)">
            <img :src="getIconURL(rStock.type)" :alt="rStock.type" />
            <b class="text--accent" style="margin-left: 5px"> {{ rStock.name }}</b>
            <div>{{ rStock.number }}</div>
          </div>

          <div class="stock-thumbnails" ref="thumbnailsRef">
            <div v-for="stockItem in rStock.stockString.split(';')">
              <div class="thumbnail_container">
                <img
                  :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockItem}.png`"
                  :title="rStock.type"
                  style="opacity: 0"
                  @error="onStockItemError"
                  @load="e => (e.target as HTMLElement).style.opacity = '1'"
                />
              </div>
            </div>
          </div>
        </li>

        <div ref="bottom"></div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStore } from '../../store';
import imageMixin from '../../mixins/imageMixin';
import stockMixin from '../../mixins/stockMixin';

import { IReadyStockItem } from '../../types';

interface ResponseJSONData {
  [key: string]: string;
}

export default defineComponent({
  mixins: [imageMixin, stockMixin],

  data: () => ({
    store: useStore(),
    responseStatus: 'loading',
    isMobile: 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) ? true : false,
    observer: null as IntersectionObserver | null,
    searchedReadyStockName: '',
    searchedReadyStockString: '',
    visibleIndexesTo: 0,
    lastSelectedStockId: null as string | null,
    scrollTop: 0,
  }),

  async mounted() {
    this.mountObserver();
    this.fetchStockListData();
  },

  activated() {
    (this.$refs['search'] as HTMLInputElement).focus();

    (this.$refs['list'] as HTMLElement).scrollTo({
      top: this.scrollTop,
      behavior: 'auto',
    });
  },

  computed: {
    computedReadyStockList() {
      if (this.searchedReadyStockName == null) return this.store.readyStockList;

      return this.store.readyStockList
        .filter(
          (rs) =>
            rs.name.toLocaleLowerCase().includes(this.searchedReadyStockName.toLocaleLowerCase()) &&
            rs.stockString.includes(this.searchedReadyStockString)
        )
        .filter((_, i) => i <= this.visibleIndexesTo);
    },
  },

  watch: {
    computedReadyStockList(curr, prev) {
      if (curr.length < prev.length) this.visibleIndexesTo = 20;
    },
  },

  methods: {
    async fetchStockListData() {
      const readyStockJSONData: ResponseJSONData = await (
        await fetch(`https://spythere.github.io/api/td2/data/readyStock.json?t=${Math.floor(Date.now() / 60000)}`)
      ).json();

      if (!readyStockJSONData) {
        this.responseStatus = 'error';
        return;
      }

      for (let stockKey in readyStockJSONData) {
        const [type, number, ...name] = stockKey.split(' ');

        const obj = {
          number: number.replace(/_/g, '/'),
          name: name.join(' '),
          stockString: readyStockJSONData[stockKey],
          type,
        };

        this.store.readyStockList.push({
          ...obj,
          stockId: `${obj.type} ${obj.number} ${obj.name}`,
        });
      }

      this.responseStatus = 'loaded';
    },

    mountObserver() {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) this.visibleIndexesTo += 20;
      });

      this.observer.observe(this.$refs['bottom'] as HTMLElement);
    },

    getImageUrl(name: string) {
      return new URL(`./dir/${name}.png`, import.meta.url).href;
    },

    chooseStock(stockItem: IReadyStockItem) {
      this.loadStockFromString(stockItem.stockString);
      this.lastSelectedStockId = stockItem.stockId;
      this.store.isRealStockListCardOpen = false;
    },

    onStockItemError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = 'images/car-passenger-unknown.png';
      imageEl.style.opacity = '1';
    },

    onListScroll(e: Event) {
      const listElement = e.target as HTMLElement;
      const scrollTop = listElement.scrollTop;

      this.scrollTop = scrollTop;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.exit-btn {
  font-size: 1.2em;
  margin: 0.25em 0;
}

.card_content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;

  background-color: #1c1c1c;
  border-radius: 1em;

  height: 90vh;
  max-width: 1000px;
  width: 90vw;

  padding: 0 1em;

  z-index: 100;
}

.top-pane {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    color: #aaa;
  }
}

.top-sticky {
  position: sticky;
  top: 0;
  background: #1c1c1c;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  padding: 0.5em 0;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  overflow: auto;

  li {
    display: grid;
    grid-template-columns: 1fr 2fr;
    background: #2b2b2b;
    gap: 1rem;
    padding: 0.1em;

    &[data-last-selected='true'] .stock-title {
      border: 1px solid $accentColor;
    }

    .stock-title {
      cursor: pointer;
      padding: 0.5em;
    }

    img {
      height: 0.85em;
    }

    &:hover {
      background: #222;
    }
  }
}

.stock-thumbnails {
  display: flex;
  align-items: flex-end;

  width: 100%;

  overflow: auto;
  padding: 0.5em;
}

.thumbnail_container img {
  height: 30px;
}
</style>

