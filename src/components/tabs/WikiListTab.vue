<template>
  <section class="wiki-list tab">
    <div class="tab_header">
      <h2>{{ $t('wiki.title') }}</h2>
    </div>

    <div class="tab_content">
      <div class="actions">
        <label>
          <span>{{ $t('wiki.labels.vehicles') }}</span>
          <select name="filter-type" id="filter-type" v-model="filterType">
            <option v-for="filter in filters" :key="filter" :value="filter">
              {{ $t(`wiki.filters.${filter}`) }}
            </option>
          </select>
        </label>

        <label>
          <span>{{ $t('wiki.labels.sort-by') }}</span>
          <select name="sorter-type" id="sorter-type" v-model="sorterType">
            <option v-for="sorter in sorters" :key="sorter" :value="sorter">
              {{ $t(`wiki.sort-by.${sorter}`) }}
            </option>
          </select>
        </label>

        <label>
          <span>{{ $t('wiki.labels.sort-direction') }}</span>

          <select name="sorter-direction" id="sorter-direction" v-model="sorterDirection">
            <option value="asc">{{ $t('wiki.sort-direction.asc') }}</option>
            <option value="desc">{{ $t('wiki.sort-direction.desc') }}</option>
          </select>
        </label>

        <label>
          <span>{{ $t('wiki.labels.search-vehicle') }}</span>
          <input
            type="text"
            :placeholder="$t('wiki.labels.search-vehicle-placeholder')"
            v-model="searchedVehicleTypeName"
          />
        </label>
      </div>

      <ul class="vehicles" ref="vehicles">
        <li
          v-for="vehicle in computedVehicles"
          :key="vehicle.type"
          :data-preview="vehicle.type === store.chosenVehicle?.type"
          :data-sponsor-only="vehicle.restrictions.sponsorOnly > 0"
          :data-team-only="vehicle.restrictions.teamOnly"
          @click="previewVehicle(vehicle)"
          @dblclick="addVehicle(vehicle)"
          @keydown.enter="previewVehicle(vehicle)"
          tabindex="0"
        >
          <img loading="lazy" width="120" :src="getThumbnailURL(vehicle.type, 'small')" />

          <span>
            <b class="vehicle-name"> {{ vehicle.type.replace(/_/g, ' ') }} </b>

            <div class="vehicle-group">
              {{ $t(`wiki.${vehicle.group}`) }} |
              {{ isTractionUnit(vehicle) ? vehicle.cabinType : vehicle.constructionType }}
            </div>

            <div class="vehicle-props">
              {{ vehicle.length }}m | {{ (vehicle.weight / 1000).toFixed(1) }}t |
              {{ vehicle.maxSpeed }}km/h
            </div>
          </span>
        </li>
      </ul>
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

const sorters = ['type', 'group', 'length', 'weight', 'maxSpeed'] as const;
const filters = ['vehicles-all', 'vehicles-traction', 'vehicles-wagon'] as const;

type SorterType = (typeof sorters)[number];
type SorterDirection = 'asc' | 'desc';

type FilterType = (typeof filters)[number];

export default defineComponent({
  mixins: [stockPreviewMixin, stockMixin, imageMixin],

  data() {
    return {
      store: useStore(),
      observer: null as IntersectionObserver | null,

      sorters: sorters,
      filters: filters,

      searchedVehicleTypeName: '',

      sorterType: 'type' as SorterType,
      sorterDirection: 'asc' as SorterDirection,

      filterType: 'vehicles-all' as FilterType,
    };
  },

  watch: {
    computedVehicles() {
      const vehiclesRef = this.$refs['vehicles'] as HTMLElement;

      vehiclesRef.scrollTo({
        top: 0,
      });
    },
  },

  methods: {
    isTractionUnit,

    onItemSelect(vehicle: IVehicle) {
      this.previewVehicle(vehicle);
    },

    filterVehicles(v: IVehicle) {
      if (this.searchedVehicleTypeName)
        return v.type
          .toLocaleLowerCase()
          .includes(this.searchedVehicleTypeName.toLocaleLowerCase());

      switch (this.filterType) {
        case 'vehicles-all':
          return true;
        case 'vehicles-traction':
          return isTractionUnit(v);
        case 'vehicles-wagon':
          return !isTractionUnit(v);

        default:
          return false;
      }
    },

    sortVehicles(v1: IVehicle, v2: IVehicle) {
      const direction = this.sorterDirection == 'asc' ? 1 : -1;

      switch (this.sorterType) {
        case 'type':
        case 'group':
          return direction * v1[this.sorterType].localeCompare(v2[this.sorterType]);

        case 'weight':
        case 'length':
        case 'maxSpeed':
          return Math.sign(v1[this.sorterType] - v2[this.sorterType]) * direction;

        // case 'cargoCount':
        //   return (
        //     Math.sign(
        //       (!isTractionUnit(v1) ? v1.cargoTypes.length || -1 : -1) -
        //         (!isTractionUnit(row2.vehicle) ? row2.vehicle.cargoTypes.length || -1 : -1)
        //     ) * direction
        //   );

        // case 'coldStart':
        //   return (
        //     ((isTractionUnit(v1) && v1.coldStart ? 1 : -1) -
        //       (isTractionUnit(row2.vehicle) && row2.vehicle.coldStart ? 1 : -1)) *
        //     direction
        //   );

        default:
          return v1.type.localeCompare(v2.type) * direction;
      }
    },
  },

  computed: {
    computedVehicles() {
      return this.store.vehicleDataList.filter(this.filterVehicles).sort(this.sortVehicles);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/tab.scss';

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));

  flex-wrap: wrap;
  gap: 0.5em;
}

.actions > label {
  display: flex;
  flex-direction: column;
  gap: 0.25em;

  span {
    color: #ccc;
  }
}

.vehicles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0.5em;
  overflow: auto;

  max-height: 730px;

  margin-top: 0.75em;
  padding: 0.25em;
}

.vehicles > li {
  display: flex;
  gap: 0.5em;

  background-color: #161c2e;
  padding: 0.5em;

  min-height: 75px;
  cursor: pointer;

  &[data-preview='true'] {
    background-color: #435288;
  }

  &[data-sponsor-only='true'] {
    box-shadow: 0 0 5px 0 $sponsorColor;
  }

  &[data-team-only='true'] {
    box-shadow: 0 0 5px 0 $teamColor;
  }

  & > span {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }
}

.vehicle-name {
  overflow: hidden;
  text-wrap: nowrap;
  text-overflow: ellipsis;
}

.vehicle-props {
  color: #ccc;
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
