<template>
  <div>
    <keep-alive>
      <RealStockCard v-if="store.isRealStockListCardOpen" />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../store';
import RealStockCard from '../cards/RealStockCard.vue';

export default defineComponent({
  components: { RealStockCard },
  data() {
    return {
      store: useStore(),
    };
  },
});
</script>

<style scoped></style>
