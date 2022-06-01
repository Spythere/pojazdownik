<template>
  <div class="bottom">
    <div class="bg-dimmer" v-if="isRandomizerCardOpen"></div>

    <train-image />

    <section class="spacer"></section>

    <section class="stock-list">
      <div class="stock-list_buttons">
        <button class="btn" @click="downloadStock">POBIERZ POCIĄG</button>
        <button class="btn" @click="resetStock">ZRESETUJ LISTĘ</button>
        <span></span>
        <button class="btn" @click="shuffleCars">TASUJ WAGONY</button>
        <button class="btn" @click="openRandomizerCard">LOSUJ SKŁAD</button>

        <transition name="card-anim">
          <randomizer-card v-if="isRandomizerCardOpen" />
        </transition>
      </div>

      <div class="stock-list_specs">
        <div>
          Masa: <span class="text--accent">{{ totalMass }}t</span> | Długość:
          <span class="text--accent">{{ totalLength }}m</span>
          | Vmax pociągu: <span class="text--accent">{{ maxStockSpeed }} km/h</span>
        </div>

        <!-- <div v-if="store.chosenRealStockName" style="margin-top: 0.25rem">
          <b>{{ store.chosenRealStockName.toLocaleUpperCase() }}</b>
        </div> -->
      </div>

      <div class="stock-list_string">
        <button class="btn--text" v-if="store.stockList.length > 0" @click="copyToClipboard">
          Skopiuj pociąg w formie tekstowej do schowka
        </button>
      </div>

      <div class="warnings">
        <div class="warning" v-if="warnings.locoNotSuitable.value">
          Lokomotywy EP07 i EP08 są przeznaczone jedynie do ruchu pasażerskiego!
        </div>

        <div class="warning" v-if="warnings.trainTooLong.value">
          Ten skład jest za długi (pasażerskie max. 350m, towarowe max. 650m)!
        </div>

        <div class="warning" v-if="warnings.trainTooHeavy.value">
          Ten skład jest za ciężki! Sprawdź
          <a target="_blank" href="https://docs.google.com/spreadsheets/d/1bFXUsHsAu4youmNz-46Q1HslZaaoklvfoBDS553TnNk/edit">
            dopuszczalne masy składów
          </a>
        </div>

        <div class="warning" v-if="warnings.tooManyLocos.value">Ten skład posiada za dużo pojazdów trakcyjnych!</div>
      </div>

      <ul ref="list" data-ignore-outside="1">
        <li v-if="store.stockList.length == 0" class="list-empty">
          <div class="item-content">Lista pojazdów jest pusta!</div>
        </li>

        <li
          v-for="(stock, i) in store.stockList"
          :key="stock.type + i"
          :class="{ loco: stock.isLoco, selected: store.chosenStockListIndex == i }"
          :data-id="i"
          tabindex="0"
          @focus="onListItemFocus(i)"
          :ref="`item-${i}`"
        >
          <div
            class="item-content"
            @dragstart="onDragStart(i)"
            @drop="onDrop($event, i)"
            @dragover="allowDrop"
            draggable="true"
          >
            <span class="stock__type" :class="{ supporter: stock.supportersOnly }">
              {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
            </span>
            <span class="stock__cargo" v-if="stock.cargo"> {{ stock.cargo.id }} </span>
            <span class="stock__length"> {{ stock.length }}m </span>
            <span class="stock__mass">{{ stock.cargo ? stock.cargo.totalMass : stock.mass }}t </span>
            <span class="stock__speed"> {{ stock.maxSpeed }}km/h </span>
          </div>

          <div class="item-actions">
            <div class="count">
              <button class="action-btn" @click="subStock(i)">
                <img :src="icons.sub" alt="subtract vehicle count" />
              </button>

              <span>{{ stock.count }} </span>

              <button class="action-btn" @click="addStock(i)">
                <img :src="icons.add" alt="add vehicle count" />
              </button>
            </div>

            <button class="action-btn" @click="moveUpStock(i)">
              <img :src="icons.higher" alt="move up vehicle" />
            </button>

            <button class="action-btn" @click="moveDownStock(i)">
              <img :src="icons.lower" alt="move down vehicle" />
            </button>

            <button class="action-btn" @click="removeStock(i)">
              <img :src="icons.remove" alt="remove vehicle" />
            </button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, provide, reactive, ref } from 'vue';
