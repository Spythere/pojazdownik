export type IVehicle = ILocomotive | ICarWagon;

export type LocoGroupType = 'loco-electric' | 'loco-diesel' | 'unit-electric' | 'unit-diesel';
export type WagonGroupType = 'wagon-passenger' | 'wagon-freight';
export type VehicleGroupType = LocoGroupType | WagonGroupType;
export type RestrictionType = 'sponsorOnly' | 'teamOnly';

export interface IVehicleProps {
  type: string;
  speed: number;
  length: number;
  weight: number;
  cargoTypes?: ICargo[];
  coldStart?: boolean;
  doubleManned?: boolean;
}

export interface ICargo {
  id: string;
  weight: number;
}

export type IVehiclesAPIResponse = IVehicleData[];

export interface ILocomotive {
  type: string;
  group: LocoGroupType;
  constructionType: string;
  cabinType: string;
  maxSpeed: number;
  maxSpeedLoco: number;
  weight: number;
  length: number;
  coldStart: boolean;
  doubleManned: boolean;
  sponsorOnlyTimestamp: number;
  teamOnly: boolean;
  massSpeeds: VehicleGroupMassSpeeds | null;
}

export interface ICarWagon {
  type: string;
  group: WagonGroupType;
  constructionType: string;
  loadable: boolean;
  maxSpeed: number;
  maxSpeedLoaded: number;
  weight: number;
  length: number;
  cargoTypes: ICargo[];
  sponsorOnlyTimestamp: number;
  teamOnly: boolean;
  massSpeeds: VehicleGroupMassSpeeds | null;
}

export interface IStock {
  id: string;
  vehicleRef: IVehicle;
  cargo?: ICargo;
}

export interface IRealComposition {
  stockId: string;
  stockString: string;
  type: string;
  number: string;
  name: string;
}

export interface IVehicleData {
  id: number;
  name: string;
  type: string;
  cabinName: string | null;
  restrictions: IVehicleRestrictions | null;
  vehicleGroupsId: number;
  simulatorVersion: string;
  group: IVehicleGroup;
}

export interface IVehicleRestrictions {
  sponsorOnly: number | null;
  teamOnly: boolean | null;
}

export interface IVehicleGroup {
  id: number;
  name: string;
  speed: number;
  speedLoaded?: number;
  speedLoco?: number;
  length: number;
  weight: number;
  cargoTypes: IVehicleCargoType[] | null;
  locoProps: IVehicleLocoProps | null;
  massSpeeds: VehicleGroupMassSpeeds | null;
}

export interface IVehicleCargoType {
  id: string;
  weight: number;
}

export interface IVehicleLocoProps {
  coldStart: boolean;
  doubleManned: boolean;
}

export interface VehicleGroupMassSpeeds {
  passenger: Record<string, number> | null;
  cargo: Record<string, number> | null;
  none: number | null;
}

export interface StorageStockEntry {
  id: string;
  createdAt: number;
  updatedAt?: number;
  stockString: string;
}
