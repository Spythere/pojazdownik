<template>
  <section class="stock-section">
    <div class="section_modes">
      <router-link v-for="(route, i) in routes" :key="route.name" class="link-btn" :to="route.href">
        <span class="text--accent">{{ i + 1 }}.</span> {{ $t(`topbar.${route.name}`) }}
        <span class="text--grayed" v-if="route.name == 'stock'">({{ store.stockList.length }})</span>
      </router-link>
    </div>

    <transition name="tab-change" mode="out-in">
      <keep-alive>
        <component :is="route.meta.viewMode"></component>
      </keep-alive>
    </transition>
  </section>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useStore } from '../../store';
import { useRoute, useRouter } from 'vue-router';

const store = useStore();
const route = useRoute();
const router = useRouter();

const routes = [
  {
    name: 'stock',
    href: '/',
  },
  {
    name: 'wiki',
    href: '/wiki',
  },
  {
    name: 'numgen',
    href: '/numgen',
  },
  {
    name: 'stockgen',
    href: '/stockgen',
  },
];

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;

    if (/^[1234]$/.test(e.key)) {
      const keyNum = Number(e.key);

      router.push(routes[keyNum - 1].href);
    }
  });
});
</script>

<style lang="scss">


// Tab change animation
.tab-change {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: all 100ms ease-in-out;
  }
}

// Section styles
.stock-section {
  grid-row: 1 / 4;
  grid-column: 2;

  overflow: hidden;
  padding: 1px;
}

.section_modes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 1px;

  gap: 0.5em;

  margin-bottom: 1em;
}

@media screen and (max-width: 650px) {
  .section_modes {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
}
</style>
