<template>
  <section class="stock-section">
    <div class="section_modes">
      <button
        class="btn"
        v-for="(id, name, i) in sectionModes"
        @click="chooseSection(id)"
        :data-selected="store.stockSectionMode == id"
      >
        <span class="text--accent">{{ i + 1 }}.</span> {{ name }}
        <span v-if="id == 'stock-list'">({{ store.stockList.length }})</span>
      </button>
    </div>

    <transition name="tab-change" mode="out-in">
      <keep-alive>
        <component :is="chosenSectionComponent" :key="chosenSectionComponent"></component>
      </keep-alive>
    </transition>
  </section>
</template>

<script lang="ts" setup>
import { computed, KeepAlive, onMounted } from 'vue';
import { useStore } from '../../store';
import StockListTab from '../tabs/StockListTab.vue';
import StockGeneratorTab from '../tabs/StockGeneratorTab.vue';
import NumberGeneratorTab from '../tabs/NumberGeneratorTab.vue';
import WikiListTab from '../tabs/WikiListTab.vue';

const store = useStore();
type SectionMode = typeof store.stockSectionMode;

const sectionModes: { [key: string]: SectionMode } = {
  SKŁAD: 'stock-list',
  POJAZDY: 'wiki-list',
  'GNR NUMERU': 'number-generator',
  'GNR SKŁADU': 'stock-generator',
};

const sectionKeyIndexes: { [key: string]: SectionMode } = {
  '1': 'stock-list',
  '2': 'wiki-list',
  '3': 'number-generator',
  '4': 'stock-generator',
};

const chosenSectionComponent = computed(() => {
  switch (store.stockSectionMode) {
    case 'stock-list':
      return StockListTab;

    case 'wiki-list':
      return WikiListTab;

    case 'stock-generator':
      return StockGeneratorTab;

    case 'number-generator':
      return NumberGeneratorTab;

    default:
      return StockListTab;
  }
});

function chooseSection(sectionId: SectionMode) {
  store.stockSectionMode = sectionId;
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4') {
      store.stockSectionMode = sectionKeyIndexes[e.key];
    }
  });
});
</script>

<style lang="scss">
@import '../../styles/global.scss';

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
  gap: 0.5em;

  margin-bottom: 0.5em;

  button {
    position: relative;
    border-radius: 0.5em 0.5em 0 0;

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);

      content: '';
      width: 0;
      height: 2px;
      transition: all 100ms;
      background-color: $accentColor;
    }

    &[data-selected='true']::after {
      width: 100%;
    }
  }
}
</style>

