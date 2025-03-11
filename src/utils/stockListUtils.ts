import { useStore } from '../store';

export const useStockListUtils = () => {
  const store = useStore();

  function removeStock(index: number) {
    if (index == -1) return;

    store.stockList = store.stockList.filter((stock, i) => i != index);

    if (store.stockList.length < index + 1) store.chosenStockListIndex = -1;
  }

  function moveUpStock(index: number) {
    if (index < 1) return;

    const tempStock = store.stockList[index];

    store.stockList[index] = store.stockList[index - 1];
    store.stockList[index - 1] = tempStock;

    store.chosenStockListIndex = index - 1;
  }

  function moveDownStock(index: number) {
    if (index == -1) return;
    if (index > store.stockList.length - 2) return;

    const tempStock = store.stockList[index];

    store.stockList[index] = store.stockList[index + 1];
    store.stockList[index + 1] = tempStock;

    store.chosenStockListIndex = index + 1;
  }

  return { removeStock, moveDownStock, moveUpStock };
};
