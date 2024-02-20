import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieDetails: [],
  movieRecents: [],
  TvNew: [],
  TvRecents: [],
  currentPage: 1,
  page: 1,
};

const movieDetailsSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovieDetails: (state, action) => {
      const newMovieDetails = action.payload;

      // Filter out duplicates based on IMDb ID
      const uniqueMovieIds = new Set(state.movieDetails.map((movie) => movie.imdbID));
      const filteredNewMovieDetails = newMovieDetails.filter(
        (movie) => !uniqueMovieIds.has(movie.imdbID)
      );

      // Update movieDetails by adding only unique new movie details
      state.movieDetails = [...state.movieDetails, ...filteredNewMovieDetails];
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setMovieRecents: (state, action) => {
      const newMovieRecents = action.payload;
      const uniqueNewMovieIds = new Set(state.movieRecents.map((m) => m.imdbID));
      const filteredNewMovieRecents = newMovieRecents.filter(
        (n) => !uniqueNewMovieIds.has(n.imdbID)
      );

      state.movieRecents = [...state.movieRecents, ...filteredNewMovieRecents];
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});

export const { setMovieDetails, setCurrentPage, setMovieRecents, setPage } =
  movieDetailsSlice.actions;
export const currentPageSelector = (state) => state.movie.currentPage;

export const allDetails = (state) => state.movie.movieDetails;
export const recentDetails = (state) => state.movie.movieRecents;


export default movieDetailsSlice.reducer;
