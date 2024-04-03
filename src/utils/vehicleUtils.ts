import { EVehicleUseType } from '../enums/EVehicleUseType';
import { ICarWagon, ILocomotive, IStock, IVehiclesAPI, TCarWagonGroup, TLocoGroup } from '../types';
import {
  MassLimitLocoType,
  SpeedLimitLocoType,
  calculateMassLimit,
  calculateSpeedLimit,
} from './vehicleLimitsUtils';

export function isLocomotive(vehicle: ILocomotive | ICarWagon): vehicle is ILocomotive {
  return (vehicle as ILocomotive).power !== undefined;
}

export function locoDataList(vehiclesData: IVehiclesAPI | undefined) {
  if (!vehiclesData) return [];

  return Object.keys(vehiclesData.vehicleInfo).reduce((acc, vehiclePower) => {
    if (!vehiclePower.startsWith('loco')) return acc;

    const locoVehiclesData = vehiclesData.vehicleInfo[vehiclePower as TLocoGroup];

    locoVehiclesData.forEach((loco) => {
      // if (!loco[4]) return;

      const [type, constructionType, cabinType, maxSpeed, sponsorsTimestamp] = loco;
      const locoProps = vehiclesData.vehicleProps.find((prop) => constructionType == prop.type);

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

        length:
          locoProps?.length && type.startsWith('2EN')
            ? locoProps.length * 2
            : locoProps?.length ?? 0,
        weight: locoProps?.weight && type.startsWith('2EN') ? 253000 : locoProps?.weight ?? 0,

        coldStart: locoProps?.coldStart ?? false,
        doubleManned: locoProps?.doubleManned ?? false,
      });
    });

    return acc;
  }, [] as ILocomotive[]);
}

export function carDataList(vehiclesData: IVehiclesAPI | undefined) {
  if (!vehiclesData) return [];

  return Object.keys(vehiclesData.vehicleInfo).reduce((acc, vehicleUseType) => {
    if (!vehicleUseType.startsWith('car')) return acc;

    const carVehiclesData = vehiclesData.vehicleInfo[vehicleUseType as TCarWagonGroup];

    carVehiclesData.forEach((car) => {
      const [type, constructionType, loadable, sponsorsOnlyTimestamp, maxSpeed] = car;

      if (sponsorsOnlyTimestamp && Number(sponsorsOnlyTimestamp) <= Date.now()) return;

      const carPropsData = vehiclesData.vehicleProps.find((v) =>
        type.toString().startsWith(v.type)
      );

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
    .every((stock) => stock.useType === EVehicleUseType.CAR_PASSENGER);
}
