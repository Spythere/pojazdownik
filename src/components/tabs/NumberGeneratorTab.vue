<template>
  <div class="number-generator tab">
    <div class="tab_header">
      <h2>{{ $t("numgen.title") }}</h2>
      <h3>{{ $t("numgen.subtitle") }}</h3>
    </div>

    <div class="tab_content">
      <div class="category-select">
        <label for="category"> {{ $t("numgen.train-category") }}</label>
        <select
          id="category"
          v-model="chosenCategory"
          @change="randomizeTrainNumber()"
        >
          <option :value="null" disabled>
            {{ $t("numgen.train-category") }}
          </option>
          <option
            v-for="(_, category) in genData.categoriesRules"
            :key="category"
            :value="category"
          >
            {{ $t(`numgen.categories.${category}`) }}
          </option>
        </select>
      </div>

      <div class="regions-select">
        <div>
          <label for="begin-region"> {{ $t("numgen.start-region") }}</label>
          <select
            id="begin-region"
            v-model="beginRegionName"
            @change="randomizeTrainNumber()"
          >
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
        </div>

        <div>
          <label for="end-region"> {{ $t("numgen.end-region") }}</label>
          <select
            id="end-region"
            v-model="endRegionName"
            @change="randomizeTrainNumber()"
          >
            <option :value="null" disabled>
              {{ $t("numgen.end-region") }}
            </option>
            <option
              v-for="(_, name) in genData.regionNumbers"
              :key="name"
              :value="name"
            >
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <div class="generated-number" @click="copyNumber">
        <span v-if="trainNumber">
          {{ $t("numgen.number-info") }}
          <b class="text--accent">{{ trainNumber }}</b>
        </span>
        <span v-else>{{ $t("numgen.warning") }}</span>
      </div>

      <div
        class="category-rules"
        v-if="chosenCategory && categoryRules && trainNumber"
      >
        <!-- First & second digit (the same regions)  -->
        <div
          v-if="
            beginRegionName && endRegionName && beginRegionName == endRegionName
          "
        >
          <b>{{ $t("numgen.rules.two-first-digits") }}</b>
          {{ $t("numgen.rules.from-pool") }}
          <b class="text--accent">{{
            genData.sameRegions[beginRegionName].join(", ")
          }}</b>
          {{ $t("numgen.rules.for-region") }} {{ beginRegionName }}
        </div>

        <!-- First & second digit (different regions)  -->
        <div v-else>
          <div>
            <b>
              {{ $t("numgen.rules.first-digit") }}
              <span class="text--accent">{{ trainNumber[0] }}</span>
            </b>
            {{ $t("numgen.rules.for-region-begin") }} {{ beginRegionName }}
          </div>

          <div>
            <b>
              {{ $t("numgen.rules.second-digit") }}
              <span class="text--accent">{{ trainNumber[1] }} </span>
            </b>
            {{ $t("numgen.rules.for-region-end") }} {{ endRegionName }}
          </div>
        </div>

        <!-- Third digit (non-passenger only) -->
        <div v-if="categoryRules[0] != null">
          <b>
            {{ $t("numgen.rules.third-digit") }}
            <span class="text--accent">{{ categoryRules[0] }}</span>
          </b>
          {{ $t("numgen.rules.for-category") }} {{ chosenCategory }}
        </div>

        <!-- Last digits  -->
        <div>
          <b>
            {{
              $t(
                `numgen.rules.${categoryRules[1]?.length == 3 ? "three" : "two"}-last-digits`,
              )
            }}</b
          >
          {{ $t("numgen.rules.from-range") }}
          <b class="text--accent"
            >{{ categoryRules[1] }}-{{ categoryRules[2] }}</b
          >
        </div>
      </div>

      <hr />

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

        <button class="btn" @click="randomizeCategory">
          {{ $t("numgen.action-random-category") }}
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
import { computed } from "vue";

const i18n = useI18n();
type RegionName = keyof typeof genData.regionNumbers;
type Category = keyof typeof genData.categoriesRules;

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

const categoryRules = computed(() => {
  if (!chosenCategory.value) return null;

  return genData.categoriesRules[chosenCategory.value];
});

const randomizeCategory = () => {
  const categoryKeys = Object.keys(genData.categoriesRules) as Category[];
  chosenCategory.value = categoryKeys[~~(Math.random() * categoryKeys.length)];

  randomizeTrainNumber(false);
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

  // Two first numbers (begin & end regions)
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

  // Choose default category if it's not chosen
  if (chosenCategory.value == null) chosenCategory.value = "EI";

  // Get category rules
  const [thirdNumber, minRange, maxRange] = categoryRules.value!;

  // Third number
  number += thirdNumber ?? "";

  // Remaining numbers
  const rangeNums = minRange!.length;
  const randRange = Math.floor(
    Math.random() * (Number(maxRange) - Number(minRange)) + Number(minRange),
  ).toString();
  const leadingZeros = new Array(Math.abs(randRange.length - rangeNums))
    .fill("0")
    .join("");

  number += `${leadingZeros}${randRange}`;

  trainNumber.value = number;
};
</script>

<style lang="scss" scoped>
@import "../../styles/tab.scss";
@import "../../styles/global.scss";

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.category-select {
  select {
    width: auto;
    min-width: 50%;
  }

  margin-bottom: 1em;
}

.regions-select {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;

  div {
    width: 100%;
  }

  select {
    width: 100%;
  }

  label {
    display: block;
    margin-bottom: 0.5em;
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

.category-rules {
  margin-bottom: 0.5em;
}

.tab_actions {
  grid-template-columns: repeat(3, 1fr);
  margin: 0.5em 0;
}

.tab_links {
  display: flex;
  justify-content: flex-end;
  margin: 0.25em 0;
}

@media screen and (max-width: $breakpointMd) {
  .number-generator {
    min-height: 100vh;
  }
}

@media screen and (max-width: $breakpointSm) {
  .regions-select {
    flex-wrap: wrap;
  }

  .regions-select select {
    width: 100%;
  }

  .category-select select {
    min-width: 100%;
  }

  .category-rules {
    text-align: center;
  }
}
</style>
