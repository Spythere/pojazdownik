<template>
  <section class="train-image-section">
    <div class="train-image__wrapper">
      <div class="train-image__content">
        <transition name="img-message-anim">
          <div class="empty-message" v-if="store.imageLoading">ŁADOWANIE OBRAZU...</div>
        </transition>

        <div class="no-img" v-if="!store.chosenVehicle">PODGLĄD WYBRANEGO POJAZDU</div>

        <img
          v-if="store.chosenVehicle"
          :src="store.chosenVehicle.imageSrc"
          :alt="store.chosenVehicle.type"
          @load="onImageLoad"
          @click="onImageClick"
        />
      </div>

      <div class="train-image__info" v-if="store.chosenVehicle">
        <b class="text--accent">{{ store.chosenVehicle.type }}</b> &bull;
        <b style="color: #ccc">{{
          vehicleTypes[
            isLocomotive(store.chosenVehicle) ? store.chosenVehicle.power : store.chosenVehicle.useType || 'loco-e'
          ]
        }}</b>

        <div style="color: #ccc">
          <div>
            {{ store.chosenVehicle.length }}m | {{ store.chosenVehicle.mass }}t |
            {{ store.chosenVehicle.maxSpeed }} km/h
          </div>

          <div v-if="isLocomotive(store.chosenVehicle)">Typ kabiny: {{ store.chosenVehicle.cabinType }}</div>

          <div v-else>
            {{
              store.chosenVehicle.useType == 'car-cargo'
                ? carUsage[store.chosenVehicle.constructionType]
                : 'Typ konstrukcji: ' + store.chosenVehicle.constructionType
            }}
          </div>
        </div>
      </div>

      <div class="train-image__info" v-else>Wybierz pojazd lub wagon, aby zobaczyć jego podgląd powyżej</div>
    </div>
  </section>
</template>

<script lang="ts">
import carUsage from '../data/carUsage.json';
import { computed, defineComponent } from 'vue';
import { useStore } from '../store';
import { isLocomotive } from '../utils/vehicleUtils';
import { ILocomotive, IVehicleData, Vehicle } from '../types';

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      store,
      chosenVehicle: computed(() => store.chosenVehicle),
    };
  },

  data() {
    return {
      vehicleTypes: {
        'loco-e': 'ELEKTROWÓZ',
        'loco-s': 'SPALINOWÓZ',
        'loco-ezt': 'EZT',
        'loco-szt': 'SZT',
        'car-passenger': 'WAGON PASAŻERSKI',
        'car-cargo': 'WAGON TOWAROWY',
      } as { [key: string]: string },

      carUsage: carUsage as { [key: string]: string },
    };
  },

  watch: {
    chosenVehicle(vehicle: Vehicle, prevVehicle: Vehicle) {
      if (vehicle && vehicle.type != prevVehicle?.type) {
        this.store.imageLoading = true;
      }
    },
  },

  methods: {
    onImageLoad() {
      this.store.imageLoading = false;
    },

    isLocomotive(vehicle: Vehicle): vehicle is ILocomotive {
      return isLocomotive(vehicle);
    },

    onImageClick() {
      const chosenVehicle = this.store.chosenVehicle;

      if (!chosenVehicle) return;

      this.store.vehiclePreviewSrc = chosenVehicle.imageSrc.replace('300', '800');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/global.scss';

.train-image-section {
  grid-row: 3;
  grid-column: 1;

  margin-top: 2em;
  height: 22em;
}

.train-image {
  &__wrapper {
    text-align: center;
  }

  &__content {
    border: 1px solid white;
    position: relative;
    overflow: hidden;

    max-width: 22em;
    height: 13em;
    margin: 0 auto;

    &.supporter {
      border: 1px solid salmon;
    }

    img {
      width: 100%;
      height: 100%;

      cursor: pointer;
    }

    .empty-message,
    .no-img {
      position: absolute;
      left: 0;
      bottom: 0;

      padding: 0.3em 0;
      width: 100%;
    }

    .empty-message {
      background: rgba(#000, 0.75);
    }
  }
}

.train-image__info {
  margin: 1em 0;
  font-size: 1.1em;
  padding: 0 1em;

  b {
    font-size: 1.1em;
  }

  div {
    margin: 0.25em 0;
  }
}

// Transition animations
.img-message-anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: opacity 75ms ease-in 100ms;
  }
}

@media screen and (max-width: $breakpointMd) {
  .train-image-section {
    justify-content: center;
  }
}
</style>

