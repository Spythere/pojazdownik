<template>
  <section class="logo-section" @click="navigate">
    <img src="/images/logo.svg" alt="logo pojazdownik" />
  </section>
</template>

<script lang="ts">
export default {
  setup() {
    return {};
  },

  methods: {
    navigate() {
      window.location.pathname = '';
    },
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

  cursor: pointer;
}

img {
  max-width: 25em;
  width: 100%;
}
</style>

