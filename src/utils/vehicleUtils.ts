import { ICarWagon, ILocomotive, IStock, IVehicleData, LocoGroupType, WagonGroupType } from '../types/common.types';
import { MassLimitLocoType, calculateMassLimit, calculateSpeedLimit } from './vehicleLimitsUtils';

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
      maxSpeedLoco: data.group.speedLoco ?? data.group.speed,
      length: data.group.length,
      weight: data.group.weight,

      coldStart: data.group.locoProps?.coldStart ?? false,
      doubleManned: data.group.locoProps?.doubleManned ?? false,

      massSpeeds: data.group.massSpeeds,
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
      maxSpeedLoaded: data.group.speedLoaded ?? data.group.speed,

      length: data.group.length,
      weight: data.group.weight,

      massSpeeds: data.group.massSpeeds,
    });

    return acc;
  }, []);
}

export function totalWeight(stockList: IStock[]) {
  return stockList.reduce((acc, stock) => acc + (stock.vehicleRef.weight + (stock.cargo?.weight ?? 0)), 0);
}

export function totalLength(stockList: IStock[]) {
  return stockList.reduce((acc, stock) => acc + stock.vehicleRef.length, 0);
}

export function maxStockSpeed(stockList: IStock[]) {
  return calculateSpeedLimit(stockList, isTrainPassenger(stockList), totalWeight(stockList));
}

export function acceptableWeight(stockList: IStock[]) {
  if (stockList.length == 0 || !isTractionUnit(stockList[0].vehicleRef)) return 0;

  const activeLocomotiveType = stockList[0].vehicleRef.type.split('-')[0];

  const locoMassLimit = calculateMassLimit(activeLocomotiveType as MassLimitLocoType, isTrainPassenger(stockList));

  return locoMassLimit;
}

export function isTrainPassenger(stockList: IStock[]) {
  if (stockList.length == 0) return false;
  if (stockList.every((stock) => isTractionUnit(stock.vehicleRef))) return false;

  return stockList.filter((stock) => !isTractionUnit(stock.vehicleRef)).every((stock) => stock.vehicleRef.group === 'wagon-passenger');
}

export function stockSupportsColdStart(stockList: IStock[]) {
  return stockList.length == 1 && isTractionUnit(stockList[0].vehicleRef) && stockList[0].vehicleRef.coldStart;
}

export function stockSupportsDoubleManning(stockList: IStock[]) {
  return stockList.length != 0 && isTractionUnit(stockList[0].vehicleRef) && stockList[0].vehicleRef.doubleManned;
}
