<template>
  <section class="tab storage-tab">
    <div class="tab_header">
      <h2>ZAPISANE SKŁADY</h2>
      <h3>Zarządzaj składami zapisanymi w pamięci przeglądarki</h3>
    </div>

    <div class="tab_content">
      <div class="tab_actions">
        <button
          class="btn btn--image"
          @click="saveStockDataToStorage"
          :disabled="store.stockList.length == 0"
          :data-disabled="store.stockList.length == 0"
        >
          <FolderArrowDownIcon />
          ZAPISZ OBECNY SKŁAD
        </button>
        <button
          class="btn btn--image"
          @click="removeStockIndexFromStorage"
          :disabled="currentStockIndex == -1"
          :data-disabled="currentStockIndex == -1"
        >
          <TrashIcon />
          <span>USUŃ ZAPISANY SKŁAD</span>
        </button>
      </div>

      <ul class="storage-stock-list">
        <li v-for="(stockList, i) in storageStockData" :key="i">
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onActivated, Reactive, reactive, ref } from 'vue';
import { IStock } from '../../types/common.types';
import { FolderArrowDownIcon, TrashIcon } from '@heroicons/vue/20/solid';
import { useStore } from '../../store';

const store = useStore();

let storageStockData: Reactive<IStock[][]> = reactive([]);
const currentStockIndex = ref(-1);

onActivated(() => {
  // loadStockDataFromStorage();
});

function loadStockDataFromStorage() {
  const savedData = localStorage.getItem('savedStockData');

  if (!savedData) {
    localStorage.setItem('savedStockData', JSON.stringify([]));
    return;
  }

  try {
    storageStockData = JSON.parse(savedData);
  } catch (error) {
    console.error('Wystąpił błąd podczas przetwarzania danych o składach z localStorage!', error);
  }
}

function saveStockDataToStorage() {
  if (store.stockList.length == 0) return;

  storageStockData.push(store.stockList);

  try {
    localStorage.setItem('savedStockData', JSON.stringify(storageStockData));
    currentStockIndex.value = storageStockData.length;
  } catch (error) {
    console.error('Wystąpił błąd podczas zapisywania składu do localStorage!', error);
    storageStockData.pop();
  }
}

function removeStockIndexFromStorage() {
  if (currentStockIndex.value == -1) return;

  storageStockData.splice(currentStockIndex.value, 1);

  try {
    localStorage.setItem('savedStockData', JSON.stringify(storageStockData));
    currentStockIndex.value = currentStockIndex.value - 1;
  } catch (error) {
    console.error('Wystąpił błąd podczas usuwania składu z localStorage!', error);
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/tab';

.tab_actions {
  grid-template-columns: repeat(2, 1fr);
}
</style>
