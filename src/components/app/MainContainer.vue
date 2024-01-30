<template>
  <main>
    <LogoSection />
    <InputsSection />
    <TrainImageSection />
    <StockSection />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogoSection from '../sections/LogoSection.vue';
import InputsSection from '../sections/InputsSection.vue';
import TrainImageSection from '../sections/TrainImageSection.vue';
import StockSection from '../sections/StockSection.vue';

export default defineComponent({
  components: { LogoSection, InputsSection, TrainImageSection, StockSection },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global.scss';

main {
  display: grid;
  gap: 1em;

  width: 100%;
  max-width: 1350px;
  min-height: 75vh;

  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto 360px minmax(400px, 1fr);

  background-color: darken($color: $bgColor, $amount: 5);
  border-radius: 1em;

  padding: 1em;
}

@media screen and (max-width: $breakpointMd) {
  main {
    display: flex;
    flex-direction: column;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }
}
</style>
