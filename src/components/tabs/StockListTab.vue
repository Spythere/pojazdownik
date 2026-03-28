<template>
  <section class="stock-list-tab">
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
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
});
</script>

<style lang="scss" scoped>
@use '../../styles/tab';

.stock-list-tab {
  display: grid;
  grid-template-rows: auto auto auto auto 1fr;
  gap: 0.5em;
  overflow: hidden;
}

.tab_content {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
</style>
