// NavBar.js
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered, faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
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
import { useSearchMoviesSeriesQuery } from "../Redux/Services/Searchapi";
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
  // const { data, error, isLoading } = useSearchMoviesSeriesQuery(query);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const Search = useSelector(selectSearchResults);
  // console.log(user)
  // console.log(movies, "mv");
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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

  const navbarHeight = visible ? 90 : 0;

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  const handleMovieLinkClick = () => {
    // Set the state to true when a movie link is clicked
    setIsMovieLinkClicked(true);
    setQuery("");
  };

  // const handleSearch = useCallback(async () => {
  //   if (isSuccess && movies) {
  //     try {
  //       setData([]);
  //       dispatch(resetSearchResults());
  //       dispatch(setDataLoading(true));
  //       if (movies.Response === "True") {
  //         dispatch(setTotalResults(Number(movies.totalResults)));

  //         const combinedResults = await Promise.all(
  //           movies.Search.map(async (movie) => {
  //             try {
  //               const detailResponse = await axios.get(
  //                 `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=8d58c823`
  //               );
  //               const movieDetails = detailResponse.data;

  //               return {
  //                 ...movie,
  //                 Plot: movieDetails.Plot || "Plot not available",
  //                 Genre: movieDetails.Genre || "Genre not available",
  //                 Director: movieDetails.Director || "Director not available",
  //                 Actors: movieDetails.Actors || "Actors not available",
  //                 imdbRating: movieDetails.imdbRating || "Rating not available",
  //               };
  //             } catch (error) {
  //               console.error(`Error fetching details for ${movie.imdbID}:`, error);
  //               return movie;
  //             }
  //           })
  //         );

  //         dispatch(setSearchResults(combinedResults));
  //         setData(combinedResults);
  //         console.log(Data, "sasdgvah");
  //         dispatch(setDataLoading(false));
  //         dispatch(setSearchQuery(query));

  //         return true;
  //       } else {
  //         dispatch(setDataLoading(false));
  //         return false;
  //       }
  //     } catch (error) {
  //       console.error("Error handling search:", error);
  //       dispatch(setDataLoading(false));
  //       return false;
  //     }
  //   }
  //   return false;
  // });
  // useEffect(() => {
  //   handleSearch();
  // }, [query]);

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
        className={`p-1 bg-gray-800 border-b-2 border-gray-900 ${
          visible
            ? "fixed top-0 left-0 w-full z-50 bg-gray-400 transition-all duration-1000 ease-in-out "
            : "" // Hide the navbar when `visible` is false
        }`}
      >
        <div className="container flex items-center justify-between 3xl:justify-around mx-auto ">
          {/* offCanvas trigger Menu Icon */}
          <button
            onClick={toggleOffCanvas}
            className="text-white lg:hidden focus:outline-none"
          >
            <FontAwesomeIcon className="fa-solid" icon={faBarsStaggered} />
          </button>

          {/* Logo or Brand (centered) */}
          <Link
            to="/dashboard"
            className="mx-auto text-4xl font-bold text-white font-libre lg:mx-0 hover:text-yellow-400 "
          >
            MovieNexus
          </Link>
          {isOffCanvasOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-black bg-opacity-50"
                onClick={toggleOffCanvas}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <motion.div
                  className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 "
                  variants={menuVariants}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Close icon */}
                  <motion.div
                    className="text-white hover:text-gray-300 py-2 px-4 font-libre cursor-pointer flex items-center justify-center"
                    onClick={toggleOffCanvas}
                    whileHover={{ scale: 1.1 }} // Add scale animation on hover
                    whileTap={{ scale: 0.9 }} // Add scale animation on tap/click
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
          <div className="hidden lg:flex gap-3 md:ml-[28rem] font-libre ">
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

          {/* User Profile */}
          <div ref={dropdownRef} className="items-center hidden space-x-4 lg:flex">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className={`inline-flex items-center border border-transparent font-medium rounded-full text-white bg-gray-800  
                  ${isOpen ? "focus:ring focus:ring-blue-700 " : ""}`}
                onClick={toggleDropdown}
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
                  className="origin-top-right absolute z-50 right-0 mt-2 min-w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none *:font-libre"
                >
                  <div className="flex justify-evenly items-center relative pt-1">
                    {" "}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          className=" object-cover rounded-full size-12 "
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
                      className="text-black-800 "
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-[1rem] truncate max-w-[6rem]"
                      >
                        {user.username.slice(0, 10)}
                      </motion.div>
                      <ul className="text-xs text-blue-500 font-libre">
                        <li>Free</li>
                        <li>online</li>
                      </ul>
                    </motion.div>
                  </div>

                  <hr className="mt-3" />
                  <div className="py-1 *:">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      <Link to="/dashboard/profile">Edit Profile</Link>
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Settings
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Earnings
                    </motion.button>
                    <hr className="my-1" />
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 hover:text-gray-900"
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

      {/* Additional content or search functionality */}
      <div
        style={{ paddingTop: navbarHeight }}
        className="flex items-center p-4 ml-auto space-x-4 bg-gray-800 place-content-center"
      >
        <div className="relative text-gray-600 focus-within:text-gray-400 w-[70rem]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <FontAwesomeIcon icon={faSearch} className="text-lg" />
          </span>
          <input
            type="search"
            className="w-full py-2 pl-10 pr-4 bg-transparent border border-green-500 rounded-md focus:outline-none focus:border-green-500"
            placeholder="Search Movies & Tv Shows/ webSeries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="mt-2 ">
          <button
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800 "
            onClick={handleSearch}
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Search
            </span>
          </button>
        </div>
        {isLoading && <div className="text-white">Loading...</div>}
        {!isSearchResultsPage &&
          isSuccess &&
          !isMovieLinkClicked &&
          Data.length > 0 &&
          !isLoading && (
            <motion.div
              className={`right-0 border-t-0 ml-0 top-[11rem] z-50 w-96 opacity-90 absolute  ${
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
                  <ul className="float-left w-full mt-0 text-black transition-opacity shadow-md bg-slate-950 bg-opacity-95">
                    <li className="block float-left w-full p-3 border-b-2 border-current">
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
