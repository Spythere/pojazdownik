export interface IStore {
  chosenCar: ICarWagon | null;
  chosenLoco: ILocomotive | null;
  chosenCargo: ICargo | null;

  showSupporter: boolean;
  imageLoading: boolean;

  chosenLocoPower: string;
  chosenCarUseType: string;

  stockList: IStock[];
  cargoOptions: any[][];

  chosenStockListIndex: number;
  chosenRealStockName: string | null;

  swapVehicles: boolean;
  vehiclePreviewSrc: string;
}

export interface IVehicleData {
  [key: string]: (string | boolean)[][];
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
  useType: string;
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