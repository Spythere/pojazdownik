<template>
  <div class="list-wrapper">
    <StockThumbnails :onListItemClick="onListItemClick" />

    <div v-if="stockIsEmpty" class="list-empty">
      <div class="stock-info">{{ $t('stocklist.list-empty') }}</div>
    </div>

    <ul v-else>
      <transition-group name="stock-list-anim">
        <li
          v-for="(stock, i) in store.stockList"
          :key="stock.id"
          :class="{ loco: isTractionUnit(stock.vehicleRef) }"
          tabindex="0"
          @click="onListItemClick(i)"
          @keydown.enter="onListItemClick(i)"
          @keydown.w="stockListUtils.moveUpStock(i)"
          @keydown.s="stockListUtils.moveDownStock(i)"
          @keydown.backspace="stockListUtils.removeStock(i)"
          ref="itemRefs"
        >
          <div
            class="stock-info"
            @dragstart="onDragStart(i)"
            @drop="onDrop($event, i)"
            @dragover="allowDrop"
            draggable="true"
          >
            <span class="stock-info-no" :data-selected="i == store.chosenStockListIndex">
              <span v-if="i == store.chosenStockListIndex">&bull;&nbsp;</span>
              {{ i + 1 }}.
            </span>

            <span
              class="stock-info-type"
              :data-sponsor-only="
                stock.vehicleRef.sponsorOnlyTimestamp &&
                stock.vehicleRef.sponsorOnlyTimestamp > Date.now()
              "
              :data-team-only="stock.vehicleRef.teamOnly"
            >
              {{
                isTractionUnit(stock.vehicleRef)
                  ? stock.vehicleRef.type
                  : getCarSpecFromType(stock.vehicleRef.type)
              }}
            </span>

            <span class="stock-info-cargo" v-if="stock.cargo">
              {{ stock.cargo.id }}
            </span>

            <span class="stock-info-length">{{ stock.vehicleRef.length }}m</span>

            <span class="stock-info-mass">
              {{ ((stock.vehicleRef.weight + (stock.cargo?.weight ?? 0)) / 1000).toFixed(1) }}t
            </span>
            <span class="stock-info-speed">{{ stock.vehicleRef.maxSpeed }}km/h</span>
          </div>
        </li>
      </transition-group>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../../store';
import { isTractionUnit } from '../../../utils/vehicleUtils';
import { useStockListUtils } from '../../../utils/stockListUtils';
import stockPreviewMixin from '../../../mixins/stockPreviewMixin';
import StockThumbnails from './StockThumbnails.vue';

export default defineComponent({
  mixins: [stockPreviewMixin],
  components: { StockThumbnails },

  setup() {
    const stockListUtils = useStockListUtils();

    return { stockListUtils };
  },

  data: () => ({
    store: useStore(),
    draggedVehicleID: -1,
  }),

  computed: {
    stockIsEmpty() {
      return this.store.stockList.length == 0;
    },
  },

  methods: {
    isTractionUnit,

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

    onListItemClick(stockID: number) {
      const stock = this.store.stockList[stockID];

      this.store.chosenStockListIndex =
        this.store.chosenStockListIndex == stockID &&
        this.store.chosenVehicle?.type == stock.vehicleRef.type
          ? -1
          : stockID;

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
  },
});
</script>

<style lang="scss" scoped>
.list-wrapper {
  position: relative;
}

.list-empty {
  background-color: global.$secondaryColor;
  border-radius: 0.5em;
  padding: 0.75em;
  font-weight: bold;
}

ul {
  overflow-y: scroll;
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
}

li > .stock-info {
  display: flex;
  gap: 0.25em;

  color: white;
  font-weight: 700;

  transition: color 100ms;

  & > span {
    padding: 0.5em;
  }
}

.stock-info-no,
.stock-info-type {
  background-color: global.$secondaryColor;

  &[data-team-only='true'] {
    color: global.$teamColor;
  }

  &[data-sponsor-only='true'] {
    color: global.$sponsorColor;
  }
}

.stock-info-no {
  min-width: 3.5em;
  text-align: right;

  &[data-selected='true'] {
    color: global.$accentColor;
  }
}

.stock-info-cargo {
  background-color: #333;
}

.stock-info-length,
.stock-info-mass,
.stock-info-speed {
  background-color: #555;
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

@media screen and (max-width: global.$breakpointMd) {
  ul {
    min-height: auto;
  }
}
</style>
