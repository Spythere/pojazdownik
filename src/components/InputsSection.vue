<template>
  <section class="inputs">
    <div class="input inputs_loco">
      <div class="input_container">
        <h2 class="input_header">LOKOMOTYWA / ZESP. TRAKCYJNY</h2>
        <div class="input_radio">
          <label v-for="label in locoLabels" :for="label.id" :key="label.id">
            <input
              type="radio"
              name="loco"
              :id="label.id"
              :value="label.id"
              :checked="store.chosenLocoPower == label.id"
              @change="onLocoPowerChange(label.id)"
              v-model="store.chosenLocoPower"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="input_list type">
          <select
            id="loco-select"
            v-model="store.chosenLoco"
            @change="onLocoTypeChange"
          >
            <option :value="null" disabled>Wybierz pojazd z listy</option>
            <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
              {{ loco.type }}
            </option>
          </select>

          <button @click="addVehicle">
            <img :src="icons.add" alt="add vehicle" />
          </button>
        </div>

        <div class="input_checkbox">
          <label for="supporter">
            <input
              type="checkbox"
              id="supporter"
              v-model="store.showSupporter"
            />
            <span>Pokaż pojazdy dla supporterów</span>
          </label>
        </div>
      </div>
    </div>

    <div
      class="input inputs_car"
      :class="{
        disabled:
          store.chosenLocoPower == 'loco-ezt' ||
          store.chosenLocoPower == 'loco-szt',
      }"
    >
      <div class="input_container">
        <h2 class="input_header">RODZAJ WAGONU</h2>
        <div class="input_radio">
          <label v-for="label in carLabels" :for="label.id" :key="label.id">
            <input
              type="radio"
              name="car"
              :id="label.id"
              :checked="store.chosenCarUseType == label.id"
              :value="label.id"
              v-model="store.chosenCarUseType"
              @change="onCarUseTypeChange(label.id)"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="input_list type">
          <select
            id="car-select"
            v-model="store.chosenCar"
            @change="onCarTypeChange"
          >
            <option :value="null" disabled>Wybierz wagon z listy</option>
            <option v-for="car in carOptions" :value="car" :key="car.type">
              {{ car.type }}
            </option>
          </select>

          <button @click="addVehicle">
            <img :src="icons.add" alt="add vehicle" />
          </button>
        </div>

        <div class="input_list cargo">
          <select
            id="cargo-select"
            :disabled="
              (store.chosenCar && !store.chosenCar.loadable) ||
              (store.chosenCar && store.chosenCar.useType == 'car-passenger') ||
              !store.chosenCar
            "
            v-model="store.chosenCargo"
          >
            <option :value="null">brak</option>
            <option
              v-for="cargo in store.chosenCar?.cargoList"
              :value="cargo"
              :key="cargo.id"
            >
              {{ cargo.id }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ICarWagon, ILocomotive, IStore } from "@/types";
import { defineComponent, inject } from "vue";
import { computed } from "@vue/reactivity";

import statsMixin from "@/mixins/StatsMixin";

function isILocomotive(
  vehicle: ILocomotive | ICarWagon
): vehicle is ILocomotive {
  return (vehicle as ILocomotive).power !== undefined;
}

