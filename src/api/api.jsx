import axios from "axios";

// Create an instance with a base URL
const instance = axios.create({
  baseURL: "https://server-coral-delta.vercel.app/",
});

export default instance;

// OMDb API: http://www.omdbapi.com/?i=tt3896198&apikey=8d58c823

// export const OMBD_API = "http://www.omdbapi.com/?i=tt3896198&apikey=8d58c823";
// export const VIDSRC_API = "https://vidsrc.to/";

export const Apis = {
  OMBD_API: "https://www.omdbapi.com/",
  VIDSRC_API: "https://vidsrc.to",
  baseURL: "https://server-coral-delta.vercel.app",
};
