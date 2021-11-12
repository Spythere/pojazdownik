<template>
  <header>
    <h1 class="header-top">POJAZDOWNIK</h1>
    <p class="header-bottom"><span>EDYTOR SKŁADÓW ONLINE</span></p>
  </header>

  <main>
    <inputs-section />
    <list-section />
  </main>
  <footer>
    <div class="text--grayed" style="margin-bottom: 0.25em">
      Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za
      tworzenie składów niezgodnych z regulaminem symulatora Train Driver 2!
    </div>
    &copy; Spythere 2021 | v{{ VERSION }}
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
  grid-template-rows: 5em 1fr auto;
}

/* HEADER SECTION */

header {
  text-align: center;
}

.header-top {
  display: inline-block;
  margin: 0;
  font-size: 3.65em;
  color: $accentColor;

  padding: 0.25em 0.5em;

  font-weight: 900;
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
  line-height: 0.55em;
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
  }
}

@media screen and (max-width: 650px) {
  header {
    font-size: 0.75em;
  }
}
</style>
