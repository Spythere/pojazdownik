export type Vehicle = ILocomotive | ICarWagon;
export type StockSectionMode = 'STOCK_LIST' | 'STOCK_GENERATOR';

export interface IStore {
  chosenCar: ICarWagon | null;
  chosenLoco: ILocomotive | null;
  chosenCargo: ICargo | null;

  chosenVehicle: Vehicle | null;

  showSupporter: boolean;
  imageLoading: boolean;

  chosenLocoPower: string;
  chosenCarUseType: string;

  stockList: IStock[];
  readyStockList: IReadyStockList;
  cargoOptions: any[][];

  chosenStockListIndex: number;
  chosenRealStockName?: string;

  swapVehicles: boolean;
  vehiclePreviewSrc: string;

  isRandomizerCardOpen: boolean;
  isRealStockListCardOpen: boolean;

  stockSectionMode: 'stock-list' | 'stock-generator';
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
  generator: {
    passenger: [];
    cargo: {
      [key: string]: string[];
    };
  };

  info: {
    [key in TStockInfoKey]: any[];
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
  useType: string;
  type: string;
  length: number;
  mass: number;
  maxSpeed: number;
  cargo?: { id: string; totalMass: number };
  isLoco: boolean;
  supportersOnly: boolean;
  count: number;
  imgSrc: string;
}

export interface IReadyStockList {
  [key: string]: { stockString: string; type: string; number: string; name: string };
}

