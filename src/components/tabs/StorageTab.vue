<template>
  <section class="tab storage-tab">
    <div class="tab_header">
      <h2>ZAPISANE SKŁADY</h2>
      <h3>Zarządzaj składami zapisanymi w pamięci przeglądarki</h3>
    </div>

    <div class="tab_content">
      <div class="storage_actions">
        <!-- :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="downloadStock" -->
        <button
          class="btn btn--image"
        >
          <img src="/images/icon-download.svg" alt="download icon" />
          POBIERZ DO PLIKU
        </button>

        <button
          class="btn btn--image"
        >
          <img src="/images/icon-download.svg" alt="download icon" />
          SKOPIUJ DO SCHOWKA
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'storage-tab',

  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use '@/styles/tab';
</style>
