
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieDetails: [],
  currentPage: 1,
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
  },
});

export const { setMovieDetails,setCurrentPage } = movieDetailsSlice.actions;
export const currentPageSelector = (state) => state.movie.currentPage;
export const allDetails = (state) => state.movie.movieDetails;
export default movieDetailsSlice.reducer;
