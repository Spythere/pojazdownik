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

      restrictions: restrictions ?? {},

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

  console.log(vehiclesData);

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

      restrictions: restrictions ?? {},

      maxSpeed: wagonProps.speed,
      weight: wagonProps?.weight || 0,
      length: wagonProps?.length || 0,
    });

    return acc;
  }, []);
}

export function totalWeight(stockList: IStock[]) {
  return stockList.reduce(
    (acc, stock) => acc + (stock.weight + (stock.cargo?.weight ?? 0)) * stock.count,
    0
  );
}

export function totalLength(stockList: IStock[]) {
  return stockList.reduce((acc, stock) => acc + stock.length * stock.count, 0);
}

export function maxStockSpeed(stockList: IStock[]) {
  const stockSpeedLimit = stockList.reduce(
    (acc, stock) => (stock.maxSpeed < acc || acc == 0 ? stock.maxSpeed : acc),
    0
  );
  const headingLoco = stockList[0]?.isLoco ? stockList[0] : undefined;

  if (!headingLoco) return stockSpeedLimit;

  const locoType = headingLoco.type.split('-')[0];

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
  if (stockList.length == 0 || !stockList[0].isLoco) return 0;

  const activeLocomotiveType = stockList[0].type.split('-')[0];

  const locoMassLimit = calculateMassLimit(
    activeLocomotiveType as MassLimitLocoType,
    isTrainPassenger(stockList)
  );

  return locoMassLimit;
}

export function isTrainPassenger(stockList: IStock[]) {
  if (stockList.length == 0) return false;
  if (stockList.every((stock) => stock.isLoco)) return false;

  return stockList
    .filter((stock) => !stock.isLoco)
    .every((stock) => stock.group === 'wagon-passenger');
}
