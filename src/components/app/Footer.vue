<template>
  <footer>
    <i18n-t keypath="footer.disclaimer" tag="div" class="text--grayed">
      <template #tos>
        <a style="color: #ccc" :href="$t('footer.tos-href')" target="_blank">
          {{ $t('footer.tos') }}
        </a>
      </template>
    </i18n-t>

    <div class="text--grayed" v-if="store.vehiclesData">
      {{ $t('footer.version-check', { version: store.vehiclesData.simulatorVersion }) }}
    </div>

    <div>
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} | v{{ VERSION }}{{ !isOnProductionHost ? 'dev' : '' }}
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
      isOnProductionHost: location.hostname == 'pojazdownik-td2.web.app',
      VERSION: packageInfo.version,
      store: useStore(),
    };
  },
});
</script>

<style lang="scss" scoped>
footer {
  text-align: center;
  padding: 1em 1em 0 1em;
}
</style>
