<template>
  <header>
    <img :src="logoSVG" alt="logo pojazdownik" />
    <p class="header-bottom"><span>EDYTOR POCIĄGÓW ONLINE</span></p>
  </header>

  <main>
    <inputs-section />
    <list-section />
  </main>
  <footer>
    <div class="text--grayed" style="margin-bottom: 0.25em">
      Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za
      tworzenie pociągów niezgodnych z regulaminem symulatora Train Driver 2!
    </div>
    &copy;
    <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
    2021 | v{{ VERSION }}
  </footer>
</template>

<script lang="ts">
import packageInfo from ".././package.json";

import { defineComponent } from "vue";

import ListSection from "@/components/ListSection.vue";
import InputsSection from "@/components/InputsSection.vue";

export default defineComponent({
  components: {
    ListSection,
    InputsSection,
  },
  data: () => ({
    VERSION: packageInfo.version,

    logoSVG: require("@/assets/logo.svg"),
  }),

  setup() {
    return {};
  },
});
</script>

<style lang="scss">
@import "./styles/global";

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;

  min-height: 100vh;

  padding: 0.5em 1em;

  overflow: hidden;

  display: grid;
  justify-content: center;

  grid-template-columns: minmax(200px, 1200px);
  grid-template-rows: 5.5em 1fr auto;
}

/* HEADER SECTION */

header {
  text-align: center;

  margin-top: 1em;

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
}

/* MAIN SECTION */

main {
  margin-top: 8em;
}

footer {
  margin-top: 1.5em;
  text-align: center;
}

@media screen and (max-width: 800px) {
  #app {
    font-size: calc(0.75vw + 0.6rem);
  }

  main {
    margin-top: 3.5em;
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
