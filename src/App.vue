<template>
  <div class="image-preview" v-if="store.vehiclePreviewSrc != ''" @click="() => (store.vehiclePreviewSrc = '')">
    <img :src="store.vehiclePreviewSrc" alt="preview" />
  </div>

  <div class="g-card-dimmer" v-if="store.isRandomizerCardOpen" @click="store.isRandomizerCardOpen = false"></div>
  <div class="g-card-dimmer" v-if="store.isRealStockListCardOpen" @click="store.isRealStockListCardOpen = false"></div>

  <keep-alive>
    <RandomizerCard v-if="store.isRandomizerCardOpen" />
  </keep-alive>

  <div class="app_container">
    <header>
      <img :src="logoImage" alt="logo pojazdownik" />
    </header>
    <main>
      <div id="inputs-area">
        <InputsSection />
      </div>

      <div id="list-area">
        <ListSection />
      </div>

      <div id="image-area">
        <TrainImage />
      </div>
    </main>
    <footer>
      <div class="text--grayed" style="margin-bottom: 0.25em">
        Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za tworzenie pociągów niezgodnych z
        regulaminem symulatora Train Driver 2!
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
import ListSection from './components/ListSection.vue';

import logoImage from './assets/logo.svg';
import { useStore } from './store';
import TrainImage from './components/TrainImageSection.vue';
import RandomizerCard from './components/RandomizerCard.vue';

export default defineComponent({
  components: {
    ListSection,
    InputsSection,
    TrainImage,
    RandomizerCard,
  },

  data: () => ({
    VERSION: packageInfo.version,

    logoImage,
  }),

  setup() {
    const store = useStore();

    return {
      store,
    };
  },
  mounted() {
    window.addEventListener('keydown', (ev) => {
      if (this.store.vehiclePreviewSrc == '') return;

      if (ev.key.toLowerCase() == 'escape') this.store.vehiclePreviewSrc = '';
      // if(ev.key.toLowerCase() == 'enter')
    });

    // window.focus();
  },
});
</script>

<style lang="scss">
@import './styles/global';

.app_container {
  min-height: 100vh;

  display: flex;
  flex-direction: column;
  padding: 1em;
}

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;

  display: flex;
  justify-content: center;
}

/* HEADER SECTION */

header {
  text-align: center;

  img {
    width: 35em;
  }
}

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
  margin-top: 2em;
  display: grid;
  gap: 1em 3em;

  width: 100vw;
  max-width: 1300px;

  grid-template-columns: 1fr 2fr;
  grid-template-areas: 'inputs list' 'image list';

  padding: 0.5em;

  #inputs-area {
    grid-area: inputs;
  }

  #list-area {
    grid-area: list;
  }

  #image-area {
    grid-area: image;
  }
}

/* FOOTER SECTION */

footer {
  margin-top: auto;
  text-align: center;
}

/* MOBILE VIEWS */

@media screen and (max-width: 1100px) {
  main {
    grid-template-columns: 1fr;
    grid-template-areas: 'inputs' 'image' 'list';
    justify-items: center;
  }
}

@media screen and (max-width: 800px) {
  #app {
    font-size: calc(0.75vw + 0.6rem);
  }

  header {
    font-size: 0.85em;

    img {
      width: 35em;
    }
  }
}

@media screen and (max-width: 650px) {
  header {
    font-size: 0.75em;

    img {
      width: 32em;
    }
  }
}
</style>

