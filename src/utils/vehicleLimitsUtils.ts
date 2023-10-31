import speedLimits from '../constants/speedLimits.json';
import massLimits from '../constants/massLimits.json';

export type SpeedLimitLocoType = keyof typeof speedLimits;
export type MassLimitLocoType = keyof typeof massLimits;

export function calculateSpeedLimit(locoType: SpeedLimitLocoType, stockMass: number, isTrainPassenger: boolean) {
  const speedTable = speedLimits[locoType][isTrainPassenger ? 'passenger' : 'cargo'];

  if (!speedTable) return undefined;

  let speedLimit = 0;
  for (const mass in speedTable) if (stockMass > Number(mass)) speedLimit = (speedTable as any)[mass];

  return speedLimit;
}

export function calculateMassLimit(locoType: MassLimitLocoType, isTrainPassenger: boolean) {
  if(massLimits[locoType] === undefined) return 0;
  
  return massLimits[locoType][isTrainPassenger ? 0 : 1] || 0;
}
