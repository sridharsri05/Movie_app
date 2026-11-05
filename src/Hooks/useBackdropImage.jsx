import { useState, useEffect } from "react";
import { tmdbGet } from "../api/tmdb";
import { Apis } from "../api/api";

const useBackdropImage = (imdbId) => {
  const [backdropUrl, setBackdropUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [ImageError, setImageError] = useState("");

  useEffect(() => {
    const fetchBackdrop = async () => {
      setLoading(true);
      setImageError("");

      try {
        // Step 1: Get TMDB ID from IMDb ID
        const findResponse = await tmdbGet(
          `${Apis.baseURL}/tmdb/find/${imdbId}`,
          {
            params: {
              external_source: "imdb_id",
            },
          }
        );

        const tmdbId = findResponse.data.movie_results[0]?.id;
        if (!tmdbId) throw new Error("Movie not found in TMDB.");

        // Step 2: Get Movie Details using TMDB ID
        const movieResponse = await tmdbGet(
          `${Apis.baseURL}/tmdb/movie/${tmdbId}`
        );

        const backdropPath = movieResponse.data.backdrop_path;
        if (backdropPath) {
          setBackdropUrl(`https://image.tmdb.org/t/p/original${backdropPath}`);
        } else {
          setImageError("Backdrop image not available");
        }
      } catch (err) {
        console.error("Error fetching backdrop:", err);
        setImageError("Failed to load backdrop image.");
      } finally {
        setLoading(false);
      }
    };

    if (imdbId) {
      fetchBackdrop();
    }
  }, [imdbId]);

  return { backdropUrl, loading, ImageError };
};

export default useBackdropImage;
