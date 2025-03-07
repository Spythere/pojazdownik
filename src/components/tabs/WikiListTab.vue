<template>
  <section class="wiki-list tab">
    <div class="tab_content">
      <div class="actions">
        <div class="action action-input">
          <label for="search-vehicle">
            {{ $t('wiki.labels.search-vehicle') }}
            <button class="reset-btn" @click="resetSearchInput">
              <img src="/images/icon-exit.svg" alt="reset vehicle input icon" />
            </button>
          </label>
          <input
            type="text"
            id="search-vehicle"
            name="search-vehicle"
            :placeholder="$t('wiki.labels.search-vehicle-placeholder')"
            v-model="searchedVehicleTypeName"
          />
        </div>

        <div class="action action-select">
          <label for="filter-type">{{ $t('wiki.labels.vehicles') }}</label>
          <select name="filter-type" id="filter-type" v-model="filterType">
            <option v-for="filter in filters" :key="filter" :value="filter">
              {{ $t(`wiki.filters.${filter}`) }}
            </option>
          </select>
        </div>

        <div class="action action-select">
          <label for="sorter-type">{{ $t('wiki.labels.sort-by') }}</label>
          <select name="sorter-type" id="sorter-type" v-model="sorterType">
            <option v-for="sorter in sorters" :key="sorter" :value="sorter">
              {{ $t(`wiki.sort-by.${sorter}`) }}
            </option>
          </select>
        </div>

        <div class="action action-select">
          <label for="sorter-direction">{{ $t('wiki.labels.sort-direction') }}</label>

          <select name="sorter-direction" id="sorter-direction" v-model="sorterDirection">
            <option value="asc">{{ $t('wiki.sort-direction.asc') }}</option>
            <option value="desc">{{ $t('wiki.sort-direction.desc') }}</option>
          </select>
        </div>
      </div>

      <ul class="vehicles" ref="vehicles">
        <li
          v-for="vehicle in computedVehicles"
          :key="vehicle.type"
          :data-preview="vehicle.type === store.chosenVehicle?.type"
          @click="previewVehicle(vehicle)"
          @dblclick="addVehicle(vehicle)"
          @keydown.enter="onVehicleSelect(vehicle)"
          tabindex="0"
        >
          <img
            loading="lazy"
            width="120"
            :src="getThumbnailURL(vehicle.type, 'small')"
            @error="onThumbnailImageError"
          />

          <span>
            <span
              class="vehicle-name"
              :class="{
                'sponsor-only':
                  vehicle.sponsorOnlyTimestamp && vehicle.sponsorOnlyTimestamp > Date.now(),
                'team-only': vehicle.teamOnly,
              }"
            >
              <b>{{ vehicle.type.replace(/_/g, ' ') }}</b>
            </span>

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

      <div class="no-vehicles-warning" v-if="computedVehicles.length == 0">
        {{ $t('wiki.no-vehicles') }}
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';
import stockPreviewMixin from '../../mixins/stockPreviewMixin';
import { IVehicle } from '../../types/common.types';
import { isTractionUnit } from '../../utils/vehicleUtils';
import stockMixin from '../../mixins/stockMixin';
import imageMixin from '../../mixins/imageMixin';

const sorters = ['type', 'group', 'length', 'weight', 'maxSpeed'] as const;

enum VehicleFilter {
  AllVehicles = 'vehicles-all',
  AllTractions = 'vehicles-tractions-all',
  ElectricTraction = 'vehicles-tractions-electric',
  DieselTraction = 'vehicles-tractions-diesel',
  EmuTraction = 'vehicles-tractions-emu',
  DmuTraction = 'vehicles-tractions-dmu',
  AllWagons = 'vehicles-wagons-all',
  PassengerWagons = 'vehicles-wagons-passenger',
  FreightWagons = 'vehicles-wagons-freight',
}

type SorterType = (typeof sorters)[number];
type SorterDirection = 'asc' | 'desc';

export default defineComponent({
  mixins: [stockPreviewMixin, stockMixin, imageMixin],

  data() {
    return {
      store: useStore(),
      observer: null as IntersectionObserver | null,

      sorters: sorters,
      filters: Object.values(VehicleFilter),

      searchedVehicleTypeName: '',

      sorterType: 'type' as SorterType,
      sorterDirection: 'asc' as SorterDirection,

      filterType: VehicleFilter.AllVehicles,

      lastScrollTop: 0,
    };
  },

  deactivated() {
    this.lastScrollTop = (this.$refs['vehicles'] as HTMLUListElement)?.scrollTop || 0;
  },

  activated() {
    (this.$refs['vehicles'] as HTMLUListElement)?.scrollTo({ top: this.lastScrollTop });
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

    onThumbnailImageError(e: Event) {
      const el = e.target as HTMLImageElement;
      
      if (el.src == '/images/no-vehicle-image.png') return;
      el.src = '/images/no-vehicle-image.png';
    },

    onVehicleSelect(vehicle: IVehicle) {
      if (this.store.chosenVehicle?.type === vehicle.type) this.addVehicle(vehicle);
      this.previewVehicle(vehicle);
    },

    resetSearchInput() {
      this.searchedVehicleTypeName = '';
    },

    filterVehicles(v: IVehicle) {
      if (
        this.searchedVehicleTypeName != '' &&
        !v.type.toLocaleLowerCase().includes(this.searchedVehicleTypeName.toLocaleLowerCase())
      )
        return false;

      switch (this.filterType) {
        case VehicleFilter.AllTractions:
          return isTractionUnit(v);

        case VehicleFilter.ElectricTraction:
          return isTractionUnit(v) && v.group == 'loco-electric';

        case VehicleFilter.DieselTraction:
          return isTractionUnit(v) && v.group == 'loco-diesel';

        case VehicleFilter.EmuTraction:
          return isTractionUnit(v) && v.group == 'unit-electric';

        case VehicleFilter.DmuTraction:
          return isTractionUnit(v) && v.group == 'unit-diesel';

        case VehicleFilter.AllWagons:
          return !isTractionUnit(v);

        case VehicleFilter.PassengerWagons:
          return !isTractionUnit(v) && v.group == 'wagon-passenger';

        case VehicleFilter.FreightWagons:
          return !isTractionUnit(v) && v.group == 'wagon-freight';
      }

      return true;
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
@use '@/styles/tab';

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));

  flex-wrap: wrap;
  gap: 0.5em;
}

.action {
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  label {
    color: #ccc;
    position: relative;
  }
}

.action.action-input label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.reset-btn {
  display: flex;
  background-color: #161c2e;
  border-radius: 0.25em;
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

.sponsor-only {
  color: global.$sponsorColor;

  &::after {
    content: '*';
  }
}

.team-only {
  color: global.$teamColor;

  &::after {
    content: '*';
  }
}

.vehicle-props {
  color: #ccc;
}

.no-vehicles-warning {
  text-align: center;
  padding: 1em;
  background-color: #161c2e;
}

@media screen and (max-width: global.$breakpointSm) {
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
