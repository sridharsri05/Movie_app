import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";
import MovieCard from "../Cards/MovieCards";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import axios from "axios";
import CustomCarousel from "../customeCards/CustomCarousel";

const PlayMovie = () => {
  const [movieview, setMovieView] = useState(true);
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data: movieData } = useSearchByidQuery(imdbID);
  console.log(movieData, "movie data");

  const [relatedMovies, setRelatedMovies] = useState([]);
  const [error, setError] = useState(null);

  const genreNameToIdMap = useMemo(
    () => ({
      Action: 28,
      Adventure: 12,
      Animation: 16,
      Comedy: 35,
      Crime: 80,
      Documentary: 99,
      Drama: 18,
      Family: 10751,
      Fantasy: 14,
      History: 36,
      Horror: 27,
      Music: 10402,
      Mystery: 9648,
      Romance: 10749,
      "Sci-Fi": 878,
      "TV Movie": 10770,
      Thriller: 53,
      War: 10752,
      Western: 37,
    }),
    []
  );

  const fetchRelatedMovies = useCallback(
    async (title, genres) => {
      const apiKey = "6a42205b97295fef4aea5d2775c755ba";
      const genreNames = genres.split(", ").map((name) => name.trim());
      const genreIds = genreNames
        .map((name) => genreNameToIdMap[name])
        .filter((id) => id);

      try {
        const titleResponse = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}`
        );

        const genreResponse =
          genreIds.length > 0
            ? await axios.get(
                `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreIds.join(
                  ","
                )}`
              )
            : { data: { results: [] } };

        const combinedMovies = [
          ...titleResponse.data.results.slice(0, 5),
          ...genreResponse.data.results.slice(0, 5),
        ];

        const formattedMovies = await processMoviesWithExternalIds(combinedMovies);
        setRelatedMovies(formattedMovies);
      } catch (error) {
        console.error("Error fetching related movies:", error);
        setError("Failed to load related movies. Please try again later.");
      }
    },
    [genreNameToIdMap]
  );

  useEffect(() => {
    if (movieData?.Title) {
      fetchRelatedMovies(movieData.Title, movieData.Genre);
    }
  }, [movieData, fetchRelatedMovies]);

  const fetchExternalIds = useCallback(async (movieId) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${movieId}/external_ids`,
        {
          params: {
            api_key: "6a42205b97295fef4aea5d2775c755ba",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching external IDs:", error);
      return null;
    }
  }, []);

  const processMoviesWithExternalIds = useCallback(
    async (movies) => {
      const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
      const processedMovies = await Promise.all(
        movies.map(async (movie) => {
          const externalIds = await fetchExternalIds(movie.id);
          return {
            poster: `${imageBaseUrl}${movie.poster_path}`,
            title: movie.title,
            year: movie.release_date.split("-")[0],
            rating: movie.vote_average.toFixed(1),
            imdbId: externalIds ? externalIds.imdb_id : "N/A",
          };
        })
      );
      return processedMovies;
    },
    [fetchExternalIds]
  );

  const minsToHours = useCallback((minutesString) => {
    const minutes = parseInt(minutesString);
    if (minutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }, []);

  console.log(relatedMovies, "check");
  return (
    <>
      <div className="pt-6 bg-black">
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16 3xl:h-[40rem] mb-8 sm:h-[31rem]">
          {movieview ? (
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://vidsrc.xyz/embed/movie/${imdbID}`}
              allowFullScreen
            ></iframe>
          ) : (
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://vidsrc.to/embed/movie/${imdbID}`}
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* leftside card */}
        <div className="flex justify-center mb-5">
          <button
            type="button"
            className="md:right-14 md:absolute l:mx-5 z-40 px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:text-blue-400 md:px-2 md:py-2 text-white font-semibold rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => setMovieView((prev) => !prev)}
          >
            Change Server
          </button>
        </div>

        <div className="relative">
          <div className="mx-auto max-w-[2560px] relative w-full">
            <div className="flex flex-wrap mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-16">
              <div className="flex-grow-0 flex-shrink-0 sm:basis-full md:basis-1/4 max-w-full min-h-[1px] px-1 relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                <div className="mb-1 md:mb-8 sticky z-10 w-full sm:mx-[-24px]">
                  <div className="relative flex w-full">
                    <div className="flex-1 l:pb-[20rem] md:py-[71.75%] px-0 relative w-full">
                      <img
                        className="absolute s:relative l:absolute s:mt-2 top-0 left-0 object-cover w-full s:h-[20rem] md:h-full"
                        src={movieData?.Poster || relatedMovies[0]?.poster}
                        alt={movieData?.Title}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* rightside part */}
              <div className="lg:flex-grow-0 flex-shrink-0 sm:basis-full md:basis-3/4 max-w-full sm:w-full md:w-2/3 lg:w-3/4 l:mt-4">
                <div className="text-white md:text-left lg:text-5xl font-extrabold leading-[56px] mt-0 mr-0 mb-2 font-libre s:text-xl s:text-center l:text-2xl">
                  {movieData?.Title}
                </div>

                <div className="text-sm font-medium leading-6 tracking-normal text-white text-opacity-75">
                  <div className="flex flex-wrap md:justify-start md:items-center gap-x-1 s:justify-center">
                    <span className="mr-3">
                      {movieData?.Year} - {minsToHours(movieData?.Runtime)}
                    </span>
                    {/* svg */}
                    {/* Rating */}
                    <div className="inline-flex">
                      <div className="items-center flex -mt-[1px]">
                        <div className="pt-0 pb-0 pl-2 pr-2 text-xs font-black leading-4 tracking-normal text-white bg-white rounded-lg bg-opacity-20 text-opacity-80">
                          {movieData?.Rated}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="block s:text-center md:text-left">
                    <div className="relative inline-block font-normal leading-normal text-white transition-opacity duration-300 bg-transparent cursor-pointer">
                      {movieData?.Genre}
                    </div>
                  </div>
                  <p className="text-[16px] leading-6 mt-2 mb-4 max-w-2xl">
                    {movieData?.Plot}
                  </p>
                  <div className="text-[16px] leading-6 relative w-full mb-20">
                    <div className="flex">
                      <span className="inline-block flex-grow-0 flex-shrink w-40 text-white text-[16px] leading-6">
                        Starring
                      </span>
                      <span className="text-white text-opacity-75 text-[16px] leading-6 relative w-full">
                        {movieData?.Actors}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-white text-opacity-75 inline-block flex-grow-0 flex-shrink-0 s:w-[6.4rem] m:w-[6.8rem] l:w-[7.1rem] lg:w-[8.1rem]">
                        Directed by
                      </span>
                      <span className="text-[16px] leading-6 opacity-100 cursor-pointer inline-block relative transition-opacity duration-300 font-normal">
                        {movieData?.Director}
                      </span>
                    </div>
                    <div className="my-4 border-b border-gray-700"></div>
                    <div>
                      <div className="text-2xl text-white mb-1">You May Also Like</div>
                      <CustomCarousel items={relatedMovies} />
                    </div>
                    {error && <div className="text-red-500">{error}</div>}
                  </div>
                </div>
              </div>
            </div>
            {/* description */}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(PlayMovie);
