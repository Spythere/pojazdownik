export type Vehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

export interface IStore {
  chosenCar: ICarWagon | null;
  chosenLoco: ILocomotive | null;
  chosenCargo: ICargo | null;
  chosenVehicle: Vehicle | null;

  isColdStart: boolean;
  isDoubleManned: boolean;

  showSupporter: boolean;
  imageLoading: boolean;

  chosenLocoPower: string;
  chosenCarUseType: string;

  stockList: IStock[];
  readyStockList: IReadyStockItem[];
  cargoOptions: any[][];

  chosenStockListIndex: number;
  chosenRealStockName?: string;

  swapVehicles: boolean;
  vehiclePreviewSrc: string;

  isRandomizerCardOpen: boolean;
  isRealStockListCardOpen: boolean;

  stockSectionMode: 'stock-list' | 'stock-generator' | 'number-generator' | 'wiki-list';
  stockData?: IStockData;

  lastFocusedElement: HTMLElement | null;
}

export type TLocoGroup = 'loco-e' | 'loco-s' | 'loco-ezt' | 'loco-szt';
export type TCarWagonGroup = 'car-passenger' | 'car-cargo';

export interface IStockProps {
  type: string;
  length: number;
  mass: number;
  cargo?: string | null;
  coldStart?: boolean;
  doubleManned?: boolean;
}

export interface IStockData {
  version: string;

  generator: {
    passenger: any;
    cargo: {
      [key: string]: string[];
    };
  };

  info: {
    'car-cargo': [string, string, boolean, number | null, string][];
    'car-passenger': [string, string, boolean, number | null, string][];
    'loco-e': [string, string, string, string, number | null][];
    'loco-s': [string, string, string, string, number | null][];
    'loco-szt': [string, string, string, string, number | null][];
    'loco-ezt': [string, string, string, string, number | null][];
  };

  props: IStockProps[];
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

  mass: number;
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

  mass: number;
  length: number;
  cargoList: { id: string; totalMass: number }[];
}

export interface ICargo {
  id: string;
  totalMass: number;
}

export interface IStock {
  id: string;
  type: string;
  useType: string;
  constructionType: string;
  length: number;
  mass: number;
  maxSpeed: number;
  cargo?: { id: string; totalMass: number };
  isLoco: boolean;
  isSponsorsOnly: boolean;
  sponsorsOnlyTimestamp: number;
  count: number;
  imgSrc?: string;
}

export interface IReadyStockItem {
  stockId: string;
  stockString: string;
  type: string;
  number: string;
  name: string;
}
