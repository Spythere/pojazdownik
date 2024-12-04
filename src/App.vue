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

export default defineComponent({
  components: { ImageFullscreenPreview, AppContainerView, AppModals },
  data() {
    return {
      store: useStore(),
    };
  },

  async created() {
    this.store.handleRouting();
    this.store.setupAPIData();
  },
});
</script>

<style lang="scss">
@import './styles/global.scss';

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;
  font-size: 1em;
  padding: 0;

  @media screen and (max-width: $breakpointMd) {
    font-size: calc(0.7rem + 0.75vw);
  }

  @media screen and (orientation: landscape) and (max-width: $breakpointMd) {
    font-size: calc(0.75rem + 0.4vw);
  }
}
</style>
