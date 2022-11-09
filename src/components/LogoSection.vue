<template>
  <section class="logo-section">
    <img src="/images/logo.svg" alt="logo pojazdownik" />
  </section>
</template>

<script lang="ts">
export default {
  setup() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.logo-section {
  grid-row: 1;
  grid-column: 1;
  margin-bottom: 1.5em;

  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  max-width: 25em;
  width: 100%;    
}
</style>

