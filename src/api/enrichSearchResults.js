import axios from "axios";
import { Apis } from "./api";

// OMDb search results lack plot/genre/rating. Fetch details for the whole page in one
// batched backend request (instead of one OMDb call per result). The backend also
// replaces broken poster links. If the request fails, results are returned unchanged.
export const enrichSearchResults = async (searchItems) => {
  let details = [];
  try {
    const { data } = await axios.post(`${Apis.baseURL}/getLatestMovies`, {
      imdbIds: searchItems.map((movie) => movie.imdbID),
    });
    details = data;
  } catch (error) {
    console.error("Error fetching search result details:", error);
  }

  const byId = new Map(details.map((d) => [d.imdbID, d]));
  return searchItems.map((movie) => {
    const d = byId.get(movie.imdbID);
    if (!d) return movie;
    return {
      ...movie,
      Poster: d.Poster ?? movie.Poster,
      Plot: d.Plot || "Plot not available",
      Genre: d.Genre || "Genre not available",
      Director: d.Director || "Director not available",
      Actors: d.Actors || "Actors not available",
      imdbRating: d.imdbRating || "Rating not available",
    };
  });
};
