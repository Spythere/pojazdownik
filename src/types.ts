export type IVehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

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

export interface IVehiclesData {
  simulatorVersion: string;

  generator: {
    cargo: {
      [key: string]: string[];
    };
  };

  vehicleList: any[][];

  vehicleProps: IVehicleProps[];

  vehicleLocales: {
    pl: {
      cargo: Record<string, string>;
      usage: Record<string, string>;
    };
    en: {
      cargo: Record<string, string>;
      usage: Record<string, string>;
    };
  };

  realCompositions: Record<string, string>;
}

export interface ILocomotive {
  type: string;
  group: LocoGroupType;
  constructionType: string;
  cabinType: string;
  maxSpeed: number;
  weight: number;
  length: number;
  coldStart: boolean;
  doubleManned: boolean;
  sponsorOnlyTimestamp: number;
  teamOnly: boolean;
}

export interface ICarWagon {
  type: string;
  group: WagonGroupType;
  constructionType: string;
  loadable: boolean;
  maxSpeed: number;
  weight: number;
  length: number;
  cargoTypes: ICargo[];
  sponsorOnlyTimestamp: number;
  teamOnly: boolean;
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
