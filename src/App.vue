<template>
  <div class="image-preview" v-if="store.vehiclePreviewSrc != ''" @click="() => (store.vehiclePreviewSrc = '')">
    <img :src="store.vehiclePreviewSrc" alt="preview" />
  </div>

  <div class="g-card-dimmer" v-if="store.isRandomizerCardOpen" @click="store.isRandomizerCardOpen = false"></div>
  <div class="g-card-dimmer" v-if="store.isRealStockListCardOpen" @click="store.isRealStockListCardOpen = false"></div>

  <keep-alive>
    <transition name="card-appear">
      <RealStockCard />
    </transition>
  </keep-alive>

  <div class="app_container">
    <main>
      <LogoSection />

      <InputsSection />

      <TrainImageSection />

      <StockSection />
    </main>

    <footer>
      <div class="text--grayed" style="margin-bottom: 0.25em">
        Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za tworzenie pociągów niezgodnych z
        <a
          style="color: #ccc"
          href="https://docs.google.com/document/d/1UAAPUtN0d_RoS4RgOzEzllJZJhA0VcizzCzKW4QylbY/edit"
          target="_blank"
        >
          regulaminem symulatora Train Driver 2</a
        >!
      </div>
      &copy;
      <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
      {{ new Date().getUTCFullYear() }} | v{{ VERSION }}
    </footer>
  </div>
</template>

<script lang="ts">
import packageInfo from '.././package.json';

import { defineComponent } from 'vue';

import InputsSection from './components/InputsSection.vue';

import { useStore } from './store';
import TrainImageSection from './components/TrainImageSection.vue';
import LogoSection from './components/LogoSection.vue';
import RealStockCard from './components/cards/RealStockCard.vue';
import StockSection from './components/StockSection.vue';

export default defineComponent({
  components: {
    StockSection,
    InputsSection,
    TrainImageSection,
    LogoSection,
    RealStockCard,
  },

  data: () => ({
    VERSION: packageInfo.version,
    store: useStore(),
  }),

  async created() {
    const stockData = await (
      await fetch(`https://spythere.github.io/api/td2/data/stockData.json?t=${Math.floor(Date.now() / 60000)}`)
    ).json();

    this.store.stockData = stockData;
  },
});
</script>

<style lang="scss">
@import './styles/global';

.app_container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
}

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;
  font-size: 1em;
  padding: 1em 0.5em;
}

/* HEADER SECTION */

h2 {
  margin: 0;
  margin-bottom: 0.5em;

  color: $accentColor;
  font-weight: 700;
  font-size: 1.2em;
}

.header-bottom {
  margin: 0;
  font-size: 1.5em;

  color: #d1d1d1;
}

.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  background: rgba(black, 0.85);

  img {
    width: 90%;
    max-width: 800px;
  }
}

/* MAIN SECTION */

main {
  display: grid;
  gap: 1em 3em;

  width: 100%;
  max-width: 1300px;
  min-height: 75vh;

  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto 360px minmax(400px, 1fr);

  // padding: 0 1em;
  margin-bottom: 2em;
}

/* FOOTER SECTION */

footer {
  margin-top: auto;
  text-align: center;
  padding: 0 1em;
}

/* MOBILE VIEWS */


@media screen and (max-width: $breakpointMd) {
  #app {
    font-size: calc(0.7rem + 0.75vw);
  }

  main {
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
}
</style>

