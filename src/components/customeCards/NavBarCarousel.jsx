import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  EffectCoverflow,
  Pagination,
  Navigation,
  Mousewheel,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "../../index.css";
import { useFetchPopularMoviesQuery } from "../../Redux/Services/Searchapi";
import axios from "axios";
import { Apis } from "../../api/api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NavBarCarousel = () => {
  const { data, isLoading, error } = useFetchPopularMoviesQuery();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const swiperRef = useRef(null);

  const [showingCards, setShowingCards] = useState(null);
  // console.log(data, "dfff");
  // console.log(movies, "d");

  const fetchMovies = useCallback(async () => {
    if (data && data.results) {
      try {
        const movieData = data.results;

        // Fetch trailers and IMDb IDs
        const moviesWithDetails = await Promise.all(
          movieData.map(async (movie) => {
            // Fetch movie details to get IMDb ID
            const detailsResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${Apis.apiKey}&language=en-US`
            );
            const releaseDatesResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}/release_dates?api_key=${Apis.apiKey}`
            );

            // Get certification for the US
            const usReleaseData = releaseDatesResponse.data.results.find(
              (release) => release.iso_3166_1 === "US"
            );
            let certification = null;
            if (usReleaseData && usReleaseData.release_dates.length > 0) {
              certification = usReleaseData.release_dates[0].certification;
            }
            // Get the trailer information
            const trailerResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${Apis.apiKey}&language=en-US`
            );

            // Find the trailer URL
            const trailer = trailerResponse.data.results.find(
              (vid) => vid.type === "Trailer"
            );
            const genres = detailsResponse.data.genres
              .map((genre) => genre.name)
              .join(" • ");
            return {
              ...movie,
              imdb_id: detailsResponse.data.imdb_id,
              runtime: detailsResponse.data.runtime,
              genres: genres,
              certification: certification || "Not Rated",
              trailerUrl: trailer
                ? `https://www.youtube.com/watch?v=${trailer.key}`
                : null,
            };
          })
        );
        const uniqueMovies = Array.from(
          new Map(moviesWithDetails.map((movie) => [movie.imdb_id, movie])).values()
        );
        setMovies(uniqueMovies);
        setSelectedMovie(moviesWithDetails[0]);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }
  }, [data]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSlideChangeTransitionStart = useCallback(
    (swiper) => {
      const activeIndex = swiper.realIndex; // Get the active index properly
      setSelectedMovie(movies[activeIndex]);
    },
    [movies]
  );

  const handleResize = useCallback(() => {
    const windowWidth = window.innerWidth;
    if (windowWidth < 320) {
      setShowingCards(2);
    } else if (windowWidth < 425) {
      setShowingCards(3);
    } else if (windowWidth < 768) {
      setShowingCards(4);
    } else if (windowWidth < 1024) {
      setShowingCards(4);
    } else {
      setShowingCards(4);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  if (isLoading) return <> Loading..</>;
  if (error) return <div>Error fetching data</div>;
  // console.log(selectedMovie, "activemovie");

  return (
    <>
      {movies?.length > 0 && (
        <motion.div
          className={`flex s:flex-col s:p-3  l:items-center md:items-stretch  lg:items-end lg:py-6 backdrop:blur-sm lg:justify-evenly  l:justify-center l:p-1 l:min-h-[400px]  md:min-h-[95vh] w-full bg-cover bg-center z-30 l:flex l:flex-col lg:flex-row  overflow-hidden transition-transform transform scale-100 duration-300 ease-in-out `}
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280/${selectedMovie?.backdrop_path})`,
          }}
          initial={{ scale: 1.2, opacity: 0 }} // Initial state for background
          animate={{ scale: 1, opacity: 1 }} // Animation on load
          transition={{ duration: 0.8, ease: "easeInOut" }} // Duration of the animation
        >
          {/* Left Poster */}
          {/* Movie Information */}

          <div className="absolute inset-0 bg-black opacity-10 z-0"></div>
          <motion.div
            key={selectedMovie?.imdb_id}
            initial={{ opacity: 0, y: -20 }} // Initial state for title
            animate={{ opacity: 1, y: 0 }} // Animation on load
            exit={{ opacity: 0, y: -20 }} // Animation when title changes
            transition={{ duration: 0.5 }} // Duration of the animation
            className="text-white space-y-4 s:mt-12  shrink  l:text-sm l:px-2  l:mt-10 lg:mt-0 lg:me-28 l:max-w-screen-l lg:w-full z-10  "
          >
            <motion.h2
              className="lg:text-5xl font-gilroy font-thin s:text-3xl l:text-3xl line-clamp-1"
              key={`${selectedMovie?.imdb_id}-${new Date().getTime()}`}
              initial={{ opacity: 0, y: -20 }} // Initial state for title
              animate={{ opacity: 1, y: 0 }} // Animation on load for title
              transition={{ duration: 0.6 }}
            >
              {selectedMovie?.title}
            </motion.h2>
            <div className="bg-gray-400 h-px w-2/4 mb-4"></div>
            <div className="flex items-center space-x-4  s:text-base ">
              <span className=" font-gilroy">
                {selectedMovie?.release_date?.split("-")[0]} • {selectedMovie?.runtime}{" "}
                min
              </span>
              <span className="flex items-center   space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  fill="none"
                  viewBox="0 0 24 24"
                  role="img"
                  className="text-gray-400"
                >
                  <path fill="currentColor" d="M12 12H6v2h6zM18 12h-4v2h4z"></path>
                  <path
                    fill="currentColor"
                    d="M21.196 4.805C20.391 4 19.354 4 17.786 4H6.214c-1.569 0-2.605 0-3.41.805C2 5.608 2 6.645 2 8.214v11.903a.501.501 0 0 0 .757.429l4.005-2.403A.997.997 0 0 1 7.277 18h10.509c1.569 0 2.605 0 3.411-.805.803-.804.803-1.841.803-3.41V8.214c0-1.569 0-2.606-.804-3.409M20 14.558c0 .961-.51 1.442-1.431 1.442H7c-.363 0-.718.099-1.029.285l-1.668 1.001A.2.2 0 0 1 4 17.114V7.442C4 6.481 4.51 6 5.431 6H18.57c.92 0 1.43.481 1.43 1.442z"
                  ></path>
                </svg>
                <span className="text-slate-400  px-1 font-libre  rounded">
                  {selectedMovie?.certification}{" "}
                </span>
              </span>
            </div>
            <div className=" font-libre  s:text-base text-slate-400">
              {selectedMovie?.genres}
            </div>
            <motion.p
              className=" font-gilroy s:line-clamp-3   s:text-base text-slate-400 l:line-clamp-5 md:line-clamp-4"
              key={selectedMovie?.imdb_id}
              initial={{ opacity: 0, y: 20 }} // Initial state for description
              animate={{ opacity: 1, y: 0 }} // Animation on load for description
              transition={{ duration: 0.6 }} // Duration of the animation
            >
              {selectedMovie?.overview}
            </motion.p>
            {/* Watch Now Button */}
            <button className="bg-yellow-500  s:text-base text-black px-6 py-2 rounded flex items-center space-x-2 font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                fill="none"
                viewBox="0 0 24 24"
                role="img"
                className="text-black"
              >
                <path
                  fill="currentColor"
                  d="M19.622 10.393A105.98 105.98 0 0 0 6.419 3.176c-1.2-.55-2.572.25-2.663 1.558-.167 2.4-.256 4.82-.256 7.262 0 2.444.088 4.868.256 7.27.092 1.307 1.464 2.108 2.663 1.558a106.112 106.112 0 0 0 13.203-7.217 1.91 1.91 0 0 0 0-3.214"
                ></path>
              </svg>
              <span>
                <Link to={`/dashboard/movie/${selectedMovie?.imdb_id}`}>Watch Now</Link>
              </span>
            </button>
          </motion.div>

          {/* Right Poster */}
          <motion.div
            className="relative s:hidden md:block lg:min-w-[37rem]  l:min-w-[14rem]  border-[1px_solid_rgba(255,255,255,0.1)] z-10 "
            initial={{ opacity: 0, scale: 0.9 }} // Initial state for Swiper
            animate={{ opacity: 1, scale: 1 }} // Animation on load
            transition={{ duration: 0.6 }} // Duration of the animation
          >
            <Swiper
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={showingCards}
              ref={swiperRef}
              autoplay={{
                delay: 6000,
                pauseOnMouseEnter: "onclick",
              }}
              mousewheel={true}
              loop={true}
              coverflowEffect={{
                rotate: 10,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: true,
              }}
              onSlideChangeTransitionStart={(swiper) =>
                handleSlideChangeTransitionStart(swiper)
              }
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination, Autoplay, Navigation, Mousewheel]}
              className=" w-full lg:max-w-2xl py-8  perspective-1500  md:max-w-[35rem]  l:max-w-md 2xl:max-w-[42rem]"
            >
              {movies.map((e, i) => (
                <SwiperSlide key={`${e.imdb_id}-${i}`}>
                  <div className=" *:rounded-lg cursor-pointer ">
                    <motion.img
                      className=" lg:w-40 lg:h-60 object-cover l:w-32 l:h-30 "
                      src={`https://image.tmdb.org/t/p/w500/${e.poster_path}`}
                      alt={e.title}
                      initial={{ opacity: 0, scale: 0.9 }} // Initial state for image
                      animate={{ opacity: 1, scale: 1 }} // Animation on load for image
                      transition={{ duration: 0.6 }} // Duration of the animation
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
export default React.memo(NavBarCarousel);
