<template>
  <section class="logo-section">
    <img :src="`/logo-${$i18n.locale}.svg`" alt="logo pojazdownik" @click="navigate" />

    <div class="actions">
      <button
        v-for="action in localeActions"
        :key="action.name"
        class="btn btn--text"
        :data-selected="$i18n.locale == action.locale"
        @click="chooseLocale(action.locale)"
      >
        {{ action.name }}
      </button>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  data() {
    return {
      localeActions: [
        { name: 'POLSKI', locale: 'pl' },
        { name: 'ENGLISH', locale: 'en' },
      ],
    };
  },
  methods: {
    navigate() {
      window.location.pathname = '';
    },

    chooseLocale(locale: string) {
      this.$i18n.locale = locale;
      window.localStorage.setItem('locale', locale);
    },
  },
};
</script>

<style lang="scss" scoped>
.logo-section {
  grid-row: 1;
  grid-column: 1;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.5em;

  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.5em;

  button[data-selected='true'] {
    font-weight: bold;
    color: global.$accentColor;
    text-decoration: underline;
  }
}

img {
  max-width: 25em;
  width: 100%;
}
</style>
