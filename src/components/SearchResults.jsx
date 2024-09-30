import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectisLoading, selectSearchResults } from "../Redux/searchSlice";
import { Link, useParams } from "react-router-dom";
import Pagination from "./Pagination/Pagination";
import Spinner from "../Spinner/Spinner";

const SearchResults = () => {
  const { query } = useParams();
  const Search = useSelector(selectSearchResults);
  const isLoading = useSelector(selectisLoading);

  // Scroll to top when Search data changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [Search]);

  return (
    <>
      <div className="relative w-full p-4 bg-gray-800 min-h-screen">
        <div className="pl-2 mb-3 text-xl text-white border-l-4 border-yellow-500 font-libre">
          Results found : {query}
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="w-full space-y-4">
            {Search.length > 0 ? (
              Search.map((movie) => (
                <li
                  key={movie?.imdbID}
                  className="flex items-start p-4 bg-gray-900 shadow-md rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Link
                    to={
                      movie.Type === "movie" || movie.Type === "game"
                        ? `/dashboard/movie/${movie?.imdbID}`
                        : movie.Type === "series"
                        ? `/dashboard/tvSeries/${movie?.imdbID}`
                        : `/dashboard/movie/${movie?.imdbID}`
                    }
                    className="flex w-full"
                  >
                    <div className="w-24 h-36 flex-shrink-0">
                      <img
                        src={movie?.Poster}
                        alt={movie?.Title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {movie.Title}
                          <span className="ml-2 text-sm text-gray-400">
                            ( {movie?.Year} )
                          </span>
                        </h3>
                        <p className="text-sm text-yellow-400 mt-1">
                          ⭐ {movie?.imdbRating}
                        </p>
                        <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                          {movie?.Genre || "No description available."}
                        </p>
                        <p className="text-sm text-gray-300 mt-2 line-clamp-3">
                          {movie?.Plot || "No description available."}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-white">No results found.</p>
            )}
          </ul>
        )}
      </div>
      <div className="p-2 mb-2">
        <Pagination />
      </div>
    </>
  );
};

export default SearchResults;
