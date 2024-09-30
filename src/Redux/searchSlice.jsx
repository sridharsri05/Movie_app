import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchResults: [],
  query: "", // Add query to the initial state
  currentPage: 1, // Add currentPage to the initial state
  totalResults: 0,
  isLoading: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchResults: (state, action) => {
      // Update the state with the combined results
      state.searchResults = action.payload;
    },
    resetSearchResults: (state) => {
      state.searchResults = [];
    },
    setSearchQuery: (state, action) => {
      // Set the query and reset the current page to 1
      state.query = action.payload;
      state.currentPage = 1; // Reset page to 1 when a new search is triggered
    },
    setCurrentPage: (state, action) => {
      // Update the current page
      state.currentPage = action.payload;
    },
    setTotalResults: (state, action) => {
      state.totalResults = action.payload;
    },
    setDataLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setSearchResults,
  resetSearchResults,
  setSearchQuery,
  setCurrentPage,
  setTotalResults,
  setDataLoading,
} = searchSlice.actions;
export const selectSearchResults = (state) => state.search.searchResults;
export const selectSearchQuery = (state) => state.search.query;
export const selectCurrentPage = (state) => state.search.currentPage;
export const selectTotalResults = (state) => state.search.totalResults;
export const selectisLoading =(state)=> state.search.isLoading
export default searchSlice.reducer;
