export type IVehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

export type TLocoGroup = 'loco-e' | 'loco-s' | 'loco-ezt' | 'loco-szt';
export type TCarWagonGroup = 'car-passenger' | 'car-cargo';

export interface IStockProps {
  type: string;
  length: number;
  // mass: number;
  weight: number;
  // cargo?: string | null;
  cargoTypes: ICargo[] | null;
  coldStart?: boolean;
  doubleManned?: boolean;
}

export interface ICargo {
  id: string;
  weight: number;
}

export interface IVehiclesAPI {
  version: string;

  generator: {
    cargo: {
      [key: string]: string[];
    };
  };

  vehicleInfo: {
    'car-cargo': [string, string, boolean, number | null, string][];
    'car-passenger': [string, string, boolean, number | null, string][];
    'loco-e': [string, string, string, string, number | null][];
    'loco-s': [string, string, string, string, number | null][];
    'loco-szt': [string, string, string, string, number | null][];
    'loco-ezt': [string, string, string, string, number | null][];
  };

  vehicleProps: IStockProps[];

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
  power: TLocoGroup;
  group: TLocoGroup;
  constructionType: string;
  cabinType: string;
  maxSpeed: number;
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
  imageSrc: string;
  weight: number;
  length: number;
  coldStart: boolean;
  doubleManned: boolean;
}

export interface ICarWagon {
  type: string;
  useType: TCarWagonGroup;
  group: TCarWagonGroup;
  constructionType: string;
  loadable: boolean;
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
  maxSpeed: number;
  imageSrc: string;
  weight: number;
  length: number;
  cargoTypes: ICargo[];
}

export interface IStock {
  id: string;
  type: string;
  useType: string;
  constructionType: string;
  length: number;
  // mass: number;
  weight: number;
  maxSpeed: number;
  cargo?: ICargo;
  isLoco: boolean;
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
  count: number;
  imgSrc?: string;
}

export interface IRealComposition {
  stockId: string;
  stockString: string;
  type: string;
  number: string;
  name: string;
}
