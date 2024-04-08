import axios from 'axios';

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_DEV === '1' && import.meta.env.DEV
      ? 'http://localhost:3001'
      : 'https://spythere.spythere.eu',
});

export default http;
