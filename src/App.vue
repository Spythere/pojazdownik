<template>
  <AppModals />
  <ImageFullscreenPreview v-if="store.vehiclePreviewSrc" />
  <AppContainerView />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from './store';
import ImageFullscreenPreview from './components/utils/ImageFullscreenPreview.vue';
import AppContainerView from './views/AppContainerView.vue';
import AppModals from './components/app/AppModals.vue';

export default defineComponent({
  data() {
    return {
      store: useStore(),
    };
  },
  async created() {
    this.store.fetchStockInfoData();
    this.store.handleRouting();
  },
  components: { ImageFullscreenPreview, AppContainerView, AppModals },
});
</script>

<style lang="scss">
@import './styles/global.scss';

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;
  font-size: 1em;
  padding: 1em 0.5em;
}

/* HEADER SECTION */

h2 {
  margin: 0;
  margin-bottom: 0.5em;

  color: $accentColor;
  font-weight: 700;
  font-size: 1.2em;
}

.header-bottom {
  margin: 0;
  font-size: 1.5em;

  color: #d1d1d1;
}
</style>
