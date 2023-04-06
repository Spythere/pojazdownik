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
  return ~~state.stockList.reduce(
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

export function acceptableMass(state: IStore) {
  if (state.stockList.length == 0 || !state.stockList[0].isLoco) return 0;
  const activeLocomotiveType = state.stockList[0].type;

  if (/^SM/.test(activeLocomotiveType)) return 2400;

  // Elektryczne EU07 / EP07 / EP08 / ET41

  // Pasażerski elektr.
  if (isTrainPassenger(state)) {
    if (/^(EU|EP)/.test(activeLocomotiveType)) return 650;
    if (/^ET/.test(activeLocomotiveType)) return 700;

    return 0;
  }

  // Towarowy / inny elektr.
  if (/^EU/.test(activeLocomotiveType)) return 2000;
  if (/^ET/.test(activeLocomotiveType)) return 4000;
  if (/^EP/.test(activeLocomotiveType)) return 650;

  return 0;
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

  const realStockObj = state.readyStockList.find((readyStock) => readyStock.stockString == currentStockString);

  state.chosenRealStockName = realStockObj
    ? `${realStockObj.type} ${realStockObj.number} ${realStockObj.name}`
    : undefined;

  return realStockObj;
}

