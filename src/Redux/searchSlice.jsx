import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  searchResults: [],
};
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
  },
});
export const { setSearchResults } = searchSlice.actions;
export const selectSearchResults = (state) => state.search.searchResults;
export default searchSlice.reducer;
