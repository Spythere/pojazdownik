<template>
  <AppModals />
  <ImageFullscreenPreview v-if="store.vehiclePreviewSrc" />

  <transition name="slide-bottom-anim">
    <MigrationInfo v-if="store.isMigrationInfoOpen" />
  </transition>

  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useStore } from './store';
import ImageFullscreenPreview from './components/utils/ImageFullscreenPreview.vue';
import AppModals from './components/app/AppModals.vue';
import { computed, onMounted, watchEffect } from 'vue';
import { registerSW } from 'virtual:pwa-register';
import MigrationInfo from './components/app/MigrationInfo.vue';

const store = useStore();

registerSW({
  immediate: true,
});

onMounted(() => {
  loadStockDataFromStorage();
  handleMigrationInfo();
  store.setupAPIData();
});

const currentStockString = computed(() => store.stockString);

watchEffect(() => {
  if (currentStockString.value != store.chosenStorageStockString) {
    store.chosenStorageStockName = '';
  }
});

function handleMigrationInfo() {
  // Show only on old domain
  if (location.hostname !== 'pojazdownik-td2.web.app') return;

  const showInfo = localStorage.getItem('showMigrationInfo');

  // Do not show if already acknowledged
  if (showInfo === 'false') return;

  setTimeout(() => {
    store.isMigrationInfoOpen = true;
  }, 2000);
}

function loadStockDataFromStorage() {
  const savedData = localStorage.getItem('savedStockData');

  if (!savedData) {
    localStorage.setItem('savedStockData', JSON.stringify({}));
    return;
  }

  try {
    store.storageStockData = JSON.parse(savedData);
  } catch (error) {
    console.error('Wystąpił błąd podczas przetwarzania danych o składach z localStorage!', error);
  }
}
</script>

<style lang="scss">
@use './styles/global';
@use './styles/responsive';

/* APP */
#app {
  margin: 0 auto;

  color: var(--textColor);
  font-size: 1em;
  padding: 0;

  @include responsive.midScreen {
    font-size: calc(0.7rem + 0.75vw);
  }
}
</style>
