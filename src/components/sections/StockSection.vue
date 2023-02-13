<template>
  <section class="stock-section">
    <transition name="tab-change" mode="out-in">
      <keep-alive>
        <component :is="chosenSectionComponent" :key="chosenSectionComponent"></component>
      </keep-alive>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';
import StockListTab from '../tabs/StockListTab.vue';
import StockGeneratorTab from '../tabs/StockGeneratorTab.vue';
import NumberGeneratorTab from '../tabs/NumberGeneratorTab.vue';

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

        case 'number-generator':
          return NumberGeneratorTab;

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

  padding: 0 1px;

  overflow: hidden;
}
</style>

