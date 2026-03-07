<template>
  <div class="migrate-info">
    <div class="info-content">
      <i18n-t keypath="migrate-info.line-1" for="migrate-info" tag="div">
        <a href="https://pojazdownik-td2.spythere.eu/" target="_blank">{{ t('migrate-info.link') }}</a>
      </i18n-t>
      <button class="btn accept-btn" @click="onAcceptButtonClick">{{ t('migrate-info.accept-btn') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useStore } from '../../store';

const store = useStore();
const { t } = useI18n();

function onAcceptButtonClick() {
  store.isMigrationInfoOpen = false;
  localStorage.setItem('showMigrationInfo', 'false');
}
</script>

<style lang="scss" scoped>
.migrate-info {
  position: fixed;
  z-index: 100;
  bottom: 0;
  left: 0;

  padding: 0.25em;
  text-align: center;

  width: 100%;
  background-color: var(--accentColor);
  color: black;
  font-weight: bold;

  font-size: 1.1em;
}

.info-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;
}

a {
  color: black;
  text-decoration: underline;

  &:hover {
    color: black;
  }
}
</style>
