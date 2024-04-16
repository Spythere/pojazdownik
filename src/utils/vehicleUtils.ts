import {
  ICarWagon,
  ILocomotive,
  IStock,
  IVehiclesData,
  LocoGroupType,
  WagonGroupType,
} from '../types';
import {
  MassLimitLocoType,
  SpeedLimitLocoType,
  calculateMassLimit,
  calculateSpeedLimit,
} from './vehicleLimitsUtils';

export function isTractionUnit(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).cabinType !== undefined;
}

export function locoDataList(vehiclesData: IVehiclesData | undefined) {
  if (!vehiclesData) return [];

  return vehiclesData.vehicleList.reduce<ILocomotive[]>((acc, vehicleInfoArray) => {
    // check if data array has 5 elements (locos & units only)
    if (vehicleInfoArray.length != 5) return acc;

    const [type, constructionType, cabinType, group, restrictions] = vehicleInfoArray;
    const locoProps = vehiclesData.vehicleProps.find((prop) => constructionType == prop.type);

    if (!locoProps) {
      console.warn('Brak atrybutów dla pojazdu:', type);
      return acc;
    }

    acc.push({
      group: group as LocoGroupType,

      type,
      constructionType,
      cabinType,

      sponsorOnlyTimestamp: restrictions?.sponsorOnly ?? 0,
      teamOnly: restrictions?.teamOnly ?? false,

      maxSpeed: locoProps.speed,
      length: locoProps.length,
      weight: locoProps.weight,

      coldStart: locoProps.coldStart ?? false,
      doubleManned: locoProps.doubleManned ?? false,
    });

    return acc;
  }, []);
}

export function carDataList(vehiclesData: IVehiclesData | undefined) {
  if (!vehiclesData) return [];

  return vehiclesData.vehicleList.reduce<ICarWagon[]>((acc, vehicleInfoArray) => {
    // check if data array has 4 elements (wagons only)
    if (vehicleInfoArray.length != 4) return acc;

    const [type, constructionType, group, restrictions] = vehicleInfoArray;
    const wagonProps = vehiclesData.vehicleProps.find((prop) => constructionType == prop.type);

    if (!wagonProps) {
      console.warn('Brak atrybutów dla pojazdu:', type);
      return acc;
    }

    acc.push({
      group: group as WagonGroupType,
      type,
      constructionType,
      loadable: wagonProps.cargoTypes ? wagonProps.cargoTypes.length > 0 : false,
      cargoTypes: wagonProps?.cargoTypes ?? [],

      sponsorOnlyTimestamp: restrictions?.sponsorOnly ?? 0,
      teamOnly: restrictions?.teamOnly ?? false,

      maxSpeed: wagonProps.speed,
      weight: wagonProps?.weight || 0,
      length: wagonProps?.length || 0,
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
