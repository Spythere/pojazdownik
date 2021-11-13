<template>
  <div class="bottom">
    <section class="image">
      <div class="image__wrapper">
        <div class="image__content">
          <div class="no-img" v-if="!store.chosenCar && !store.chosenLoco">
            POGLĄD WYBRANEGO POJAZDU
          </div>
          <div class="empty-message" v-if="store.imageLoading">
            ŁADOWANIE OBRAZU...
          </div>
          <img
            v-if="store.chosenLoco && !store.chosenCar"
            :src="store.chosenLoco.imageSrc"
            :alt="store.chosenLoco.type"
            @load="onImageLoad"
          />
          <img
            v-if="store.chosenCar"
            :src="store.chosenCar.imageSrc"
            :alt="store.chosenCar.type"
            @load="onImageLoad"
          />
        </div>
      </div>
    </section>

    <section class="spacer"></section>

    <section class="stock-list">
      <div class="stock-list_buttons">
        <button class="btn btn--copy" @click="downloadStock">
          POBIERZ SKŁAD
        </button>
      </div>
      <div class="stock-list_specs">
        Masa: <span class="text--accent">{{ totalMass }}</span> t | Długość:
        <span class="text--accent">{{ totalLength }}</span>
        m
      </div>

      <div class="warnings">
        <div class="warning" v-if="warnings.locoNotSuitable.value">
          Lokomotywy EP07 i EP08 są przeznaczone jedynie do ruchu pasażerskiego!
        </div>

        <div class="warning" v-if="warnings.trainTooLong.value">
          Ten skład jest za długi!
        </div>

        <div class="warning" v-if="warnings.trainTooHeavy.value">
          Ten skład jest za ciężki!
        </div>
      </div>

      <ul>
        <li v-if="store.stockList.length == 0" class="list-empty">
          <div class="item-content">Lista pojazdów jest pusta!</div>
        </li>

        <li
          v-for="(stock, i) in store.stockList"
          :key="stock.type + i"
          :class="{ loco: stock.isLoco }"
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
            <span>
              {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
            </span>
            <span v-if="stock.cargo"> &nbsp; ({{ stock.cargo?.id }}) </span>
            &nbsp;
            <span> {{ stock.length }}m</span>
            &nbsp;
            <span>{{ stock.cargo ? stock.cargo.totalMass : stock.mass }}t</span>
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
import { ComputedRef, defineComponent, inject } from "vue";
import { ICarWagon, ILocomotive, IStore } from "@/types";

export default defineComponent({
  setup() {
    const store = inject("Store") as IStore;

    return {
      store,
      locoDataList: inject("locoDataList") as ILocomotive[],
      carDataList: inject("carDataList") as ICarWagon[],
      isTrainPassenger: inject("isTrainPassenger") as boolean,
      totalLength: inject("totalLength") as number,
      totalMass: inject("totalMass") as number,
      maxStockSpeed: inject("maxStockSpeed") as number,
      maxAllowedSpeed: inject("maxAllowedSpeed") as number,

      warnings: inject("warnings") as {
        locoNotSuitable: ComputedRef<boolean>;
        trainTooLong: ComputedRef<boolean>;
        trainTooHeavy: ComputedRef<boolean>;
      },
    };
  },

  data: () => ({
    icons: {
      add: require("@/assets/add-icon.svg"),
      sub: require("@/assets/sub-icon.svg"),
      remove: require("@/assets/remove-icon.svg"),
      lower: require("@/assets/lower-icon.svg"),
      higher: require("@/assets/higher-icon.svg"),
    },

    draggedVehicleID: -1,
  }),

  methods: {
    onListItemFocus(vehicleID: number) {
      const vehicle = this.store.stockList[vehicleID];

      if (vehicle.isLoco) {
        this.store.chosenLocoPower = vehicle.useType;

        this.store.chosenLoco =
          this.locoDataList.find((v) => v.type == vehicle.type) || null;

        this.store.chosenCar = null;
        this.store.chosenCargo = null;

        // this.store.onLocoPowerChange(vehicle.useType);
        return;
      }

      this.store.chosenCarUseType = vehicle.useType;

      this.store.chosenLoco = null;
      this.store.chosenCar =
        this.carDataList.find((v) => v.type == vehicle.type) || null;
      this.store.chosenCargo = vehicle.cargo || null;

      // this.chose = vehicle.useType;
    },

    getCarSpecFromType(typeStr: string) {
      const specArray = typeStr.split("_");

      if (specArray.length == 0) return null;

      /* 111a_Grafitti_1 */
      if (specArray.length == 3)
        return `${specArray[0]} ${specArray[1]}-${specArray[2]}`;

      /* 111a_PKP_Bnouz_01 */
      return `${specArray[0]} ${specArray[2]}-${specArray[3]} (${specArray[1]})`;
    },

    addStock(index: number) {
      this.store.stockList[index].count++;
    },

    subStock(index: number) {
      if (this.store.stockList[index].count < 2) return;

      this.store.stockList[index].count--;
    },

    removeStock(index: number) {
      this.store.stockList = this.store.stockList.filter(
        (stock, i) => i != index
      );
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

    downloadStock() {
      if (
        this.warnings.locoNotSuitable.value ||
        this.warnings.trainTooLong.value ||
        this.warnings.trainTooHeavy.value
      ) {
        const allowDownload = confirm(
          "Jazda tym pociągiem może być niezgodna z regulaminem symulatora! Czy na pewno chcesz kontynuować?"
        );

        if (!allowDownload) return;
      }

      const fileName = prompt("Nazwij plik:", "sklad");

      if (!fileName) return;

      const stockString = this.store.stockList
        .map((stock) => {
          let s =
            stock.isLoco || !stock.cargo
              ? stock.type
              : `${stock.type}:${stock.cargo.id}`;

          let final = s;
          for (let i = 0; i < stock.count - 1; i++) final += `;${s}`;

          return final;
        })
        .join(";");

      const blob = new Blob([stockString]);
      const file = fileName + ".con";

      var e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = file;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["", a.download, a.href].join(":");
      e.initEvent("click", true, false);
      a.dispatchEvent(e);
    },

    onDragStart(vehicleIndex: number) {
      this.draggedVehicleID = vehicleIndex;
    },

    onDrop(e: DragEvent, vehicleIndex: number) {
      e.preventDefault();

      let targetEl: Element | null = this.$refs[
        `item-${vehicleIndex}`
      ] as Element;

      if (!targetEl) return;

      const dataID = targetEl.attributes.getNamedItem("data-id")?.textContent;

      if (!dataID) return;

      const tempVehicle = this.store.stockList[Number(dataID)];

      this.store.stockList[Number(dataID)] =
        this.store.stockList[this.draggedVehicleID];
      this.store.stockList[this.draggedVehicleID] = tempVehicle;
    },

    allowDrop(e: DragEvent) {
      e.preventDefault();
    },

    onImageLoad() {
      this.store.imageLoading = false;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../styles/global";

.bottom {
  display: flex;
  justify-content: space-between;

  margin-top: 2.5em;

  @media screen and (max-width: 800px) {
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
}

.spacer {
  flex: 2 1 10%;
}

.image {
  flex-grow: 2;
  padding: 0 1em 0 0;

  &__wrapper {
    max-width: 380px;
    width: 22em;
    height: 13em;
  }

  &__content {
    border: 1px solid white;
    position: relative;

    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }

    .empty-message,
    .no-img {
      position: absolute;
      left: 0;
      top: 0;

      display: flex;
      justify-content: center;
      align-items: flex-end;

      width: 100%;
      height: 100%;
      padding: 0.3em 0;
    }

    .empty-message {
      background: rgba(#000, 0.75);
    }
  }
}

.stock-list {
  flex-grow: 3;

  width: 100%;

  &_buttons {
    button {
      font-size: 0.9em;
      padding: 0.4em 0.5em;
      margin-bottom: 0.5em;
    }
  }

  ul {
    margin-top: 1em;
  }

  ul li {
    outline: none;
    cursor: pointer;

    &.list-empty {
      border: 1px solid whitesmoke;
      padding: 0 0.5em;
    }

    &:focus .item-content {
      color: $accentColor;
    }

    display: flex;
    align-items: center;
    justify-content: space-between;

    .item-content {
      /* background: whitesmoke; */
      color: white;
      font-weight: 700;
      margin: 1em 0;

      margin-right: 0.5em;

      /* max-width: 200px; */
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
      }
    }
  }
}
</style>