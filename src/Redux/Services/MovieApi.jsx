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
  }),
});

export const vidsrcApi = createApi({
  reducerPath: "vid_Api",
  baseQuery: fetchBaseQuery({ baseUrl: "/vapi" }),
  endpoints: (builder) => ({
    getPlayableMovie: builder.query({
      query: (titleId) => `/embed/movie/${titleId}`,
    }),
    getNewlyAddedMovies: builder.query({
      query: (page) => `/vapi/movie/new/${page}`,
    }),
  }),
});

export const { useSearchMoviesQuery } = omdbApi;
export const { useGetPlayableMovieQuery, useGetNewlyAddedMoviesQuery } = vidsrcApi;