export default defineComponent({
  mixins: [statsMixin],

  setup() {
    const store = inject("Store") as IStore;

    return {
      store,
      totalMass: computed(() =>
        store.stockList.reduce(
          (acc, stock) =>
            acc +
            (stock.cargo ? stock.cargo.totalMass : stock.mass) * stock.count,
          0
        )
      ),
      totalLength: computed(() =>
        store.stockList.reduce(
          (acc, stock) => acc + stock.length * stock.count,
          0
        )
      ),
      maxSpeed: computed(() =>
        store.stockList.reduce(
          (acc, stock) =>
            stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc,
          0
        )
      ),
    };
  },

  data: () => ({
    icons: {
      add: require("@/assets/add-icon.svg"),
    },
    locoLabels: [
      {
        id: "loco-e",
        title: "ELEKTROWÓZ",
      },
      {
        id: "loco-s",
        title: "SPALINOWÓZ",
      },
      {
        id: "loco-ezt",
        title: "EZT",
      },
      {
        id: "loco-szt",
        title: "SZT",
      },
    ],

    carLabels: [
      {
        id: "car-passenger",
        title: "PASAŻERSKI",
      },
      {
        id: "car-cargo",
        title: "TOWAROWY",
      },
    ],
  }),

  computed: {
    locoOptions() {
      return this.locoDataList
        .filter((loco) => loco.power == this.store.chosenLocoPower)
        .sort((a, b) => (a.type > b.type ? -1 : 1));
    },

    carOptions() {
      return this.carDataList
        .filter((car) => car.useType == this.store.chosenCarUseType)
        .sort((a, b) => (a.type > b.type ? 1 : -1));
    },
  },

  methods: {
    onLocoPowerChange(inputId: string) {
      this.store.chosenLoco = null;
      this.store.imageLoading = false;
    },

    onCarUseTypeChange(inputId: string) {
      this.store.chosenCar = null;

      if (inputId == "car-passenger") this.store.chosenCargo = null;

      this.store.imageLoading = false;
    },

    onCarTypeChange() {
      this.store.chosenCargo = null;
      this.store.chosenLoco = null;

      this.store.imageLoading = true;
    },

    onLocoTypeChange() {
      this.store.chosenCargo = null;
      this.store.chosenCar = null;

      this.store.imageLoading = true;
    },

    addVehicle() {
      const vehicle = this.store.chosenCar || this.store.chosenLoco;

      if (!vehicle) return;

      if (vehicle.length + this.totalLength > 650) {
        alert("Maksymalna długość składu to 650m!");
        return;
      }

      const previousStock =
        this.store.stockList.length > 0
          ? this.store.stockList[this.store.stockList.length - 1]
          : null;

      if (
        isILocomotive(vehicle) &&
        previousStock &&
        previousStock.type == vehicle.type
      ) {
        this.store.stockList[this.store.stockList.length - 1].count++;
        return;
      }

      if (
        !isILocomotive(vehicle) &&
        previousStock &&
        previousStock.type == vehicle.type &&
        previousStock.cargo?.id == this.store.chosenCargo?.id
      ) {
        this.store.stockList[this.store.stockList.length - 1].count++;

        return;
      }

      const stockObj = {
        type: vehicle.type,
        length: vehicle.length,
        mass: vehicle.mass,
        maxSpeed: vehicle.maxSpeed,
        isLoco: isILocomotive(vehicle),
        cargo:
          !isILocomotive(vehicle) && vehicle.loadable && this.store.chosenCargo
            ? this.store.chosenCargo
            : undefined,
        count: 1,
        imgSrc: vehicle.imageSrc,
        useType: isILocomotive(vehicle) ? vehicle.power : vehicle.useType,
      };

      if (
        isILocomotive(vehicle) &&
        this.store.stockList.length > 0 &&
        !this.store.stockList[0].isLoco
      )
        this.store.stockList.unshift(stockObj);
      else this.store.stockList.push(stockObj);
    },
  },

  mounted() {
    this.onLocoPowerChange("loco-e");
    this.onCarUseTypeChange("car-passenger");
  },
});
</script>

<style lang="scss" scoped>
@import "../styles/global";

.inputs {
  display: flex;
  justify-content: space-between;

  &_car {
    &.disabled {
      opacity: 0.75;
      pointer-events: none;
    }
  }
  
  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
}

.input {
  &_header {
    margin-bottom: 1em;
  }

  &_radio {
    label span {
      padding: 0.25em 0.55em;
      border: 2px solid white;
    }
  }

  &_checkbox {
    label span {
      /* padding: 0.25em 0.55em; */
      /* border: 2px solid white; */
      color: #aaa;

      &::before {
        content: "";
        display: inline-block;

        width: 1.5ex;
        height: 1.5ex;
        background: #aaa;

        margin-right: 0.5em;
      }
    }

    input:checked + span::before {
      background-color: $accentColor;
    }
  }

  &_radio,
  &_checkbox {
    margin: 1em 0;

    label {
      cursor: pointer;
      margin-right: 0.5em;

      input {
        display: none;

        &:checked + span {
          border-color: $accentColor;
          color: $accentColor;
        }
      }
    }
  }

  &_list {
    margin: 0.5em 0;

    display: flex;
  }

  &_list button {
    margin-left: 0.5em;

    &:hover img {
      border-color: $accentColor;
    }

    img {
      border: 2px solid white;
      padding: 0.25em;

      height: 2.35em;

      vertical-align: middle;
    }
  }

  @media screen and (max-width: 800px) {
    justify-content: center;

    margin: 1em 0;

    &_header {
      text-align: center;
    }

    &_radio,
    &_list,
    &_checkbox {
      display: flex;
      justify-content: center;
    }
  }
}
</style>