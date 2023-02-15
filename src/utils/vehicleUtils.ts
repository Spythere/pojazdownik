import { EVehicleUseType } from '../enums/EVehicleUseType';
import { ICarWagon, ILocomotive, IStore, TStockInfoKey } from '../types';
import { LocoType, calculateSpeedLimit } from './speedLimitUtils';

export function isLocomotive(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).power !== undefined;
}

export function locoDataList(state: IStore) {
  if (!state.stockData) return [];

  const stockData = state.stockData;

  return Object.keys(stockData.info).reduce((acc, vehiclePower) => {
    if (!vehiclePower.startsWith('loco')) return acc;

    const locoVehiclesData = stockData.info[vehiclePower as 'loco-e' | 'loco-s' | 'loco-ezt' | 'loco-szt'];

    locoVehiclesData.forEach((loco) => {
      if (state.showSupporter && !loco[4]) return;

      const [type, constructionType, cabinType, maxSpeed, supportersOnly] = loco;
      const locoProps = stockData.props.find((prop) => constructionType == prop.type);

      acc.push({
        power: vehiclePower,
        type,
        constructionType,
        cabinType,
        maxSpeed: Number(maxSpeed),
        supportersOnly,
        imageSrc: '',

        length: locoProps?.length && type.startsWith('2EN') ? locoProps.length * 2 : locoProps?.length || 0,
        mass: locoProps?.mass && type.startsWith('2EN') ? 253 : locoProps?.mass || 0,
      });
    });

    return acc;
  }, [] as ILocomotive[]);
}

export function carDataList(state: IStore) {
  if (!state.stockData) return [];

  const stockData = state.stockData;

  return Object.keys(stockData.info).reduce((acc, vehicleUseType) => {
    if (!vehicleUseType.startsWith('car')) return acc;

    const carVehiclesData = stockData.info[vehicleUseType as 'car-passenger' | 'car-cargo'];

    carVehiclesData.forEach((car) => {
      if (state.showSupporter && !car[3]) return;

      const carPropsData = stockData.props.find((v) => car[0].toString().startsWith(v.type));

      acc.push({
        useType: vehicleUseType as 'car-passenger' | 'car-cargo',
        type: car[0],
        constructionType: car[1],
        loadable: car[2],
        supportersOnly: car[3],
        maxSpeed: Number(car[4]),
        imageSrc: '',
        cargoList:
          !carPropsData || carPropsData.cargo === null
            ? []
            : carPropsData.cargo.split(';').map((cargo) => ({
                id: cargo.split(':')[0],
                totalMass: Number(cargo.split(':')[1]),
              })),

        mass: carPropsData?.mass || 0,
        length: carPropsData?.length || 0,
      });
    });

    return acc;
  }, [] as ICarWagon[]);
}

export function totalMass(state: IStore) {
  return state.stockList.reduce(
    (acc, stock) => acc + (stock.cargo ? stock.cargo.totalMass : stock.mass) * stock.count,
    0
  );
}

export function totalLength(state: IStore) {
  return state.stockList.reduce((acc, stock) => acc + stock.length * stock.count, 0);
}

export function maxStockSpeed(state: IStore) {
  const stockSpeedLimit = state.stockList.reduce(
    (acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc),
    0
  );
  const headingLoco = state.stockList[0]?.isLoco ? state.stockList[0] : undefined;

  if (!headingLoco) return stockSpeedLimit;

  const locoType = headingLoco.type.split('-')[0];

  if (/^(EN|2EN|SN)/.test(locoType)) return stockSpeedLimit;

  const stockMass = totalMass(state);

  const speedLimitByMass = calculateSpeedLimit(locoType as LocoType, stockMass, isTrainPassenger(state));

  return speedLimitByMass ? Math.min(stockSpeedLimit, speedLimitByMass) : stockSpeedLimit;
}

export function isTrainPassenger(state: IStore) {
  if (state.stockList.length == 0) return false;
  if (state.stockList.every((stock) => stock.isLoco)) return false;

  return state.stockList
    .filter((stock) => !stock.isLoco)
    .every((stock) => stock.useType === EVehicleUseType.CAR_PASSENGER);
}

export function chosenRealStock(state: IStore) {
  const currentStockString = state.stockList
    .reduce((acc, stock) => {
      for (let i = 0; i < stock.count; i++) acc.push(stock.type);
      return acc;
    }, [] as string[])
    .join(';');

  const realStockObj = Object.values(state.readyStockList).find(
    (readyStock) => readyStock.stockString == currentStockString
  );

  state.chosenRealStockName = realStockObj
    ? `${realStockObj.type} ${realStockObj.number} ${realStockObj.name}`
    : undefined;

  return realStockObj;
}

// export function maxAllowedSpeed(state: IStore) {
//   const headLocoType = state.stockList[0]?.isLoco ? state.stockList[0].type : undefined;

//   if (!headLocoType) return 0;

//   const isPassenger = isTrainPassenger(state);
//   const stockMass = totalMass(state);

//   // const maxSpeed = maxAllowedSpeedTable[headLocoType];

//   // if()
// }

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

