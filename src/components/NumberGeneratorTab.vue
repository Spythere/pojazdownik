<template>
  <div class="number-generator tab">
    <div class="tab_header">
      <h2>GENERATOR NUMERU POCIĄGU</h2>
      <button class="btn" @click="() => (store.stockSectionMode = 'stock-list')">POWRÓT DO LISTY &gt;</button>
    </div>

    <div class="tab_content">
      <div class="options">
        <select v-model="regionNumbers">
          <option :value="null" disabled>Obszar konstrukcyjny</option>
          <option v-for="(nums, name) in genData.regions" :value="nums">{{ name }}</option>
        </select>

        <select v-model="categoryRules">
          <option :value="null" disabled>Kategoria pociągu</option>
          <option v-for="(rules, category) in genData.categories" :value="rules">{{ category }}</option>
        </select>
      </div>

      <h1>Wygenerowany numer pociągu: {{ computedNumber }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, computed, ref } from 'vue';
import { useStore } from '../store';

import genData from '../constants/numberGeneratorData.json';

const store = useStore();

const regionNumbers = ref(null) as Ref<number[] | null>;
const categoryRules = ref(null) as Ref<string | null>;

const computedNumber = computed(() => {
  if (regionNumbers.value == null || categoryRules.value == null) return '';

  let trainNumber = '';
  const randRegionNumber = regionNumbers.value[Math.floor(Math.random() * regionNumbers.value.length)];

  trainNumber += randRegionNumber.toString();

  const rulesArray = categoryRules.value.split(';').map((r) => ({
    index: r.split(':')[0],
    rule: r.split(':')[1],
    nums: Number(r.split(':')[2] || '1'),
  }));

  rulesArray.forEach((r) => {
    const range = r.rule.split('-');

    if (range.length == 1) trainNumber += r.rule;
    else {
      const [minRange, maxRange] = range;
      const randRange = Math.floor(Math.random() * (Number(maxRange) - Number(minRange)) + Number(minRange)).toString();

      trainNumber += new Array(Math.abs(randRange.length - r.nums)).fill('0').join('') + randRange;
    }
  });

  return trainNumber;
});
</script>

<style lang="scss" scoped>
@import '../styles/tab.scss';

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;

  select {
    width: calc(50% - 1em);
  }
}
</style>

