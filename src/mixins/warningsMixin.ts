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
      return (
        (this.store.totalLength > 350 && this.store.isTrainPassenger) ||
        (this.store.totalLength > 650 && !this.store.isTrainPassenger)
      );
    },

    trainTooHeavy() {
      const totalMass = this.store.totalMass;
      const isTrainPassenger = this.store.isTrainPassenger;
      const stockList = this.store.stockList;

      if (stockList.length == 0 || !stockList[0].isLoco) return false;

      const activeLocomotiveType = stockList[0].type;

      // Spalinowy SM
      if (/^SM/.test(activeLocomotiveType) && totalMass > 2400) return true;

      // Elektryczne EU07 / EP07 / EP08 / ET41

      // Pasażerski elektr.
      if (isTrainPassenger) {
        if (/^(EU|EP)/.test(activeLocomotiveType) && totalMass > 650) return true;
        if (/^ET/.test(activeLocomotiveType) && totalMass > 700) return true;

        return false;
      }

      // Towarowy / inny elektr.
      if (/^EU/.test(activeLocomotiveType) && totalMass > 2000) return true;
      if (/^ET/.test(activeLocomotiveType) && totalMass > 4000) return true;

      return false;
    },

    locoNotSuitable() {
      return (
        !this.store.isTrainPassenger &&
        this.store.stockList.length > 1 &&
        !this.store.stockList.every((stock) => stock.isLoco) &&
        this.store.stockList.find((stock) => stock.isLoco && stock.type.startsWith('EP'))
      );
    },

    tooManyLocomotives() {
      return this.store.stockList.reduce((acc, stock) => {
        if (stock.isLoco) acc += stock.count;
        return acc;
      }, 0) > 2;
    },
  },
});
