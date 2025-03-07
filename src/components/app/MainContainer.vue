<template>
  <main>
    <LogoSection />
    <InputsSection />
    <TrainImageSection />
    <TabsSection />
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LogoSection from '../sections/LogoSection.vue';
import InputsSection from '../sections/InputsSection.vue';
import TrainImageSection from '../sections/TrainImageSection.vue';
import TabsSection from '../sections/TabsSection.vue';

export default defineComponent({
  components: { LogoSection, InputsSection, TrainImageSection, TabsSection },
});
</script>

<style lang="scss" scoped>
main {
  display: grid;
  gap: 1em;

  width: 100%;
  max-width: 1350px;

  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto 360px minmax(300px, 1fr);

  background-color: global.$bgColorDarker;
  border-radius: 1em;

  min-height: 950px;

  padding: 1em;
}

@media screen and (max-width: global.$breakpointMd) {
  main {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
}
</style>
