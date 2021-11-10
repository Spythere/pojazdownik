<template>
  <header>
    <h1 class="header-top">POJAZDOWNIK</h1>
    <p class="header-bottom"><span>EDYTOR SKŁADÓW ONLINE</span></p>
  </header>

  <main>
    <div class="inputs_loco">
      <div class="input_container">
        <h2 class="input_header">LOKOMOTYWA / ZESP. TRAKCYJNY</h2>
        <div class="input_radio">
          <label v-for="label in locoLabels" :for="label.id" :key="label.id">
            <input
              type="radio"
              name="loco"
              :id="label.id"
              :value="label.id"
              :checked="chosenLocoPower == label.id"
              @change="onLocoPowerChange(label.id)"
              v-model="chosenLocoPower"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="input_list type">
          <select
            id="loco-select"
            v-model="chosenLoco"
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
      </div>
    </div>

    <div
      class="inputs_car"
      :class="{
        disabled:
          chosenLocoPower == 'loco-ezt' || chosenLocoPower == 'loco-szt',
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
              :checked="chosenCarUseType == label.id"
              :value="label.id"
              v-model="chosenCarUseType"
              @change="onCarUseTypeChange(label.id)"
            />
            <span>{{ label.title }}</span>
          </label>
        </div>

        <div class="input_list type">
          <select id="car-select" v-model="chosenCar" @change="onCarTypeChange">
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
              (chosenCar && !chosenCar.loadable) ||
              (chosenCar && chosenCar.useType == 'car-passenger') ||
              !chosenCar
            "
            v-model="chosenCargo"
          >
            <option :value="null">brak</option>
            <option
              v-for="cargo in chosenCar?.cargoList"
              :value="cargo"
              :key="cargo.id"
            >
              {{ cargo.id }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <section class="images">
      <div class="image">
        <div class="image-content">
          <div class="no-img" v-if="!chosenCar && !chosenLoco">
            POGLĄD WYBRANEGO POJAZDU
          </div>

          <div class="empty-message" v-if="imageLoading">
            ŁADOWANIE OBRAZU...
          </div>

          <img
            v-if="chosenLoco && !chosenCar"
            :src="chosenLoco.imageSrc"
            :alt="chosenLoco.type"
            @load="onImageLoad"
          />

          <img
            v-if="chosenCar"
            :src="chosenCar.imageSrc"
            :alt="chosenCar.type"
            @load="onImageLoad"
          />
        </div>

        <button class="btn-rect" @click="addVehicle">+</button>
      </div>
    </section>

    <section class="stock-list">
      <div class="stock-list_buttons">
        <button class="btn btn--copy" @click="downloadStock">
          POBIERZ SKŁAD
        </button>
        <!-- <button class="btn btn--show-text">WCZYTAJ SKŁAD</button> -->
      </div>

      <div class="stock-list_specs">
        Masa: <span class="text--accent">{{ totalMass }}</span> t | Długość:
        <span class="text--accent">{{ totalLength }}</span>
        m | Vmax: <span class="text--accent">{{ maxSpeed }} </span> km/h
      </div>

      <ul>
        <li v-if="stockList.length == 0" class="list-empty">
          Lista pojazdów jest pusta!
        </li>

        <li
          v-for="(stock, i) in stockList"
          :key="stock.type + i"
          :class="{ loco: stock.isLoco }"
          :data-id="i"
          tabindex="0"
          @focus="onListItemFocus(i)"
          :ref="`item-${i}`"
        >
          <div
            class="item-content"
            @dragstart="onDragStart(i)"
            @drop="onDrop($event, i)"
            @dragover="allowDrop"
            draggable="true"
          >
            <span>
              {{ stock.isLoco ? stock.type : getCarSpecFromType(stock.type) }}
            </span>
            <span v-if="stock.cargo"> &nbsp; ({{ stock.cargo?.id }}) </span>
            &nbsp;
            <span> {{ stock.length }}m</span>
            &nbsp;
            <span>{{ stock.cargo ? stock.cargo.totalMass : stock.mass }}t</span>
          </div>

          <div class="item-actions">
            <div class="count">
              <button class="action-btn" @click="subStock(i)">
                <img :src="icons.sub" alt="subtract vehicle count" />
              </button>

              <span>{{ stock.count }} </span>

              <button class="action-btn" @click="addStock(i)">
                <img :src="icons.add" alt="add vehicle count" />
              </button>
            </div>

            <button class="action-btn" @click="moveUpStock(i)">
              <img :src="icons.higher" alt="move up vehicle" />
            </button>

            <button class="action-btn" @click="moveDownStock(i)">
              <img :src="icons.lower" alt="move down vehicle" />
            </button>

            <button class="action-btn" @click="removeStock(i)">
              <img :src="icons.remove" alt="remove vehicle" />
            </button>
          </div>
          <!-- <span class="type"></span>
          <span class="cargo"></span>
          <span class="cargo"></span>

          <span class="actions">
            <div class="car-count">5</div>
            <button class="btn--remove"></button>
            <button class="btn--moveup"></button>
            <button class="btn--movedown"></button>
          </span> -->
        </li>
      </ul>
    </section>
  </main>
  <footer>
    <span class="text--grayed">
      Ta strona ma charakter informacyjny. Autor nie ponosi odpowiedzialności za
      tworzenie składów niezgodnych z regulaminem symulatora Train Driver 2!
    </span>
    <br />
    &copy; Spythere 2021 | v{{ VERSION }}
  </footer>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";

import vehicleDataJSON from "./data/vehicleData.json";
import vehiclePropsJSON from "./data/vehicleProps.json";

import packageInfo from ".././package.json";

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

function isLocomotive(vehicle: Locomotive | CarWagon): vehicle is Locomotive {
  return (vehicle as Locomotive).power !== undefined;
}

export default class App extends Vue {
  icons = {
    add: require("./assets/add-icon.svg"),
    sub: require("./assets/sub-icon.svg"),
    remove: require("./assets/remove-icon.svg"),
    lower: require("./assets/lower-icon.svg"),
    higher: require("./assets/higher-icon.svg"),
  };

  VERSION = packageInfo.version;

  imageLoading = false;
  draggedVehicleID = -1;

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
  chosenCarUseType = "car-passenger";

  chosenCar: CarWagon | null = null;
  chosenLoco: Locomotive | null = null;
  chosenCargo: { id: string; totalMass: number } | null = null;

  cargoOptions: any[][] = [];

  stockList: {
    useType: string;
    type: string;
    length: number;
    mass: number;
    maxSpeed: number;
    cargo?: { id: string; totalMass: number };
    isLoco: boolean;
    count: number;
    imgSrc: string;
  }[] = [];

  onLocoPowerChange(inputId: string) {
    this.chosenLoco = null;
    this.imageLoading = false;
  }

  onCarUseTypeChange(inputId: string) {
    this.chosenCar = null;

    if (inputId == "car-passenger") this.chosenCargo = null;

    this.imageLoading = false;
  }

  onCarTypeChange() {
    this.chosenCargo = null;
    this.chosenLoco = null;

    this.imageLoading = true;
  }

  onLocoTypeChange() {
    this.chosenCargo = null;
    this.chosenCar = null;

    this.imageLoading = true;
  }

  get locoOptions() {
    return this.locoDataList
      .filter((loco) => loco.power == this.chosenLocoPower)
      .sort((a, b) => (a.type > b.type ? -1 : 1));
  }

  get carOptions() {
    return this.carDataList
      .filter((car) => car.useType == this.chosenCarUseType)
      .sort((a, b) => (a.type > b.type ? 1 : -1));
  }

  onDragStart(vehicleIndex: number) {
    this.draggedVehicleID = vehicleIndex;
  }

  onDrop(e: DragEvent, vehicleIndex: number) {
    e.preventDefault();

    let targetEl: Element | null = this.$refs[
      `item-${vehicleIndex}`
    ] as Element;

    if (!targetEl) return;

    const dataID = targetEl.attributes.getNamedItem("data-id")?.textContent;

    if (!dataID) return;

    const tempVehicle = this.stockList[Number(dataID)];

    this.stockList[Number(dataID)] = this.stockList[this.draggedVehicleID];
    this.stockList[this.draggedVehicleID] = tempVehicle;
  }

  allowDrop(e: DragEvent) {
    e.preventDefault();
  }

  onImageLoad(ev: Event) {
    this.imageLoading = false;
  }

  onListItemFocus(vehicleID: number) {
    const vehicle = this.stockList[vehicleID];

    if (vehicle.isLoco) {
      this.chosenLocoPower = vehicle.useType;

      this.chosenLoco =
        this.locoDataList.find((v) => v.type == vehicle.type) || null;

      this.chosenCar = null;
      this.chosenCargo = null;

      // this.onLocoPowerChange(vehicle.useType);
      return;
    }

    this.chosenCarUseType = vehicle.useType;

    this.chosenLoco = null;
    this.chosenCar =
      this.carDataList.find((v) => v.type == vehicle.type) || null;
    this.chosenCargo = vehicle.cargo || null;

    // this.chose = vehicle.useType;
  }

  getCarSpecFromType(typeStr: string) {
    const specArray = typeStr.split("_");

    if (specArray.length == 0) return null;

    const shortVersion = specArray.length == 3;

    /* 111a_Grafitti_1 */
    if (specArray.length == 3)
      return `${specArray[0]} ${specArray[1]}-${specArray[2]}`;

    /* 111a_PKP_Bnouz_01 */
    return `${specArray[0]} ${specArray[2]}-${specArray[3]} (${specArray[1]})`;
  }

  addStock(index: number) {
    this.stockList[index].count++;
  }

  subStock(index: number) {
    if (this.stockList[index].count < 2) return;

    this.stockList[index].count--;
  }

  removeStock(index: number) {
    this.stockList = this.stockList.filter((stock, i) => i != index);
  }

  moveUpStock(index: number) {
    if (index < 1) return;

    const tempStock = this.stockList[index];

    this.stockList[index] = this.stockList[index - 1];
    this.stockList[index - 1] = tempStock;
  }

  moveDownStock(index: number) {
    if (index > this.stockList.length - 2) return;

    const tempStock = this.stockList[index];

    this.stockList[index] = this.stockList[index + 1];
    this.stockList[index + 1] = tempStock;
  }

  downloadStock() {
    const stockString = this.stockList
      .map((stock) => {
        let s =
          stock.isLoco || !stock.cargo
            ? stock.type
            : `${stock.type}:${stock.cargo.id}`;

        let final = s;
        for (let i = 0; i < stock.count - 1; i++) final += `;${s}`;

        return final;
      })
      .join(";");

    const fileName = prompt("Nazwij plik:", "sklad");

    const blob = new Blob([stockString]);
    const file = fileName + ".con";

    var e = document.createEvent("MouseEvents"),
      a = document.createElement("a");
    a.download = file;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["", a.download, a.href].join(":");
    e.initEvent("click", true, false);
    a.dispatchEvent(e);

    console.log(stockString);
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
        if (vehicleTypeKey.startsWith("loco-szt")) {
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

  addVehicle() {
    const vehicle = this.chosenCar || this.chosenLoco;

    if (!vehicle) return;

    const previousStock =
      this.stockList.length > 0
        ? this.stockList[this.stockList.length - 1]
        : null;

    if (
      isLocomotive(vehicle) &&
      previousStock &&
      previousStock.type == vehicle.type
    ) {
      this.stockList[this.stockList.length - 1].count++;
      return;
    }

    if (
      !isLocomotive(vehicle) &&
      previousStock &&
      previousStock.type == vehicle.type &&
      previousStock.cargo?.id == this.chosenCargo?.id
    ) {
      this.stockList[this.stockList.length - 1].count++;

      return;
    }

    const stockObj = {
      type: vehicle.type,
      length: vehicle.length,
      mass: vehicle.mass,
      maxSpeed: vehicle.maxSpeed,
      isLoco: isLocomotive(vehicle),
      cargo:
        !isLocomotive(vehicle) && vehicle.loadable && this.chosenCargo
          ? this.chosenCargo
          : undefined,
      count: 1,
      imgSrc: vehicle.imageSrc,
      useType: isLocomotive(vehicle) ? vehicle.power : vehicle.useType,
    };

    if (
      isLocomotive(vehicle) &&
      this.stockList.length > 0 &&
      !this.stockList[0].isLoco
    )
      this.stockList.unshift(stockObj);
    else this.stockList.push(stockObj);
  }

  get totalMass() {
    return this.stockList.reduce(
      (acc, stock) =>
        acc + (stock.cargo ? stock.cargo.totalMass : stock.mass) * stock.count,
      0
    );
  }

  get totalLength() {
    return this.stockList.reduce(
      (acc, stock) => acc + stock.length * stock.count,
      0
    );
  }

  get maxSpeed() {
    return this.stockList.reduce(
      (acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc),
      0
    );
  }

  mounted() {
    this.onLocoPowerChange("loco-e");
    this.onCarUseTypeChange("car-passenger");
  }
}
</script>

<style lang="scss">
@import "./styles/global";

/* APP */
#app {
  margin: 0 auto;

  color: $textColor;

  min-height: 100vh;

  padding: 0.5em 1em;

  overflow: hidden;

  display: grid;
  justify-content: center;

  grid-template-columns: minmax(200px, 1200px);
  grid-template-rows: 5em 1fr auto;
}

/* HEADER SECTION */

header {
  text-align: center;
}

.header-top {
  display: inline-block;
  margin: 0;
  font-size: 3.65em;
  color: $accentColor;

  padding: 0.25em 0.5em;

  font-weight: 900;
}

h2 {
  margin: 0;
  margin-bottom: 0.5em;

  color: $accentColor;
  font-weight: 700;
  font-size: 1.2em;
}

.header-bottom {
  margin: 0;
  font-size: 1.5em;
  line-height: 0.55em;

  /* span {
    padding: 0.25em 0.65em;
  } */
}

/* MAIN SECTION */

main {
  display: grid;

  grid-template-areas: "loco car" "image list";
  gap: 4em 2em;

  align-content: flex-start;

  margin-top: 6em;

  @media screen and (max-width: 800px) {
    grid-template-areas: "loco" "car" "image" "list";
    justify-content: center;

    margin-top: 2.5em;
    gap: 2em;
  }
}

.inputs {
  &_loco {
    grid-area: "loco";
  }

  &_car {
    grid-area: "car";

    &.disabled {
      opacity: 0.75;
      pointer-events: none;
    }
  }
}

.input {
  &_header {
    margin-bottom: 1em;
  }

  &_radio {
    margin: 1em 0;

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
}

.images {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .image {
    position: relative;

    grid-area: "image";
    max-width: 380px;
    width: 22em;
    height: 13em;
    border: 1px solid white;

    &-content {
      height: 100%;
    }

    img {
      width: 100%;
      height: 100%;
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

  button {
    position: absolute;
    right: 0;
    top: 0;

    margin: 0.25em;
  }

  img {
    width: 100%;
    height: 100%;
  }
}

.stock-list {
  grid-area: "list";

  &_buttons {
    button {
      font-size: 0.9em;
      padding: 0.2em 0.5em;
      margin-bottom: 0.5em;
    }
  }

  ul {
    margin-top: 1em;
  }

  ul li {
    outline: none;
    cursor: pointer;

    &:focus .item-content {
      color: $accentColor;
    }

    display: flex;
    align-items: center;
    justify-content: space-between;

    .item-content {
      /* background: whitesmoke; */
      color: white;
      font-weight: 700;
      margin: 1em 0;

      margin-right: 0.5em;

      /* max-width: 200px; */
    }

    .item-actions {
      display: flex;
      align-items: center;

      .count {
        display: flex;
        align-items: center;

        margin-right: 0.5em;

        span {
          margin: 0 0.5em;
          /* font-size: 1.25em; */

          color: $accentColor;
        }
      }

      img {
        vertical-align: middle;

        width: 1.3em;
        height: 1.3em;
      }

      button {
        margin: 0 0.25em;
      }
    }
  }
}

@media screen and (max-width: 800px) {
  #app {
    font-size: calc(0.75vw + 0.6rem);
  }

  header {
    font-size: 0.85em;
  }

  .images {
    justify-content: center;

    > .image {
      width: 25em;
      height: 15em;
    }
  }

  .input {
    justify-content: center;

    margin: 1em 0;

    &_header {
      text-align: center;
    }

    &_radio {
      display: flex;
      justify-content: center;
    }

    &_list {
      display: flex;
      justify-content: center;
    }
  }
}

footer {
  margin-top: 1.5em;
  text-align: center;
}

@media screen and (max-width: 650px) {
  header {
    font-size: 0.75em;
  }
}
</style>
