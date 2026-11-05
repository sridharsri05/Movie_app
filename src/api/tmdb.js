import axios from "axios";

// Drop-in replacement for axios.get for TMDB requests, sent through our backend proxy (`${Apis.baseURL}/tmdb/...`),
// which adds the API key server-side. Responses are cached in memory
// for the session, and identical requests made at the same time share a single call,
// so revisiting a movie/show page doesn't refetch everything.
const cache = new Map();
const MAX_ENTRIES = 300;

export const tmdbGet = (url, config = {}) => {
  const params = { ...config.params };
  const key = `${url}?${new URLSearchParams(params).toString()}`;

  if (cache.has(key)) return cache.get(key);

  // Network drops (no response at all) get one automatic retry; real HTTP errors don't.
  const attempt = () => axios.get(url, { ...config, params, timeout: 12000 });
  const request = attempt()
    .catch((error) => {
      if (error.response) throw error;
      return new Promise((resolve) => setTimeout(resolve, 800)).then(attempt);
    })
    .catch((error) => {
      cache.delete(key); // don't cache failures; allow a retry next time
      throw error;
    });

  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, request);
  return request;
};
