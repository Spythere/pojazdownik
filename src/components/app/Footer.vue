<template>
  <footer>
    <div>
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} | v{{ VERSION }}{{ !isOnProductionHost ? 'dev' : '' }}
    </div>

    <div class="text--grayed" v-if="store.vehiclesData">
      {{
        $t('footer.vehicles-count', {
          all: vehiclesCounters.all,
          units: vehiclesCounters.units,
          cars: vehiclesCounters.cars,
        })
      }}
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import packageInfo from '../../../package.json';
import { useStore } from '../../store';

export default defineComponent({
  data() {
    return {
      isOnProductionHost: location.hostname == 'pojazdownik-td2.web.app' || location.hostname == 'pojazdownik-td2.spythere.eu',
      VERSION: packageInfo.version,
      store: useStore(),
    };
  },

  computed: {
    vehiclesCounters() {
      let counters = {
        all: 0,
        cars: 0,
        units: 0,
      };

      if (!this.store.vehiclesData) return counters;

      this.store.vehiclesData?.forEach((v) => {
        counters.all += 1;

        if (v.group.locoProps !== null) counters.units += 1;
        else counters.cars += 1;
      });

      return counters;
    },
  },
});
</script>

<style lang="scss" scoped>
footer {
  text-align: center;
  padding: 0 0.5em 0.5em 0.5em;
}
</style>
