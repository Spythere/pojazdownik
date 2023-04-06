<template>
  <div class="real-stock-card g-card">
    <div class="g-card_bg" @click="store.isRealStockListCardOpen = false"></div>

    <div class="card_content">
      <div class="card_nav">
        <div class="top-pane">
          <h1>ZESTAWIENIA REALNE by <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a></h1>
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

          <input list="readyStockStringList" placeholder="Szukaj zestawienia po pojazdach" />

          <datalist id="readyStockStringList">
            <option v-for="stock in store.readyStockList" :value="stock.stockString">
              {{ stock.type }} {{ stock.number }} {{ stock.name }}
            </option>
          </datalist>
        </div>
      </div>

      <ul class="card_list" ref="list" @scroll="onListScroll">
        <li v-for="(rStock, i) in computedReadyStockList" :key="i">
          <div
            class="desc"
            tabindex="0"
            @click="chooseStock(rStock.stockString)"
            @keydown.enter="chooseStock(rStock.stockString)"
          >
            <img :src="getIconURL(rStock.type)" :alt="rStock.type" />
            <b class="text--accent" style="margin-left: 5px"> {{ rStock.name }}</b>
            <div>{{ rStock.number }}</div>
          </div>

          <div class="thumbnails" ref="thumbnailsRef">
            <div v-for="stockItem in rStock.stockString.split(';')">
              <!-- rStock.stockString.split(';') -->
              <!-- <span> -->
              <!-- <span>{{ stockItem }}</span> -->
              <div class="thumbnail_container">
                <img
                  :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockItem}.png`"
                  :title="rStock.type"
                  style="opacity: 0"
                  @error="onStockItemError"
                  @load="e => (e.target as HTMLElement).style.opacity = '1'"
                />

                <!-- <img src="images/car-passenger-unknown.png" alt=""> -->
              </div>
              <!-- <img @error="e => (e.target as HTMLImageElement).src = `images/car-passenger-unknown.png`" /> -->
              <!-- </span> -->
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

interface ResponseJSONData {
  [key: string]: string;
}

export default defineComponent({
  mixins: [imageMixin, stockMixin],

  data: () => ({
    responseStatus: 'loading',
    isMobile: 'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/) ? true : false,
    observer: null as IntersectionObserver | null,
    searchedReadyStockName: '',
    store: useStore(),
    visibleIndexesTo: 0,
    lastChecked: null,
    scrollY: 0,
  }),

  async mounted() {
    this.mountObserver();
    this.fetchStockListData();
  },

  activated() {
    (this.$refs['search'] as HTMLInputElement).focus();
  },

  deactivated() {
    console.log((this.$refs['list'] as HTMLElement).scrollTop);
  },

  computed: {
    computedReadyStockList() {
      if (this.searchedReadyStockName == null) return this.store.readyStockList;

      return this.store.readyStockList
        .filter((rs) => rs.name.toLocaleLowerCase().includes(this.searchedReadyStockName.toLocaleLowerCase()))
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

        this.store.readyStockList.push({
          type,
          number: number.replace(/_/g, '/'),
          name: name.join(' '),
          stockString: readyStockJSONData[stockKey],
        });
      }

      this.responseStatus = 'loaded';
    },

    mountObserver() {
      this.observer = new IntersectionObserver((entries) => {
        // Is the entry visible?
        if (entries[0].intersectionRatio > 0) {
          this.visibleIndexesTo += 20;
        }
      });

      this.observer.observe(this.$refs['bottom'] as HTMLElement);
    },

    getImageUrl(name: string) {
      return new URL(`./dir/${name}.png`, import.meta.url).href;
    },

    chooseStock(stockString: string) {
      this.loadStockFromString(stockString);
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

    .desc {
      cursor: pointer;
      padding: 0.5em;
    }

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

.thumbnails {
  display: flex;
  align-items: flex-end;

  width: 100%;

  overflow: auto;
  padding: 0.5em;

  // img {
  //   // width: 150px;
  //   height: 100%;
  //   max-height: 20px;
  //   vertical-align: middle;
  // }
}

.thumbnail_container {
  // position: relative;
  // width: 100%;
  // height: 0;

  img {
    // position: absolute;
    // top: 0;
    // left: 0;
    // width: 100%;
    height: 30px;
  }
}
</style>

