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
import { tmdbGet } from "../../api/tmdb";
import { Apis } from "../../api/api";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Smooth ease-out curve shared by the hero animations.
const EASE = [0.22, 1, 0.36, 1];
const heroContainer = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const heroTitle = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};
const heroItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const formatRuntime = (min) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`);

const backdropUrl = (movie) =>
  movie?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;

// Logo URLs that have finished downloading, so a slide's title shows the logo immediately.
const loadedLogos = new Set();
const preload = (src, onDone) => {
  if (!src) return;
  const img = new Image();
  img.onload = () => onDone?.(src);
  img.src = src;
};

// Shows the movie's official logo once it has loaded; until then (or if there is none), the text title.
const HeroTitle = ({ movie }) => {
  const [logoReady, setLogoReady] = useState(() => loadedLogos.has(movie?.logoUrl));
  if (!movie) return null;
  return (
    <>
      {movie.logoUrl && (
        <img
          src={movie.logoUrl}
          alt={movie.title}
          onLoad={() => {
            loadedLogos.add(movie.logoUrl);
            setLogoReady(true);
          }}
          className={`${logoReady ? "block" : "hidden"} w-auto max-w-[90%] max-h-24 md:max-h-32 lg:max-w-[26rem] xl:max-h-40 xl:max-w-[34rem] 2xl:max-h-52 2xl:max-w-[44rem] object-contain object-left drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]`}
        />
      )}
      {!logoReady && movie.title}
    </>
  );
};

const cardsForWidth = (w) => {
  if (w < 320) return 2;
  if (w < 425) return 3;
  if (w < 1024) return 4;
  if (w < 1280) return 3; // narrower carousel column on small laptops: fewer, larger cards
  return 4;
};

// type="movie" (popular movies) or type="tv" (trending TV shows). Both are normalised to the
// same shape (title, release_date, imdb_id, ...) so the hero UI is shared.
const NavBarCarousel = ({ type = "movie" }) => {
  const isTv = type === "tv";
  const { data: movieList, isLoading, error } = useFetchPopularMoviesQuery(undefined, { skip: isTv });
  const [tvList, setTvList] = useState(null);
  useEffect(() => {
    if (!isTv) return;
    tmdbGet("https://api.themoviedb.org/3/trending/tv/week")
      .then(({ data }) => setTvList(data))
      .catch((err) => console.error("Error fetching trending TV:", err));
  }, [isTv]);
  const data = isTv ? tvList : movieList;
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const swiperRef = useRef(null);

  const [showingCards, setShowingCards] = useState(() => cardsForWidth(window.innerWidth));
  // console.log(data, "dfff");
  // console.log(movies, "d");

  const fetchMovies = useCallback(async () => {
    if (data && data.results) {
      try {
        const movieData = data.results;

        // One TMDB call per movie: details + release dates + videos via append_to_response.
        // A movie that fails to load is dropped instead of breaking the whole carousel.
        const moviesWithDetails = await Promise.all(
          movieData.map(async (movie) => {
            try {
              const { data: details } = await tmdbGet(
                `https://api.themoviedb.org/3/${isTv ? "tv" : "movie"}/${movie.id}`,
                {
                  params: {
                    api_key: Apis.apiKey,
                    language: "en-US",
                    // "images" brings the official title logos (transparent PNGs) in the same call.
                    append_to_response: isTv
                      ? "content_ratings,videos,images,external_ids"
                      : "release_dates,videos,images",
                    include_image_language: "en,null",
                  },
                }
              );

              const usRelease = details.release_dates?.results?.find(
                (release) => release.iso_3166_1 === "US"
              );
              const certification = isTv
                ? details.content_ratings?.results?.find((r) => r.iso_3166_1 === "US")?.rating
                : usRelease?.release_dates?.[0]?.certification;
              const trailer = details.videos?.results?.find((vid) => vid.type === "Trailer");
              const logos = details.images?.logos ?? [];
              const logo = logos.find((l) => l.iso_639_1 === "en") ?? logos[0];

              return {
                ...movie,
                title: details.title ?? details.name,
                release_date: details.release_date ?? details.first_air_date,
                imdb_id: isTv ? details.external_ids?.imdb_id : details.imdb_id,
                runtime: isTv ? null : details.runtime,
                seasons: isTv ? details.number_of_seasons : null,
                genres: details.genres.map((genre) => genre.name).join(" • "),
                certification: certification || "Not Rated",
                trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
                logoUrl: logo ? `https://image.tmdb.org/t/p/w500${logo.file_path}` : null,
              };
            } catch (error) {
              console.error(`Error fetching TMDB details for ${movie.id}:`, error);
              return null;
            }
          })
        );
        const uniqueMovies = Array.from(
          new Map(
            moviesWithDetails.filter((m) => m?.imdb_id).map((movie) => [movie.imdb_id, movie])
          ).values()
        );
        setMovies(uniqueMovies);
        setSelectedMovie(uniqueMovies[0]);
        // Logos are small transparent PNGs: fetch them all up front.
        uniqueMovies.forEach((m) => preload(m.logoUrl, (src) => loadedLogos.add(src)));
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }
  }, [data, isTv]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Backdrops are large: preload only the neighbouring slides so the next one never shows blank.
  useEffect(() => {
    if (!selectedMovie || movies.length === 0) return;
    const i = movies.findIndex((m) => m.imdb_id === selectedMovie.imdb_id);
    if (i < 0) return;
    preload(backdropUrl(movies[(i + 1) % movies.length]));
    preload(backdropUrl(movies[(i - 1 + movies.length) % movies.length]));
  }, [selectedMovie, movies]);

  const handleSlideChangeTransitionStart = useCallback(
    (swiper) => {
      const activeIndex = swiper.realIndex; // Get the active index properly
      setSelectedMovie(movies[activeIndex]);
    },
    [movies]
  );

  const handleResize = useCallback(() => setShowingCards(cardsForWidth(window.innerWidth)), []);

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
          className={`relative flex s:flex-col s:p-3  l:items-center md:items-stretch  lg:items-end lg:py-10 lg:justify-between l:justify-center l:p-1 l:min-h-[400px]  md:min-h-[95vh] w-full bg-[#0b0614] z-30 l:flex l:flex-col lg:flex-row gap-8 overflow-hidden`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* Backdrop: crossfades smoothly between movies instead of switching abruptly */}
          <AnimatePresence initial={false}>
            <motion.div
              key={backdropUrl(selectedMovie) ?? "none"}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: backdropUrl(selectedMovie) ? `url(${backdropUrl(selectedMovie)})` : "none",
              }}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            />
          </AnimatePresence>

          {/* Shade the left (text) side and the bottom so title and copy stay readable on any backdrop */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 z-0 bg-gradient-to-t from-[#0b0614] to-transparent"></div>

          {/* From lg up, text + posters sit in the same centred container (and padding) as the
              navbar, so the title lines up with the logo. Below lg, "contents" makes this wrapper
              invisible to layout, keeping the mobile/tablet arrangement unchanged. */}
          <div className="contents lg:relative lg:z-10 lg:container lg:mx-auto lg:px-6 lg:flex lg:items-end lg:justify-between lg:gap-8">
          {/* Movie info: one staggered fade-up per slide */}
          <motion.div
            key={selectedMovie?.imdb_id}
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="relative text-white space-y-4 2xl:space-y-5 s:mt-12 shrink l:text-sm l:px-2 l:mt-10 lg:mt-0 lg:text-base 2xl:text-lg w-full min-w-0 lg:flex-1 lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl z-10"
          >
            <motion.h2
              variants={heroTitle}
              className="font-gilroy font-bold leading-tight s:text-3xl l:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl line-clamp-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
            >
              <HeroTitle movie={selectedMovie} />
            </motion.h2>

            <motion.div
              variants={heroItem}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm 2xl:text-base text-gray-200 font-medium"
            >
              {selectedMovie?.vote_average > 0 && (
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
                  </svg>
                  {selectedMovie.vote_average.toFixed(1)}
                </span>
              )}
              {selectedMovie?.release_date && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{selectedMovie.release_date.split("-")[0]}</span>
                </>
              )}
              {selectedMovie?.runtime > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{formatRuntime(selectedMovie.runtime)}</span>
                </>
              )}
              {selectedMovie?.seasons > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>
                    {selectedMovie.seasons} Season{selectedMovie.seasons > 1 ? "s" : ""}
                  </span>
                </>
              )}
              {selectedMovie?.certification && selectedMovie.certification !== "Not Rated" && (
                <span className="rounded border border-white/40 px-1.5 py-px text-xs font-semibold tracking-wide">
                  {selectedMovie.certification}
                </span>
              )}
            </motion.div>

            {selectedMovie?.genres && (
              <motion.div variants={heroItem} className="flex flex-wrap gap-2">
                {selectedMovie.genres.split(" • ").map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs 2xl:text-sm text-gray-100 ring-1 ring-white/15 backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </motion.div>
            )}

            <motion.p
              variants={heroItem}
              className="font-gilroy leading-relaxed text-gray-300 s:text-base line-clamp-3 lg:max-w-lg 2xl:max-w-2xl"
            >
              {selectedMovie?.overview}
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={`/dashboard/${isTv ? "tvSeries" : "movie"}/${selectedMovie?.imdb_id}`}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-7 py-3 font-bold text-black shadow-lg shadow-yellow-500/20 transition duration-200 hover:scale-[1.03] hover:bg-yellow-300 active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M19.622 10.393A105.98 105.98 0 0 0 6.419 3.176c-1.2-.55-2.572.25-2.663 1.558-.167 2.4-.256 4.82-.256 7.262 0 2.444.088 4.868.256 7.27.092 1.307 1.464 2.108 2.663 1.558a106.112 106.112 0 0 0 13.203-7.217 1.91 1.91 0 0 0 0-3.214" />
                </svg>
                Watch Now
              </Link>
              {selectedMovie?.trailerUrl && (
                <a
                  href={selectedMovie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition duration-200 hover:border-white/40 hover:bg-white/20 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2.5" y="5" width="19" height="14" rx="3" />
                    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
                  </svg>
                  Trailer
                </a>
              )}
            </motion.div>
          </motion.div>

          {/* Right Poster */}
          <motion.div
            className="relative s:hidden md:block l:min-w-[14rem] lg:w-[46%] lg:min-w-0 lg:shrink-0 xl:w-auto xl:min-w-[37rem] border-[1px_solid_rgba(255,255,255,0.1)] z-10 "
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
              // Clicking a side card brings it to the centre (and updates the hero via onSlideChange).
              slideToClickedSlide={true}
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
              className=" w-full lg:max-w-2xl py-8  perspective-1500  md:max-w-[35rem]  l:max-w-md 2xl:max-w-[50rem]"
            >
              {movies.map((e, i) => (
                <SwiperSlide key={`${e.imdb_id}-${i}`}>
                  <div className=" *:rounded-lg cursor-pointer ">
                    <motion.img
                      // Fixed sizes give the coverflow its 3D overlap. Only on 1024–1279px (narrow
                      // carousel column) do posters fill the slide instead, so they don't pile up.
                      className="object-cover l:w-32 l:h-30 lg:w-full lg:h-auto lg:aspect-[2/3] xl:w-40 xl:h-60 xl:aspect-auto 2xl:w-48 2xl:h-72"
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
          </div>
        </motion.div>
      )}
    </>
  );
};
export default React.memo(NavBarCarousel);
