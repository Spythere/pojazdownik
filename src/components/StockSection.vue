<template>
  <div class="stock-section">
    <transition name="tab-change" mode="out-in">
      <keep-alive>
        <component :is="chosenSectionComponent" :key="chosenSectionComponent"></component>
      </keep-alive>
    </transition>
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
// Tab change animation
.tab-change {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: all 100ms ease-in-out;
  }
}

// Section styles
.stock-section {
  grid-row: 1 / 4;
  grid-column: 2;
}

// Stock tabs styles
.stock_actions {
  display: flex;
  gap: 0.5em;

  @media only screen and (max-width: 450px) {
    flex-wrap: wrap;

    button {
      width: 100%;
    }
  }
 
}
</style>

