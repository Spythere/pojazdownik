<template>
  <section class="train-image-section">
    <div v-if="store.chosenVehicle">
      <img
        :src="getThumbnailURL(store.chosenVehicle.type, 'small')"
        :data-preview-active="store.chosenVehicle !== null"
        :data-sponsor-only="
          store.chosenVehicle.sponsorOnlyTimestamp &&
          store.chosenVehicle.sponsorOnlyTimestamp > Date.now()
        "
        :data-team-only="store.chosenVehicle.teamOnly"
        @click="onImageClick"
        @keydown.enter="onImageClick"
        @error="onImageError"
        tabindex="0"
      />

      <div class="image-info">
        <b class="text--accent">{{ store.chosenVehicle.type }}</b> &bull;
        <b style="color: #ccc">
          {{
            $t(
              `preview.${isTractionUnit(store.chosenVehicle) ? store.chosenVehicle.group : store.chosenVehicle.group}`
            )
          }}
        </b>

        <div style="color: #ccc">
          <div>
            {{ store.chosenVehicle.length }}m |
            {{ (store.chosenVehicle.weight / 1000).toFixed(1) }}t |
            {{ store.chosenVehicle.maxSpeed }} km/h
          </div>

          <div v-if="isTractionUnit(store.chosenVehicle)">
            {{ $t('preview.cabin') }} {{ store.chosenVehicle.cabinType }}
          </div>

          <div v-else>
            {{
              store.chosenVehicle.group == 'wagon-freight'
                ? $t(`usage.${store.chosenVehicle.constructionType}`)
                : `${$t('preview.construction')} ${store.chosenVehicle.constructionType}`
            }}
          </div>

          <b
            v-if="
              store.chosenVehicle.sponsorOnlyTimestamp &&
              store.chosenVehicle.sponsorOnlyTimestamp > Date.now()
            "
            class="sponsor-only"
          >
            {{
              $t('preview.sponsor-only', [
                new Date(store.chosenVehicle.sponsorOnlyTimestamp).toLocaleDateString(
                  $i18n.locale == 'pl' ? 'pl-PL' : 'en-GB'
                ),
              ])
            }}
          </b>

          <b v-if="store.chosenVehicle.teamOnly" class="team-only">{{ $t('preview.team-only') }}</b>
        </div>
      </div>
    </div>

    <div v-else>
      <img src="/images/placeholder.jpg" alt="placeholder image" />
      <div class="image-info">{{ $t('preview.desc') }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from '../../store';
import { isTractionUnit } from '../../utils/vehicleUtils';
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

  methods: {
    isTractionUnit,

    onImageError(e: Event) {
      const el = e.target as HTMLImageElement;
      if (el.src == '/images/placeholder.jpg') return;

      el.src = '/images/placeholder.jpg';
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
  align-items: center;
  text-align: center;

  min-height: 250px;

  & > div {
    max-width: 100%;
    width: 380px;
  }
}

img {
  width: 100%;

  &[data-preview-active='true'] {
    border: 1px solid white;
    cursor: zoom-in;
  }

  &[data-sponsor-only='true'] {
    border: 1px solid $sponsorColor;
  }

  &[data-team-only='true'] {
    border: 1px solid $teamColor;
  }
}

.placeholder {
  height: 250px;

  background-color: $bgColor;
}

.sponsor-only {
  color: $sponsorColor;
}

.team-only {
  color: $teamColor;
}

.image-info {
  font-size: 1.1em;
  padding: 0.5em;
  // margin: 0.5em auto;
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
