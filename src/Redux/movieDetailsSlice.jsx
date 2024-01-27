// movieDetailsSlice.js
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  movieDetails: [],
  
};

const movieDetailsSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    setMovieDetails: (state, action) => {
      state.movieDetails = action.payload;
    },
  },
});

// ... rest of the slice

export const { setMovieDetails } = movieDetailsSlice.actions;

export const allDetails = (state) => state.movie.movieDetails;
export default movieDetailsSlice.reducer;
