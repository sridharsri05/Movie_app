import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Apis } from "../../api/api";

const baseQuery = fetchBaseQuery({ baseUrl: Apis.OMBD_API });
const OMBD_API_KEY = "8d58c823";

export const omdbApi = createApi({
  reducerPath: "omdb_Api",
  baseQuery,
  endpoints: (builder) => ({
    searchMovies: builder.query({
      query: (query) => `?apikey=${OMBD_API_KEY}&t=${query}`,
    }),
    searchByid: builder.query({
      query: (imdbID) => `?apikey=${OMBD_API_KEY}&i=${imdbID}`,
    }),
  }),
});

const baseQueryDefault = fetchBaseQuery({
  baseUrl: "https://vidsrc.to",
});

// Create the API
export const vidsrcApi = createApi({
  reducerPath: "vid_Api",
  baseQuery: baseQueryDefault, // Use default base query for the API
  endpoints: (builder) => ({
    getPlayableMovie: builder.query({
      query: (imdbID) => `/embed/movie/${imdbID}`,
    }),
    getNewlyAddedMovies: builder.query({
      query: (page) => `/vapi/movie/new/${page}`,
    }),
  }),
});

// Extract hooks for using the API
export const { useGetNewlyAddedMoviesQuery, useGetPlayableMovieQuery } = vidsrcApi;

export const { useSearchMoviesQuery, useSearchByidQuery } = omdbApi;
