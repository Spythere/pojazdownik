<template>
  <section class="stock-list">
    <div class="stock_controls" :data-disabled="store.chosenStockListIndex == -1">
      <b class="no">
        POJAZD NR <span class="text--accent">{{ store.chosenStockListIndex + 1 }}</span> &nbsp;
      </b>

      <button
        class="btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="moveUpStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('higher')" alt="move up vehicle" />
        PRZENIEŚ WYŻEJ
      </button>

      <button
        class="btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="moveDownStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('lower')" alt="move down vehicle" />
        PRZENIEŚ NIŻEJ
      </button>

      <button
        class="btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="removeStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('remove')" alt="remove vehicle" />
        USUŃ
      </button>
    </div>

    <div class="stock_actions">
      <label class="file-label">
        <div class="btn">WCZYTAJ</div>
        <input type="file" @change="uploadStock" ref="conFile" accept=".con,.txt" />
      </label>

      <button class="btn" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="downloadStock">POBIERZ</button>

      <button class="btn" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="copyToClipboard">
        SKOPIUJ
      </button>

      <button class="btn" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="resetStock">ZRESETUJ</button>

      <button class="btn" :data-disabled="stockIsEmpty" :disabled="stockIsEmpty" @click="shuffleCars">PRZETASUJ</button>
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
        Masa: <span class="text--accent">{{ store.totalMass }}t</span> (dopuszczalna:
        <span class="text--accent">{{ store.acceptableMass ? store.acceptableMass + 't' : '-' }}</span
        >) - Długość:
        <span class="text--accent">{{ store.totalLength }}m</span>
        - vMax: <span class="text--accent">{{ store.maxStockSpeed }} km/h</span>
      </span>
    </div>

    <div class="stock_warnings">
      <div class="warning" v-if="locoNotSuitable">
        Lokomotywy EP07 i EP08 są przeznaczone jedynie do ruchu pasażerskiego!
      </div>

      <div class="warning" v-if="trainTooLong && store.isTrainPassenger">
        Maksymalna długość składów pasażerskich nie może przekraczać 350m!
      </div>

      <div class="warning" v-if="trainTooLong && !store.isTrainPassenger">
        Maksymalna długość składów innych niż pasażerskie nie może przekraczać 650m!
      </div>

      <div class="warning" v-if="trainTooHeavy">
        Ten skład jest za ciężki! Sprawdź
        <a
          target="_blank"
          href="https://docs.google.com/spreadsheets/d/1bFXUsHsAu4youmNz-46Q1HslZaaoklvfoBDS553TnNk/edit"
        >
          dopuszczalne masy składów
        </a>
      </div>

      <div class="warning" v-if="tooManyLocomotives">Ten skład posiada za dużo pojazdów trakcyjnych!</div>
    </div>

    <StockThumbnails :onListItemClick="onListItemClick" :onStockImageError="stockImageError" />

    <!-- Stock list -->
    <ul ref="stock_list">
      <li v-if="stockIsEmpty" class="list-empty">
        <div class="stock-info">Lista pojazdów jest pusta!</div>
      </li>

      <TransitionGroup name="stock-list-anim">
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
          <div
            class="stock-info"
            @dragstart="onDragStart(i)"
            @drop="onDrop($event, i)"
            @dragover="allowDrop"
            draggable="true"
          >
            <span class="stock-info__no" :data-selected="i == store.chosenStockListIndex">
              <span v-if="i == store.chosenStockListIndex">&bull;&nbsp;</span>
              {{ i + 1 }}.
            </span>

            <span class="stock-info__type" :class="{ supporter: stock.supportersOnly }">
              {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
            </span>

            <span class="stock-info__cargo" v-if="stock.cargo"> {{ stock.cargo.id }} </span>
            <span class="stock-info__length"> {{ stock.length }}m </span>
            <span class="stock-info__mass">{{ stock.cargo ? stock.cargo.totalMass : stock.mass }}t </span>
            <span class="stock-info__speed"> {{ stock.maxSpeed }}km/h </span>
          </div>
        </li>
      </TransitionGroup>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TrainImage from '../sections/TrainImageSection.vue';

import { useStore } from '../../store';
import warningsMixin from '../../mixins/warningsMixin';
import imageMixin from '../../mixins/imageMixin';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import { IStock } from '../../types';
import StockThumbnails from '../utils/StockThumbnails.vue';
import stockMixin from '../../mixins/stockMixin';

export default defineComponent({
  name: 'stock-list',
  components: { TrainImage, StockThumbnails },

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
  }),

  computed: {
    stockString() {
      return this.store.stockList
        .map((stock) => {
          let s = stock.isLoco || !stock.cargo ? stock.type : `${stock.type}:${stock.cargo.id}`;

          let final = s;
          for (let i = 0; i < stock.count - 1; i++) final += `;${s}`;

          return final;
        })
        .join(';');
    },

    stockIsEmpty() {
      return this.store.stockList.length == 0;
    },

    chosenStockVehicle() {
      return this.store.chosenStockListIndex == -1 ? undefined : this.store.stockList[this.store.chosenStockListIndex];
    },
  },

  methods: {
    stockHasWarnings() {
      return this.tooManyLocomotives || this.trainTooHeavy || this.trainTooLong || this.locoNotSuitable;
    },

    stockImageError(e: Event, stock: IStock): void {
      (e.target as HTMLImageElement).src = `images/${stock.useType}-unknown.png`;
    },

    copyToClipboard() {
      // if (this.stockHasWarnings()) {
      //   alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');
      //   return;
      // }

      navigator.clipboard.writeText(this.stockString);

      setTimeout(() => {
        alert('Pociąg został skopiowany do schowka!');
      }, 20);
    },

    onListItemClick(stockID: number) {
      const stock = this.store.stockList[stockID];

      this.store.chosenStockListIndex =
        this.store.chosenStockListIndex == stockID && this.store.chosenVehicle?.type == stock.type ? -1 : stockID;

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
      if (this.store.stockList.length == 0) return alert('Lista pojazdów jest pusta!');

      // if (this.stockHasWarnings())
      //   return alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');

      const defaultName = `${this.store.chosenRealStockName || this.store.stockList[0].type} ${
        this.store.totalMass
      }t; ${this.store.totalLength}m; vmax ${this.store.maxStockSpeed}`;

      const fileName = prompt(
        'Nazwij plik, a następnie pobierz do folderu Presets (Dokumenty/TTSK/TrainDriver2):',
        defaultName
      );

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

  gap: 0.5em;
  flex-wrap: wrap;

  padding: 0.5em;
  margin-bottom: 1em;

  background-color: #353a57;

  &[data-disabled='true'] {
    opacity: 0.8;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    pointer-events: none;
  }

  input#stock-count {
    width: 3em;

    margin: 0;
    padding: 0.25em;
    outline: none;
    border: none;
  }

  button {
    img {
      margin-right: 0.25em;
    }
  }
}

.stock_actions {
  display: grid;
  gap: 0.5em;
  margin-bottom: 1em;

  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));

  label.file-label {
    text-align: center;
    cursor: pointer;

    input {
      display: none;
    }
  }
}

.real-stock-info {
  img {
    height: 1.3ch;
  }
}

ul {
  position: relative;

  overflow: auto;

  height: 500px;
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

.stock_warnings {
  margin: 0.5em 0;
}

.supporter {
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

