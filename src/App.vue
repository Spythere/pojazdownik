<template>
  <header>
    <h1 class="header-top">POJAZDOWNIK</h1>
    <p class="header-bottom">EDYTOR SKŁADÓW ONLINE</p>
  </header>

  <main>
    <section class="inputs">
      <div class="inputs_loco">
        <h2 class="inputs_header">LOKOMOTYWA / ZESP. TRAKCYJNY</h2>
        <div class="inputs_radio">
          <label
            v-for="(label, i) in locoLabels"
            :for="label.id"
            :key="label.id"
          >
            <input
              type="radio"
              name="loco"
              :id="label.id"
              :checked="i == 0"
              @change="onLocoInputChange(label.id)"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="inputs_list type">
          <select id="loco-select" v-model="chosenLoco">
            <option :value="null" disabled>Wybierz pojazd z listy</option>
            <option v-for="loco in locoOptions" :value="loco" :key="loco.type">
              {{ loco.type }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="inputs_car"
        :class="{
          disabled:
            chosenLocoPower == 'loco-ezt' || chosenLocoPower == 'loco-szt',
        }"
      >
        <h2 class="inputs_header">RODZAJ WAGONU</h2>
        <div class="inputs_radio">
          <label
            v-for="(label, i) in carLabels"
            :for="label.id"
            :key="label.id"
          >
            <input
              type="radio"
              name="car"
              :id="label.id"
              :checked="i == 0"
              @change="onCarInputChange(label.id)"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="inputs_list type">
          <select id="car-select" v-model="chosenCar">
            <option :value="null" disabled>Wybierz wagon z listy</option>
            <option v-for="car in carOptions" :value="car" :key="car.type">
              {{ car.type }}
            </option>
          </select>
        </div>
        <div class="inputs_list cargo">
          <select
            id="cargo-select"
            :disabled="(chosenCar && !chosenCar.loadable) || !chosenCar"
          >
            <option value="" disabled>Wybierz ładunek z listy</option>
            <option
              v-for="cargo in chosenCar?.cargoList"
              :value="cargo.id"
              :key="cargo.id"
            >
              {{ cargo.id }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <section class="image-viewer">
      <div class="image-viewer_content">
        <img
          v-if="chosenLoco"
          :src="chosenLoco.imageSrc"
          :alt="chosenLoco.type"
        />
      </div>

      <div class="image-viewer_addbtn"></div>
    </section>

    <section class="image-viewer">
      <div class="image-viewer_content">
        <img v-if="chosenCar" :src="chosenCar.imageSrc" :alt="chosenCar.type" />
      </div>

      <div class="image-viewer_addbtn"></div>
    </section>

    <section class="stock-list">
      <div class="stock-list_buttons">
        <button class="btn--copy"></button>
        <button class="btn--show-text"></button>
      </div>

      <div class="stock-list_specs"></div>

      <ul>
        <li>
          <span class="type"></span>

          <span class="actions">
            <div class="car-count">5</div>
            <button class="btn--remove"></button>
            <button class="btn--moveup"></button>
            <button class="btn--movedown"></button>
          </span>
        </li>
      </ul>
    </section>
  </main>
  <footer></footer>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

import vehicleDataJSON from "./data/vehicleData.json";
import vehiclePropsJSON from "./data/vehicleProps.json";

interface VehicleData {
  [key: string]: (string | boolean)[][];
}

interface Locomotive {
  type: string;
  power: string;
  constructionType: string;
  cabinType: string;
  maxSpeed: number;
  supportersOnly: boolean;
  imageSrc: string;

  mass: number;
  length: number;
}

interface CarWagon {
  //"203V_PKPC_Fll_01","203V",true,false,"100",img
  type: string;
  useType: string;
  constructionType: string;
  loadable: boolean;
  supportersOnly: boolean;
  maxSpeed: number;
  imageSrc: string;

  mass: number;
  length: number;
  cargoList: { id: string; totalMass: number }[];
}

export default class App extends Vue {
  locoLabels = [
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
  ];

  carLabels = [
    {
      id: "car-passenger",
      title: "PASAŻERSKI",
    },
    {
      id: "car-cargo",
      title: "TOWAROWY",
    },
  ];

  chosenLocoPower = "loco-e";

  chosenCar: CarWagon | null = null;
  chosenLoco: Locomotive | null = null;

  locoOptions: Locomotive[] = [];
  carOptions: CarWagon[] = [];
  cargoOptions: any[][] = [];

  totalLength = 0;
  totalMass = 0;

  onLocoInputChange(inputId: string) {
    this.chosenLocoPower = inputId;
    this.chosenLoco = null;

    this.locoOptions = this.locoDataList
      .filter((loco) => loco.power == inputId)
      .sort((a, b) => (a.type > b.type ? -1 : 1));
  }

  onCarInputChange(inputId: string) {
    this.carOptions = this.carDataList
      .filter((car) => car.useType == inputId)
      .sort((a, b) => (a.type > b.type ? 1 : -1));
  }

  get locoDataList() {
    const locos = Object.keys(vehicleDataJSON).reduce((acc, vehicleTypeKey) => {
      if (!vehicleTypeKey.startsWith("loco")) return acc;

      const locoVehiclesData = (vehicleDataJSON as VehicleData)[vehicleTypeKey];

      locoVehiclesData.forEach((loco) => {
        const locoType = loco[0] as string;

        let length = 0,
          mass = 0;

        // Elektrowozy
        if (vehicleTypeKey.startsWith("loco-e")) {
          // 32m dla ET41, reszta 16
          length = locoType.startsWith("ET") ? 32 : 16;

          // 80t dla wszystkich EU06, EP08
          mass = 80;

          // 83t dla: EU07 o nr większych niż 300 & dla wszystkich EP07 oprócz nr 135,242,1002,1048
          const locoNumber = Number(locoType.split("-")[1]);

          if (
            (locoType.startsWith("EU") && locoNumber > 300) ||
            (locoType.startsWith("EP") &&
              ![242, 135, 1002, 1048].includes(locoNumber))
          ) {
            mass = 83;
          }
        }

        // Spalinowozy
        if (vehicleTypeKey.startsWith("loco-s")) {
          length = 14;
          mass = 74;
        }

        // EZT
        if (vehicleTypeKey.startsWith("loco-ezt")) {
          // EN57
          length = 65;
          mass = 126;

          // EN71
          if (locoType.startsWith("EN71")) {
            length = 86;
            mass = 182;
          }

          // 2xEN57
          if (locoType.startsWith("2EN57")) {
            length = 130;
            mass = 253;
          }
        }

        // SZT
        if (vehicleTypeKey.startsWith("loco-ezt")) {
          length = 14;
          mass = 23;
        }

        acc.push({
          power: vehicleTypeKey,
          type: loco[0] as string,
          constructionType: loco[1] as string,
          cabinType: loco[2] as string,
          maxSpeed: Number(loco[3] as string),
          supportersOnly: loco[4] as boolean,
          imageSrc: loco[5] as string,

          length,
          mass,
        });
      });

      return acc;
    }, [] as Locomotive[]);

    return locos;
  }

  get carDataList() {
    const locos = Object.keys(vehicleDataJSON).reduce((acc, vehicleTypeKey) => {
      if (!vehicleTypeKey.startsWith("car")) return acc;

      const carVehiclesData = (vehicleDataJSON as VehicleData)[vehicleTypeKey];

      carVehiclesData.forEach((car) => {
        const carPropsData = vehiclePropsJSON.find((v) =>
          car[0].toString().includes(v.type)
        );

        acc.push({
          useType: vehicleTypeKey,
          type: car[0] as string,
          constructionType: car[1] as string,
          loadable: car[2] as boolean,
          supportersOnly: car[3] as boolean,
          maxSpeed: Number(car[4] as string),
          imageSrc: car[5] as string,
          cargoList:
            carPropsData?.cargo.split(";").map((cargo) => ({
              id: cargo.split(":")[0],
              totalMass: Number(cargo.split(":")[1]),
            })) || [],

          mass: carPropsData?.mass || 0,
          length: carPropsData?.length || 0,
        });
      });

      return acc;
    }, [] as CarWagon[]);

    return locos;
  }

  parseCargoList(cargoString: string): string[] {
    return cargoString.split(";").map((str) => str[0]);
  }

  mounted() {
    this.onLocoInputChange("loco-e");
    this.onCarInputChange("car-passenger");
  }
}
</script>

<style lang="scss">
@import "./styles/global";
@import url("https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap");

body,
html {
  margin: 0;
  padding: 0;

  min-height: 100vh;
  font-family: "Lato", sans-serif;

  background-color: $bgColor;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

select,
option,
input {
  font-family: "Lato", sans-serif;
}

#app {
  margin: 0 auto;

  color: $textColor;

  min-height: 100vh;
  max-width: 950px;

  padding: 0.5em 1em;
}

select {
  background: none;
  border: 1px solid white;
  outline: none;

  padding: 0.25em 0.35em;
  margin-top: 1em;

  color: white;
  font-size: 1em;

  width: 250px;
}

option {
  color: black;
  border: none;
}

header {
  text-align: center;
}

h1.header-top {
  margin: 0;
  font-size: 3.65em;
  color: $accentColor;

  font-weight: 900;
}

h2 {
  margin: 0;
  margin-bottom: 0.5em;

  color: $accentColor;
  font-weight: 700;
  font-size: 1.2em;
}

p.header-bottom {
  margin: 0;
  font-size: 1.5em;
  line-height: 0.95em;
}

.inputs {
  display: flex;
  justify-content: space-between;

  flex-wrap: wrap;

  margin-top: 3em;

  & > div {
    margin: 1.5em 1em 0 0;
  }

  &_radio {
    margin-top: 1em;
  }
}

.inputs_car.disabled {
  opacity: 0.75;
  pointer-events: none;
}

label {
  cursor: pointer;

  margin-right: 0.5em;

  span {
    padding: 0.25em 0.55em;
    border: 2px solid white;
  }

  & > input {
    display: none;

    &:checked + span {
      border-color: $accentColor;
      color: $accentColor;
    }
  }
}

.image-viewer {
  max-width: 300px;
  height: 170px;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
