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

export interface IVehiclesAPI {
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
  restrictions: Record<RestrictionType, any>;
  weight: number;
  length: number;
  coldStart: boolean;
  doubleManned: boolean;
}

export interface ICarWagon {
  type: string;
  group: WagonGroupType;
  constructionType: string;
  loadable: boolean;
  restrictions: Record<RestrictionType, any>;
  maxSpeed: number;
  weight: number;
  length: number;
  cargoTypes: ICargo[];
}

export interface IStock {
  id: string;
  type: string;
  group: LocoGroupType | WagonGroupType;
  constructionType: string;
  length: number;
  weight: number;
  maxSpeed: number;
  cargo?: ICargo;
  isLoco: boolean;
  restrictions: Record<RestrictionType, any>;
  count: number;
}

export interface IRealComposition {
  stockId: string;
  stockString: string;
  type: string;
  number: string;
  name: string;
}
