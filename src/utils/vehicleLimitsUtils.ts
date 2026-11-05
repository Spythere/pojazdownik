import massLimits from '../constants/massLimits.json';
import { type IStock } from '../types/common.types';

export type MassLimitLocoType = keyof typeof massLimits;

export function calculateSpeedLimit(stockList: IStock[], isPassenger: boolean, stockMass: number) {
  // Check the whole consist speed limit
  const stockMaxSpeed = stockList.reduce((acc, vehicle, i) => {
    let vehicleSpeed = vehicle.vehicleRef.maxSpeed;

    if (vehicle.vehicleRef.group == 'wagon-freight' && vehicle.cargo !== undefined && vehicle.vehicleRef.maxSpeedLoaded) {
      vehicleSpeed = vehicle.vehicleRef.maxSpeedLoaded;
    }

    return Math.min(vehicleSpeed, acc);
  }, Infinity);

  // Check the head vehicle speed limit
  const headVehicle = stockList[0];

  // Omit speed check for head vehicle if there's no data for it
  if (!headVehicle || !headVehicle.vehicleRef.massSpeeds) return stockMaxSpeed;

  const massSpeeds = headVehicle.vehicleRef.massSpeeds[stockList.length == 1 ? 'none' : isPassenger ? 'passenger' : 'cargo'];

  // Omit speed check if there's no data on mass speeds
  if (!massSpeeds) return stockMaxSpeed;

  // Number type for locomotives alone
  if (typeof massSpeeds === 'number') return massSpeeds;

  // Record type for passenger or cargo, find the closest range
   let largestMassKey: string | null = null;
  for (let massSpeedKey in massSpeeds) {
    if (stockMass >= Number(massSpeedKey)) largestMassKey = massSpeedKey;
  }

  const massMaxSpeed = largestMassKey ? massSpeeds[largestMassKey] : Infinity;
  console.log(largestMassKey, massMaxSpeed);

  return Math.min(massMaxSpeed, stockMaxSpeed);
}

export function calculateMassLimit(locoType: MassLimitLocoType, isTrainPassenger: boolean) {
  if (massLimits[locoType] === undefined) return 0;

  return massLimits[locoType][isTrainPassenger ? 0 : 1] || 0;
}
