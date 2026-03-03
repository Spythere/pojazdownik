<template>
  <div>
    <keep-alive>
      <RealStockCard v-if="store.isRealStockListCardOpen" />
    </keep-alive>

    <MigrationInfoCard v-if="store.isMigrationCardOpen" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from '../../store';
import RealStockCard from '../cards/RealStockCard.vue';
import MigrationInfoCard from '../cards/MigrationInfoCard.vue';

const store = useStore();
</script>
