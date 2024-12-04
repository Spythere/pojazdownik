// API namespace
export namespace API {
  export interface ActiveData {
    trains: Train[];
    activeSceneries: ActiveScenery[];
  }
}

export interface ActiveScenery {
  dispatcherId: number;
  dispatcherName: string;
  dispatcherIsSupporter: boolean;
  stationName: string;
  stationHash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawn: number;
  lastSeen: number;
  dispatcherExp: number;
  nameFromHeader: string;
  spawnString?: string;
  networkConnectionString: string;
  isOnline: number;
  dispatcherRate: number;
  dispatcherStatus: number;
}

export interface Train {
  id: string;
  trainNo: number;
  mass: number;
  speed: number;
  length: number;
  distance: number;
  stockString: string;
  driverName: string;
  driverId: number;
  driverIsSupporter: boolean;
  driverLevel: number;
  currentStationHash: string;
  currentStationName: string;
  signal: string;
  connectedTrack: string;
  online: number;
  lastSeen: number;
  region: string;
  isTimeout: boolean;
  timetable?: Timetable;
}

export interface Timetable {
  SKR: boolean;
  TWR: boolean;
  hasDangerousCargo: boolean;
  hasExtraDeliveries: boolean;
  warningNotes: string;
  category: string;
  stopList: TimetableStop[];
  route: string;
  timetableId: number;
  sceneries: string[];
  path: string;
}

export interface TimetableStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  pointId: string;
  comments?: (null | string)[];
  mainStop: boolean;
  arrivalLine?: string;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;
  departureLine?: string;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;
  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: number;
  stopped: number;
  stopTime?: number;
}
