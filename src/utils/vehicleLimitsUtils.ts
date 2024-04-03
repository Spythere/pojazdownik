import speedLimits from '../constants/speedLimits.json';
import massLimits from '../constants/massLimits.json';

export type SpeedLimitLocoType = keyof typeof speedLimits;
export type MassLimitLocoType = keyof typeof massLimits;

export function calculateSpeedLimit(
  locoType: SpeedLimitLocoType,
  stockTotalWeight: number,
  stockCount: number,
  isTrainPassenger: boolean
) {
  if (speedLimits[locoType] === undefined) return 0;

  if (stockCount == 1) return speedLimits[locoType]['none'];

  const stockType = isTrainPassenger ? 'passenger' : 'cargo';
  const speedTable = speedLimits[locoType][stockType];

  if (!speedTable) return undefined;

  let speedLimit = 0;
  for (const mass in speedTable)
    if (stockTotalWeight > Number(mass)) speedLimit = (speedTable as any)[mass];

  return speedLimit;
}

export function calculateMassLimit(locoType: MassLimitLocoType, isTrainPassenger: boolean) {
  if (massLimits[locoType] === undefined) return 0;

  return massLimits[locoType][isTrainPassenger ? 0 : 1] || 0;
}
