<template>
  <div class="number-generator tab">
    <div class="tab_header">
      <h2>GENERATOR NUMERU POCIĄGU</h2>
    </div>

    <div class="tab_content">
      <div class="options">
        <select v-model="beginRegionName" @change="randomizeTrainNumber">
          <option :value="null" disabled>Początkowy obszar konstrukcyjny</option>
          <option v-for="(_, name) in genData.regionNumbers" :value="name">{{ name }}</option>
        </select>

        <select v-model="endRegionName" @change="randomizeTrainNumber">
          <option :value="null" disabled>Końcowy obszar konstrukcyjny</option>
          <option v-for="(_, name) in genData.regionNumbers" :value="name">{{ name }}</option>
        </select>

        <select v-model="categoryRules" @change="randomizeTrainNumber">
          <option :value="null" disabled>Kategoria pociągu</option>
          <option v-for="(rules, category) in genData.categories" :value="rules">{{ category }}</option>
        </select>
      </div>

      <div class="generated-number">
        <span v-if="trainNumber">Wygenerowany numer pociągu: <b class="text--accent">{{ trainNumber }}</b></span>
        <span v-else>Wybierz obszary konstrukcyjne i kategorię!</span>
      </div>

      <hr>
      
      <div class="tab_actions">
        <button class="btn" @click="randomizeTrainNumber">PRZELOSUJ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

import genData from '../../constants/numberGeneratorData.json';

type RegionName = keyof typeof genData.regionNumbers;

const beginRegionName = ref(null) as Ref<RegionName | null>;
const endRegionName = ref(null) as Ref<RegionName | null>;
const categoryRules = ref(null) as Ref<string | null>;

const trainNumber = ref(null) as Ref<string | null>;

const randomizeTrainNumber = () => {
  if (beginRegionName.value == null || endRegionName.value == null || categoryRules.value == null) return '';

  let number = '';

  if (beginRegionName.value == endRegionName.value) {
    const sameRegionsNumbers = genData.sameRegions[beginRegionName.value];
    const randRegionNumber = sameRegionsNumbers[Math.floor(Math.random() * sameRegionsNumbers.length)];
    number += randRegionNumber.toString();
  } else {
    const beginRegionNumber = genData.regionNumbers[beginRegionName.value];
    const endRegionNumber = genData.regionNumbers[endRegionName.value];

    number += `${beginRegionNumber}${endRegionNumber}`;
  }

  const rulesArray = categoryRules.value.split(';').map((r) => ({
    index: r.split(':')[0],
    rule: r.split(':')[1],
    nums: Number(r.split(':')[2] || '1'),
  }));

  rulesArray.forEach((r) => {
    const range = r.rule.split('-');

    if (range.length == 1) number += r.rule;
    else {
      const [minRange, maxRange] = range;
      const randRange = Math.floor(Math.random() * (Number(maxRange) - Number(minRange)) + Number(minRange)).toString();

      number += new Array(Math.abs(randRange.length - r.nums)).fill('0').join('') + randRange;
    }
  });

  trainNumber.value = number;
};
</script>

<style lang="scss" scoped>
@import '../../styles/tab.scss';
@import '../../styles/global.scss';

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  select {
    width: calc(50% - 0.5em);
  }
}

.generated-number {
  font-size: 1.3em;
  font-weight: bold;

  margin: 0.5em 0;
  padding: 0.5em;
  background-color: $secondaryColor;
}

.tab_actions {
  margin-top: 0.5em;

  button {
    grid-column: 3;
  }
}

@media screen and (max-width: $breakpointMd) {
  .number-generator {
    min-height: 100vh;
  }
}

@media screen and (max-width: $breakpointSm) {
  .options select {
    width: 100%;
  }
}
</style>
