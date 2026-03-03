<template>
  <div class="migration-card g-card" @toggle-card="toggleCard">
    <div class="g-card_bg" @click="store.isMigrationCardOpen = false"></div>

    <div class="card-content">
      <div class="content-top">
        <!-- <img src="/images/icon-loading.svg" alt="loading" height="125" /> -->
        <h1>{{ t('migrate-info.header-text') }}</h1>
      </div>

      <div>
        <p v-html="t('migrate-info.paragraph-1-html')"></p>

        <p>
          <a class="new-link" href="https://stacjownik-td2.spythere.eu/" target="_blank">
            {{ t('migrate-info.paragraph-2-link-text') }}
          </a>
        </p>

        <p>
          {{ t('migrate-info.paragraph-3-text') }}
        </p>

        <p class="info-bottom" v-html="t('migrate-info.paragraph-4-html')"></p>
      </div>

      <div class="content-actions">
        <button class="btn" @click="toggleCard">PRZYJĄŁEM!</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useStore } from '../../store';

const { t } = useI18n();
const store = useStore();

function toggleCard() {
  store.isMigrationCardOpen = !store.isMigrationCardOpen;
}
</script>

<style lang="scss" scoped>
@use '@/styles/responsive';

.migration-card {
  align-items: center;
  top: 0;
  padding: 0.5em;
}

.card-content {
  background-color: #1c1c1c;
  z-index: 100;
  border-radius: 1em;

  max-width: 800px;
  min-height: 500px;
  padding: 1em 0.5em;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;

  text-align: center;
  font-size: 1.1em;
}

p {
  padding: 0.5em 0;
}

a.new-link {
  font-size: 1.2em;
  color: var(--clr-primary);
  color: transparent;

  background: var(--clr-primary);
  background: linear-gradient(90deg, var(--clr-primary), #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: var(--clr-primary) 0 0 10px;
}

.info-bottom {
  font-size: 0.9em;
  color: #ccc;
}

.content-actions {
  display: flex;
  justify-content: center;
  font-size: 1.2em;
}

.content-actions > button {
  background-color: #111;
  padding: 0.5em;
}

@include responsive.smallScreen {
  .migration-card {
    // top: 0;
  }
}
</style>
