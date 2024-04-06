export type IVehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

export type LocoGroupType = 'loco-electric' | 'loco-diesel' | 'unit-electric' | 'unit-diesel';
export type WagonGroupType = 'wagon-passenger' | 'wagon-freight';
export type VehicleGroupType = LocoGroupType & WagonGroupType;

export interface IVehicleProps {
  type: string;
  speed: number;
  length: number;
  weight: number;
  cargoTypes?: ICargo[];
  coldStart?: boolean;
  doubleManned?: boolean;
  supporterTimestamp?: number;
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

  vehicleList: string[][];

  // vehiclesList: {
  //   'loco-electric': string[][];
  //   'loco-diesel': string[][];
  //   'unit-electric': string[][];
  //   'unit-diesel': string[][];
  //   'wagon-passenger': string[][];
  //   'wagon-freight': string[][];
  // };

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
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
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
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
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
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
  count: number;
}

export interface IRealComposition {
  stockId: string;
  stockString: string;
  type: string;
  number: string;
  name: string;
}
