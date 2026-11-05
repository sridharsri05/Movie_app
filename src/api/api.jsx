import axios from "axios";

// In development, use relative URLs so Vite's proxy handles CORS
// In production, use the full server URL
// `?.` because vite.config.js also imports this file, where import.meta.env is undefined
const isDev = import.meta.env?.DEV;
const LOCAL_SERVER = "http://localhost:3001";

// Create an instance with a base URL
const instance = axios.create({
  baseURL: isDev ? LOCAL_SERVER : "https://server-flax-eight.vercel.app/",
});

// Send the login token with every request to our API, so protected routes (profile update,
// account deletion, ...) can verify who is calling. The server accepts the raw JWT.
instance.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token && !config.headers.Authorization) config.headers.Authorization = token;
  return config;
});

export default instance;

// TMDB and OMDb are called through our backend (`${Apis.baseURL}/tmdb/...`, `${Apis.baseURL}/omdb`),
// which holds the API keys.
export const Apis = {
  VIDSRC_API: "https://vidsrc.to",
  baseURL: isDev ? LOCAL_SERVER : "https://server-flax-eight.vercel.app",
};
