import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    getIconURL(name: string, ext = 'svg'): string {
      return `/images/icon-${name}.${ext}`;
    },

    getThumbnailURL(vehicleType: string, size: 'small' | 'large') {
      return `https://stacjownik.spythere.eu/static/images/${vehicleType}--${size == 'small' ? 300 : 800}px.jpg`;
    },
  },
});
