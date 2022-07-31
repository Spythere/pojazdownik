<template>
  <section class="stock-list-section">
    <div class="list_actions">
      <button class="btn" @click="downloadStock">POBIERZ POCIĄG</button>
      <button class="btn" @click="resetStock">ZRESETUJ LISTĘ</button>
      <span class="spacer"></span>
      <button class="btn" @click="shuffleCars">TASUJ WAGONY</button>
      <button class="btn" @click="store.isRandomizerCardOpen = true">LOSUJ SKŁAD</button>
    </div>

    <div class="stock_actions" v-if="chosenStockVehicle">
      <b class="no">
        POJAZD NR <span class="text--accent">{{ store.chosenStockListIndex + 1 }}</span> &nbsp;
      </b>

      <div class="count">
        <button class="action-btn" @click="subStock(store.chosenStockListIndex)">
          <img :src="icons.sub" alt="subtract vehicle count" />
          1
        </button>

        <input type="number" name="stock-count" id="stock-count" v-model="chosenStockVehicle.count" />

        <button class="action-btn" @click="addStock(store.chosenStockListIndex)">
          <img :src="icons.add" alt="add vehicle count" />
          1
        </button>
      </div>

      <button class="action-btn" @click="moveUpStock(store.chosenStockListIndex)">
        <img :src="icons.higher" alt="move up vehicle" />
        Przenieś wyżej
      </button>

      <button class="action-btn" @click="moveDownStock(store.chosenStockListIndex)">
        <img :src="icons.lower" alt="move down vehicle" />
        Przenieś niżej
      </button>

      <button class="action-btn" @click="removeStock(store.chosenStockListIndex)">
        <img :src="icons.remove" alt="remove vehicle" />
        Usuń
      </button>
    </div>

    <div class="stock_actions no-chosen-vehicle" v-else>Wybierz pojazd z listy poniżej, aby pokazać opcje</div>

    <div class="stock_specs">
      <div>
        Masa: <span class="text--accent">{{ store.totalMass }}t</span> | Długość:
        <span class="text--accent">{{ store.totalLength }}m</span>
        | Vmax pociągu: <span class="text--accent">{{ store.maxStockSpeed }} km/h</span>
      </div>

      <!-- <div v-if="store.chosenRealStockName" style="margin-top: 0.25rem">
          <b>{{ store.chosenRealStockName.toLocaleUpperCase() }}</b>
        </div> -->
    </div>

    <div class="stock_clipboard-text">
      <button class="btn--text" v-if="store.stockList.length > 0" @click="copyToClipboard">
        Skopiuj pociąg w formie tekstowej do schowka
      </button>
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

    <ul ref="list">
      <li v-if="store.stockList.length == 0" class="list-empty">
        <div class="stock-info">Lista pojazdów jest pusta!</div>
      </li>

      <li
        v-for="(stock, i) in store.stockList"
        :key="stock.type + i"
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

          <span class="stock-info__type">
            {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
          </span>

          <span class="stock-info__cargo" v-if="stock.cargo"> {{ stock.cargo.id }} </span>
          <span class="stock-info__length"> {{ stock.length }}m </span>
          <span class="stock-info__mass">{{ stock.cargo ? stock.cargo.totalMass : stock.mass }}t </span>
          <span class="stock-info__speed"> {{ stock.maxSpeed }}km/h </span>

          <span class="stock-info__count"> x{{ stock.count }} </span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RandomizerCard from './RandomizerCard.vue';
import TrainImage from './TrainImageSection.vue';

import addIcon from '../assets/add-icon.svg';
import subIcon from '../assets/sub-icon.svg';
import removeIcon from '../assets/remove-icon.svg';
import lowerIcon from '../assets/lower-icon.svg';
import higherIcon from '../assets/higher-icon.svg';
import { useStore } from '../store';
import warningsMixin from '../mixins/warningsMixin';

export default defineComponent({
  components: { RandomizerCard, TrainImage },

  mixins: [warningsMixin],

  setup() {
    const store = useStore();

    return {
      store,
    };
  },

  data: () => ({
    icons: {
      add: addIcon,
      sub: subIcon,
      remove: removeIcon,
      lower: lowerIcon,
      higher: higherIcon,
    },

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

    chosenStockVehicle() {
      return this.store.chosenStockListIndex == -1 ? undefined : this.store.stockList[this.store.chosenStockListIndex];
    },
  },

  methods: {
    stockHasWarnings() {
      return this.tooManyLocomotives || this.trainTooHeavy || this.trainTooLong || this.locoNotSuitable;
    },

    copyToClipboard() {
      if (this.stockHasWarnings()) {
        alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');
        return;
      }

      navigator.clipboard.writeText(this.stockString);

      setTimeout(() => {
        alert('Pociąg został skopiowany do schowka!');
      }, 20);
    },

    onListItemClick(vehicleID: number) {
      const vehicle = this.store.stockList[vehicleID];

      this.store.chosenStockListIndex =
        this.store.chosenStockListIndex == vehicleID && this.store.chosenVehicle?.type == vehicle.type ? -1 : vehicleID;

      if (this.store.chosenStockListIndex == -1) {
        this.store.chosenVehicle = null;
        return;
      }

      if (this.store.chosenVehicle?.imageSrc != vehicle.imgSrc) this.store.imageLoading = true;

      if (this.store.showSupporter && !vehicle.supportersOnly) {
        this.store.showSupporter = false;
      }

      if (vehicle.isLoco) {
        const chosenLoco = this.store.locoDataList.find((v) => v.type == vehicle.type) || null;
        this.store.chosenVehicle = chosenLoco;
        this.store.chosenLoco = chosenLoco;

        // this.store.chosenCargo = null;
      } else {
        const chosenCar = this.store.carDataList.find((v) => v.type == vehicle.type) || null;
        this.store.chosenVehicle = chosenCar;
        this.store.chosenCar = chosenCar;

        this.store.chosenCargo = vehicle.cargo || null;
      }

      if (this.store.swapVehicles) {
        this.store.swapVehicles = false;
      }
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
      if (this.stockHasWarnings()) {
        alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');
        return;
      }

      const fileName = prompt('Nazwij plik:', 'pociag');

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
@import '../styles/global';

.warnings {
  margin-top: 0.5em;
}

.warning {
  padding: 0.25em;
  margin-top: 0.5em;
  background: $accentColor;
  color: black;

  font-weight: bold;

  a {
    color: black;
    text-decoration: underline;
  }
}

.stock-list-section {
  grid-row: 1 / 3;
  grid-column: 2;
}

.list_actions {
  display: flex;

  .spacer {
    flex-grow: 2;
  }

  button {
    font-size: 0.9em;
    padding: 0.4em 0.55em;
    margin-right: 0.5em;

    &:nth-child(5) {
      margin-right: 0;
    }

    &:focus-visible {
      color: $accentColor;
      border-color: $accentColor;
    }
  }
}

.stock_actions {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-wrap: wrap;

  margin: 1em 0;

  &.no-chosen-vehicle {
    font-size: 1.05em;
    padding: 0.5em;
  }

  input#stock-count {
    width: 3em;

    margin: 0;
    padding: 0.25em;
    outline: none;
    border: none;
  }

  button {
    margin: 0.25em;
    padding: 0.25em;

    border: 2px solid gray;
    border-radius: 0.25em;

    &:focus-visible {
      outline: 1px solid white;
    }

    img {
      vertical-align: text-bottom;
      margin-right: 0.5em;

      width: 1.1em;
      height: 1.1em;
    }
  }
}

.stock_clipboard-text {
  margin-top: 1em;
  font-weight: bold;
}

ul {
  margin-top: 1em;

  max-height: 500px;
  overflow: auto;

  padding: 0.25em;

  border: 2px solid gray;
}

ul > li {
  display: flex;
  align-items: center;
  justify-content: space-between;

  outline: none;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid white;
  }

  &:hover .item-content {
    color: $accentColor;
  }
}

li > .stock-info {
  display: flex;

  color: white;
  font-weight: 700;
  margin: 0.25em 0;

  transition: color 100ms;

  & > span {
    padding: 0.5em;
    margin-right: 0.25em;

    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.stock-info {
  &__no,
  &__type {
    background-color: #222;
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

@media screen and (max-width: $breakpointMd) {
  li > .stock-info {
    font-size: 0.9em;
  }
}
</style>

