import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  search: [],
};
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchResults: (state, action) => {
      state.search = action.payload;
    },
  },
});
export const { setSearchResults } = searchSlice.actions;
export const selectSearchResults = (state) => state.search.search;
export default searchSlice.reducer;
