<template>
  <div class="migrate-info">
    <i18n-t keypath="migrate-info.line-1" for="migrate-info">
      <a href="https://pojazdownik-td2.spythere.eu/" target="_blank">{{ $t('migrate-info.link') }}</a>
    </i18n-t>
  </div>
</template>

<script setup lang="ts"></script>

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

a {
  color: black;
  text-decoration: underline;

  &:hover {
    color: black;
  }
}
</style>
