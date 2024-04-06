<template>
  <section class="wiki-list tab">
    <div class="tab_header">
      <h2>{{ $t('wiki.title') }}</h2>
    </div>

    <div class="tab_content">
      <div class="actions-panel">
        <div class="actions-panel_vehicles">
          <button
            class="btn"
            :data-chosen="currentFilterMode == 'tractions'"
            @click="toggleFilter('tractions')"
          >
            {{ $t('wiki.action-vehicles') }}
          </button>
          <button
            class="btn"
            :data-chosen="currentFilterMode == 'carriages'"
            @click="toggleFilter('carriages')"
          >
            {{ $t('wiki.action-carriages') }}
          </button>
        </div>

        <div class="actions-panel_search">
          <input type="text" :placeholder="$t('wiki.search')" v-model="searchedVehicleTypeName" />
        </div>
      </div>

      <div class="table-wrapper" ref="table-wrapper">
        <table>
          <thead>
            <tr>
              <th v-for="header in visibleHeaders" @click="toggleSorter(header)" :key="header.id">
                {{ $t(`wiki.header.${header.id}`) }}

                <span v-if="currentSorter.id == header.id">
                  {{ currentSorter.direction == 1 ? `&uArr;` : `&dArr;` }}
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="{ vehicle, show } in computedTableData"
              v-show="show"
              tabindex="0"
              :key="vehicle.type"
              @click="previewVehicle(vehicle)"
              @keydown.enter="previewVehicle(vehicle)"
              @dblclick="addVehicle(vehicle)"
              ref="itemRefs"
            >
              <td style="width: 120px">
                <img width="120" src="" :data-src="getThumbnailURL(vehicle.type, 'small')" />
              </td>

              <td :data-sponsoronly="vehicle.isSponsorsOnly">
                {{ vehicle.type }}
              </td>

              <td v-if="isTractionUnit(vehicle)">
                {{ $t(`wiki.${vehicle.group}`) }}
              </td>
              <td v-else>{{ $t(`wiki.${vehicle.group}`) }}</td>

              <td>{{ vehicle.constructionType }}</td>
              <td>{{ vehicle.length }}</td>
              <td>{{ (vehicle.weight / 1000).toFixed(1) }}</td>
              <td>{{ vehicle.maxSpeed }}</td>

              <td v-if="currentFilterMode == 'carriages'">
                {{ !isTractionUnit(vehicle) ? vehicle.cargoTypes.length : '---' }}
              </td>
              <td v-if="currentFilterMode == 'tractions'">
                {{ isTractionUnit(vehicle) ? (vehicle.coldStart ? `&check;` : '&cross;') : '---' }}
              </td>
            </tr>
          </tbody>

          <span ref="table-bottom"></span>
        </table>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import { IVehicle } from '../../types';
import { isTractionUnit } from '../../utils/vehicleUtils';
import stockMixin from '../../mixins/stockMixin';
import imageMixin from '../../mixins/imageMixin';

type SorterID =
  | 'type'
  | 'constructionType'
  | 'image'
  | 'length'
  | 'weight'
  | 'maxSpeed'
  | 'cargoCount'
  | 'group'
  | 'coldStart';

interface IWikiHeader {
  id: SorterID;
  sortable: boolean;
  for: 'all' | 'carriages' | 'tractions';
}

interface IWikiRow {
  vehicle: IVehicle;
  show: boolean;
  showImage: boolean;
}

const headers: IWikiHeader[] = [
  { id: 'image', sortable: false, for: 'all' },
  { id: 'type', sortable: true, for: 'all' },
  { id: 'group', sortable: true, for: 'all' },
  { id: 'constructionType', sortable: true, for: 'all' },
  { id: 'length', sortable: true, for: 'all' },
  { id: 'weight', sortable: true, for: 'all' },
  { id: 'maxSpeed', sortable: true, for: 'all' },
  { id: 'coldStart', sortable: true, for: 'tractions' },
  { id: 'cargoCount', sortable: true, for: 'carriages' },
];

