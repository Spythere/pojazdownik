<template>
  <section class="stock-list-tab">
    <div class="tab_content">
      <!-- Stock Actions -->
      <StockActions />

      <!-- Stock Specs -->
      <StockSpecs />

      <!-- Stock Spawn Settings -->
      <StockSpawnSettings />

      <!-- Stock Warnings -->
      <StockWarnings />

      <!-- Stock List -->
      <StockList />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStore } from '../../store';

import imageMixin from '../../mixins/imageMixin';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import stockMixin from '../../mixins/stockMixin';

import StockActions from './stock-list/StockActions.vue';
import StockSpecs from './stock-list/StockSpecs.vue';
import StockSpawnSettings from './stock-list/StockSpawnSettings.vue';
import StockWarnings from './stock-list/StockWarnings.vue';
import StockList from './stock-list/StockList.vue';

export default defineComponent({
  name: 'stock-list',
  components: {
    StockActions,
    StockSpecs,
    StockSpawnSettings,
    StockWarnings,
    StockList,
  },

  mixins: [imageMixin, stockMixin, stockPreviewMixin],

  setup() {
    const store = useStore();

    return {
      store,
    };
  },

  data: () => ({}),

  // computed: {
  //   chosenStockVehicle() {
  //     return this.store.chosenStockListIndex == -1
  //       ? undefined
  //       : this.store.stockList[this.store.chosenStockListIndex];
  //   },
  // },

  methods: {},
});
</script>

<style lang="scss" scoped>
@use '@/styles/tab';

.tab_content {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>
