import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    getIconURL(name: string, ext = 'svg'): string {
      return `/images/icon-${name}.${ext}`;
    },
  },
});
