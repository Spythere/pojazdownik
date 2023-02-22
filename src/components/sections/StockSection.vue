<template>
  <section class="stock-section">
    <div class="section_modes">
      <button
        class="btn"
        v-for="(id, name) in sectionModes"
        @click="chooseSection(id)"
        :data-selected="store.stockSectionMode == id"
      >
        {{ name }}
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
import { computed, KeepAlive } from 'vue';
import { useStore } from '../../store';
import StockListTab from '../tabs/StockListTab.vue';
import StockGeneratorTab from '../tabs/StockGeneratorTab.vue';
import NumberGeneratorTab from '../tabs/NumberGeneratorTab.vue';

const store = useStore();
type SectionMode = typeof store.stockSectionMode;

const sectionModes: { [key: string]: SectionMode } = {
  SKŁAD: 'stock-list',
  'GNR. NUMERU': 'number-generator',
  'GNR. SKŁADU': 'stock-generator',
};

const chosenSectionComponent = computed(() => {
  switch (store.stockSectionMode) {
    case 'stock-list':
      return StockListTab;

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
  grid-template-columns: repeat(3, 1fr);
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
