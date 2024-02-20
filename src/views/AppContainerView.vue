<template>
  <div class="app-container">
    <MainContainer />
    <FooterVue />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "../store";

import MainContainer from "../components/app/MainContainer.vue";
import FooterVue from "../components/app/Footer.vue";

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
.app-container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
