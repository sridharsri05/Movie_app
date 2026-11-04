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

export default instance;

// All third-party API keys live here. Override with VITE_TMDB_API_KEY / VITE_OMDB_API_KEY
// in Movie_app/.env; the defaults are the keys this app has always shipped with.
const env = import.meta.env ?? {};

export const Apis = {
  OMBD_API: "https://www.omdbapi.com/",
  VIDSRC_API: "https://vidsrc.to",
  TMDB: "https://api.themoviedb.org/3/",
  baseURL: isDev ? LOCAL_SERVER : "https://server-flax-eight.vercel.app",
  apiKey: env.VITE_TMDB_API_KEY || "bb666e560f71cab382892f0e4efa696e",
  omdbKey: env.VITE_OMDB_API_KEY || "8d58c823",
};
