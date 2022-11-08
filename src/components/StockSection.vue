<template>
  <div class="stock-section">
    <!-- <keep-alive> -->
      <component :is="chosenSectionComponent" :key="store.stockSectionMode"></component>
    <!-- </keep-alive> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../store';
import StockListTab from './StockListTab.vue';
import StockGeneratorTab from './StockGeneratorTab.vue';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  computed: {
    chosenSectionComponent() {
      switch (this.store.stockSectionMode) {
        case 'stock-list':
          return StockListTab;

        case 'stock-generator':
          return StockGeneratorTab;

        default:
          return StockListTab;
      }
    },
  },
});
</script>

<style lang="scss">
// Section styles
.stock-section {
  grid-row: 1 / 4;
  grid-column: 2;
}

// Stock tabs styles
.stock_actions {
  display: flex;

  .spacer {
    flex-grow: 2;
  }

  button {
    margin-right: 0.5em;

    &:nth-child(5) {
      margin-right: 0;
    }
  }
}
</style>
