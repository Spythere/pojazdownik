<template>
  <div class="stock-thumbnails" ref="thumbnailsRef">
    <div
      class="thumbnail-item"
      v-for="(stock, stockIndex) in store.stockList"
      :key="stockIndex"
      :data-selected="store.chosenStockListIndex == stockIndex"
      :data-sponsor="stock.restrictions.sponsorOnly"
      draggable="true"
      @dragstart="onDragStart(stockIndex)"
      @drop="onDrop($event, stockIndex)"
      @dragover="allowDrop"
      @click="onListItemClick(stockIndex)"
    >
      <b>
        {{ stock.type }}
      </b>

      <img
        draggable="false"
        :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stock.type}.png`"
        :alt="stock.type"
        :title="stock.type"
        @error="stockImageError($event, stock)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, nextTick, ref, watch } from 'vue';
import { useStore } from '../../store';
import { IStock } from '../../types';

const store = useStore();
const emit = defineEmits(['listItemClick']);

const thumbnailsRef = ref() as Ref<HTMLElement>;
const draggedIndex = ref(-1);

const onListItemClick = (index: number) => {
  emit('listItemClick', index);
};

const stockImageError = (e: Event, stock: IStock) => {
  (e.target as HTMLImageElement).src = `images/${stock.group}-unknown.png`;
};

watch(
  computed(() => store.chosenStockListIndex),
  (index) => {
    if (index < 0) return;

    nextTick(() => {
      (thumbnailsRef.value as HTMLElement)
        .querySelector(`div:nth-child(${index + 1})`)
        ?.scrollIntoView({
          block: 'nearest',
          inline: 'start',
          behavior: 'smooth',
        });
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
.stock-thumbnails {
  display: flex;
  overflow: auto;
  background-color: #353a57;
}

.thumbnail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-direction: column;
  gap: 0.5em;

  padding-top: 0.5em;

  cursor: pointer;
  min-height: 100px;
  font-size: 0.85em;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &[data-selected='true'] {
    background-color: rebeccapurple;
  }

  b {
    color: #ccc;
    margin: 0 1em;
  }

  &[data-sponsor='true'] > b {
    color: salmon;
  }

  img {
    max-height: 60px;
  }
}
</style>
