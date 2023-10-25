<template>
  <section class="wiki-list tab">
    <div class="tab_header">
      <h2>{{ $t('wiki.title') }}</h2>
    </div>

    <div class="tab_content">
      <div class="actions-panel">
        <div class="actions-panel_vehicles">
          <button class="btn" :data-chosen="filters.tractions" @click="toggleFilter('tractions')">
            {{ $t('wiki.action-vehicles') }}
          </button>
          <button class="btn" :data-chosen="filters.carriages" @click="toggleFilter('carriages')">
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

          <!--     @click="previewLocomotive(vehicle)"
              @keydown.enter="previewLocomotive(vehicle)"
              @dblclick="addLocomotive(vehicle)"
             -->
          <tbody>
            <tr v-for="vehicle in computedVehicleList" v-show="vehicle.show" :key="vehicle.type" tabindex="0">
              <td style="width: 120px">
                <img
                  width="120"
                  :src="getThumbnailURL(vehicle.type, 'small')"
                  :alt="`${vehicle.type}`"
                  loading="lazy"
                  @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
                />
              </td>

              <td>{{ vehicle.type }}</td>
              <!-- <td>{{ $t(`wiki.${vehicle.power || vehicle.}`) }}</td> -->
              <td v-if="isLocomotive(vehicle)">{{ $t(`wiki.${vehicle.power}`) }}</td>
              <td v-else>{{ $t(`wiki.${vehicle.useType}`) }}</td>
              <td>{{ vehicle.constructionType }}</td>
              <td>{{ vehicle.length }}m</td>
              <td>{{ vehicle.mass }}t</td>
              <td>{{ vehicle.maxSpeed }}km/h</td>
              <td v-if="!filters.tractions && filters.carriages">{{ !isLocomotive(vehicle) ? vehicle.cargoList.length ?? '---' : 'niedost.' }}</td>
              <td v-if="filters.tractions && !filters.carriages">
                {{ isLocomotive(vehicle) ? (locoSupportsColdStart(vehicle.constructionType) ? `&check;` : '&cross;') : '---' }}
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
import { Vehicle } from '../../types';
import { isLocomotive } from '../../utils/vehicleUtils';
import stockMixin from '../../mixins/stockMixin';
import imageMixin from '../../mixins/imageMixin';
import { locoSupportsColdStart } from '../../utils/locoUtils';

type SorterID = 'type' | 'constructionType' | 'image' | 'length' | 'mass' | 'maxSpeed' | 'cargoCount' | 'power' | 'coldStart';

interface WikiHeader {
  id: SorterID;
  sortable: boolean;
  for: 'all' | 'carriages' | 'tractions';
}

const headers: WikiHeader[] = [
  { id: 'image', sortable: false, for: 'all' },
  { id: 'type', sortable: true, for: 'all' },
  { id: 'power', sortable: true, for: 'all' },
  { id: 'constructionType', sortable: true, for: 'all' },
  { id: 'length', sortable: true, for: 'all' },
  { id: 'mass', sortable: true, for: 'all' },
  { id: 'maxSpeed', sortable: true, for: 'all' },
  { id: 'coldStart', sortable: true, for: 'tractions' },
  { id: 'cargoCount', sortable: true, for: 'carriages' },
];

// const carHeaders: WikiHeader[] = [
//   { id: 'image', sortable: false },
//   { id: 'type', sortable: true },
//   { id: 'constructionType', sortable: true },
//   { id: 'length', sortable: true },
//   { id: 'mass', sortable: true },
//   { id: 'maxSpeed', sortable: true },
//   { id: 'cargoCount', sortable: true },
// ];

export default defineComponent({
  mixins: [stockPreviewMixin, stockMixin, imageMixin],

  data() {
    return {
      store: useStore(),
      headers,

      locosScrollTop: 0,
      carsScrollTop: 0,

      searchedVehicleTypeName: '',

      currentSorter: {
        id: 'type' as SorterID,
        direction: 1,
      },

      filters: {
        tractions: true,
        carriages: true,
      },
    };
  },

  activated() {
    const tableWrapperRef = this.$refs['table-wrapper'] as HTMLElement;

    // tableWrapperRef.scrollTo({
    //   top: this.wikiMode == 'locomotives' ? this.locosScrollTop : this.carsScrollTop,
    // });
  },

  methods: {
    locoSupportsColdStart,
    isLocomotive,

    toggleFilter(name: keyof typeof this.filters) {
      this.filters[name] = !this.filters[name];
    },

    toggleSorter(header: WikiHeader) {
      if (!header.sortable) return;

      if (header.id == this.currentSorter.id) this.currentSorter.direction *= -1;
      this.currentSorter.id = header.id;
    },

    sortVehicles(vA: Vehicle, vB: Vehicle) {
      const { id, direction } = this.currentSorter;
      const vehiclesAreLocos = isLocomotive(vA) && isLocomotive(vB);
      const vehiclesAreCars = !isLocomotive(vA) && !isLocomotive(vB);

      switch (id) {
        case 'type':
        case 'constructionType':
          return direction == 1 ? vA[id].localeCompare(vB[id]) : vB[id].localeCompare(vA[id]);

        case 'mass':
        case 'length':
        case 'maxSpeed':
          return Math.sign(vA[id] - vB[id]) * direction;

        case 'cargoCount':
          if (vehiclesAreCars) return Math.sign((vA.cargoList.length || -1) - (vB.cargoList.length || -1)) * direction;
          break;

        case 'coldStart':
          if (vehiclesAreLocos) return (locoSupportsColdStart(vA.constructionType) > locoSupportsColdStart(vB.constructionType) ? 1 : -1) * direction;
          break;

        default:
          break;
      }

      return direction == 1 ? vA.type.localeCompare(vB.type) : vB.type.localeCompare(vA.type);
    },
  },

  computed: {
    computedVehicleList() {
      return this.store.vehicleDataList
        .map((vehicle) => ({
          ...vehicle,
          show:
            new RegExp(`${this.searchedVehicleTypeName.trim()}`, 'i').test(vehicle.type) &&
            ((this.filters.tractions && isLocomotive(vehicle)) || (this.filters.carriages && !isLocomotive(vehicle))),
        }))
        .sort(this.sortVehicles);
    },

    visibleHeaders() {
      const filtersActive =
        this.filters.carriages && this.filters.tractions ? 'all' : this.filters.carriages ? 'carriages' : this.filters.tractions ? 'tractions' : null;

      console.log(filtersActive);

      return this.headers.filter((header) => header.for == 'all' || header.for == filtersActive);
    },

    // computedCarList() {
    //   const trimmedSearchValue = this.searchedVehicleTypeName.trim();

    //   return this.store.carDataList.map((car) =>({

    //   })).sort(this.sortVehicles);
    // },
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
    height: 70px;
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
