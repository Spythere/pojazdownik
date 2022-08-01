import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    getIcon(name: string) {
      return new URL(`./assets/${name}.svg`, import.meta.url).href;
    },
  },
});
