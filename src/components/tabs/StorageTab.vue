<template>
  <section class="tab storage-tab">
    <div class="tab_header">
      <h2>ZAPISANE SKŁADY</h2>
      <h3>Zarządzaj składami zapisanymi w pamięci przeglądarki</h3>
    </div>

    <div class="tab_content">
      <div class="storage-list-wrapper">
        <transition-group name="storage-list-anim" tag="ul" class="storage-list">
          <li
            v-for="(stockString, stockName) in store.storageStockData"
            :key="stockName"
            :data-current="store.chosenStorageStockName == stockName"
          >
            <div class="storage-item-top">
              <button class="btn btn--text btn-name" @click="chooseStorageStock(stockName)">
                {{ stockName }}
              </button>

              <div class="storage-item-top-actions">
                <button class="btn btn--text" @click="toggleStorageEntryExpand(stockName)">
                  <ChevronDownIcon
                    v-if="!expandedEntries.includes(stockName)"
                    style="width: 25px"
                  />
                  <ChevronUpIcon v-else style="width: 25px" />
                </button>

                <button class="btn btn--text" @click="removeStockIndexFromStorage(stockName)">
                  <TrashIcon style="width: 25px" />
                </button>
              </div>
            </div>

            <div class="storage-item-expandable" v-if="expandedEntries.includes(stockName)">
              {{
                stockString
                  .split(';')
                  .map((s) => s.split(/:|,/)[0])
                  .join(' + ')
              }}
            </div>
          </li>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  FolderArrowDownIcon,
  TrashIcon,
} from '@heroicons/vue/20/solid';

import { useStore } from '../../store';
import stockMixin from '../../mixins/stockMixin';

export default defineComponent({
  components: {
    ChevronDownIcon,
    ChevronUpIcon,
    FolderArrowDownIcon,
    TrashIcon,
  },

  mixins: [stockMixin],

  data: () => ({
    store: useStore(),

    expandedEntries: [] as string[],
  }),

  methods: {
    removeStockIndexFromStorage(stockName: string) {
      delete this.store.storageStockData[stockName];
      this.store.chosenStorageStockName = '';

      try {
        localStorage.setItem('savedStockData', JSON.stringify(this.store.storageStockData));
      } catch (error) {
        console.error('Wystąpił błąd podczas usuwania składu z localStorage!', error);
      }
    },

    chooseStorageStock(stockName: string) {
      try {
        this.loadStockFromString(this.store.storageStockData[stockName]);
        this.store.chosenStorageStockName = stockName;
      } catch (error) {
        console.log(error);
      }
    },

    toggleStorageEntryExpand(stockName: string) {
      const stockIndex = this.expandedEntries.indexOf(stockName);

      if (stockIndex == -1) this.expandedEntries.push(stockName);
      else this.expandedEntries.splice(stockIndex, 1);
    },
  },
});
</script>

<style lang="scss" scoped>
@use '@/styles/tab';

.tab_actions {
  grid-template-columns: repeat(2, 1fr);
}

.storage-list-wrapper {
  position: relative;
}

ul.storage-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-top: 0.5em;
}

ul.storage-list > li {
  padding: 0.5em;
  background-color: global.$secondaryColor;

  &[data-current='true'] {
    background-color: #3b3b3b;
  }
}

.storage-item-top {
  display: flex;
  align-items: center;
}

.storage-item-top button.btn-name {
  font-size: 1.2em;
  width: 100%;
  text-align: left;
}

.storage-item-top-actions {
  display: flex;
  gap: 0.5em;
}

.storage-item-expandable {
  margin-top: 0.5em;
}

.storage-list-anim {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 120ms ease-in-out;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(-25px);
  }

  &-leave-to {
    opacity: 0;
  }

  &-leave-active {
    position: absolute;
  }
}
</style>
