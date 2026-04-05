import { IVehicleRestrictions } from './common.types';

// API namespace
export namespace API {
  export namespace VehiclesData {
    export interface VehicleObject {
      id: number;
      name: string;
      type: string;
      cabinName: string | null;
      restrictions: IVehicleRestrictions | null;

      vehicleGroupsId: number;
    }

    export interface VehicleGroupObject {
      id: number;
      name: string;
      speed: number;
      speedLoaded?: number;
      speedLoco?: number;
      length: number;
      weight: number;
      cargoTypes: VehicleCargo[] | null;

      locoProps: {
        coldStart: boolean;
        doubleManned: boolean;
      } | null;

      massSpeeds: VehicleGroupMassSpeeds | null;
    }

    export interface VehicleGroupMassSpeeds {
      passenger: Record<string, number> | null;
      cargo: Record<string, number> | null;
      none: number | null;
    }

    export interface VehicleCargo {
      id: string;
      weight: number;
    }

    export interface Data {
      vehicles: VehicleObject[];
      vehicleGroups: VehicleGroupObject[];
    }

    export type Response = Data;
  }
}
