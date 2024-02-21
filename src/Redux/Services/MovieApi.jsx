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

export const vidsrcApi2 = createApi({
  reducerPath: "vid_Api2",
  baseQuery: fetchBaseQuery({
    baseUrl: Apis.baseURL,
  }),
  endpoints: (builder) => ({
    getNewlyAddedMovies2: builder.query({
      query: (page) => `/api/vapi/movie/new/${page}`,
    }),
    getRecentlyAddedMovies: builder.query({
      query: (currentPage) => `/api/vapi/movie/add/${currentPage}`,
    }),

    getNewlyAddedTvShows: builder.query({
      query: (page) => `/api/vapi/tv/new/${page}`,
    }),
  }),
});

// Extract hooks for using the API
export const {
  useGetNewlyAddedMoviesQuery,
  useGetPlayableMovieQuery,
 
} = vidsrcApi;
export const { useGetNewlyAddedMovies2Query , useGetRecentlyAddedMoviesQuery,useGetNewlyAddedTvShowsQuery} = vidsrcApi2;
export const { useSearchMoviesQuery, useSearchByidQuery } = omdbApi;
