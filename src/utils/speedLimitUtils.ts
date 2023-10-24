import speedLimitTable from "../constants/speedLimits.json";
export type LocoType = keyof typeof speedLimitTable;

export const calculateSpeedLimit = (
  locoType: LocoType,
  stockMass: number,
  isTrainPassenger: boolean,
) => {
  const speedTable =
    speedLimitTable[locoType][isTrainPassenger ? "passenger" : "cargo"];

  if (!speedTable) return undefined;

  let speedLimit = 0;
  for (const mass in speedTable)
    if (stockMass > Number(mass)) speedLimit = (speedTable as any)[mass];

  return speedLimit;
};
