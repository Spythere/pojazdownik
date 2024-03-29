import { defineComponent } from 'vue';
import { useStore } from '../store';

export default defineComponent({
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
  computed: {
    trainTooLong() {
      return (this.store.totalLength > 350 && this.store.isTrainPassenger) || (this.store.totalLength > 650 && !this.store.isTrainPassenger);
    },

    trainTooHeavy() {
      return this.store.acceptableWeight && this.store.totalWeight > this.store.acceptableWeight;
    },

    locoNotSuitable() {
      return (
        !this.store.isTrainPassenger &&
        this.store.stockList.length > 1 &&
        !this.store.stockList.every((stock) => stock.isLoco) &&
        this.store.stockList.some((stock) => stock.isLoco && stock.type.startsWith('EP'))
      );
    },

    tooManyLocomotives() {
      return (
        this.store.stockList.reduce((acc, stock) => {
          if (stock.isLoco) acc += stock.count;
          return acc;
        }, 0) > 2
      );
    },
  },
});
