<template>
  <div class="stock_specs">
    <b class="real-stock-info" v-if="store.chosenStorageStockName">
      <span class="text--accent">
        <BookmarkIcon />
        {{ store.chosenStorageStockName }}
      </span>
      |
    </b>

    <!-- <b class="real-stock-info" v-if="store.chosenRealComposition">
      <span class="text--accent">
        <img :src="getIconURL(chosenRealComposition.type)" :alt="chosenRealComposition.type" />
        {{ chosenRealComposition.number }} {{ chosenRealComposition.name }}
      </span>
      |
    </b> -->

    <span>
      {{ $t('stocklist.mass') }}
      <span class="text--accent">{{ (store.totalWeight / 1000).toFixed(1) }}t</span>
      ({{ $t('stocklist.mass-accepted') }}:
      <span class="text--accent">{{
        store.acceptableWeight ? `${~~(store.acceptableWeight / 1000)}t` : '-'
      }}</span
      >) - {{ $t('stocklist.length') }}:
      <span class="text--accent">{{ store.totalLength }}m</span>
      - {{ $t('stocklist.vmax') }}
      <span tabindex="0" :data-tooltip="$t('stocklist.disclaimer')">(?)</span>:
      <span class="text--accent">{{ store.maxStockSpeed }} km/h</span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../../store';
import imageMixin from '../../../mixins/imageMixin';

export default defineComponent({
  mixins: [imageMixin],

  data: () => ({
    store: useStore(),
  }),
});
</script>

<style scoped>
.real-stock-info {
  img {
    height: 1.3ch;
  }
}
</style>
