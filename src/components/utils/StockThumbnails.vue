<template>
  <div class="stock-thumbnails" ref="thumbnailsRef">
    <ul>
      <li
        class="thumbnail-item"
        v-for="(stock, stockIndex) in store.stockList"
        :key="stockIndex"
        :data-selected="store.chosenStockListIndex == stockIndex"
        :data-sponsor-only="
          stock.vehicleRef.sponsorOnlyTimestamp &&
          stock.vehicleRef.sponsorOnlyTimestamp > Date.now()
        "
        :data-team-only="stock.vehicleRef.teamOnly"
        draggable="true"
        @dragstart="onDragStart(stockIndex)"
        @drop="onDrop($event, stockIndex)"
        @dragover="allowDrop"
        @click="onListItemClick(stockIndex)"
      >
        <div class="stock-text">
          <p>
            {{ stock.vehicleRef.type.replace(/_/g, ' ') }}
          </p>
        </div>

        <span>
          <img
            v-for="thumbnail in getVehicleThumbnails(stock.vehicleRef.type)"
            draggable="false"
            style="min-width: 200px"
            :src="`https://stacjownik.spythere.eu/static/thumbnails/${thumbnail.src}.png`"
            :alt="stock.vehicleRef.type"
            :title="stock.vehicleRef.type"
            @load="($event) => (($event.target as HTMLImageElement).style.minWidth = 'auto')"
            @error="
              ($event) =>
                (($event.target as HTMLImageElement).src = `/images/${thumbnail.fallbackSrc}.png`)
            "
            height="70"
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, nextTick, ref, watch } from 'vue';
import { useStore } from '../../store';

const store = useStore();
const emit = defineEmits(['listItemClick']);

const thumbnailsRef = ref() as Ref<HTMLElement>;
const draggedIndex = ref(-1);

const onListItemClick = (index: number) => {
  emit('listItemClick', index);
};

watch(
  computed(() => store.chosenStockListIndex),
  (index) => {
    if (index < 0) return;

    nextTick(() => {
      (thumbnailsRef.value as HTMLElement)
        .querySelector(`li:nth-child(${index + 1})`)
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

  let targetEl = thumbnailsRef.value.querySelector(`li:nth-child(${vehicleIndex + 1})`);

  if (!targetEl && draggedIndex.value != -1) return;

  const tempVehicle = store.stockList[vehicleIndex];
  store.stockList[vehicleIndex] = store.stockList[draggedIndex.value];
  store.stockList[draggedIndex.value] = tempVehicle;

  store.chosenStockListIndex = vehicleIndex;
};

const allowDrop = (e: DragEvent) => {
  e.preventDefault();
};

const getVehicleThumbnails = (vehicleString: string) => {
  const [vehicleName, vehicleCargo] = vehicleString.split(':');

  const thumbnails: { src: string; fallbackSrc: string }[] = [];

  // Generowanie członów EN57
  if (vehicleName.startsWith('EN57')) {
    thumbnails.push(
      { src: vehicleName + 'ra', fallbackSrc: 'unknown_ezt-ra' },
      { src: vehicleName + 's', fallbackSrc: 'unknown_ezt-s' },
      { src: vehicleName + 'rb', fallbackSrc: 'unknown_ezt-rb' }
    );
  }

  // Generowanie członów EN71
  else if (vehicleName.startsWith('EN71')) {
    thumbnails.push(
      { src: vehicleName + 'ra', fallbackSrc: 'unknown_ezt-ra' },
      { src: vehicleName + 'sa', fallbackSrc: 'unknown_ezt-sa' },
      { src: vehicleName + 'sb', fallbackSrc: 'unknown_ezt-sb' },
      { src: vehicleName + 'rb', fallbackSrc: 'unknown_ezt-rb' }
    );
  }

  // Generowanie pojazdów i członów 2EN57
  else if (vehicleString.startsWith('2EN57')) {
    const [firstVehicleNumber, secondVehicleNumber] = vehicleString
      .replace('2EN57-', '')
      .split('+');

    thumbnails.push(
      { src: `EN57-${firstVehicleNumber}ra`, fallbackSrc: 'unknown_ezt-ra' },
      { src: `EN57-${firstVehicleNumber}s`, fallbackSrc: 'unknown_ezt-s' },
      { src: `EN57-${firstVehicleNumber}rb`, fallbackSrc: 'unknown_ezt-rb' },
      { src: `EN57-${secondVehicleNumber}ra`, fallbackSrc: 'unknown_ezt-ra' },
      { src: `EN57-${secondVehicleNumber}s`, fallbackSrc: 'unknown_ezt-s' },
      { src: `EN57-${secondVehicleNumber}rb`, fallbackSrc: 'unknown_ezt-rb' }
    );
  }

  // Generowanie członów Gor77
  else if (vehicleString.startsWith('Gor77')) {
    thumbnails.push(
      { src: vehicleName + '-A', fallbackSrc: 'unknown_Gor77-A' },
      { src: vehicleName + '-B', fallbackSrc: 'unknown_Gor77-B' },
      { src: vehicleName + '-C', fallbackSrc: 'unknown_Gor77-C' },
      { src: vehicleName + '-D', fallbackSrc: 'unknown_Gor77-D' }
    );
  }

  // Generowanie członów ET41
  else if (vehicleString.startsWith('ET41')) {
    thumbnails.push(
      { src: vehicleName + '-A', fallbackSrc: 'unknown_ET41-A' },
      { src: vehicleName + '-B', fallbackSrc: 'unknown_ET41-B' }
    );
  }

  // Generowanie pozostałych pojazdów
  else {
    let fallbackVehicleImage = 'unknown_cargo';

    if (/^(EP|EU)/.test(vehicleName)) fallbackVehicleImage = 'unknown_train';
    else if (/^(SM42)/.test(vehicleName)) fallbackVehicleImage = 'unknown_SM42';
    else if (/(\d{3}a|(Bau|Gor)\d{2}|304C)_/.test(vehicleName))
      fallbackVehicleImage = 'unknown_passenger';

    thumbnails.push({ src: vehicleName, fallbackSrc: fallbackVehicleImage });
  }

  return thumbnails;
};
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

.stock-thumbnails {
  overflow: auto;
  background-color: #353a57;
  height: auto;
}

ul {
  display: flex;
  align-items: flex-end;
  min-height: 110px;
}

.thumbnail-item {
  cursor: pointer;
  font-size: 0.85em;
  text-align: center;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &[data-selected='true'] {
    background-color: rebeccapurple;
  }

  &[data-sponsor-only='true'] > b {
    color: $sponsorColor;
  }

  &[data-team-only='true'] > b {
    color: $teamColor;
  }

  img {
    max-height: 70px;
    width: auto;
    height: auto;
  }
}

.stock-text {
  font-weight: bold;
  color: #ccc;
  font-size: 0.9em;
}

.thumbnail-item > span {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  cursor: crosshair;
}
</style>
