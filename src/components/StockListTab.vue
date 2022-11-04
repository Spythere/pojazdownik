<template>
  <section class="stock-list">
    <div class="stock_actions">
      <button class="btn" @click="downloadStock">POBIERZ POCIĄG</button>
      <button class="btn" @click="resetStock">ZRESETUJ LISTĘ</button>
      <span class="spacer"></span>
      <button class="btn" @click="shuffleCars">TASUJ WAGONY</button>
      <button class="btn" @click="store.stockSectionMode = 'stock-generator'">LOSUJ SKŁAD</button>
    </div>

    <div class="stock_controls" :data-disabled="store.chosenStockListIndex == -1">
      <b class="no">
        POJAZD NR <span class="text--accent">{{ store.chosenStockListIndex + 1 }}</span> &nbsp;
      </b>

      <div class="count">
        <button
          class="action-btn"
          :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
          @click="subStock(store.chosenStockListIndex)"
        >
          <img :src="getIconURL('sub')" alt="subtract vehicle count" />
          1
        </button>

        <input
          v-if="chosenStockVehicle"
          v-model="chosenStockVehicle.count"
          type="number"
          min="1"
          name="stock-count"
          id="stock-count"
        />

        <input v-else id="stock-count" type="number" value="0" :tabindex="store.chosenStockListIndex == -1 ? -1 : 0" />

        <button
          class="action-btn"
          :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
          @click="addStock(store.chosenStockListIndex)"
        >
          <img :src="getIconURL('add')" alt="add vehicle count" />
          1
        </button>
      </div>

      <button
        class="action-btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="moveUpStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('higher')" alt="move up vehicle" />
        Przenieś wyżej
      </button>

      <button
        class="action-btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="moveDownStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('lower')" alt="move down vehicle" />
        Przenieś niżej
      </button>

      <button
        class="action-btn"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="removeStock(store.chosenStockListIndex)"
      >
        <img :src="getIconURL('remove')" alt="remove vehicle" />
        Usuń
      </button>
    </div>

    <div class="stock_clipboard-text" v-if="store.stockList.length > 0">
      <button class="btn" @click="copyToClipboard">Skopiuj tekst składu do schowka</button>
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
        Masa: <span class="text--accent">{{ store.totalMass }}t</span> - Długość:
        <span class="text--accent">{{ store.totalLength }}m</span>
        - Vmax pociągu: <span class="text--accent">{{ store.maxStockSpeed }} km/h</span>
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

    <ul ref="list">
      <li v-if="store.stockList.length == 0" class="list-empty">
        <div class="stock-info">Lista pojazdów jest pusta!</div>
      </li>

      <transition-group name="stock-list-anim">
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
      </transition-group>
    </ul>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TrainImage from './TrainImageSection.vue';

import { useStore } from '../store';
import warningsMixin from '../mixins/warningsMixin';
import imageMixin from '../mixins/imageMixin';

export default defineComponent({
  name: 'stock-list',
  components: { TrainImage },

  mixins: [warningsMixin, imageMixin],

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
        this.store.chosenLocoPower = vehicle.useType;
      } else {
        const chosenCar = this.store.carDataList.find((v) => v.type == vehicle.type) || null;
        this.store.chosenVehicle = chosenCar;
        this.store.chosenCar = chosenCar;

        this.store.chosenCargo = vehicle.cargo || null;
        this.store.chosenCarUseType = vehicle.useType;
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
      if (this.store.stockList.length == 0) return alert('Lista pojazdów jest pusta!');

      if (this.stockHasWarnings())
        return alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');

      const fileName = prompt(
        'Nazwij plik, a następnie pobierz do folderu Presets (Dokumenty/TTSK/TrainDriver2):',
        `${this.store.chosenRealStockName || this.store.stockList[0].type}`
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

.stock_warnings {
  margin-top: 1em;
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

  margin: 1em 0;
  border: 1px solid white;

  padding: 0 0.3em;

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
    margin: 0.25em;
    padding: 0.25em;

    &:focus-visible {
      outline: 1px solid white;
    }

    img {
      vertical-align: text-bottom;
      margin-right: 0.25em;

      width: 1.1em;
      height: 1.1em;
    }
  }
}

.stock_clipboard-text {
  font-weight: bold;

  & > .btn {
    margin: 0 0.5em 0.5em 0;
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

  height: 70vh;
  margin-top: 1em;
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
    padding: 0.5em;
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
