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
@use '@/styles/responsive';

main {
  display: grid;
  gap: 1em;

  width: 100vw;
  max-width: 1600px;

  grid-template-columns: minmax(380px, 1fr) 3fr;
  grid-template-rows: auto 350px minmax(300px, 1fr);

  border-radius: 1em;
  overflow: hidden;
  padding: 1em;
}

@include responsive.midScreen {
  main {
    display: flex;
    flex-direction: column;
    gap: 1em;
    height: auto;
  }
}
</style>
