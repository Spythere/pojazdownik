import { useStore } from '../store';
import { additionalCargoTypes } from '../utils/vehicleUtils';

export function getCurrentStockFileName() {
  const store = useStore();

  let fileName = '';

  if (store.chosenStorageStockName.trim() != '') {
    return store.chosenStorageStockName;
  }

  const currentStockString = store.stockList.map((s) => s.vehicleRef.type).join(';');

  const currentRealComp = store.realCompositionList.find((rc) => rc.stockString == currentStockString);

  // Append real composition to the name if chosen
  if (currentRealComp != undefined) {
    fileName += `${currentRealComp.stockId} `;
  }

  // Append default props
  fileName += `${store.stockList[0].vehicleRef.type} ${(store.totalWeight / 1000).toFixed(1)}t; ${store.totalLength}m; vmax ${store.maxStockSpeed}`;

  return fileName;
}

// UNUSED - PARSES ADDITIONAL CARGO FOR INTERMODALS
export function getStockStringOutput() {
  const store = useStore();

  const stockEntries = store.stockString.split(';');

  const parsedEntries = store.stockList.map((stockVehicle, i) => {
    if (stockVehicle.cargo && /412Z|627Z/.test(stockVehicle.vehicleRef.constructionType)) {
      const additionalCargo = additionalCargoTypes.find(
        (c) => c.groupType == stockVehicle.vehicleRef.constructionType && c.id == stockVehicle.cargo!.id
      );

      if (additionalCargo) {
        let cargoString = additionalCargo.cargoStringVariations[Math.floor(Math.random() * additionalCargo.cargoStringVariations.length)];

        return stockEntries[i].replace(stockVehicle.cargo.id, cargoString);
      }
    }

    return stockEntries[i];
  });

  return parsedEntries.join(';');
}
