<template>
  <div class="app-container">
    <MainContainer />
    <FooterVue />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import MainContainer from '../components/app/MainContainer.vue';
import FooterVue from '../components/app/Footer.vue';

export default defineComponent({
  components: {
    MainContainer,
    FooterVue,
  },

  data: () => ({
    store: useStore(),
  }),
});
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

.app-container {
  display: grid;
  justify-content: center;
  
  grid-template-rows: minmax(900px, 1fr) auto;
  gap: 0.5em;
  
  height: 100vh;
}

@include responsive.midScreen {
  .app-container {
    height: auto;
    min-height: 100vh;
  }
}
</style>
