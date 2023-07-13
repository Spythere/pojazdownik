<template>
  <section class="wiki-list">
    <div class="actions-panel">
      <div class="actions-panel_vehicles">
        <button class="btn btn--choice" @click="changeWikiMode('locomotives')">POJ. TRAKCYJNE</button>
        <button class="btn btn--choice" @click="changeWikiMode('carWagons')">WAGONY</button>
      </div>

      <div class="actions-panel_search">
        <input type="text" placeholder="Wyszukaj pojazd..." v-model="searchedVehicleTypeName" />
      </div>
    </div>

    <div class="table-wrapper" @scroll="scrollEvent" ref="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="header in wikiMode == 'locomotives' ? locoHeaders : carHeaders" @click="toggleSorter(header)">
              {{ header.name }}

              <span v-if="currentModeSorter.id == header.id">
                {{ currentModeSorter.direction == 1 ? `&uArr;` : `&dArr;` }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody v-if="wikiMode == 'locomotives'">
          <tr
            v-for="loco in computedLocoList"
            @click="previewLocomotive(loco)"
            @keydown.enter="previewLocomotive(loco)"
            @dblclick="addLocomotive(loco)"
            tabindex="0"
          >
            <td>
              <img
                :src="`https://spythere.github.io/api/td2/images/${loco.type}--300px.jpg`"
                loading="lazy"
                :alt="`Lokomotywa ${loco.type}`"
              />
            </td>

            <td>{{ loco.type }}</td>
            <td>{{ vehicleTypes[loco.power] }}</td>
            <td>{{ loco.constructionType }}</td>
            <td>{{ locoSupportsColdStart(loco.constructionType) ? `&check;` : '&cross;' }}</td>
            <td>{{ loco.length }}m</td>
            <td>{{ loco.mass }}t</td>
            <td>{{ loco.maxSpeed }}km/h</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="car in computedCarList"
            @keydow.enter="previewCarWagon(car)"
            @click="previewCarWagon(car)"
            @dblclick="addCarWagon(car)"
            tabindex="0"
          >
            <td>
              <img
                :src="`https://spythere.github.io/api/td2/images/${car.type}--300px.jpg`"
                loading="lazy"
                :alt="`Lokomotywa ${car.type}`"
              />
            </td>

            <td>{{ car.type }}</td>
            <td>{{ car.constructionType }}</td>
            <td>{{ car.length }}m</td>
            <td>{{ car.mass }}t</td>
            <td>{{ car.maxSpeed }}km/h</td>
            <td>{{ car.cargoList.length == 0 ? '-' : car.cargoList.length }}</td>
          </tr>
        </tbody>
      </table>
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
import { locoSupportsColdStart } from '../../utils/locoUtils';

type WikiMode = 'locomotives' | 'carWagons';
type SorterID =
  | 'type'
  | 'constructionType'
  | 'image'
  | 'length'
  | 'mass'
  | 'maxSpeed'
  | 'cargoCount'
  | 'power'
  | 'coldStart';

interface WikiHeader {
  name: string;
  id: SorterID;
  sortable: boolean;
}

const locoHeaders: WikiHeader[] = [
  { name: 'Zdjęcie', id: 'image', sortable: false },
  { name: 'Nazwa', id: 'type', sortable: true },
  { name: 'Rodzaj', id: 'power', sortable: true },
  { name: 'Konstrukcja', id: 'constructionType', sortable: true },
  { name: 'Zimny start', id: 'coldStart', sortable: true },
  { name: 'Długość', id: 'length', sortable: true },
  { name: 'Masa', id: 'mass', sortable: true },
  { name: 'Prędkość', id: 'maxSpeed', sortable: true },
];

const carHeaders: WikiHeader[] = [
  { name: 'Zdjęcie', id: 'image', sortable: false },
  { name: 'Nazwa', id: 'type', sortable: true },
  { name: 'Konstrukcja', id: 'constructionType', sortable: true },
  { name: 'Długość', id: 'length', sortable: true },
  { name: 'Masa', id: 'mass', sortable: true },
  { name: 'Prędkość', id: 'maxSpeed', sortable: true },
  { name: 'Ładunki', id: 'cargoCount', sortable: true },
];

const vehicleTypes: { [key: string]: string } = {
  'loco-ezt': 'EZT',
  'loco-szt': 'SZT',
  'loco-s': 'Spalinowóz',
  'loco-e': 'Elektrowóz',
};

export default defineComponent({
  mixins: [stockPreviewMixin, stockMixin],

  data() {
    return {
      store: useStore(),
      locoHeaders,
      carHeaders,
      vehicleTypes,

      locosScrollTop: 0,
      carsScrollTop: 0,

      wikiMode: 'locomotives' as WikiMode,
      searchedVehicleTypeName: '',

      currentLocoSorter: {
        id: 'type' as SorterID,
        direction: 1,
      },

      currentCarSorter: {
        id: 'type' as SorterID,
        direction: 1,
      },
    };
  },

  activated() {
    const tableWrapperRef = this.$refs['table-wrapper'] as HTMLElement;
    tableWrapperRef.scrollTo({ top: this.wikiMode == 'locomotives' ? this.locosScrollTop : this.carsScrollTop });
  },

  methods: {
    locoSupportsColdStart,

    scrollEvent(e: Event) {
      const tableScrollTop = (e.target as HTMLElement).scrollTop;

      if (this.wikiMode == 'locomotives') this.locosScrollTop = tableScrollTop;
      else this.carsScrollTop = tableScrollTop;
    },

    changeWikiMode(wikiMode: WikiMode) {
      this.searchedVehicleTypeName = '';
      this.wikiMode = wikiMode;
    },

    toggleSorter(header: WikiHeader) {
      if (!header.sortable) return;

      if (header.id == this.currentModeSorter.id) this.currentModeSorter.direction *= -1;
      this.currentModeSorter.id = header.id;
    },

    sortVehicles(vA: Vehicle, vB: Vehicle) {
      const { id, direction } = this.currentModeSorter;
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

        case 'coldStart':
          if (vehiclesAreLocos)
            return (
              (locoSupportsColdStart(vA.constructionType) > locoSupportsColdStart(vB.constructionType) ? 1 : -1) *
              direction
            );

        default:
          break;
      }

      return direction == 1 ? vA.type.localeCompare(vB.type) : vB.type.localeCompare(vA.type);
    },
  },

  computed: {
    currentModeSorter() {
      return this.wikiMode == 'carWagons' ? this.currentCarSorter : this.currentLocoSorter;
    },

    computedLocoList() {
      const trimmedSearchValue = this.searchedVehicleTypeName.trim();

      return this.store.locoDataList
        .filter((loco) => new RegExp(`${trimmedSearchValue}`, 'i').test(loco.type))
        .sort(this.sortVehicles);
    },

    computedCarList() {
      const trimmedSearchValue = this.searchedVehicleTypeName.trim();

      return this.store.carDataList
        .filter((car) => new RegExp(`${trimmedSearchValue}`, 'i').test(car.type))
        .sort(this.sortVehicles);
    },
  },
});
</script>

<style lang="scss" scoped>
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
    height: 100px;
  }

  td:first-child {
    width: 150px;
  }

  td img {
    display: block;
    width: 150px;
  }
}
</style>
