<template>
  <div class="image">
    <div class="image__wrapper">
      <div
        class="image__content"
        :class="{
          supporter: (store.chosenLoco || store.chosenCar)?.supportersOnly,
        }"
      >
        <div class="no-img" v-if="!store.chosenCar && !store.chosenLoco">PODGLĄD WYBRANEGO POJAZDU</div>
        <div class="empty-message" v-if="store.imageLoading">ŁADOWANIE OBRAZU...</div>
        <img
          v-if="store.chosenLoco || store.chosenCar"
          :src="store.chosenLoco?.imageSrc || store.chosenCar?.imageSrc"
          :alt="store.chosenLoco?.type || store.chosenCar?.type"
          @load="onImageLoad"
          @click="onImageClick"
        />
      </div>
    </div>

    <div class="image__info" v-if="store.chosenLoco || store.chosenCar">
      <b class="text--accent">{{ (store.chosenLoco || store.chosenCar)?.type }} </b>

      <div style="color: #ccc">
        <b>{{ vehicleTypes[store.chosenLoco?.power || store.chosenCar?.useType || 'loco-e'] }}</b>

        <div>
          {{ (store.chosenCar || store.chosenLoco)?.length }}m | {{ (store.chosenCar || store.chosenLoco)?.mass }}t |
          {{ (store.chosenCar || store.chosenLoco)?.maxSpeed }} km/h
        </div>

        <div v-if="store.chosenLoco">Typ kabiny: {{ store.chosenLoco.cabinType }}</div>

        <div v-if="store.chosenCar">
          {{
            store.chosenCar.useType == 'car-cargo'
              ? carUsage[store.chosenCar.constructionType]
              : 'Typ konstrukcji: ' + store.chosenCar.constructionType
          }}
        </div>
      </div>
    </div>

    <div class="image__info" v-else>Wybierz pojazd lub wagon, aby zobaczyć jego podgląd powyżej</div>
  </div>
</template>

<script lang="ts">
import carUsage from '../data/carUsage.json';
import { defineComponent } from 'vue';
import { useStore } from '../store';

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      store,
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

  methods: {
    onImageLoad() {
      this.store.imageLoading = false;
    },

    onImageClick() {
      const chosenVehicle = this.store.chosenCar || this.store.chosenLoco;

      if (!chosenVehicle) return;

      this.store.vehiclePreviewSrc = chosenVehicle.imageSrc.replace('300', '800');
    },
  },
});
</script>

<style lang="scss" scoped>
.image {
  flex-grow: 2;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.image {
  &__wrapper {
    max-width: 380px;
    width: 22em;
    height: 13em;
  }

  &__content {
    border: 1px solid white;
    position: relative;

    height: 100%;

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
      top: 0;

      display: flex;
      justify-content: center;
      align-items: flex-end;

      width: 100%;
      height: 100%;
      padding: 0.3em 0;
    }

    .empty-message {
      background: rgba(#000, 0.75);
    }
  }
}

.image__info {
  text-align: center;

  margin: 1em 0;

  font-size: 1.1em;

  b {
    font-size: 1.1em;
  }

  div {
    margin: 0.25em 0;
  }
}
</style>

