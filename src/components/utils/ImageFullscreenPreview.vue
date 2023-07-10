<template>
  <div class="image-preview" v-if="store.vehiclePreviewSrc">
    <img :src="store.vehiclePreviewSrc" alt="preview" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';

export default defineComponent({
  data() {
    return {
      store: useStore(),
    };
  },
});
</script>

<style lang="scss" scoped>
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  background: rgba(black, 0.85);

  img {
    width: 90%;
    max-width: 800px;
  }
}
</style>
