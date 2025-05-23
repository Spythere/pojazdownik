<template>
  <section class="tab storage-tab">
    <div class="tab_header">
      <h2>{{ $t('storage.title') }}</h2>
      <h3>{{ $t('storage.subtitle') }}</h3>
    </div>

    <div class="tab_content">
      <div class="storage-list-wrapper">
        <transition-group name="storage-list-anim" tag="ul" class="storage-list">
          <li v-for="storageEntry in storageStockDataList" :key="storageEntry.id">
            <div class="storage-item-top">
              <h3>
                {{ storageEntry.id }}
              </h3>

              <div class="storage-item-top-actions">
                <button class="btn btn--icon" @click="chooseStorageStock(storageEntry.id)">
                  <LogIn />
                </button>

                <button class="btn btn--icon" @click="toggleStorageEntryExpand(storageEntry.id)">
                  <ChevronDown v-if="!expandedEntries.includes(storageEntry.id)" />
                  <ChevronUp v-else />
                </button>

                <button class="btn btn--icon" @click="removeStockIndexFromStorage(storageEntry.id)">
                  <Trash2 />
                </button>
              </div>
            </div>

            <div class="storage-item-expandable" v-if="expandedEntries.includes(storageEntry.id)">
              <i>
                {{ $t('storage.created-at') }}
                {{ new Date(storageEntry.createdAt).toLocaleString($i18n.locale) }}</i
              >
              <i v-if="storageEntry.updatedAt">
                &bull; {{ $t('storage.updated-at') }}
                {{ new Date(storageEntry.updatedAt).toLocaleString($i18n.locale) }}</i
              >

              <div style="margin-top: 0.5em">
                <i>{{ $t('storage.stock-title') }} </i>
                {{ shortenStockString(storageEntry.stockString) }}
              </div>
            </div>
          </li>

          <li v-if="Object.keys(storageStockDataList).length == 0" class="storage-no-entries">
            {{ $t('storage.no-entires') }}
          </li>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useStore } from '../../store';
import stockMixin from '../../mixins/stockMixin';
import { ChevronDown, ChevronUp, LogIn, Trash2 } from 'lucide-vue-next';

export default defineComponent({
  components: {
    ChevronDown,
    ChevronUp,
    LogIn,
    Trash2,
  },

  mixins: [stockMixin],

  data: () => ({
    store: useStore(),
    expandedEntries: [] as string[],
  }),

  computed: {
    storageStockDataList() {
      return Object.values(this.store.storageStockData)
        .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
        .map((data) => ({
          ...data,
          isExpanded: false,
        }));
    },
  },

  methods: {
    shortenStockString(stockString: string) {
      return Array.from(
        stockString.split(';').reduce(
          (acc, s) => {
            const stockName = s.split(/:|,/)[0];
            acc.set(stockName, (acc.get(stockName) ?? 0) + 1);

            return acc;
          },
          new Map() as Map<string, number>
        )
      )
        .map(([stockName, count]) => `${count}x ${stockName.replace(/_/g, ' ')}`)
        .join(', ');
    },
    removeStockIndexFromStorage(stockName: string) {
      let removeConfirm = confirm(this.$t('storage.remove-confirm'));

      if (!removeConfirm) return;

      delete this.store.storageStockData[stockName];
      this.store.chosenStorageStockName = '';
      this.store.chosenStorageStockString = '';

      try {
        localStorage.setItem('savedStockData', JSON.stringify(this.store.storageStockData));
      } catch (error) {
        console.error('Wystąpił błąd podczas usuwania składu z localStorage!', error);
      }
    },

    chooseStorageStock(stockName: string) {
      try {
        this.loadStockFromString(this.store.storageStockData[stockName].stockString);
        this.store.chosenStorageStockName = stockName;
        this.store.chosenStorageStockString = this.store.storageStockData[stockName].stockString;

        this.$router.push('/');
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
  height: 730px;
  overflow: auto;
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
  gap: 0.5em;
}

.storage-item-top > h3 {
  width: 100%;
  text-align: left;
  margin: 0;
}

.storage-item-top-actions {
  display: flex;
  gap: 0.5em;

  & > button {
    background-color: #333;
  }
}

.storage-item-expandable {
  margin-top: 0.5em;
}

.storage-no-entries {
  padding: 1em;
  font-size: 1.15em;
  font-weight: bold;
  text-align: center;
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
    width: 100%;
  }
}
</style>
