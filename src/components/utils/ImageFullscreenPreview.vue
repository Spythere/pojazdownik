<template>
  <div
    class="image-preview"
    @click="store.vehiclePreviewSrc = ''"
    @keydown.esc="store.vehiclePreviewSrc = ''"
    tabindex="0"
  >
    <img :src="store.vehiclePreviewSrc" alt="preview" @error="onImageError" />
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

  mounted() {
    this.$el.focus();
  },

  methods: {
    onImageError(event: Event) {
      if(!event.target || !(event.target instanceof HTMLImageElement)) return

      event.target.src = '/images/no-vehicle-image.png';
    },
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
  cursor: zoom-out;

  img {
    max-width: 100%;
    height: auto;
    max-height: 100%;
  }
}
</style>
