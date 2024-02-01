import { configureStore } from "@reduxjs/toolkit";
import { omdbApi, vidsrcApi, vidsrcApi2 } from "../Redux/Services/MovieApi";
import { rootReducer } from "../Redux/reducers/combineReducer";

export const Store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(vidsrcApi.middleware)
      .concat(omdbApi.middleware)
      .concat(vidsrcApi2.middleware),
});
