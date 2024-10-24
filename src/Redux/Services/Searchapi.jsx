//  TMDB APi

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Apis } from "../../api/api";

export const Tmd_API = createApi({
  reducerPath: "tmDB_API",
  baseQuery: fetchBaseQuery({
    baseUrl: Apis.TMDB,
  }),
  endpoints: (builder) => ({
    // New endpoint for fetching popular movies
    fetchPopularMovies: builder.query({
      query: (page = 1) => ({
        url: `movie/popular`,
        params: {
          api_key: Apis.apiKey,
          language: "en-US",
          page: page,
        },
      }),
    }),
  }),
});

export const { useFetchPopularMoviesQuery } = Tmd_API;
