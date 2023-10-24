<template>
  <div class="number-generator tab">
    <div class="tab_header">
      <h2>{{ $t("numgen.title") }}</h2>
    </div>

    <div class="tab_content">
      <div class="options">
        <select v-model="chosenCategory" @change="randomizeTrainNumber()">
          <option :value="null" disabled>
            {{ $t("numgen.train-category") }}
          </option>
          <option
            v-for="(_, category) in genData.categories"
            :key="category"
            :value="category"
          >
            {{ $t(`numgen.categories.${category}`) }}
          </option>
        </select>

        <select v-model="beginRegionName" @change="randomizeTrainNumber()">
          <option :value="null" disabled>
            {{ $t("numgen.start-region") }}
          </option>
          <option
            v-for="(_, name) in genData.regionNumbers"
            :key="name"
            :value="name"
          >
            {{ name }}
          </option>
        </select>

        <select v-model="endRegionName" @change="randomizeTrainNumber()">
          <option :value="null" disabled>{{ $t("numgen.end-region") }}</option>
          <option
            v-for="(_, name) in genData.regionNumbers"
            :key="name"
            :value="name"
          >
            {{ name }}
          </option>
        </select>
      </div>

      <div class="generated-number" @click="copyNumber">
        <span v-if="trainNumber">
          {{ $t("numgen.number-info") }}
          <b class="text--accent">{{ trainNumber }}</b>
        </span>
        <span v-else>{{ $t("numgen.warning") }}</span>
      </div>

      <!-- <div v-if="chosenCategory">
        Current numbering rules: {{ $t(`numgen.rules.${chosenCategory}`) }};

        <span v-if="beginRegionName && endRegionName">
          <span v-if="beginRegionName == endRegionName">
            pierwsze dwie cyfry:
            {{ genData.sameRegions[beginRegionName].join(', ') }}
            (numer w obrębie obszaru {{ beginRegionName }})
          </span>

          <span v-else>
            pierwsza cyfra: {{ genData.regionNumbers[beginRegionName] }}; druga cyfra:
            {{ genData.regionNumbers[endRegionName] }}
          </span>
        </span>
      </div> -->

      <div class="tab_links">
        <a :href="$t('numgen.td2-wiki-link')" target="_blank">
          {{ $t("numgen.td2-wiki") }}
        </a>
      </div>

      <hr />

      <div class="tab_actions">
        <button class="btn" @click="randomizeTrainNumber(true)">
          {{ $t("numgen.action-random-region") }}
        </button>
        <button class="btn" @click="randomizeTrainNumber(false)">
          {{ $t("numgen.action-random-number") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import genData from "../../constants/numberGeneratorData.json";

const i18n = useI18n();
type RegionName = keyof typeof genData.regionNumbers;
type Category = keyof typeof genData.categories;

const beginRegionName = ref(null) as Ref<RegionName | null>;
const endRegionName = ref(null) as Ref<RegionName | null>;
const chosenCategory = ref(null) as Ref<Category | null>;

const trainNumber = ref(null) as Ref<string | null>;

const copyNumber = () => {
  if (trainNumber.value) {
    navigator.clipboard.writeText(trainNumber.value);
    alert(i18n.t("numgen.alert"));
  }
};

const randomizeTrainNumber = (randomizeRegions = false) => {
  // if (categoryRules.value == null) return;

  const regionKeys = Object.keys(genData.regionNumbers);

  if (beginRegionName.value == null || randomizeRegions)
    beginRegionName.value = regionKeys[
      (regionKeys.length * Math.random()) << 0
    ] as RegionName;

  if (endRegionName.value == null || randomizeRegions)
    endRegionName.value = regionKeys[
      (regionKeys.length * Math.random()) << 0
    ] as RegionName;

  let number = "";

  if (beginRegionName.value == endRegionName.value) {
    const sameRegionsNumbers = genData.sameRegions[beginRegionName.value!];
    const randRegionNumber =
      sameRegionsNumbers[Math.floor(Math.random() * sameRegionsNumbers.length)];
    number += randRegionNumber.toString();
  } else {
    const beginRegionNumber = genData.regionNumbers[beginRegionName.value!];
    const endRegionNumber = genData.regionNumbers[endRegionName.value!];

    number += `${beginRegionNumber}${endRegionNumber}`;
  }

  // Do not roll the rest of number again if only randomize regions and category rules are already selected
  if (randomizeRegions && chosenCategory.value != null) {
    trainNumber.value = number + trainNumber.value?.substring(2);
    return;
  }

  if (chosenCategory.value == null) chosenCategory.value = "EI";

  const rulesArray = genData.categories[chosenCategory.value]
    .split(";")
    .map((r) => ({
      index: r.split(":")[0],
      rule: r.split(":")[1],
      nums: Number(r.split(":")[2] || "1"),
    }));

  rulesArray.forEach((r) => {
    const range = r.rule.split("-");

    if (range.length == 1) number += r.rule;
    else {
      const [minRange, maxRange] = range;
      const randRange = Math.floor(
        Math.random() * (Number(maxRange) - Number(minRange)) +
          Number(minRange),
      ).toString();

      number +=
        new Array(Math.abs(randRange.length - r.nums)).fill("0").join("") +
        randRange;
    }
  });

  trainNumber.value = number;
};
</script>

<style lang="scss" scoped>
@import "../../styles/tab.scss";
@import "../../styles/global.scss";

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5em;

  select {
    width: 100%;
  }
}

.generated-number {
  font-size: 1.3em;
  font-weight: bold;
  text-align: center;

  cursor: pointer;

  margin: 0.5em 0;
  padding: 0.5em;
  background-color: $secondaryColor;
}

.tab_actions {
  grid-template-columns: 1fr 1fr;
  margin: 0.5em 0;
}

.tab_links {
  display: flex;
  justify-content: flex-end;
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
