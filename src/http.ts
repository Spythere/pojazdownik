import axios from "axios";

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_DEV === "1" && import.meta.env.DEV
      ? "http://localhost:5500"
      : "https://spythere.github.io/api",
});

export default http;
