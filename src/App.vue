<template>
  <AppModals />
  <ImageFullscreenPreview v-if="store.vehiclePreviewSrc" />

  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from './store';
import ImageFullscreenPreview from './components/utils/ImageFullscreenPreview.vue';
import AppContainerView from './views/AppContainerView.vue';
import AppModals from './components/app/AppModals.vue';
import { registerSW } from 'virtual:pwa-register';

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Needs refresh!');
  },
});

export default defineComponent({
  components: { ImageFullscreenPreview, AppContainerView, AppModals },
  data() {
    return { store: useStore() };
  },

  created() {
    this.loadStockDataFromStorage();
    this.store.setupAPIData();
  },

  computed: {
    currentStockString() {
      return this.store.stockString;
    },
  },

  watch: {
    currentStockString(val: string) {
      if (val != this.store.chosenStorageStockString) {
        this.store.chosenStorageStockName = '';
      }
    },
  },

  methods: {
    loadStockDataFromStorage() {
      const savedData = localStorage.getItem('savedStockData');

      if (!savedData) {
        localStorage.setItem('savedStockData', JSON.stringify({}));
        return;
      }

      try {
        this.store.storageStockData = JSON.parse(savedData);
      } catch (error) {
        console.error('Wystąpił błąd podczas przetwarzania danych o składach z localStorage!', error);
      }
    },
  },
});
</script>

<style lang="scss">
/* APP */
#app {
  margin: 0 auto;

  color: global.$textColor;
  font-size: 1em;
  padding: 0;

  @media screen and (max-width: global.$breakpointMd) {
    font-size: calc(0.7rem + 0.75vw);
  }

  @media screen and (orientation: landscape) and (max-width: global.$breakpointMd) {
    font-size: calc(0.75rem + 0.4vw);
  }
}
</style>
