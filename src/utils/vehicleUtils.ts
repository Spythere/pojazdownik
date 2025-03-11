import {
  ICarWagon,
  ILocomotive,
  IStock,
  IVehicleData,
  IVehiclesAPIResponse,
  LocoGroupType,
  WagonGroupType,
} from '../types/common.types';
import {
  MassLimitLocoType,
  SpeedLimitLocoType,
  calculateMassLimit,
  calculateSpeedLimit,
} from './vehicleLimitsUtils';

export function isTractionUnit(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).cabinType !== undefined;
}

export function locoDataList(vehiclesData: IVehicleData[] | undefined) {
  if (!vehiclesData) return [];

  return vehiclesData.reduce<ILocomotive[]>((acc, data) => {
    if (!data.cabinName) return acc;

    acc.push({
      group: data.type as LocoGroupType,
      type: data.name,

      constructionType: data.group.name,
      cabinType: data.cabinName,

      sponsorOnlyTimestamp: data.restrictions?.sponsorOnly ?? 0,
      teamOnly: data.restrictions?.teamOnly ?? false,

      maxSpeed: data.group.speed,
      length: data.group.length,
      weight: data.group.weight,

      coldStart: data.group.locoProps?.coldStart ?? false,
      doubleManned: data.group.locoProps?.doubleManned ?? false,
    });

    return acc;
  }, []);
}

export function carDataList(vehiclesData: IVehicleData[] | undefined) {
  if (!vehiclesData) return [];

  return vehiclesData.reduce<ICarWagon[]>((acc, data) => {
    if (data.cabinName !== null) return acc;

    acc.push({
      group: data.type as WagonGroupType,
      type: data.name,
      constructionType: data.group.name,
      loadable: data.group.cargoTypes !== null && data.group.cargoTypes.length > 0,
      cargoTypes: data.group?.cargoTypes ?? [],

      sponsorOnlyTimestamp: data.restrictions?.sponsorOnly ?? 0,
      teamOnly: data.restrictions?.teamOnly ?? false,

      maxSpeed: data.group.speed,
      length: data.group.length,
      weight: data.group.weight,
    });

    return acc;
  }, []);
}

export function totalWeight(stockList: IStock[]) {
  return stockList.reduce(
    (acc, stock) => acc + (stock.vehicleRef.weight + (stock.cargo?.weight ?? 0)),
    0
  );
}

export function totalLength(stockList: IStock[]) {
  return stockList.reduce((acc, stock) => acc + stock.vehicleRef.length, 0);
}

export function maxStockSpeed(stockList: IStock[]) {
  const stockSpeedLimit = stockList.reduce(
    (acc, stock) => (stock.vehicleRef.maxSpeed < acc || acc == 0 ? stock.vehicleRef.maxSpeed : acc),
    0
  );
  const headingLoco =
    stockList[0] && isTractionUnit(stockList[0].vehicleRef) ? stockList[0] : undefined;

  if (!headingLoco) return stockSpeedLimit;

  const locoType = headingLoco.vehicleRef.type.split('-')[0];

  if (/^(EN|2EN|SN)/.test(locoType)) return stockSpeedLimit;

  const speedLimitByMass = calculateSpeedLimit(
    locoType as SpeedLimitLocoType,
    totalWeight(stockList),
    stockList.length,
    isTrainPassenger(stockList)
  );

  return speedLimitByMass ? Math.min(stockSpeedLimit, speedLimitByMass) : stockSpeedLimit;
}

export function acceptableWeight(stockList: IStock[]) {
  if (stockList.length == 0 || !isTractionUnit(stockList[0].vehicleRef)) return 0;

  const activeLocomotiveType = stockList[0].vehicleRef.type.split('-')[0];

  const locoMassLimit = calculateMassLimit(
    activeLocomotiveType as MassLimitLocoType,
    isTrainPassenger(stockList)
  );

  return locoMassLimit;
}

export function isTrainPassenger(stockList: IStock[]) {
  if (stockList.length == 0) return false;
  if (stockList.every((stock) => isTractionUnit(stock.vehicleRef))) return false;

  return stockList
    .filter((stock) => !isTractionUnit(stock.vehicleRef))
    .every((stock) => stock.vehicleRef.group === 'wagon-passenger');
}

export function stockSupportsColdStart(stockList: IStock[]) {
  return (
    stockList.length == 1 &&
    isTractionUnit(stockList[0].vehicleRef) &&
    stockList[0].vehicleRef.coldStart
  );
}

export function stockSupportsDoubleManning(stockList: IStock[]) {
  return (
    stockList.length != 0 &&
    isTractionUnit(stockList[0].vehicleRef) &&
    stockList[0].vehicleRef.doubleManned
  );
}
