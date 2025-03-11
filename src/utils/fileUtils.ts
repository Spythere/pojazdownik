import { useStore } from '../store';

export const useFileUtils = () => {
  const store = useStore();

  function getCurrentStockFileName() {
    let fileName = '';

    const currentStockString = store.stockList.map((s) => s.vehicleRef.type).join(';');

    const currentRealComp = store.realCompositionList.find(
      (rc) => rc.stockString == currentStockString
    );

    // Append real composition to the name if chosen
    if (currentRealComp != undefined) {
      fileName += `${currentRealComp.stockId} `;
    }

    // Append default props
    fileName += `${store.stockList[0].vehicleRef.type} ${(store.totalWeight / 1000).toFixed(1)}t; ${store.totalLength}m; vmax ${store.maxStockSpeed}`;

    return fileName;
  }

  return { getCurrentStockFileName };
};
