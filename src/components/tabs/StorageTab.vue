<template>
  <section class="tab storage-tab">
    <div class="tab_header">
      <h2>ZAPISANE SKŁADY</h2>
      <h3>Zarządzaj składami zapisanymi w pamięci przeglądarki</h3>
    </div>

    <div class="tab_content">
      <div class="tab_actions">
        <button class="btn btn--image">
          <FolderArrowDownIcon />
          ZAPISZ OBECNY SKŁAD
        </button>
        <button class="btn btn--image">
          <TrashIcon />
          <span>USUŃ ZAPISANY SKŁAD</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, onActivated, Reactive, reactive } from 'vue';
import { IStock } from '../../types/common.types';
import { FolderArrowDownIcon, TrashIcon } from '@heroicons/vue/20/solid';

let storageStockData: Reactive<IStock[][]> = reactive([]);

onActivated(() => {
  loadStockDataFromStorage();
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

function saveStockDataToStorage(stockList: IStock[]) {
  storageStockData.push(stockList);

  try {
    localStorage.setItem('savedStockData', JSON.stringify(storageStockData));
  } catch (error) {
    console.error('Wystąpił błąd podczas zapisywania składu do localStorage!', error);
  }
}

function removeStockIndexFromStorage(stockIndex: number) {
  storageStockData.splice(stockIndex, 1);

  try {
    localStorage.setItem('savedStockData', JSON.stringify(storageStockData));
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
