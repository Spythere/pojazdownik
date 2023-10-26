import { defineComponent } from "vue";

export default defineComponent({
  methods: {
    getIconURL(name: string, ext = "svg"): string {
      return `/images/icon-${name}.${ext}`;
    },

    getThumbnailURL(vehicleType: string, size: "small" | "large") {
      return `${
        import.meta.env.VITE_API_DEV === "1"
          ? "http://localhost:5500"
          : "https://spythere.github.io/api"
      }/td2/images/${vehicleType}--${size == "small" ? 300 : 800}px.jpg`;
    },
  },
});
