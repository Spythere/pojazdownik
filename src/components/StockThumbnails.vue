<template>
  <div class="stock_thumbnails" ref="thumbnailsRef">
    <div
      v-for="(stock, stockIndex) in store.stockList"
      :data-selected="store.chosenStockListIndex == stockIndex"
      draggable="true"
      @dragstart="onDragStart(stockIndex)"
      @drop="onDrop($event, stockIndex)"
      @dragover="allowDrop"
    >
      <span @click="onListItemClick(stockIndex)" :key="stock.id">
        <b>
          {{ stock.type }}
        </b>

        <span>
          <img
            draggable="false"
            :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stock.type}.png`"
            :alt="stock.type"
            :title="stock.type"
            @error="stockImageError($event, stock)"
          />
        </span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, nextTick, ref, watch } from 'vue';
import { useStore } from '../store';
import { IStock } from '../types';

const store = useStore();
const emit = defineEmits(['listItemClick', 'stockImageError']);

const thumbnailsRef = ref() as Ref<HTMLElement>;
const draggedIndex = ref(-1);

const onListItemClick = (index: number) => {
  emit('listItemClick', index);
};

const stockImageError = (e: Event, stock: IStock) => {
  console.log('error');

  emit('stockImageError', e, stock);
};

watch(
  computed(() => store.chosenStockListIndex),
  (index) => {
    if (index < 0) return;

    nextTick(() => {
      (thumbnailsRef.value as HTMLElement)
        .querySelector(`div:nth-child(${index + 1})`)
        ?.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'smooth' });
    });
  }
);

// Dragging images
const onDragStart = (vehicleIndex: number) => {
  draggedIndex.value = vehicleIndex;
};

const onDrop = (e: DragEvent, vehicleIndex: number) => {
  e.preventDefault();

  let targetEl = thumbnailsRef.value.querySelector(`div:nth-child(${vehicleIndex + 1})`);

  if (!targetEl && draggedIndex.value != -1) return;

  const tempVehicle = store.stockList[vehicleIndex];
  store.stockList[vehicleIndex] = store.stockList[draggedIndex.value];
  store.stockList[draggedIndex.value] = tempVehicle;

  store.chosenStockListIndex = vehicleIndex;
};

const allowDrop = (e: DragEvent) => {
  e.preventDefault();
};
</script>

<style lang="scss" scoped>
.stock_thumbnails {
  display: flex;
  margin: 1em 0;

  overflow: auto;

  background-color: #353a57;

  > div {
    display: flex;
    align-items: flex-end;
    cursor: pointer;

    &[data-selected='true'] {
      background-color: rebeccapurple;
    }

    > span {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      padding: 0.5em 0;

      text-align: center;

      font-size: 0.85em;
      user-select: none;
      -moz-user-select: none;
    }
  }

  img {
    max-height: 60px;
  }
}
</style>

