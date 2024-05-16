<template>
  <div class="real-stock-card g-card" @keydown.esc="store.isRealStockListCardOpen = false">
    <div class="g-card_bg" @click="store.isRealStockListCardOpen = false"></div>

    <div class="card_content">
      <div class="card_nav">
        <div class="top-pane">
          <h1>
            {{ $t('realstock.title') }}
            <a href="https://td2.info.pl/profile/?u=17708" target="_blank">Railtrains997</a>
          </h1>
          <button class="btn action-exit" @click="store.isRealStockListCardOpen = false">
            <img src="/images/icon-exit.svg" alt="" />
          </button>
        </div>

        <div class="filters" ref="focus" tabindex="0">
          <input
            list="readyStockDataList"
            v-model="searchedReadyStockName"
            :placeholder="$t('realstock.search-name')"
          />

          <datalist id="readyStockDataList">
            <option
              v-for="stock in store.realCompositionList"
              :value="stock.stockId"
              :key="stock.name"
            >
              {{ stock.stockId }}
            </option>
          </datalist>

          <input
            list="readyStockStringList"
            v-model="searchedReadyStockString"
            :placeholder="$t('realstock.search-stock')"
          />

          <datalist id="readyStockStringList">
            <option
              v-for="stockType in computedAvailableStockTypes"
              :value="stockType"
              :key="stockType"
            >
              {{ stockType }}
            </option>
          </datalist>

          <button class="btn action-reset" @click="resetStockFilters">
            {{ $t('realstock.action-reset') }}
          </button>
        </div>
      </div>

      <ul class="card_list" ref="list" @scroll="onListScroll">
        <li v-for="rStock in computedReadyStockList" :key="rStock.stockId">
          <!-- :data-last-selected="store.ch === rStock.stockId" -->
          <div
            class="stock-title"
            tabindex="0"
            @click="chooseStock(rStock)"
            @keydown.enter="chooseStock(rStock)"
          >
            <img class="stock-icon" :src="getIconURL(rStock.type)" :alt="rStock.type" />
            <b class="text--accent" style="margin-left: 5px"> {{ rStock.name }}</b>
            <div>{{ rStock.number }}</div>
          </div>

          <div class="stock-thumbnails" ref="thumbnailsRef">
            <div
              class="thumbnail-item"
              v-for="stockType in rStock.stockString.split(';')"
              :key="stockType"
            >
              <div class="thumbnail-container">
                <div>{{ stockType }}</div>
                <img
                  :src="`https://static.spythere.eu/thumbnails/${stockType}.png`"
                  :title="stockType"
                  style="opacity: 0"
                  @error="(e) => onStockItemError(e, stockType)"
                  @load="(e) => ((e.target as HTMLElement).style.opacity = '1')"
                />
              </div>
            </div>
          </div>
        </li>

        <div class="bottom" ref="bottom"></div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStore } from '../../store';
import imageMixin from '../../mixins/imageMixin';
import stockMixin from '../../mixins/stockMixin';

import { IRealComposition, VehicleGroupType } from '../../types';

function getVehicleType(stockType: string): VehicleGroupType {
  if (/^E/.test(stockType)) return 'loco-electric';
  if (/^S/.test(stockType)) return 'loco-diesel';

  return 'wagon-passenger';
}

export default defineComponent({
  mixins: [imageMixin, stockMixin],

  data: () => ({
    store: useStore(),
    responseStatus: 'loading',
    isMobile:
      'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/)
        ? true
        : false,
    observer: null as IntersectionObserver | null,
    searchedReadyStockName: '',
    searchedReadyStockString: '',
    visibleIndexesTo: 0,
    lastSelectedStockId: null as string | null,
    scrollTop: 0,
  }),

  mounted() {
    this.mountObserver();
  },

  activated() {
    (this.$refs['focus'] as HTMLElement).focus();

    (this.$refs['list'] as HTMLElement).scrollTo({
      top: this.scrollTop,
      behavior: 'auto',
    });
  },

  computed: {
    computedReadyStockList(): IRealComposition[] {
      return this.store.realCompositionList
        .filter(
          (rc) =>
            rc.stockId
              .toLocaleLowerCase()
              .includes(this.searchedReadyStockName.toLocaleLowerCase()) &&
            rc.stockString
              .toLocaleLowerCase()
              .includes(this.searchedReadyStockString.toLocaleLowerCase())
        )
        .filter((_, i) => i <= this.visibleIndexesTo);
    },

    computedAvailableStockTypes() {
      return this.store.realCompositionList
        .reduce((acc, rs) => {
          rs.stockString.split(';').forEach((s) => {
            if (!acc.includes(s)) acc.push(s);
          });

          return acc;
        }, [] as string[])
        .sort((a, b) => (a > b ? 1 : -1));
    },
  },

  watch: {
    computedReadyStockList(curr, prev) {
      if (curr.length < prev.length) {
        this.visibleIndexesTo = 20;
        (this.$refs['list'] as HTMLElement).scrollTo({
          top: 0,
        });
      }
    },
  },

  methods: {
    mountObserver() {
      this.observer = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > 0) this.visibleIndexesTo += 20;
      });

      this.observer.observe(this.$refs['bottom'] as HTMLElement);
    },

    getImageUrl(name: string) {
      return new URL(`./dir/${name}.png`, import.meta.url).href;
    },

    resetStockFilters() {
      this.searchedReadyStockName = '';
      this.searchedReadyStockString = '';
    },

    chooseStock(stockItem: IRealComposition) {
      this.loadStockFromString(stockItem.stockString);
      this.lastSelectedStockId = stockItem.stockId;
      this.store.isRealStockListCardOpen = false;
    },

    onStockItemError(e: Event, stockType: string) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = `images/${getVehicleType(stockType)}-unknown.png`;
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

.action-exit {
  display: flex;
  background-color: #333;
  border-radius: 0.25em;
  padding: 0.5em;
}

.action-reset {
  background-color: #333;
}

.card_content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;

  background-color: #1c1c1c;
  border-radius: 1em;

  height: 95vh;
  max-width: 1000px;
  width: 90vw;

  padding: 0 1em;

  z-index: 100;

  @media screen and (max-width: $breakpointSm) {
    height: 80vh;
  }
}

.top-pane {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5em;

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
  gap: 0.5em;

  padding: 0.5em 0;

  input {
    width: 35%;
  }

  @media screen and (max-width: $breakpointSm) {
    flex-wrap: wrap;

    input {
      width: 100%;
    }

    .btn {
      width: 100%;
    }
  }
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

    .stock-icon {
      height: 0.85em;
    }

    &:hover {
      background: #222;
    }

    @media screen and (max-width: $breakpointSm) {
      grid-template-columns: 1fr;
      // grid-template-rows: 1fr 1fr;
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

.thumbnail-item {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;

  div {
    font-size: 0.9em;
    text-align: center;
  }

  img {
    max-width: 250px;
    max-height: 50px;
  }

  & > .thumbnail-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }
}

.bottom {
  padding: 1em;
}
</style>
