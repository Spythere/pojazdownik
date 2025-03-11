<template>
  <div class="stock_spawn-settings">
    <Checkbox :disabled="!store.stockSupportsColdStart" v-model="store.isColdStart">
      {{ $t('stocklist.coldstart-info') }}
    </Checkbox>

    <Checkbox :disabled="!store.stockSupportsDoubleManning" v-model="store.isDoubleManned">
      {{ $t('stocklist.doublemanning-info') }}
    </Checkbox>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '../../../store';
import Checkbox from '../../common/Checkbox.vue';

export default defineComponent({
  components: { Checkbox },

  data: () => ({
    store: useStore(),
  }),
});
</script>

<style scoped>
.stock_spawn-settings {
  display: flex;
  gap: 0.5em;
}
</style>
