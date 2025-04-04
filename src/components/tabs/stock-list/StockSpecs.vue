<template>
  <div class="stock-specs">
    <div v-if="store.chosenStorageStockName || chosenRealComposition">
      <b v-if="store.chosenStorageStockName">
        <span
          class="text--accent"
          :title="store.chosenStorageStockName.length > 41 ? store.chosenStorageStockName : ''"
        >
          <BookmarkCheck :size="19" />
          {{ store.chosenStorageStockName.slice(0, 40) }}
          {{ store.chosenStorageStockName.length > 41 ? '...' : '' }}
        </span>
      </b>

      <span v-if="store.chosenStorageStockName && chosenRealComposition"> | </span>

      <b class="real-stock-info" v-if="chosenRealComposition">
        <span class="text--accent">
          <img
            class="real-stock-icon"
            :src="getIconURL(chosenRealComposition.type)"
            :alt="chosenRealComposition.type"
          />
          {{ chosenRealComposition.number }} {{ chosenRealComposition.name }}
        </span>
      </b>
    </div>

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
import { BookmarkCheck } from 'lucide-vue-next';

export default defineComponent({
  components: { BookmarkCheck },

  mixins: [imageMixin],

  data: () => ({
    store: useStore(),
  }),

  computed: {
    chosenRealComposition() {
      const currentStockString = this.store.stockList.map((s) => s.vehicleRef.type).join(';');

      return this.store.realCompositionList.find((rc) => rc.stockString == currentStockString);
    },
  },
});
</script>

<style scoped>
.real-stock-icon {
  height: 1.3ch;
}

.stock-specs svg {
  vertical-align: text-top;
}
</style>