import { ICarWagon, ILocomotive, IStore } from '@/types';
import RandomizerCard from './RandomizerCard.vue';

import TrainImage from './TrainImage.vue';

export default defineComponent({
  components: { RandomizerCard, TrainImage },

  setup() {
    const store = inject('Store') as IStore;

    const isRandomizerCardOpen = ref(false);

    provide('isCardOpen', isRandomizerCardOpen);
    provide('chosenLength', ref(350));
    provide('chosenMass', ref(1000));
    provide('chosenLocoType', ref('loco-e'));
    provide('chosenCarTypes', reactive([]));
    provide('includeSupporterVehicles', ref(false));

    return {
      store,
      locoDataList: inject('locoDataList') as ILocomotive[],
      carDataList: inject('carDataList') as ICarWagon[],
      isTrainPassenger: inject('isTrainPassenger') as boolean,
      totalLength: inject('totalLength') as number,
      totalMass: inject('totalMass') as number,
      maxStockSpeed: inject('maxStockSpeed') as number,
      maxAllowedSpeed: inject('maxAllowedSpeed') as number,

      warnings: inject('warnings') as {
        locoNotSuitable: ComputedRef<boolean>;
        trainTooLong: ComputedRef<boolean>;
        trainTooHeavy: ComputedRef<boolean>;
        tooManyLocos: ComputedRef<boolean>;
      },

      isRandomizerCardOpen,

      hasSupporterOnlyVehicle: computed(() => store.stockList.some((stock) => stock.supportersOnly)),
    };
  },

  mounted() {
    document.addEventListener('click', (event: Event) => {
      if (!event.target) return;

      event.stopPropagation();

      const targetNode = event.target as HTMLElement;

      const attr = targetNode.attributes.getNamedItem('data-ignore-outside');

      if (
        !attr &&
        !(this.$refs['list'] as Node).contains(targetNode) &&
        targetNode.tagName.toLowerCase() != 'select' &&
        targetNode.tagName.toLowerCase() != 'option'
      )
        this.store.chosenStockListIndex = -1;
    });
  },

  data: () => ({
    icons: {
      add: require('@/assets/add-icon.svg'),
      sub: require('@/assets/sub-icon.svg'),
      remove: require('@/assets/remove-icon.svg'),
      lower: require('@/assets/lower-icon.svg'),
      higher: require('@/assets/higher-icon.svg'),
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
  },

  methods: {
    copyToClipboard() {
      if (Object.values(this.warnings).some((v) => v.value == true)) {
        alert('Jazda tym pociągiem jest niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');
        return;
      }

      navigator.clipboard.writeText(this.stockString);

      setTimeout(() => {
        alert('Pociąg został skopiowany do schowka!');
      }, 20);
    },

    onListItemFocus(vehicleID: number) {
      const vehicle = this.store.stockList[vehicleID];

      this.store.chosenStockListIndex = vehicleID;

      if ((this.store.chosenCar || this.store.chosenLoco)?.imageSrc != vehicle.imgSrc) this.store.imageLoading = true;

      if (this.store.showSupporter && !vehicle.supportersOnly) {
        this.store.showSupporter = false;
      }

      if (vehicle.isLoco) {
        this.store.chosenLocoPower = vehicle.useType;

        this.store.chosenLoco = this.locoDataList.find((v) => v.type == vehicle.type) || null;

        this.store.chosenCar = null;
        this.store.chosenCargo = null;
      } else {
        this.store.chosenCarUseType = vehicle.useType;

        this.store.chosenLoco = null;
        this.store.chosenCar = this.carDataList.find((v) => v.type == vehicle.type) || null;
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
      this.store.stockList[index].count++;
    },

    subStock(index: number) {
      if (this.store.stockList[index].count < 2) return;

      this.store.stockList[index].count--;
    },

    removeStock(index: number) {
      this.store.stockList = this.store.stockList.filter((stock, i) => i != index);
    },

    moveUpStock(index: number) {
      if (index < 1) return;

      const tempStock = this.store.stockList[index];

      this.store.stockList[index] = this.store.stockList[index - 1];
      this.store.stockList[index - 1] = tempStock;
    },

    moveDownStock(index: number) {
      if (index > this.store.stockList.length - 2) return;

      const tempStock = this.store.stockList[index];

      this.store.stockList[index] = this.store.stockList[index + 1];
      this.store.stockList[index + 1] = tempStock;
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

    openRandomizerCard() {
      this.isRandomizerCardOpen = true;
    },

    downloadStock() {
      if (Object.values(this.warnings).some((v) => v.value == true)) {
        alert('Jazda tym pociągiem może być niezgodna z regulaminem symulatora! Zmień parametry zestawienia!');
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

      let targetEl: Element | null = this.$refs[`item-${vehicleIndex}`] as Element;

      if (!targetEl) return;

      const dataID = targetEl.attributes.getNamedItem('data-id')?.textContent;

      if (!dataID) return;

      const tempVehicle = this.store.stockList[Number(dataID)];

      this.store.stockList[Number(dataID)] = this.store.stockList[this.draggedVehicleID];
      this.store.stockList[this.draggedVehicleID] = tempVehicle;
    },

    allowDrop(e: DragEvent) {
      e.preventDefault();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/global';

.bg-dimmer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background: rgba(black, 0.85);
  z-index: 100;
}

.bottom {
  display: flex;
  justify-content: space-between;

  margin-top: 2.5em;

  @media screen and (max-width: 1150px) {
    flex-direction: column;
    align-items: center;

    .image {
      display: flex;
      padding: 0 0 2em 0;
    }
  }
}

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

.spacer {
  flex: 2 1 10%;
}

.stock-list {
  flex-grow: 3;

  width: 100%;

  &_string {
    margin-top: 1em;
    font-weight: bold;
  }

  &_buttons {
    display: flex;

    span {
      flex-grow: 2;
    }

    button {
      font-size: 0.9em;
      padding: 0.4em 0.55em;
      margin: 0 0.5em 1em 0;

      &:nth-child(5) {
        margin-right: 0;
      }

      &:focus {
        color: $accentColor;
        border-color: $accentColor;
      }
    }
  }

  ul {
    margin-top: 1em;

    max-height: 500px;
    overflow: auto;
  }

  ul li {
    outline: none;
    cursor: pointer;

    &.list-empty {
      border: 1px solid whitesmoke;
      padding: 0 0.5em;
    }

    &.selected .item-content {
      color: $accentColor;
    }

    &:focus .item-content {
      color: $accentColor;
    }

    &:hover .item-content {
      color: $accentColor;
    }

    display: flex;
    align-items: center;
    justify-content: space-between;

    .item-content {
      display: flex;
      flex-wrap: wrap;

      color: white;
      font-weight: 700;
      margin: 0.5em 0;

      transition: color 100ms;

      span {
        padding: 0.5em;
        margin-right: 0.25em;
        margin-top: 0.25em;
      }

      @media screen and (max-width: 800px) {
        span {
          padding: 0.25em;
        }
      }
    }

    .item-actions {
      display: flex;
      align-items: center;

      .count {
        display: flex;
        align-items: center;

        margin-right: 0.5em;

        span {
          margin: 0 0.5em;
          /* font-size: 1.25em; */

          color: $accentColor;
        }
      }

      img {
        vertical-align: middle;

        width: 1.3em;
        height: 1.3em;
      }

      button {
        margin: 0 0.25em;

        &:focus {
          outline: 1px solid white;
        }
      }
    }
  }
}

.stock {
  &__type {
    background-color: #222;

    &.supporter {
      background-color: #ff887b;
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

.card-anim {
  &-enter {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: opacity 300ms;
  }

  &-leave-to {
    opacity: 0;
  }
}
</style>
