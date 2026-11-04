import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieDetails: [],
  movieRecents: [],
  TvNew: [],
  TvRecents: [],
  currentPage: 1,
  tvCurrentPage: 1,
  page: 1,
};

// Merge fetched items into an existing list by imdbID: new items are appended, and
// items already present are replaced so fresh data (e.g. fixed posters) wins over
// whatever redux-persist restored from localStorage.
const upsertByImdbId = (existing, incoming) => {
  const fresh = new Map(incoming.map((m) => [m.imdbID, m]));
  const updated = existing.map((m) => fresh.get(m.imdbID) ?? m);
  const known = new Set(existing.map((m) => m.imdbID));
  return [...updated, ...incoming.filter((m) => !known.has(m.imdbID))];
};

const movieDetailsSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovieDetails: (state, action) => {
      state.movieDetails = upsertByImdbId(state.movieDetails, action.payload);
    },
    setTvCurrentPage: (state, action) => {
      state.tvCurrentPage = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setMovieRecents: (state, action) => {
      state.movieRecents = upsertByImdbId(state.movieRecents, action.payload);
    },
    setTvshows: (state, action) => {
      state.TvNew = upsertByImdbId(state.TvNew, action.payload);
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { setMovieDetails, setCurrentPage, setTvCurrentPage, setMovieRecents, setPage, setTvshows } =
  movieDetailsSlice.actions;
export const currentPageSelector = (state) => state.movie.currentPage;
export const tvCurrentPageSelector = (state) => state.movie.tvCurrentPage ?? 1;

export const allDetails = (state) => state.movie.movieDetails;
export const allShows = (state) => state.movie.TvNew;
export const recentDetails = (state) => state.movie.movieRecents;

export default movieDetailsSlice.reducer;
