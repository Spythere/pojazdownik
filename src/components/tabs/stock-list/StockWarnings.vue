<template>
  <div class="stock_warnings" v-if="hasAnyWarnings">
    <div class="warning" v-if="locoNotSuitable">(!) {{ $t('stocklist.warning-not-suitable') }}</div>

    <div class="warning" v-if="lengthExceeded && store.isTrainPassenger">
      (!) {{ $t('stocklist.warning-passenger-too-long') }}
    </div>

    <div class="warning" v-if="lengthExceeded && !store.isTrainPassenger">
      (!) {{ $t('stocklist.warning-freight-too-long') }}
    </div>

    <div class="warning" v-if="teamOnlyVehicles.length > 0">
      (!)
      {{
        $t('stocklist.warning-team-only-vehicle', [
          teamOnlyVehicles.map((v) => v.vehicleRef.type).join(', '),
        ])
      }}
    </div>

    <div class="warning" v-if="weightExceeded">
      (!)
      <i18n-t keypath="stocklist.warning-too-heavy">
        <template #href>
          <a
            target="_blank"
            href="https://docs.google.com/spreadsheets/d/1BvTU-U7huIaEheov22TrhTtROUM4MwVfdbq03GVAEM8"
          >
            {{ $t('stocklist.acceptable-mass-docs') }}
          </a>
        </template>
      </i18n-t>
    </div>

    <!-- <div class="warning" v-if="locoCountExceeded">
          {{ $t('stocklist.warning-too-many-locos') }}
        </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../../store';
import { isTractionUnit } from '../../../utils/vehicleUtils';

export default defineComponent({
  data: () => ({
    store: useStore(),
  }),

  computed: {
    teamOnlyVehicles() {
      return this.store.stockList.filter((stock) => stock.vehicleRef.teamOnly);
    },

    hasAnyWarnings() {
      return (
        this.weightExceeded || this.lengthExceeded || this.locoNotSuitable || this.teamOnlyVehicles
      );
    },

    lengthExceeded() {
      return (
        (this.store.totalLength > 350 && this.store.isTrainPassenger) ||
        (this.store.totalLength > 650 && !this.store.isTrainPassenger)
      );
    },

    weightExceeded() {
      return this.store.acceptableWeight && this.store.totalWeight > this.store.acceptableWeight;
    },

    locoNotSuitable() {
      return (
        !this.store.isTrainPassenger &&
        this.store.stockList.length > 1 &&
        !this.store.stockList.every((stock) => isTractionUnit(stock.vehicleRef)) &&
        this.store.stockList.some(
          (stock) => isTractionUnit(stock.vehicleRef) && stock.vehicleRef.type.startsWith('EP')
        )
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.warning {
  padding: 0.25em;
  margin: 0.25em 0;
  background: global.$accentColor;
  color: black;

  font-weight: bold;

  a {
    color: black;
    text-decoration: underline;
  }
}
</style>
