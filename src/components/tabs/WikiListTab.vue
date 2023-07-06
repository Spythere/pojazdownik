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

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Zdjęcie</th>
            <th>Nazwa</th>
            <th>Typ</th>
            <th>Długość</th>
            <th>Masa</th>
            <th>Prędkość</th>
          </tr>
        </thead>

        <tbody v-if="wikiMode == 'locomotives'">
          <tr v-for="loco in computedLocoList" @click="previewLocomotive(loco)">
            <td>
              <img
                :src="`https://spythere.github.io/api/td2/images/${loco.type}--300px.jpg`"
                width="170"
                loading="lazy"
                :alt="`Lokomotywa ${loco.type}`"
              />
            </td>

            <td>{{ loco.type }}</td>
            <td>{{ loco.cabinType }}</td>
            <td>{{ loco.length }}m</td>
            <td>{{ loco.mass }}t</td>
            <td>{{ loco.maxSpeed }}km/h</td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr v-for="car in computedCarList" @click="previewCarWagon(car)">
            <td>
              <img
                :src="`https://spythere.github.io/api/td2/images/${car.type}--300px.jpg`"
                width="170"
                loading="lazy"
                :alt="`Lokomotywa ${car.type}`"
              />
            </td>

            <td>{{ car.type }}</td>
            <td>{{ car.constructionType }}</td>
            <td>{{ car.length }}m</td>
            <td>{{ car.mass }}t</td>
            <td>{{ car.maxSpeed }}km/h</td>
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
import { ICarWagon, ILocomotive } from '../../types';

type WikiMode = 'locomotives' | 'carWagons';

export default defineComponent({
  mixins: [stockPreviewMixin],

  data() {
    return {
      store: useStore(),
      wikiMode: 'locomotives' as WikiMode,
      searchedVehicleTypeName: '',
    };
  },

  methods: {
    changeWikiMode(wikiMode: WikiMode) {
      this.searchedVehicleTypeName = '';
      this.wikiMode = wikiMode;
    },
  },

  computed: {
    computedLocoList() {
      const trimmedSearchValue = this.searchedVehicleTypeName.trim();
      if (trimmedSearchValue == '') return this.store.locoDataList;

      return this.store.locoDataList.filter((loco) => new RegExp(`${trimmedSearchValue}`, 'i').test(loco.type));
    },

    computedCarList() {
      const trimmedSearchValue = this.searchedVehicleTypeName.trim();
      if (trimmedSearchValue == '') return this.store.carDataList;

      return this.store.carDataList.filter((car) => new RegExp(`${trimmedSearchValue}`, 'i').test(car.type));
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
  }

  tr {
    background-color: #333;

    &:nth-child(odd) {
      background-color: #444;
    }
  }

  td {
    text-align: center;
    height: 100px;
  }

  td img {
    display: block;
    margin: 0 auto;
    object-fit: cover;
  }
}
</style>
