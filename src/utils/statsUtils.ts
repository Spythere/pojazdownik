import { EVehicleUseType } from "../enums/EVehicleUseType";
import { IStock } from "../types";

export const verifyTrainSpec = (stockList: IStock[], vehicleMass: number, vehicleUseType: string) => {
    const hasHeadLoco = stockList.length > 0
        && (stockList[0].useType == EVehicleUseType.LOCO_ELECTRICAL
            || stockList[0].useType == EVehicleUseType.LOCO_DIESEL);

    if (!hasHeadLoco) return;

    const headLoco = stockList[0];
    const carList = stockList.filter(stock => !stock.isLoco);



    const isTrainPassenger = carList.length != 0
        ? carList.every(stock => stock.useType == EVehicleUseType.CAR_PASSENGER)
        && vehicleUseType == EVehicleUseType.CAR_PASSENGER
        : false;


}