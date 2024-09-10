//  TMDB APi

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Apis } from "../../api/api";

export const Tmd_API = createApi({
  reducerPath: "tmDB_API",
  baseQuery: fetchBaseQuery({
    baseUrl: Apis.TMDB,
  }),
  endpoints: (builder) => ({
    searchMoviesSeries: builder.query({
      query: (query) => ({
        url: `search/multi`,
        params: {
          query: query,
          api_key: Apis.apiKey,
          language: "en-US",
        },
      }),
    }),
  }),
});
export const { useSearchMoviesSeriesQuery } = Tmd_API;
