<template>
  <div class="app-container">
    <MainContainer />
    <Footer />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';

import MainContainer from '../components/app/MainContainer.vue';
import Footer from '../components/app/Footer.vue';

export default defineComponent({
  components: {
    MainContainer,
    Footer,
  },

  data: () => ({
    store: useStore(),
  }),
});
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
