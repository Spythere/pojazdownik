<template>
  <section class="stock-list-tab">
    <div class="tab_header">
      <h2>{{ $t('stocklist.title') }}</h2>
    </div>

    <div class="stock_actions">
      <button class="btn btn--image" @click="clickFileInput">
        <input type="file" @change="uploadStock" ref="conFile" accept=".con,.txt" />
        <img src="/images/icon-upload.svg" alt="upload icon" />
        {{ $t('stocklist.action-upload') }}
      </button>

      <button class="btn btn--image" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="downloadStock">
        <img src="/images/icon-download.svg" alt="download icon" />
        {{ $t('stocklist.action-download') }}
      </button>

      <button class="btn btn--image" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="copyToClipboard">
        <img src="/images/icon-copy.svg" alt="copy icon" />
        {{ $t('stocklist.action-copy') }}
      </button>

      <button class="btn btn--image" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="resetStock">
        <img src="/images/icon-reset.svg" alt="reset icon" />
        {{ $t('stocklist.action-reset') }}
      </button>

      <button class="btn btn--image" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="shuffleCars">
        <img src="/images/icon-shuffle.svg" alt="shuffle icon" />
        {{ $t('stocklist.action-shuffle') }}
      </button>
    </div>

    <div class="stock_controls" :data-disabled="store.chosenStockListIndex == -1">
      <button class="btn btn--image" :tabindex="store.chosenStockListIndex == -1 ? -1 : 0" @click="moveUpStock(store.chosenStockListIndex)">
        <img :src="getIconURL('higher')" alt="move up vehicle" />
        {{ $t('stocklist.action-move-up') }}
      </button>

      <button class="btn btn--image" :tabindex="store.chosenStockListIndex == -1 ? -1 : 0" @click="moveDownStock(store.chosenStockListIndex)">
        <img :src="getIconURL('lower')" alt="move down vehicle" />
        {{ $t('stocklist.action-move-down') }}
      </button>

      <button class="btn btn--image" :tabindex="store.chosenStockListIndex == -1 ? -1 : 0" @click="removeStock(store.chosenStockListIndex)">
        <img :src="getIconURL('remove')" alt="remove vehicle" />
        {{ $t('stocklist.action-remove') }}
      </button>
    </div>

    <div class="stock_specs">
      <b class="real-stock-info" v-if="store.chosenRealStock">
        <span class="text--accent">
          <img :src="getIconURL(store.chosenRealStock.type)" :alt="store.chosenRealStock.type" />
          {{ store.chosenRealStock.number }} {{ store.chosenRealStock.name }}
        </span>
        |
      </b>

      <span>
        {{ $t('stocklist.mass') }}
        <span class="text--accent">{{ (store.totalWeight / 1000).toFixed(1) }}t</span> ({{ $t('stocklist.mass-accepted') }}:
        <span class="text--accent">{{ store.acceptableWeight ? `${~~(store.acceptableWeight / 1000)}t` : '-' }}</span
        >) - {{ $t('stocklist.length') }}:
        <span class="text--accent">{{ store.totalLength }}m</span>
        - {{ $t('stocklist.vmax') }}:
        <span class="text--accent">{{ store.maxStockSpeed }} km/h</span>
      </span>
    </div>

    <div class="stock_spawn-settings">
      <Checkbox v-if="store.stockSupportsColdStart" v-model="store.isColdStart">
        {{ $t('stocklist.coldstart-info') }}
      </Checkbox>

      <Checkbox v-if="store.stockSupportsDoubleManning" v-model="store.isDoubleManned">
        {{ $t('stocklist.doublemanning-info') }}
      </Checkbox>
    </div>

    <div class="stock_warnings" v-if="stockHasWarnings">
      <div class="warning" v-if="locoNotSuitable">(!) {{ $t('stocklist.warning-not-suitable') }}</div>

      <div class="warning" v-if="trainTooLong && store.isTrainPassenger">(!) {{ $t('stocklist.warning-passenger-too-long') }}</div>

      <div class="warning" v-if="trainTooLong && !store.isTrainPassenger">(!) {{ $t('stocklist.warning-freight-too-long') }}</div>

      <div class="warning" v-if="trainTooHeavy">
        (!)
        <i18n-t keypath="stocklist.warning-too-heavy">
          <template #href>
            <a target="_blank" href="https://docs.google.com/spreadsheets/d/1KVa5vn2d8XGkXQFwbavVudwKqUQxbLOucHWs2VYqAUE">
              {{ $t('stocklist.acceptable-mass-docs') }}
            </a>
          </template>
        </i18n-t>
      </div>

      <div class="warning" v-if="tooManyLocomotives">
        {{ $t('stocklist.warning-too-many-locos') }}
      </div>
    </div>

    <StockThumbnails :onListItemClick="onListItemClick" />

    <!-- Stock list -->
    <ul ref="stock_list">
      <li v-if="stockIsEmpty" class="list-empty">
        <div class="stock-info">{{ $t('stocklist.list-empty') }}</div>
      </li>

      <TransitionGroup name="stock-list-anim" v-else>
        <li
          v-for="(stock, i) in store.stockList"
          :key="stock.id"
          :class="{ loco: stock.isLoco }"
          tabindex="0"
          @click="onListItemClick(i)"
          @keydown.enter="onListItemClick(i)"
          @keydown.w="moveUpStock(i)"
          @keydown.s="moveDownStock(i)"
          @keydown.backspace="removeStock(i)"
          ref="itemRefs"
        >
          <div class="stock-info" @dragstart="onDragStart(i)" @drop="onDrop($event, i)" @dragover="allowDrop" draggable="true">
            <span class="stock-info__no" :data-selected="i == store.chosenStockListIndex">
              <span v-if="i == store.chosenStockListIndex">&bull;&nbsp;</span>
              {{ i + 1 }}.
            </span>

            <span class="stock-info__type" :class="{ sponsor: stock.isSponsorsOnly }">
              {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
            </span>

            <span class="stock-info__cargo" v-if="stock.cargo">
              {{ stock.cargo.id }}
            </span>
            <span class="stock-info__length">{{ stock.length }}m</span>
            <span class="stock-info__mass">{{ ((stock.weight + (stock.cargo?.weight ?? 0)) / 1000).toFixed(1) }}t</span>
            <span class="stock-info__speed">{{ stock.maxSpeed }}km/h</span>
          </div>
        </li>
      </TransitionGroup>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStore } from '../../store';

