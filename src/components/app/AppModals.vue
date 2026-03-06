<template>
  <div>
    <keep-alive>
      <RealStockCard v-if="store.isRealStockListCardOpen" />
    </keep-alive>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from '../../store';
import RealStockCard from '../cards/RealStockCard.vue';

const store = useStore();
</script>
