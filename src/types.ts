export type Vehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

export interface IStore {
  chosenCar: ICarWagon | null;
  chosenLoco: ILocomotive | null;
  chosenCargo: ICargo | null;
  chosenVehicle: Vehicle | null;

  isColdStart: boolean;

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
}

export type TStockInfoKey = 'loco-e' | 'loco-s' | 'loco-ezt' | 'loco-szt' | 'car-passenger' | 'car-cargo';

export interface IStockProps {
  type: string;
  length: number;
  mass: number;
  cargo: string;
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
    'car-cargo': [string, string, boolean, boolean, string][];
    'car-passenger': [string, string, boolean, boolean, string][];
    'loco-e': [string, string, string, string, boolean][];
    'loco-s': [string, string, string, string, boolean][];
    'loco-szt': [string, string, string, string, boolean][];
    'loco-ezt': [string, string, string, string, boolean][];
  };

  props: IStockProps[];

  usage: { [key: string]: string };
}

export interface ILocomotive {
  type: string;
  power: string;
  constructionType: string;
  cabinType: string;
  maxSpeed: number;
  supportersOnly: boolean;
  imageSrc: string;

  mass: number;
  length: number;
}

export interface ICarWagon {
  //"203V_PKPC_Fll_01","203V",true,false,"100",img
  type: string;
  useType: 'car-passenger' | 'car-cargo';
  constructionType: string;
  loadable: boolean;
  supportersOnly: boolean;
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
  supportersOnly: boolean;
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

