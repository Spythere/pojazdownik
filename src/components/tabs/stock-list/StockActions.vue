<template>
  <div class="stock_actions">
    <div class="actions-top">
      <button
        class="btn btn--image"
        @click="clickFileInput"
        :data-button-tooltip="$t('stocklist.action-upload-file')"
      >
        <input type="file" @change="uploadStockFromFile" ref="conFile" accept=".con,.txt" />
        <FolderPlusIcon />
      </button>

      <button
        class="btn btn--image"
        @click="uploadStockFromClipboard"
        :data-button-tooltip="$t('stocklist.action-upload-clipboard')"
      >
        <ClipboardDocumentCheckIcon />
      </button>

      <button
        class="btn btn--image"
        :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="downloadStock"
        :data-button-tooltip="$t('stocklist.action-download')"
      >
        <ArrowDownTrayIcon />
      </button>

      <button
        class="btn btn--image"
        :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="copyToClipboard"
        :data-button-tooltip="$t('stocklist.action-copy')"
      >
        <DocumentDuplicateIcon />
      </button>

      <button
        class="btn btn--image"
        :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="saveStockDataToStorage"
        :data-button-tooltip="$t('stocklist.action-bookmark')"
      >
        <BookmarkIcon />
      </button>

      <button
        class="btn btn--image"
        :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="resetStock"
        :data-button-tooltip="$t('stocklist.action-reset')"
      >
        <ArrowUturnLeftIcon />
      </button>

      <button
        class="btn btn--image"
        :data-disabled="stockIsEmpty"
        :disabled="stockIsEmpty"
        @click="shuffleCars"
        :data-button-tooltip="$t('stocklist.action-shuffle')"
      >
        <ArrowPathIcon />
      </button>
    </div>

    <div class="actions-bottom" :data-disabled="store.chosenStockListIndex == -1">
      <button
        class="btn btn--image"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="stockListUtils.moveUpStock(store.chosenStockListIndex)"
      >
        <ChevronUpIcon />
        {{ $t('stocklist.action-move-up') }}
      </button>

      <button
        class="btn btn--image"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="stockListUtils.moveDownStock(store.chosenStockListIndex)"
      >
        <ChevronDownIcon />
        {{ $t('stocklist.action-move-down') }}
      </button>

      <button
        class="btn btn--image"
        :tabindex="store.chosenStockListIndex == -1 ? -1 : 0"
        @click="stockListUtils.removeStock(store.chosenStockListIndex)"
      >
        <TrashIcon />
        {{ $t('stocklist.action-remove') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../../store';

import { isTractionUnit } from '../../../utils/vehicleUtils';
import { useFileUtils } from '../../../utils/fileUtils';
import stockMixin from '../../../mixins/stockMixin';
import { useStockListUtils } from '../../../utils/stockListUtils';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
  TrashIcon,
} from '@heroicons/vue/20/solid';

export default defineComponent({
  mixins: [stockMixin],

  components: {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ArrowUturnLeftIcon,
    BookmarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardDocumentCheckIcon,
    DocumentDuplicateIcon,
    FolderPlusIcon,
    TrashIcon,
  },

  data: () => ({
    store: useStore(),
  }),

  setup() {
    const fileUtils = useFileUtils();
    const stockListUtils = useStockListUtils();

    return {
      fileUtils,
      stockListUtils,
    };
  },

  computed: {
    stockIsEmpty() {
      return this.store.stockList.length == 0;
    },
  },

  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.store.stockString);

      setTimeout(() => {
        alert(this.$t('stocklist.alert-copied'));
      }, 20);
    },

    clickFileInput() {
      (this.$refs['conFile'] as HTMLInputElement).click();
    },

    resetStock() {
      this.store.stockList.length = 0;
      this.store.chosenStockListIndex = -1;
    },

    shuffleCars() {
      const availableIndexes = this.store.stockList.reduce((acc, stock, i) => {
        if (!isTractionUnit(stock.vehicleRef)) acc.push(i);

        return acc;
      }, [] as number[]);

      for (let i = 0; i < this.store.stockList.length; i++) {
        if (!availableIndexes.includes(i)) continue;

        availableIndexes.splice(i, -1);

        const randAvailableIndex =
          availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
        const tempSwap = this.store.stockList[randAvailableIndex];

        this.store.stockList[randAvailableIndex] = this.store.stockList[i];
        this.store.stockList[i] = tempSwap;
      }
    },

    downloadStock() {
      if (this.store.stockList.length == 0) return alert(this.$t('stocklist.alert-empty'));

      const defaultName = this.fileUtils.getCurrentStockFileName();
      const fileName = prompt(this.$t('stocklist.prompt-file'), defaultName);

      if (!fileName) return;

      const blob = new Blob([this.store.stockString]);
      const file = fileName + '.con';

      var e = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = file;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['', a.download, a.href].join(':');
      e.initEvent('click', true, false);
      a.dispatchEvent(e);
    },

    uploadStockFromFile() {
      const inputEl = this.$refs['conFile'] as HTMLInputElement;
      const files = inputEl.files;

      if (files?.length != 1) return;
      if (!/\.con$/.test(files[0].name)) return;

      const reader = new FileReader();
      reader.readAsText(files[0]);

      reader.onload = (res) => {
        const stockString = res.target?.result;

        if (!stockString || typeof stockString !== 'string') return;

        this.loadStockFromString(stockString);
      };

      reader.onerror = (err) => console.error(err);

      inputEl.value = '';
    },

    saveStockDataToStorage() {
      if (this.store.stockList.length == 0) return;

      const defaultName = `${this.store.stockList[0].vehicleRef.type} ${(this.store.totalWeight / 1000).toFixed(1)}t; ${this.store.totalLength}m; vmax ${this.store.maxStockSpeed}`;
      const entryName = prompt(this.$t('stocklist.prompt-bookmark'), defaultName);

      if (!entryName) return;

      let updatedAt: number | undefined = undefined;

      if (entryName in this.store.storageStockData) {
        const overwriteDataConfirm = confirm(this.$t('stocklist.prompt-bookmark-overwrite'));

        if (!overwriteDataConfirm) return;

        this.store.storageStockData[entryName]['updatedAt'] = Date.now();
        this.store.storageStockData[entryName]['stockString'] = this.store.stockString;
      } else {
        this.store.storageStockData[entryName] = {
          id: entryName,
          createdAt: Date.now(),
          stockString: this.store.stockString,
        };
      }

      try {
        localStorage.setItem('savedStockData', JSON.stringify(this.store.storageStockData));
        this.store.chosenStorageStockName = entryName;
      } catch (error) {
        console.error('Wystąpił błąd podczas zapisywania składu do localStorage!', error);
      }
    },

    async uploadStockFromClipboard() {
      try {
        const content = await navigator.clipboard.readText();
        this.loadStockFromString(content);
      } catch (error) {
        switch (error) {
          case 'stock-loading-error':
            alert(this.$t('stocklist.stock-loading-error'));
            break;

          default:
            alert(this.$t('stocklist.stock-clipboard-error'));
            break;
        }
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.stock_actions {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.actions-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.5em;

  padding: 0.5em;

  background-color: #353a57;

  &[data-disabled='true'] {
    opacity: 0.8;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    pointer-events: none;
  }
}

.actions-top {
  display: grid;
  gap: 0.5em;

  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));

  button {
    width: 100%;

    &[data-button-tooltip] {
      font-size: 0.85em;
    }

    input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  }
}
</style>