export default defineComponent({
  mixins: [stockPreviewMixin, stockMixin, imageMixin],

  data() {
    return {
      store: useStore(),
      observer: null as IntersectionObserver | null,
      headers,

      scrollTop: 0,

      searchedVehicleTypeName: '',

      currentSorter: {
        id: 'type' as SorterID,
        direction: 1,
      },

      currentFilterMode: 'all' as 'all' | 'tractions' | 'carriages',
    };
  },

  mounted() {
    this.mountObserver();
  },

  activated() {
    const tableWrapperRef = this.$refs['table-wrapper'] as HTMLElement;

    tableWrapperRef.scrollTo({
      top: this.scrollTop,
    });
  },

  methods: {
    isTractionUnit,

    mountObserver() {
      if (this.observer) return;

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            entry.target
              .querySelector('td:first-child > img')!
              .setAttribute(
                'src',
                entry.target.querySelector('td:first-child > img')!.getAttribute('data-src')!
              );
            // your observer logic
            console.log(entry.target.textContent, ':D');
          } else {
            console.log(entry.target.textContent, ':(');
          }
        });
      });

      (this.$refs['itemRefs'] as HTMLElement[]).forEach((el) => this.observer?.observe(el));
    },

    toggleFilter(name: typeof this.currentFilterMode) {
      this.currentFilterMode = this.currentFilterMode == name ? 'all' : name;
      const tableWrapperRef = this.$refs['table-wrapper'] as HTMLElement;

      tableWrapperRef.scrollTo({
        top: this.scrollTop,
      });
    },

    toggleSorter(header: IWikiHeader) {
      if (!header.sortable) return;

      if (header.id == this.currentSorter.id) this.currentSorter.direction *= -1;
      this.currentSorter.id = header.id;
    },

    sortTableRows(row1: IWikiRow, row2: IWikiRow) {
      if (!row1.show) return 0;

      const { id, direction } = this.currentSorter;

      switch (id) {
        case 'type':
        case 'constructionType':
        case 'group':
          return direction == 1
            ? row1.vehicle[id].localeCompare(row2.vehicle[id])
            : row2.vehicle[id].localeCompare(row1.vehicle[id]);

        case 'weight':
        case 'length':
        case 'maxSpeed':
          return Math.sign(row1.vehicle[id] - row2.vehicle[id]) * direction;

        case 'cargoCount':
          return (
            Math.sign(
              (!isTractionUnit(row1.vehicle) ? row1.vehicle.cargoTypes.length || -1 : -1) -
                (!isTractionUnit(row2.vehicle) ? row2.vehicle.cargoTypes.length || -1 : -1)
            ) * direction
          );

        case 'coldStart':
          return (
            ((isTractionUnit(row1.vehicle) && row1.vehicle.coldStart ? 1 : -1) -
              (isTractionUnit(row2.vehicle) && row2.vehicle.coldStart ? 1 : -1)) *
            direction
          );

        default:
          break;
      }

      return direction == 1
        ? row1.vehicle.type.localeCompare(row2.vehicle.type)
        : row2.vehicle.type.localeCompare(row1.vehicle.type);
    },
  },

  computed: {
    computedTableData(): IWikiRow[] {
      return this.store.vehicleDataList
        .map((vehicle) => ({
          vehicle,
          showImage: false,
          show:
            new RegExp(`${this.searchedVehicleTypeName.trim()}`, 'i').test(vehicle.type) &&
            (this.currentFilterMode == 'all' ||
              (this.currentFilterMode == 'tractions' && isTractionUnit(vehicle)) ||
              (this.currentFilterMode == 'carriages' && !isTractionUnit(vehicle))),
        }))
        .sort((a, b) => this.sortTableRows(a, b));
    },

    visibleHeaders() {
      const filtersActive = this.currentFilterMode;

      return this.headers.filter((header) => header.for == 'all' || header.for == filtersActive);
    },

    areTractionVehiclesShown() {
      return this.currentFilterMode == 'all' || this.currentFilterMode == 'tractions';
    },

    areCarriagesShown() {
      return this.currentFilterMode == 'all' || this.currentFilterMode == 'carriages';
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/tab.scss';

.actions-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;

  flex-wrap: wrap;
  gap: 0.5em;

  margin: 0.5em 0;
}

.actions-panel_vehicles {
  display: flex;
  gap: 0.5em;
}

.actions-panel_search {
  input {
    width: auto;
  }
}

.table-wrapper {
  overflow: auto;
  height: 750px;
  max-height: 95vh;
}

.wiki-list table {
  border-collapse: collapse;
  width: 100%;

  thead {
    position: sticky;
    top: 0;
  }

  th {
    background-color: #111;
    padding: 0.5em;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }

  tr {
    cursor: pointer;
    background-color: #333;

    &:first-child {
      min-width: 120px;
    }

    &:nth-child(odd) {
      background-color: #444;
    }

    &:hover {
      background-color: #666;
    }
  }

  td {
    text-align: center;
    padding: 0.25em;
    height: 75px;

    &[data-sponsoronly='true'] {
      color: salmon;
    }

    img {
      vertical-align: middle;
    }
  }
}

@media screen and (max-width: $breakpointMd) {
  .wiki-list table {
    th {
      min-width: 100px;
    }

    img {
      max-width: 100px;
    }
  }
}

@media screen and (max-width: $breakpointSm) {
  .actions-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .actions-panel_vehicles {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .actions-panel_search {
    display: grid;
  }
}
</style>
