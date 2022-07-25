import { computed } from "vue";
import { EVehicleUseType } from "../enums/EVehicleUseType";
import { ICarWagon, ILocomotive, IStore, IVehicleData } from "../types";

import vehicleDataJSON from '../data/vehicleData.json';
import vehiclePropsJSON from '../data/vehicleProps.json';

export function isLocomotive(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).power !== undefined;
}

export function locoDataList(state: IStore) {
    return Object.keys(vehicleDataJSON).reduce((acc, vehicleTypeKey) => {
    if (!vehicleTypeKey.startsWith('loco')) return acc;

    const locoVehiclesData = (vehicleDataJSON as IVehicleData)[vehicleTypeKey];

    locoVehiclesData.forEach((loco) => {
      if (state.showSupporter && !loco[4]) return;

      const locoType = loco[0] as string;

      let length = 0,
        mass = 0;

      // Elektrowozy
      if (vehicleTypeKey.startsWith('loco-e')) {
        // 32m dla ET41, reszta 16
        length = locoType.startsWith('ET') ? 32 : 16;

        // 80t dla wszystkich EU06, EP08
        mass = 80;

        // 83t dla: EU07 o nr większych niż 300 & dla wszystkich EP07 oprócz nr 135,242,1002,1048
        const locoNumber = Number(locoType.split('-')[1]);

        if (
          (locoType.startsWith('EU') && locoNumber > 300) ||
          (locoType.startsWith('EP') && ![242, 135, 1002, 1048].includes(locoNumber))
        ) {
          mass = 83;
        }
      }

      // Spalinowozy
      if (vehicleTypeKey.startsWith('loco-s')) {
        length = 14;
        mass = 74;
      }

      // EZT
      if (vehicleTypeKey.startsWith('loco-ezt')) {
        // EN57
        length = 65;
        mass = 126;

        // EN71
        if (locoType.startsWith('EN71')) {
          length = 86;
          mass = 182;
        }

        // 2xEN57
        if (locoType.startsWith('2EN57')) {
          length = 130;
          mass = 253;
        }
      }

      // SZT
      if (vehicleTypeKey.startsWith('loco-szt')) {
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
  }, [] as ILocomotive[])
}

export function carDataList(state: IStore) {
    return Object.keys(vehicleDataJSON).reduce((acc, vehicleTypeKey) => {
    if (!vehicleTypeKey.startsWith('car')) return acc;

    const carVehiclesData = (vehicleDataJSON as IVehicleData)[vehicleTypeKey];

    carVehiclesData.forEach((car) => {
      if (state.showSupporter && !car[3]) return;

      const carPropsData = vehiclePropsJSON.find((v) => car[0].toString().includes(v.type));

      acc.push({
        useType: vehicleTypeKey,
        type: car[0] as string,
        constructionType: car[1] as string,
        loadable: car[2] as boolean,
        supportersOnly: car[3] as boolean,
        maxSpeed: Number(car[4] as string),
        imageSrc: car[5] as string,
        cargoList: carPropsData?.cargo.includes(';')
          ? carPropsData.cargo.split(';').map((cargo) => ({
              id: cargo.split(':')[0],
              totalMass: Number(cargo.split(':')[1]),
            }))
          : [],
        mass: carPropsData?.mass || 0,
        length: carPropsData?.length || 0,
      });
    });

    return acc;
  }, [] as ICarWagon[])
}

export function totalMass(state: IStore) {
  return state.stockList.reduce(
    (acc, stock) => acc + (stock.cargo ? stock.cargo.totalMass : stock.mass) * stock.count,
    0
  );
};

export function totalLength(state: IStore) {
  return state.stockList.reduce((acc, stock) => acc + stock.length * stock.count, 0);
};

export function maxStockSpeed(state: IStore) {
  return state.stockList.reduce((acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc), 0);
};

export function isTrainPassenger(state: IStore) {
  if (state.stockList.length == 0) return false;
  if (state.stockList.every((stock) => stock.isLoco)) return false;

  return state.stockList
    .filter((stock) => !stock.isLoco)
    .every((stock) => stock.useType === EVehicleUseType.CAR_PASSENGER);
};

// export function maxAllowedSpeed(state: IStore) {
//   if (state.stockList.length < 1) return -1;
//   if (!state.stockList[0].isLoco) return -1;

//   const headingLoco = state.stockList[0];
//   const isPassenger = isTrainPassenger(state);

//   if (headingLoco.type.startsWith('EU07')) {
//     if (isPassenger && totalMass.value <= 650) return 125;
//     if (!isPassenger && totalMass.value <= 2000) return 70;

//     return -1;
//   }

//   if (headingLoco.type.startsWith('EP07')) {
//     if (isPassenger && totalMass.value <= 650) return 125;
//     if (!isPassenger) return -1;

//     return -1;
//   }

//   if (headingLoco.type.startsWith('EP08')) {
//     if (isPassenger && totalMass.value <= 650) return 140;
//     if (!isPassenger) return -1;

//     return -1;
//   }

//   if (headingLoco.type.startsWith('ET41')) {
//     if (isPassenger && totalMass.value <= 700) return 125;
//     if (!isPassenger && totalMass.value <= 4000) return 70;

//     return -1;
//   }

//   if (headingLoco.type.startsWith('SM42')) {
//     if (totalMass.value <= 95) return 90;
//     if (totalMass.value <= 200) return 80;
//     if (totalMass.value <= 300) return 70;
//     if (totalMass.value <= 450) return 60;
//     if (totalMass.value <= 750) return 50;
//     if (totalMass.value <= 1130) return 40;
//     if (totalMass.value <= 1720) return 30;
//     if (totalMass.value <= 2400) return 20;

//     return -1;
//   }

//   return Store.stockList.reduce((acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc), 0);
// });

// export const warnings = {
//   trainTooLong: computed(() => {
//     if (isTrainPassenger.value && totalLength.value > 350) return true;
//     if (!isTrainPassenger.value && totalLength.value > 650) return true;

//     return false;
//   }),

//   locoNotSuitable: computed(() => {
//     if (
//       !isTrainPassenger.value &&
//       Store.stockList.length > 1 &&
//       !Store.stockList.every((stock) => stock.isLoco) &&
//       Store.stockList.find((stock) => stock.isLoco && stock.type.startsWith('EP'))
//     )
//       return true;

//     return false;
//   }),

//   trainTooHeavy: computed(() => {
//     if (Store.stockList.length == 0 || !Store.stockList[0].isLoco) return false;

//     const headingLoco = Store.stockList[0];

//     if (
//       isTrainPassenger.value &&
//       (headingLoco.type.startsWith('EU') || headingLoco.type.startsWith('EP')) &&
//       totalMass.value > 650
//     )
//       return true;
//     if (isTrainPassenger.value && headingLoco.type.startsWith('ET') && totalMass.value > 700) return true;

//     if (!isTrainPassenger.value && headingLoco.type.startsWith('EU') && totalMass.value > 2000) return true;
//     if (!isTrainPassenger.value && headingLoco.type.startsWith('ET') && totalMass.value > 4000) return true;

//     if (headingLoco.type.startsWith('SM') && totalMass.value > 2400) return true;

//     return false;
//   }),

//   tooManyLocos: computed(() => {
//     if (
//       Store.stockList.reduce((acc, stock) => {
//         if (!stock.isLoco) return acc;

//         acc += stock.count;

//         return acc;
//       }, 0) > 2
//     )
//       return true;

//     return false;
//   }),
// };

