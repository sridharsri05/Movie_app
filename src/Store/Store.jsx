

import { configureStore } from "@reduxjs/toolkit";
import { omdbApi, vidsrcApi, vidsrcApi2 } from "../Redux/Services/MovieApi";
import { rootReducer } from "../Redux/reducers/combineReducer";
import { Tmd_API } from "../Redux/Services/Searchapi";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";

// Create persist configuration
const persistConfig = {
  key: "root", // Key to persist the entire store
  storage, // Specify the storage (localStorage or sessionStorage)
  whitelist: ["search"], // List the reducers you want to persist (e.g. search slice)
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const Store = configureStore({
  reducer: persistedReducer, // Use persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // Ignore these actions in serializable check
      },
    })
      .concat(vidsrcApi.middleware)
      .concat(omdbApi.middleware)
      .concat(vidsrcApi2.middleware)
      .concat(Tmd_API.middleware),
});

// Create persistor
export const persistor = persistStore(Store);
