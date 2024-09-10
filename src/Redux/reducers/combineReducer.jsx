import { combineReducers } from "redux";

import { omdbApi, vidsrcApi, vidsrcApi2 } from "../Services/MovieApi";
import authSlice from "../authSlice";
import searchSlice from "../searchSlice";
import movieDetailsSlice from "../movieDetailsSlice";
import { Tmd_API } from "../Services/Searchapi";

export const rootReducer = combineReducers({
  auth: authSlice,
  search: searchSlice,
  movie: movieDetailsSlice,
  [omdbApi.reducerPath]: omdbApi.reducer,
  [vidsrcApi.reducerPath]: vidsrcApi.reducer,
  [vidsrcApi2.reducerPath]: vidsrcApi2.reducer,
  [Tmd_API.reducerPath]: Tmd_API.reducer,
});
