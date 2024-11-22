import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";
import MovieCard from "../Cards/MovieCards";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import axios from "axios";
import CustomCarousel from "../customeCards/CustomCarousel";
import { motion } from "framer-motion";
import Spinner from "../../Spinner/Spinner";
import { Apis } from "../../api/api";
const PlayMovie = () => {
  const [movieview, setMovieView] = useState(true);
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data: movieData, isLoading } = useSearchByidQuery(imdbID);
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
      
      const genreNames = genres.split(", ").map((name) => name.trim());
      const genreIds = genreNames
        .map((name) => genreNameToIdMap[name])
        .filter((id) => id);

      try {
        const titleResponse = await axios.get(
          `https://api.themoviedb.org/3/search/movie?api_key=${Apis.apiKey}&query=${title}`
        );

        const genreResponse =
          genreIds.length > 0
            ? await axios.get(
                `https://api.themoviedb.org/3/discover/movie?api_key=${Apis.apiKey}&with_genres=${genreIds.join(
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

  if (isLoading)
    return (
      <div className="h-screen flex justify-center items-center">
        {" "}
        <Spinner />
      </div>
    );
  console.log(relatedMovies, "check");
  return (
    <>
      <motion.div
        className="pt-6 bg-black  "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} // Start small and transparent
          animate={{ opacity: 1, scale: 1 }} // Animate to full size and visible
          transition={{ duration: 0.5 }}
          className="mx-4 l:h-[15rem]  sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16 3xl:h-[40rem] mb-8 sm:h-[31rem] mt-[4rem]"
        >
          <motion.iframe
            className="w-full h-full rounded-2xl"
            src={
              movieview
                ? `https://vidsrc.xyz/embed/movie/${imdbID}`
                : `https://vidsrc.cc/v2/embed/movie/${imdbID}?autoPlay=false`
            }
            initial={{ opacity: 0 }} // Ensure iframe is hidden initially
            animate={{ opacity: 1 }} // Fade in the iframe
            transition={{ duration: 0.5, delay: 0.3 }}
            allowFullScreen
          ></motion.iframe>
        </motion.div>

        <div className="flex justify-center s:mb-4 md:mb-0 ">
          <button
            type="button"
            className="md:right-12  md:absolute l:mx-5 z-40 px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:text-blue-400 md:px-2 md:py-2 text-white font-semibold rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => setMovieView((prev) => !prev)}
          >
            Change Server
          </button>
        </div>

        {/* Left Side - Sticky Image */}
        <div className="relative md:flex  mx-3 px-2 rounded-md">
          <motion.div
            className="flex-grow-0 sm:basis-full  h-full flex-shrink-0 md:basis-1/4 md:max-w-[17rem]  l:max-w-screen-md px-1 relative w-full md:sticky top-0 md:h-full sm:w-1/2 md:w-1/3 lg:w-1/4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 z-10 w-full">
              <div className="relative flex w-full">
                <div className="flex-1 px-0 relative w-full l:pb-[20rem]  ">
                  <img
                    className="absolute s:relative l:absolute s:mt-2 top-0 left-0 object-cover  s:h-[20rem] w-full h-full md:h-auto md:max-h-screen"
                    src={movieData?.Poster || relatedMovies[0]?.poster}
                    alt={movieData?.Title}
                  />
                </div>
              </div>
              {/*----------------------------> here u need to create that buttons <--------------------*/}
              <div className="grid grid-cols-3 gap-2 text-white md:mt-[6rem] md:mb-5">
                <button className="col-span-2 bg-gray-800  py-2 rounded flex items-center justify-center hover:bg-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="none"
                    data-test-id="icons-thumb-up-stroke"
                    viewBox="0 0 24 24"
                    role="img"
                    className="size-6"
                  >
                    <title>Thumb Up Stroke Icon</title>
                    <path
                      fill="currentColor"
                      d="M21.396 10.025C20.645 9.124 19.525 9 18.429 9H16.19a.252.252 0 0 1-.237-.327c.338-1.123.359-1.603.359-3.29v-.676C16.312 3.214 15.125 2 13.666 2h-.351c-1.179 0-2.226.811-2.545 1.971l-.221.8a11.338 11.338 0 0 1-1.991 3.975.658.658 0 0 1-.371.214A2.984 2.984 0 0 0 6 8H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h1c.848 0 1.611-.357 2.157-.924a3.541 3.541 0 0 0 2.387.924h6.121c1.049 0 2.148-.109 3.082-.904.971-.825 1.234-1.929 1.405-2.9l.714-4.04c.179-1.021.306-2.189-.47-3.131M7 18c0 .551-.449 1-1 1H5c-.551 0-1-.449-1-1v-7c0-.551.449-1 1-1h1c.551 0 1 .449 1 1zm12.896-5.19-.713 4.039c-.169.957-.36 1.408-.732 1.724-.371.315-.838.427-1.786.427H10.5c-.827 0-1.5-.673-1.5-1.5V11c0-.067-.016-.131-.02-.197a2.648 2.648 0 0 0 1.155-.827 13.31 13.31 0 0 0 2.342-4.673l.221-.8c.081-.296.335-.503.617-.503h.351c.355 0 .646.317.646.707v.676c0 1.916 0 1.916-.597 3.72a1.46 1.46 0 0 0 .195 1.312c.264.366.692.585 1.144.585h3.375c.824 0 1.253.092 1.428.302.178.216.189.653.039 1.508"
                    />
                  </svg>
                </button>

                <button className=" col-span-1 font-libre   bg-gray-800 py-2 rounded flex items-center justify-center hover:bg-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="none"
                    data-test-id="icons-thumb-down-stroke"
                    viewBox="0 0 24 24"
                    role="img"
                    className="size-6"
                  >
                    <title>Thumb Down Stroke Icon</title>
                    <path
                      fill="currentColor"
                      d="m21.865 10.844-.714-4.04c-.171-.971-.435-2.075-1.405-2.9C18.812 3.109 17.713 3 16.664 3h-6.12a3.54 3.54 0 0 0-2.387.924A2.986 2.986 0 0 0 6 3H5a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h1c.865 0 1.639-.373 2.187-.96a.664.664 0 0 1 .37.214 11.339 11.339 0 0 1 1.991 3.975l.221.8c.32 1.16 1.366 1.971 2.545 1.971h.351c1.46 0 2.646-1.214 2.646-2.707v-.676c0-1.687-.02-2.168-.359-3.29a.252.252 0 0 1 .237-.327h2.238c1.097 0 2.216-.124 2.968-1.025.776-.942.649-2.11.47-3.131M7 13c0 .551-.45 1-1 1H5c-.551 0-1-.449-1-1V6c0-.551.449-1 1-1h1c.55 0 1 .449 1 1v7m12.855-.302c-.174.21-.603.302-1.427.302h-3.375c-.452 0-.88.219-1.144.586a1.457 1.457 0 0 0-.195 1.312c.597 1.804.597 1.804.597 3.72v.676c0 .39-.29.707-.646.707h-.35c-.283 0-.537-.207-.618-.503l-.22-.8a13.318 13.318 0 0 0-2.343-4.673 2.644 2.644 0 0 0-1.154-.827c.004-.067.02-.131.02-.198V6.5c0-.827.672-1.5 1.5-1.5h6.164c.948 0 1.415.112 1.786.428.372.315.563.767.732 1.724l.713 4.039c.15.854.139 1.291-.04 1.507"
                    />
                  </svg>
                </button>

                <button className="col-span-3 bg-gray-800  font-libre  py-2 rounded flex items-center justify-center hover:bg-gray-700">
                  Add to My List
                </button>

                <button className="col-span-2 bg-gray-800 py-2  font-libre rounded flex items-center justify-center hover:bg-gray-700">
                  Share
                </button>

                <button className="bg-gray-800 py-2 rounded flex items-center justify-center hover:bg-gray-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="none"
                    viewBox="0 0 24 24"
                    role="img"
                    className="size-6"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M9 12a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Scrollable Content */}
          <div className="sm:basis-full  flex-shrink-0  lg:flex-grow-0 md:basis-3/4 max-w-full px-3  sm:w-full md:w-2/3 lg:w-3/4 l:mt-4  ">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white md:text-left lg:text-4xl font-extrabold leading-[56px] mt-0 mr-0 mb-2 font-libre s:text-xl s:text-center l:text-2xl"
            >
              {movieData?.Title}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm font-medium leading-6 tracking-normal text-white text-opacity-75"
            >
              <div className="flex flex-wrap md:justify-start md:items-center gap-x-1 s:justify-center">
                <span className="mr-3">
                  {movieData?.Year} - {minsToHours(movieData?.Runtime)}
                </span>
                {/* svg */}
                {/* Rating */}{" "}
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
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-[16px] leading-6 mt-2 mb-4 max-w-2xl"
              >
                {movieData?.Plot}
              </motion.p>
              <div className="text-[16px] leading-6 relative w-full mb-20">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex"
                >
                  <span className="inline-block flex-grow-0 flex-shrink w-40 text-white text-[16px] leading-6">
                    Starring
                  </span>
                  <span className="text-white text-opacity-75 text-[16px] leading-6 relative w-full">
                    {movieData?.Actors}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex"
                >
                  <span className="text-white inline-block flex-grow-0 flex-shrink-0 s:w-[6.4rem] m:w-[6.8rem] l:w-[7.1rem] lg:w-[8.1rem]">
                    Directed by
                  </span>
                  <span className="text-[16px] lg:ml-2 leading-6 opacity-100 cursor-pointer inline-block relative transition-opacity duration-300 font-normal">
                    {movieData?.Director}
                  </span>
                </motion.div>
                <div className="my-4 border-b border-gray-700"></div>
                {relatedMovies.length > 0 && (
                  <div>
                    <div className="text-2xl text-white mb-1">You May Also Like</div>
                    <CustomCarousel items={relatedMovies} />
                  </div>
                )}

                {error && (
                  <div className="text-red-500">{`${error} change dns or proxy to view `}</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default memo(PlayMovie);
