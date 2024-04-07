<template>
  <section class="train-image-section">
    <div class="image-wrapper">
      <img
        :src="
          store.chosenVehicle
            ? getThumbnailURL(store.chosenVehicle.type, 'small')
            : '/images/placeholder.jpg'
        "
        tabindex="0"
        :data-sponsor-only="store.chosenVehicle?.restrictions.sponsorOnly"
        :data-team-only="store.chosenVehicle?.restrictions.teamOnly"
        @click="onImageClick"
        @keydown.enter="onImageClick"
        @error="onImageError"
      />
    </div>

    <div class="image-info" v-if="store.chosenVehicle">
      <b class="text--accent">{{ store.chosenVehicle.type }}</b> &bull;
      <b style="color: #ccc">
        {{
          $t(
            `preview.${isLocomotive(store.chosenVehicle) ? store.chosenVehicle.group : store.chosenVehicle.group}`
          )
        }}
      </b>

      <div style="color: #ccc">
        <div>
          {{ store.chosenVehicle.length }}m | {{ (store.chosenVehicle.weight / 1000).toFixed(1) }}t
          | {{ store.chosenVehicle.maxSpeed }} km/h
        </div>

        <div v-if="isLocomotive(store.chosenVehicle)">
          {{ $t('preview.cabin') }} {{ store.chosenVehicle.cabinType }}
        </div>

        <div v-else>
          {{
            store.chosenVehicle.group == 'wagon-freight'
              ? $t(`usage.${store.chosenVehicle.constructionType}`)
              : `${$t('preview.construction')} ${store.chosenVehicle.constructionType}`
          }}
        </div>

        <b style="color: salmon" v-if="store.chosenVehicle.restrictions['sponsorOnly']">{{
          $t('preview.sponsor-only', [
            new Date(store.chosenVehicle.restrictions['sponsorOnly']).toLocaleDateString(
              $i18n.locale == 'pl' ? 'pl-PL' : 'en-GB'
            ),
          ])
        }}</b>

        <b style="color: gold" v-if="store.chosenVehicle.restrictions['teamOnly']">{{
          $t('preview.team-only')
        }}</b>
      </div>
    </div>

    <div class="image-info" v-else>{{ $t('preview.desc') }}</div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from '../../store';
import { isTractionUnit } from '../../utils/vehicleUtils';
import { ILocomotive, IVehicle } from '../../types';
import imageMixin from '../../mixins/imageMixin';

export default defineComponent({
  mixins: [imageMixin],

  data() {
    return {
      noImageAvailable: false,
    };
  },

  setup() {
    const store = useStore();

    return {
      store,
      chosenVehicle: computed(() => store.chosenVehicle),
    };
  },

  watch: {
    chosenVehicle(vehicle: IVehicle, prevVehicle: IVehicle) {
      if (vehicle && vehicle.type != prevVehicle?.type) {
        this.store.imageLoading = true;
      }
    },
  },

  methods: {
    onImageLoad() {
      this.store.imageLoading = false;
    },

    onImageError(e: Event) {
      const el = e.target as HTMLImageElement;
      if (el.src == '/images/placeholder.jpg') return;

      el.src = '/images/placeholder.jpg';
    },

    isLocomotive(vehicle: IVehicle): vehicle is ILocomotive {
      return isTractionUnit(vehicle);
    },

    onImageClick(e: Event) {
      const target = e.target as HTMLElement;

      const chosenVehicle = this.store.chosenVehicle;

      if (!chosenVehicle) return;

      this.store.lastFocusedElement = target;
      this.store.vehiclePreviewSrc = this.getThumbnailURL(chosenVehicle.type, 'large');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/global';

.train-image-section {
  display: flex;
  flex-direction: column;
  text-align: center;

  grid-row: 3;
  grid-column: 1;

  margin-top: 1em;
  height: 22em;
}

img {
  max-width: 380px;
  width: 100%;
  height: 100%;
  border: 1px solid white;

  cursor: zoom-in;

  &[data-sponsor-only='true'] {
    border: 1px solid $sponsorColor;
  }

  &[data-team-only='true'] {
    border: 1px solid $teamColor;
  }
}

// .train-image {
//   &__content {
//     &.sponsor img {
//       border: 1px solid salmon;
//     }

//     img {
//       max-width: 380px;
//       width: 100%;
//       height: 100%;
//       border: 1px solid white;

//       cursor: zoom-in;
//     }
//   }
// }

.image-info {
  font-size: 1.1em;
  padding: 0.5em;
  margin: 0.5em auto;
  line-height: 1.35;

  width: 100%;
  max-width: 380px;

  background-color: $secondaryColor;
  font-weight: bold;
}

@media screen and (max-width: $breakpointMd) {
  .train-image-section {
    justify-content: center;
  }
}
</style>
