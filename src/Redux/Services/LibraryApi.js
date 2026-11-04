// Per-user Watchlist / Liked / Watch History, stored in the user's account on the backend.
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Apis } from "../../api/api";
import { toast } from "react-toastify";
import { logout } from "../authSlice";

export const HISTORY_CAP = 100;
const EMPTY = { watchlist: [], liked: [], history: [] };

const getToken = () => localStorage.getItem("authToken");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: Apis.baseURL,
  // The backend reads the raw JWT from the Authorization header (a "Bearer " prefix is accepted too).
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) headers.set("Authorization", token);
    return headers;
  },
});

// Login tokens expire (1h on the server). The rest of the site works without one, so an expired
// token only shows up here: on 401, sign the user out with a clear message instead of a vague error.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    toast.info("Your session expired. Please sign in again.", { toastId: "session-expired" });
    api.dispatch(logout());
    api.dispatch(libraryApi.util.resetApiState());
  }
  return result;
};

export const libraryApi = createApi({
  reducerPath: "libraryApi",
  baseQuery,
  tagTypes: ["Library"],
  endpoints: (builder) => ({
    getLibrary: builder.query({
      query: () => "library",
      providesTags: ["Library"],
    }),

    // list: "watchlist" | "liked"; item: { imdbId, type, title, poster, year }
    addToList: builder.mutation({
      query: ({ list, item }) => ({ url: `library/${list}`, method: "POST", body: item }),
      async onQueryStarted({ list, item }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getLibrary", undefined, (draft) => {
            draft[list] = [
              { ...item, addedAt: new Date().toISOString() },
              ...(draft[list] || []).filter((i) => i.imdbId !== item.imdbId),
            ];
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeFromList: builder.mutation({
      query: ({ list, imdbId }) => ({ url: `library/${list}/${imdbId}`, method: "DELETE" }),
      async onQueryStarted({ list, imdbId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getLibrary", undefined, (draft) => {
            draft[list] = (draft[list] || []).filter((i) => i.imdbId !== imdbId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // item: { imdbId, type, title, poster, year, season?, episode? }
    recordHistory: builder.mutation({
      query: (item) => ({ url: "library/history", method: "POST", body: item }),
      async onQueryStarted(item, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getLibrary", undefined, (draft) => {
            draft.history = [
              { ...item, watchedAt: new Date().toISOString() },
              ...(draft.history || []).filter((i) => i.imdbId !== item.imdbId),
            ].slice(0, HISTORY_CAP);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    removeHistoryItem: builder.mutation({
      query: (imdbId) => ({ url: `library/history/${imdbId}`, method: "DELETE" }),
      async onQueryStarted(imdbId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getLibrary", undefined, (draft) => {
            draft.history = (draft.history || []).filter((i) => i.imdbId !== imdbId);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    clearHistory: builder.mutation({
      query: () => ({ url: "library/history", method: "DELETE" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          libraryApi.util.updateQueryData("getLibrary", undefined, (draft) => {
            draft.history = [];
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetLibraryQuery,
  useAddToListMutation,
  useRemoveFromListMutation,
  useRecordHistoryMutation,
  useRemoveHistoryItemMutation,
  useClearHistoryMutation,
} = libraryApi;

/** All three lists (always defined), plus the query state (isLoading, isError, refetch). */
export function useLibrary() {
  const q = useGetLibraryQuery(undefined, { skip: !getToken() });
  const data = q.data || EMPTY;
  return { ...q, watchlist: data.watchlist, liked: data.liked, history: data.history };
}

// OMDb uses "N/A" for missing values.
const clean = (v) => (typeof v === "string" && v !== "N/A" ? v : "");

/**
 * Library state + toggles for one title, used by the movie / series pages.
 * meta: { title, poster, year } from the details (may be undefined while loading).
 */
export function useLibraryItem(imdbId, type, meta) {
  const { watchlist, liked } = useLibrary();
  const [addToList] = useAddToListMutation();
  const [removeFromList] = useRemoveFromListMutation();

  const inList = watchlist.some((i) => i.imdbId === imdbId);
  const isLiked = liked.some((i) => i.imdbId === imdbId);

  const item = useMemo(
    () => ({
      imdbId,
      type,
      title: clean(meta?.title),
      poster: clean(meta?.poster),
      year: clean(meta?.year),
    }),
    [imdbId, type, meta?.title, meta?.poster, meta?.year]
  );

  const setMember = useCallback(
    (list, on) => {
      if (on) addToList({ list, item });
      else removeFromList({ list, imdbId });
    },
    [addToList, removeFromList, item, imdbId]
  );

  return {
    inList,
    liked: isLiked,
    setInList: (on) => setMember("watchlist", on),
    setLiked: (on) => setMember("liked", on),
  };
}

/** Records one history entry per page view (per title + episode), once the title is known. */
export function useRecordHistory(imdbId, type, meta, season, episode) {
  const [recordHistory] = useRecordHistoryMutation();
  const done = useRef(null);
  const title = clean(meta?.title);
  const poster = clean(meta?.poster);
  const year = clean(meta?.year);
  const key = `${imdbId}|${season ?? ""}|${episode ?? ""}`;

  useEffect(() => {
    if (!title || !getToken() || done.current === key) return;
    if (type === "tv" && (season == null || episode == null)) return; // series only count once an episode is opened
    done.current = key;
    const entry = { imdbId, type, title, poster, year };
    if (type === "tv" && season != null && episode != null) {
      entry.season = Number(season);
      entry.episode = Number(episode);
    }
    recordHistory(entry);
  }, [key, title, poster, year, imdbId, type, season, episode, recordHistory]);
}