import warningsMixin from '../../mixins/warningsMixin';
import imageMixin from '../../mixins/imageMixin';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import StockThumbnails from '../utils/StockThumbnails.vue';
import stockMixin from '../../mixins/stockMixin';
import Checkbox from '../common/Checkbox.vue';

export default defineComponent({
  name: 'stock-list',
  components: { StockThumbnails, Checkbox },

  mixins: [warningsMixin, imageMixin, stockMixin, stockPreviewMixin],

  setup() {
    const store = useStore();

    return {
      store,
    };
  },

  data: () => ({
    imageOffsetY: 0,
    draggedVehicleID: -1,

    stockActions: [{}],
  }),

  computed: {
    stockString() {
      if (this.store.stockList.length == 0) return '';

      const includeColdStart = this.store.isColdStart && this.store.stockSupportsColdStart;
      const includeDoubleManned = this.store.isDoubleManned && this.store.stockSupportsDoubleManning;

      return this.store.stockList
        .map((stock, i) => {
          let stockTypeStr = stock.isLoco || !stock.cargo ? stock.type : `${stock.type}:${stock.cargo.id}`;

          if (i == 0 && (includeColdStart || includeDoubleManned))
            return `${stockTypeStr},${includeColdStart ? 'c' : ''}${includeDoubleManned ? 'd' : ''}`;

          return stockTypeStr;
        })
        .join(';');
    },

    stockIsEmpty() {
      return this.store.stockList.length == 0;
    },

    chosenStockVehicle() {
      return this.store.chosenStockListIndex == -1 ? undefined : this.store.stockList[this.store.chosenStockListIndex];
    },

    stockHasWarnings() {
      return this.tooManyLocomotives || this.trainTooHeavy || this.trainTooLong || this.locoNotSuitable;
    },
  },

  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.stockString);

      setTimeout(() => {
        alert(this.$t('stocklist.alert-copied'));
      }, 20);
    },

    clickFileInput() {
      (this.$refs['conFile'] as HTMLInputElement).click();
    },

    onListItemClick(stockID: number) {
      const stock = this.store.stockList[stockID];

      this.store.chosenStockListIndex = this.store.chosenStockListIndex == stockID && this.store.chosenVehicle?.type == stock.type ? -1 : stockID;

      if (this.store.chosenStockListIndex == -1) {
        this.store.chosenVehicle = null;
        return;
      }

      if (this.store.swapVehicles) this.store.swapVehicles = false;

      this.previewStock(stock);
    },

    getCarSpecFromType(typeStr: string) {
      const specArray = typeStr.split('_');

      if (specArray.length == 0) return null;

      /* 111a_Grafitti_1 */
      if (specArray.length == 3) return `${specArray[0]} ${specArray[1]}-${specArray[2]}`;

      /* 111a_PKP_Bnouz_01 */
      return `${specArray[0]} ${specArray[2]}-${specArray[3]} (${specArray[1]})`;
    },

    resetStock() {
      this.store.stockList.length = 0;
      this.store.chosenStockListIndex = -1;
    },

    addStock(index: number) {
      if (index == -1) return;

      this.store.stockList[index].count++;
    },

    subStock(index: number) {
      if (index == -1) return;

      if (this.store.stockList[index].count < 2) return;

      this.store.stockList[index].count--;
    },

    removeStock(index: number) {
      if (index == -1) return;

      this.store.stockList = this.store.stockList.filter((stock, i) => i != index);

      if (this.store.stockList.length < index + 1) this.store.chosenStockListIndex = -1;
    },

    moveUpStock(index: number) {
      if (index < 1) return;

      const tempStock = this.store.stockList[index];

      this.store.stockList[index] = this.store.stockList[index - 1];
      this.store.stockList[index - 1] = tempStock;

      this.store.chosenStockListIndex = index - 1;
    },

    moveDownStock(index: number) {
      if (index == -1) return;
      if (index > this.store.stockList.length - 2) return;

      const tempStock = this.store.stockList[index];

      this.store.stockList[index] = this.store.stockList[index + 1];
      this.store.stockList[index + 1] = tempStock;

      this.store.chosenStockListIndex = index + 1;
    },

    shuffleCars() {
      const availableIndexes = this.store.stockList.reduce((acc, stock, i) => {
        if (!stock.isLoco) acc.push(i);

        return acc;
      }, [] as number[]);

      for (let i = 0; i < this.store.stockList.length; i++) {
        if (!availableIndexes.includes(i)) continue;

        availableIndexes.splice(i, -1);

        const randAvailableIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        const tempSwap = this.store.stockList[randAvailableIndex];

        this.store.stockList[randAvailableIndex] = this.store.stockList[i];
        this.store.stockList[i] = tempSwap;
      }
    },

    downloadStock() {
      if (this.store.stockList.length == 0) return alert(this.$t('stocklist.alert-empty'));

      const defaultName = `${this.store.chosenRealStockName || this.store.stockList[0].type} ${(this.store.totalWeight / 1000).toFixed(1)}t; ${
        this.store.totalLength
      }m; vmax ${this.store.maxStockSpeed}`;

      const fileName = prompt(this.$t('stocklist.prompt-file'), defaultName);

      if (!fileName) return;

      const blob = new Blob([this.stockString]);
      const file = fileName + '.con';

      var e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = file;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['', a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
    },

    uploadStock() {
      const inputEl = this.$refs['conFile'] as HTMLInputElement;
      const files = inputEl.files;

      if (files?.length != 1) return;
      if (!/\.con$/.test(files[0].name)) return;

      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = (res) => {
        const stockString = res.target?.result;

        if (!stockString || typeof stockString !== 'string') return;

        this.loadStockFromString(stockString);
      };

      reader.onerror = (err) => console.log(err);

      inputEl.value = '';
    },

    onDragStart(vehicleIndex: number) {
      this.draggedVehicleID = vehicleIndex;
    },

    onDrop(e: DragEvent, vehicleIndex: number) {
      e.preventDefault();

      let targetEl = (this.$refs['itemRefs'] as Element[])[vehicleIndex];

      if (!targetEl) return;

      const tempVehicle = this.store.stockList[vehicleIndex];

      this.store.stockList[vehicleIndex] = this.store.stockList[this.draggedVehicleID];
      this.store.stockList[this.draggedVehicleID] = tempVehicle;

      this.store.chosenStockListIndex = vehicleIndex;
    },

    allowDrop(e: DragEvent) {
      e.preventDefault();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global';
@import '../../styles/tab.scss';

.stock-list-tab {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.warning {
  padding: 0.25em;
  background: $accentColor;
  color: black;

  font-weight: bold;

  a {
    color: black;
    text-decoration: underline;
  }
}

.stock_controls {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.5em;

  padding: 0.5em;

  background-color: #353a57;

  &[data-disabled='true'] {
    opacity: 0.8;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    pointer-events: none;
  }
}

.stock_actions {
  display: grid;
  gap: 0.5em;

  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));

  button {
    width: 100%;

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }
}

.stock_spawn-settings {
  display: flex;
  gap: 0.5em;
}

.real-stock-info {
  img {
    height: 1.3ch;
  }
}

ul {
  position: relative;
  overflow: auto;
  max-height: 500px;
}

ul > li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 500px;

  margin: 0.25em 0;

  outline: none;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid white;
  }

  &.list-empty {
    background-color: $secondaryColor;
    border-radius: 0.5em;
    padding: 0.75em;
  }
}

li > .stock-info {
  display: flex;

  color: white;
  font-weight: 700;

  transition: color 100ms;

  & > span {
    padding: 0.5em;
    margin-right: 0.25em;

    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.sponsor {
  color: salmon;
}

.stock-info {
  &__no,
  &__type {
    background-color: $secondaryColor;
  }

  &__count {
    background-color: #e04e3e;
  }

  &__no {
    min-width: 3.5em;
    text-align: right;

    &[data-selected='true'] {
      color: $accentColor;
    }
  }

  &__cargo {
    background-color: #333;
  }

  &__length,
  &__mass,
  &__speed {
    background-color: #555;
  }
}

.stock-list-anim {
  &-move, /* apply transition to moving elements */
  &-enter-active,
  &-leave-active {
    transition: all 250ms ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(-25px);
  }

  &-leave-to {
    opacity: 0;
  }

  &-leave-active {
    position: absolute;
  }
}

@media screen and (max-width: $breakpointMd) {
  ul {
    min-height: auto;
  }
}
</style>
