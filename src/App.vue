<template>
  <div class="migration-info">
    <img src="/favicon.svg" alt="logo" width="120" />
    <h1><span class="text--accent">Aplikacja</span> została przeniesiona na nową domenę!</h1>
    <h1><span class="text--accent">This app</span> has been moved to a new domain!</h1>
    <a href="http://pojazdownik-td2.spythere.eu/">http://pojazdownik-td2.spythere.eu/</a>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from './store';
import { computed, watchEffect } from 'vue';
import { registerSW } from 'virtual:pwa-register';

const store = useStore();

registerSW({
  immediate: true,
});

const currentStockString = computed(() => store.stockString);

watchEffect(() => {
  if (currentStockString.value != store.chosenStorageStockString) {
    store.chosenStorageStockName = '';
  }
});
</script>

<style lang="scss">
@use './styles/global';
@use './styles/responsive';

/* APP */
#app {
  margin: 0 auto;

  color: var(--textColor);
  font-size: 1em;
  padding: 0;

  @include responsive.midScreen {
    font-size: calc(0.7rem + 0.75vw);
  }
}

.migration-info {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
  padding: 1em;

  img {
    margin-bottom: 2em;
  }

  h1 {
    margin: 0;
  }

  a {
    font-size: 1.85em;
    margin-top: 1em;
    text-decoration: underline;
  }
}
</style>
