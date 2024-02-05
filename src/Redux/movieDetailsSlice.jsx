// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   movieDetails: [],
// };

// const movieDetailsSlice = createSlice({
//   name: "movie",
//   initialState,
//   reducers: {
//     setMovieDetails: (state, action) => {
//       // Filter out duplicates based on IMDb ID
//       const uniqueMovieDetails = action.payload.filter(
//         (newMovie) =>
//           !state.movieDetails.some(
//             (existingMovie) => existingMovie.imdbID === newMovie.imdbID
//           )
//       );

//       // Concatenate unique movie details with existing ones
//       state.movieDetails = [...state.movieDetails, ...uniqueMovieDetails];
//     },
//   },
// });

// export const { setMovieDetails } = movieDetailsSlice.actions;

// export const allDetails = (state) => state.movie.movieDetails;
// export default movieDetailsSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  movieDetails: [],
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
  },
});

export const { setMovieDetails } = movieDetailsSlice.actions;

export const allDetails = (state) => state.movie.movieDetails;
export default movieDetailsSlice.reducer;
