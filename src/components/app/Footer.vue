<template>
  <footer>
    <div class="text--grayed">
      Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za tworzenie pociągów niezgodnych z
      <a
        style="color: #ccc"
        href="https://docs.google.com/document/d/1UAAPUtN0d_RoS4RgOzEzllJZJhA0VcizzCzKW4QylbY/edit"
        target="_blank"
      >
        regulaminem symulatora Train Driver 2</a
      >!
    </div>

    <div class="text--grayed" v-if="store.stockData">
      Strona jest kompletna dla wersji {{ store.stockData.version }} symulatora TD2
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
  display: flex;
  flex-direction: column;
  gap: 0.25em;

  text-align: center;
  padding: 1em 1em 0 1em;
  margin-top: auto;
}
</style>
