// NavBar.js
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faUser,
  faSearch,
  faSpinner,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useSearchByQueryQuery } from "../Redux/Services/MovieApi";
import {
  resetSearchResults,
  selectCurrentPage,
  selectSearchResults,
  setDataLoading,
  setSearchQuery,
  setSearchResults,
  setTotalResults,
} from "../Redux/searchSlice";
import { logout, selectAuth } from "../Redux/authSlice";
import { motion } from "framer-motion";
import { useFetchPopularMoviesQuery } from "../Redux/Services/Searchapi";
import axios from "axios";
import { debounce } from "lodash";
import { useCallback } from "react";

const NavBar = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isMovieLinkClicked, setIsMovieLinkClicked] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [Data, setData] = useState([]);
  const { user } = useSelector(selectAuth);
  const currentPage = useSelector(selectCurrentPage);
  const { data: movies, isSuccess } = useSearchByQueryQuery(
    {
      query: query,
      page: currentPage,
    },
    { skip: !query }
  );
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const offSetRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const Search = useSelector(selectSearchResults);
  // console.log(user)
  // console.log(d, "mv");
  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  const handleButtonFocus = () => {
    setIsOpen(true);
  };

  const handleButtonBlur = (event) => {
    // Check if the focused element is still within the dropdown
    if (dropdownRef.current && !dropdownRef.current.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    setIsMovieLinkClicked(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      // Set the state based on scroll position (for example, when scrolling down more than 50 pixels)
      setIsScrolled(window.scrollY > 30);
    };
    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleVisibleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(currentScrollPos < prevScrollPos || currentScrollPos < 30); // Update visibility based on scroll direction and position
      setPrevScrollPos(currentScrollPos);
    };

    // Attach the scroll event listener
    window.addEventListener("scroll", handleVisibleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleVisibleScroll);
    };
  }, [prevScrollPos]);

  const navbarHeight = visible ? 0 : 0;

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  const handleMovieLinkClick = () => {
    // Set the state to true when a movie link is clicked
    setIsMovieLinkClicked(true);
    setQuery("");
  };

  const handleSearch = useCallback(
    debounce(async () => {
      if (isSuccess && movies) {
        try {
          setIsLoading(true);
          setError(null);
          setData([]);
          dispatch(resetSearchResults());
          dispatch(setDataLoading(true));

          if (movies.Response === "True") {
            dispatch(setTotalResults(Number(movies.totalResults)));

            const combinedResults = await Promise.all(
              movies.Search.map(async (movie) => {
                try {
                  const detailResponse = await axios.get(
                    `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=8d58c823`
                  );
                  const movieDetails = detailResponse.data;

                  return {
                    ...movie,
                    Plot: movieDetails.Plot || "Plot not available",
                    Genre: movieDetails.Genre || "Genre not available",
                    Director: movieDetails.Director || "Director not available",
                    Actors: movieDetails.Actors || "Actors not available",
                    imdbRating: movieDetails.imdbRating || "Rating not available",
                  };
                } catch (error) {
                  console.error(`Error fetching details for ${movie.imdbID}:`, error);
                  return movie;
                }
              })
            );

            dispatch(setSearchResults(combinedResults));
            setData(combinedResults);
            dispatch(setDataLoading(false));
            dispatch(setSearchQuery(query));
            return true;
          } else {
            setError(movies.Error || "No results found");
          }
        } catch (error) {
          console.error("Error handling search:", error);
          setError("Something went wrong. Please try again later.");
        } finally {
          setIsLoading(false);
          dispatch(setDataLoading(false));
          dispatch(setSearchQuery(query));
        }
      }
    }, 3000),
    [isSuccess, movies, dispatch, query]
  );

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, handleSearch]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch().then((isSuccessful) => {
        if (isSuccessful && query.trim() !== "") {
          setQuery("");
          setIsMovieLinkClicked(true);
          setIsOffCanvasOpen(false);
          navigate(`searchResults/${query}`);
        }
      });
    }
  };

  const handleSignOut = () => {
    // Dispatch the logout action
    dispatch(logout());
  };
  const menuVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };
  const isSearchResultsPage = location.pathname.startsWith("/dashboard/searchResults/");

  return (
    <>
      <nav
        style={{
          background:
            "linear-gradient(180deg, rgba(11,0,25,.8) .98%, rgba(11,0,25,.4) 59.23%, rgba(11,0,25,.2) 78.16%, rgba(11,0,25,0) 96.12%)",
          backgroundBlendMode: "multiply",
        }}
        className={`p-2  fixed top-0 left-0 w-full z-50 transition-transform h-[4.5rem] duration-500 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container  flex items-center justify-between 3xl:justify-evenly  mx-auto">
          {/* offCanvas trigger Menu Icon */}
          <button
            onClick={toggleOffCanvas}
            className="text-white lg:hidden focus:outline-none ml-4"
          >
            <FontAwesomeIcon className="fa-solid" icon={faBarsStaggered} />
          </button>

          {/* Logo or Brand (centered) */}
          <Link
            to="/dashboard"
            className="mx-auto xl:text-4xl lg:ml-3 xl:ml-0 2xl:ml-2 font-bold text-white font-libre lg:mx-0   text-sm sm:text-base md:text-lg lg:text-xl hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500  hover:via-green-400  hover:via-purple-500 hover:via-pink-500 hover:to-green-500 transition-all duration-700 ease-in-out "
         >
            MovieNexus
          </Link>
          {isOffCanvasOpen && (
            <>
              <motion.div
                className="fixed inset-0 h-screen bg-black bg-opacity-50 z-10"
                onClick={toggleOffCanvas}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <motion.div
                  className="relative h-full inset-y-0 left-0  w-64 bg-gray-800  "
                  variants={menuVariants}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Close icon */}
                  <motion.div
                    className="text-white hover:text-gray-300 py-2 px-4 font-libre cursor-pointer flex items-center justify-center"
                    onClick={toggleOffCanvas}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-xl">&times;</span>
                  </motion.div>

                  {/* Off-canvas menu content goes here */}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeInOut" }}
                  >
                    <Link
                      to="/dashboard"
                      className="text-white hover:text-gray-300 py-2 px-4 font-libre block"
                    >
                      Home
                    </Link>
                    <Link
                      to="/dashboard/tvShows/"
                      className="text-white hover:text-gray-300 py-2 px-4 font-libre block"
                    >
                      TV Shows
                    </Link>
                    <Link
                      to="/dashboard/dropdown2"
                      className="text-white hover:text-gray-300 py-2 px-4 font-libre block"
                    >
                      Trending
                    </Link>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-0 left-0 right-0 flex justify-center flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
                  >
                    <Link
                      to="/dashboard/profile"
                      className="text-white hover:text-gray-300 py-2 px-4 font-libre block text-center text-lg"
                    >
                      Profile
                    </Link>
                    <button
                      className="text-white hover:text-gray-300 py-2 px-4 font-libre"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
          {/* Navigation Links */}
          <div className="hidden lg:flex lg:ml-[14rem]  xl:ml-[30rem] gap-3 md:ml-[28rem] font-libre ">
            <Link to="/dashboard" className="text-white hover:text-yellow-500">
              Home
            </Link>
            <Link to="/dashboard/tvshows" className="text-white hover:text-yellow-500">
              TV Shows
            </Link>
            <Link to="/dashboard" className="text-white hover:text-yellow-500">
              Trending
            </Link>
          </div>
          {/* search bar */}
          <div className="relative text-gray-600 focus-within:text-gray-400 ml-4  3xl:ml-0  lg:grid  z-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <FontAwesomeIcon icon={faSearch} className="text-lg" />
            </span>
            <input
              type="search"
              className={`s:focus:w-[180px] l:focus:w-[200px]  transition-all duration-700 ease-in-out w-0 lg:w-full lg:focus:w-full py-2 pl-10 md:pr-4 bg-transparent border border-green-500 rounded-md focus:outline-none focus:border-green-500 ${
                isLoading ? "hide-clear-button" : ""
              }`}
              placeholder="Search Movies & Tv Shows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <span className="absolute s:hidden  inset-y-0 right-0 flex items-center pr-4 justify-end cursor-pointer">
              {isLoading && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="text-lg text-cyan-700"
                />
              )}
            </span>
          </div>
          {/* User Profile */}
          <div ref={dropdownRef} className="items-center hidden space-x-4 lg:flex">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className={`inline-flex items-center border border-transparent font-medium rounded-full text-white bg-gray-800  
                 ${isOpen ? "focus:ring-2 focus:ring-blue-700" : "hover:bg-gray-700"}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleButtonFocus}
                onBlur={handleButtonBlur}
              >
                {/* You may replace this with your Avatar component */}
                <div className="flex items-center justify-center ">
                  {user?.profilePicture ? (
                    <div className=" size-[3.5rem] ">
                      <img
                        src={user?.profilePicture}
                        className="object-cover w-full h-full text-3xl text-white border border-gray-800 rounded-full fa-duotone"
                      />
                    </div>
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-full h-full text-3xl text-white fa-duotone "
                    />
                  )}
                </div>
              </button>

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={handleMouseEnter} // Keep dropdown open when hovering
                  onMouseLeave={handleMouseLeave}
                  className="origin-top-right absolute z-50 right-0 mt-0 min-w-44 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-opacity-30 focus:outline-none *:font-libre"
                >
                  <div className="flex justify-evenly items-center relative pt-1">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          className="object-cover rounded-full size-12"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUser}
                          className="p-2 bg-blue-500 text-white rounded-full size-6 fa-duotone"
                        />
                      )}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-black dark:text-white"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-[1rem] truncate max-w-[6rem]"
                      >
                        {user.username.slice(0, 10)}
                      </motion.div>
                      <ul className="text-xs text-blue-500 dark:text-blue-300 font-libre">
                        <li>Free</li>
                        <li>online</li>
                      </ul>
                    </motion.div>
                  </div>

                  <hr className="mt-3 dark:border-gray-600" />
                  <div className="py-1">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      role="menuitem"
                    >
                      <Link to="/dashboard/profile">Edit Profile</Link>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      role="menuitem"
                    >
                      Earnings
                    </motion.button>
                    <hr className="my-1 dark:border-gray-600" />
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-red-500 dark:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* <------------------------------------------------Additional content or search functionality--------------------------------------------------------> */}
      <div
        style={{ paddingTop: navbarHeight }}
        className={`flex items-center  space-x-4 bg-gray-800 place-content-center ${
          isSuccess ? " visible" : "hidden"
        } `}
      >
        {/*  <------------------------------------------search results miniDisplay--------------------------------------------------> */}
        {isLoading && (
          <div className="text-white grid place-content-center">Loading...</div>
        )}
        {!isSearchResultsPage &&
          isSuccess &&
          !isMovieLinkClicked &&
          Data.length > 0 &&
          !isLoading &&
          !isOffCanvasOpen && (
            <motion.div
              className={`right-0 border-t-0 ml-0 s:hidden md:block l:w-full l:h-[28rem]  l:top-[4rem] md:top-[5rem] z-50 md:w-[26rem] opacity-90 absolute  scroll-smooth scroll-p-0 md:h-[32rem] overflow-y-auto ${
                isScrolled ? "hidden" : ""
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? -20 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {Data.map((movie) => (
                <Link
                  key={movie.imdbID}
                  to={
                    movie.Type === "movie" || movie.Type === "game"
                      ? `/dashboard/movie/${movie?.imdbID}`
                      : movie.Type === "series"
                      ? `/dashboard/tvSeries/${movie?.imdbID}`
                      : `/dashboard/movie/${movie?.imdbID}`
                  }
                  onClick={handleMovieLinkClick}
                >
                  <ul className="float-left w-full mt-0 text-black transition-opacity shadow-md bg-slate-800 bg-opacity-95">
                    <li className="block float-left w-full p-3 border-b-[1px] border-cyan-400">
                      <div className="float-left inline-block mr-[20px] h-2/4 w-24 overflow-hidden">
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="w-full h-full rounded-md"
                        />
                      </div>
                      <div className="mb-0 text-sm *:font-normal text-ellipsis whitespace-nowrap overflow-hidden text-white">
                        {movie.Title}{" "}
                        <span className="ml-1 text-[12px]">( {movie.Year} )</span>
                        <span className="float-end">⭐ {movie.imdbRating}</span>
                      </div>
                      <p className="font-mono text-sm font-thin text-white text-wrap text-ellipsis">
                        {movie.Plot}
                      </p>
                    </li>
                  </ul>
                </Link>
              ))}
            </motion.div>
          )}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </>
  );
};

export default NavBar;
