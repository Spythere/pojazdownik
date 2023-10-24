<template>
  <section class="train-image-section">
    <div class="train-image__wrapper">
      <div
        class="train-image__content"
        :class="{ supporter: store.chosenVehicle?.supportersOnly }"
      >
        <transition name="img-message-anim">
          <div
            class="empty-message"
            v-if="store.imageLoading && store.chosenVehicle?.imageSrc"
          >
            {{ $t("preview.loading") }}
          </div>
        </transition>

        <div class="no-img" v-if="!store.chosenVehicle">
          {{ $t("preview.title") }}
        </div>

        <img
          v-if="store.chosenVehicle"
          :src="getThumbnailURL(store.chosenVehicle.type, 'small')"
          :alt="store.chosenVehicle.type"
          @load="onImageLoad"
          @click="onImageClick"
        />

        <!-- <div class="empty-message" v-if="store.chosenVehicle && !store.chosenVehicle.imageSrc">Ten pojazd nie ma jeszcze podglądu!</div> -->
      </div>

      <div class="train-image__info" v-if="store.chosenVehicle">
        <b class="text--accent">{{ store.chosenVehicle.type }}</b> &bull;
        <b style="color: #ccc">
          {{
            $t(
              `preview.${
                isLocomotive(store.chosenVehicle)
                  ? store.chosenVehicle.power
                  : store.chosenVehicle.useType
              }`,
            )
          }}
        </b>

        <div style="color: #ccc">
          <div>
            {{ store.chosenVehicle.length }}m | {{ store.chosenVehicle.mass }}t
            | {{ store.chosenVehicle.maxSpeed }} km/h
          </div>

          <div v-if="isLocomotive(store.chosenVehicle)">
            {{ $t("preview.cabin") }} {{ store.chosenVehicle.cabinType }}
          </div>

          <div v-else>
            {{
              store.chosenVehicle.useType == "car-cargo" // ? store.stockData?.usage[store.chosenVehicle.constructionType]
                ? $t(`usage.${store.chosenVehicle.constructionType}`)
                : `${$t("preview.construction")} ${
                    store.chosenVehicle.constructionType
                  }`
            }}
          </div>

          <b style="color: salmon" v-if="store.chosenVehicle.supportersOnly">{{
            $t("preview.sponsor-only")
          }}</b>
        </div>
      </div>

      <div class="train-image__info" v-else>{{ $t("preview.desc") }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "../../store";
import { isLocomotive } from "../../utils/vehicleUtils";
import { ILocomotive, Vehicle } from "../../types";
import imageMixin from "../../mixins/imageMixin";

export default defineComponent({
  mixins: [imageMixin],

  setup() {
    const store = useStore();

    return {
      store,
      chosenVehicle: computed(() => store.chosenVehicle),
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

      this.store.vehiclePreviewSrc = this.getThumbnailURL(
        chosenVehicle.type,
        "large",
      );
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/global.scss";

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

      cursor: zoom-in;
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
