import { EVehicleUseType } from '../enums/EVehicleUseType';
import { ICarWagon, ILocomotive, IStore, TCarWagonGroup, TLocoGroup } from '../types';
import { MassLimitLocoType, SpeedLimitLocoType, calculateMassLimit, calculateSpeedLimit } from './vehicleLimitsUtils';

export function isLocomotive(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).power !== undefined;
}

export function locoDataList(state: IStore) {
  if (!state.stockData) return [];

  const stockData = state.stockData;

  return Object.keys(stockData.info).reduce((acc, vehiclePower) => {
    if (!vehiclePower.startsWith('loco')) return acc;

    const locoVehiclesData = stockData.info[vehiclePower as TLocoGroup];

    locoVehiclesData.forEach((loco) => {
      if (state.showSupporter && !loco[4]) return;

      const [type, constructionType, cabinType, maxSpeed, sponsorsTimestamp] = loco;
      const locoProps = stockData.props.find((prop) => constructionType == prop.type);

      acc.push({
        power: vehiclePower as TLocoGroup,
        group: vehiclePower as TLocoGroup,
        type,
        constructionType,
        cabinType,
        maxSpeed: Number(maxSpeed),
        isSponsorsOnly: Number(sponsorsTimestamp) > Date.now(),
        sponsorsOnlyTimestamp: Number(sponsorsTimestamp),
        imageSrc: '',

        length: locoProps?.length && type.startsWith('2EN') ? locoProps.length * 2 : locoProps?.length ?? 0,
        weight: locoProps?.weight && type.startsWith('2EN') ? 253000 : locoProps?.weight ?? 0,

        coldStart: locoProps?.coldStart ?? false,
        doubleManned: locoProps?.doubleManned ?? false,
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

    const carVehiclesData = stockData.info[vehicleUseType as TCarWagonGroup];

    carVehiclesData.forEach((car) => {
      const [type, constructionType, loadable, sponsorsOnlyTimestamp, maxSpeed] = car;

      if (state.showSupporter && Number(sponsorsOnlyTimestamp) <= Date.now()) return;

      const carPropsData = stockData.props.find((v) => type.toString().startsWith(v.type));

      acc.push({
        useType: vehicleUseType as TCarWagonGroup,
        group: vehicleUseType as TCarWagonGroup,
        type,
        constructionType,
        loadable,
        isSponsorsOnly: Number(sponsorsOnlyTimestamp) > Date.now(),
        sponsorsOnlyTimestamp: Number(sponsorsOnlyTimestamp),
        maxSpeed: Number(maxSpeed),
        imageSrc: '',
        cargoTypes: carPropsData?.cargoTypes ?? [],

        weight: carPropsData?.weight || 0,
        length: carPropsData?.length || 0,
      });
    });

    return acc;
  }, [] as ICarWagon[]);
}

export function totalWeight(state: IStore) {
  return state.stockList.reduce((acc, stock) => acc + (stock.weight + (stock.cargo?.weight ?? 0)) * stock.count, 0);
}

export function totalLength(state: IStore) {
  return state.stockList.reduce((acc, stock) => acc + stock.length * stock.count, 0);
}

export function maxStockSpeed(state: IStore) {
  const stockSpeedLimit = state.stockList.reduce((acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc), 0);
  const headingLoco = state.stockList[0]?.isLoco ? state.stockList[0] : undefined;

  if (!headingLoco) return stockSpeedLimit;

  const locoType = headingLoco.type.split('-')[0];

  if (/^(EN|2EN|SN)/.test(locoType)) return stockSpeedLimit;

  const speedLimitByMass = calculateSpeedLimit(locoType as SpeedLimitLocoType, totalWeight(state), state.stockList.length, isTrainPassenger(state));

  return speedLimitByMass ? Math.min(stockSpeedLimit, speedLimitByMass) : stockSpeedLimit;
}

export function acceptableMass(state: IStore) {
  if (state.stockList.length == 0 || !state.stockList[0].isLoco) return 0;

  const activeLocomotiveType = state.stockList[0].type.split('-')[0];

  const locoMassLimit = calculateMassLimit(activeLocomotiveType as MassLimitLocoType, isTrainPassenger(state));

  return locoMassLimit;
}

export function isTrainPassenger(state: IStore) {
  if (state.stockList.length == 0) return false;
  if (state.stockList.every((stock) => stock.isLoco)) return false;

  return state.stockList.filter((stock) => !stock.isLoco).every((stock) => stock.useType === EVehicleUseType.CAR_PASSENGER);
}

export function chosenRealStock(state: IStore) {
  const currentStockString = state.stockList
    .reduce((acc, stock) => {
      for (let i = 0; i < stock.count; i++) acc.push(stock.type);
      return acc;
    }, [] as string[])
    .join(';');

  const realStockObj = state.readyStockList.find((readyStock) => readyStock.stockString == currentStockString);

  state.chosenRealStockName = realStockObj?.stockId ?? undefined;

  return realStockObj;
}
