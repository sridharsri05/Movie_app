// NavBar.js
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered, faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useSearchMoviesQuery } from "../Redux/Services/MovieApi";
import { setSearchResults } from "../Redux/searchSlice";
import { logout, selectAuth } from "../Redux/authSlice";

const NavBar = ({ image = true }) => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isMovieLinkClicked, setIsMovieLinkClicked] = useState(false);
  const location = useLocation();
  const { user } = useSelector(selectAuth);
  const { data: movies, isSuccess } = useSearchMoviesQuery(query);
  const dropdownRef = useRef(null);

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
    // Function to handle scroll event
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

  const handleSearch = async () => {
    try {
      const firstMovie = movies;

      if (firstMovie) {
        // Fetch playable movie from vidsrcApi using titleId
        const titleId = firstMovie.imdbID;
        // You can perform additional logic or API calls here if needed
        console.log(titleId, "navbar");
        // Dispatch the setSearchResults action to update the search results in Redux store
        dispatch(setSearchResults(movies || []));
        setQuery("");
      }
    } catch (error) {
      console.error("Error handling search:", error);
    }
  };

  const handleSignOut = () => {
    // Dispatch the logout action
    dispatch(logout());
    // You can also add other logic here, such as redirecting the user to the login page
  };
  
  return (
    <>
      <nav className="p-4 bg-gray-800 border-b-2 border-gray-900 ">
        <div className="container flex items-center justify-between 3xl:justify-around mx-auto">
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
            className="mx-auto text-4xl font-bold text-white font-libre lg:mx-0"
          >
            MovieHub
          </Link>
          {isOffCanvasOpen && (
            <>
              <div
                className="fixed inset-0 z-50 bg-black bg-opacity-50"
                onClick={toggleOffCanvas}
              >
                <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition duration-300 ease-in-out ">
                  {/* Off-canvas menu content goes here */}
                  <div className=" flex  flex-col justify-center items-center min-h-screen ">
                    <Link to="/dashboard" className="text-white hover:text-gray-300">
                      Home
                    </Link>
                    <Link
                      to="/dashboard/dropdown1"
                      className="text-white hover:text-gray-300"
                    >
                      TV Shows
                    </Link>
                    <Link
                      to="/dashboard/dropdown2"
                      className="text-white hover:text-gray-300"
                    >
                      Trending
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Navigation Links */}
          <div className="hidden lg:flex gap-3 md:ml-[28rem] ">
            <Link to="/dashboard" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/dashboard/dropdown1" className="text-white hover:text-gray-300">
              TV Shows
            </Link>
            <Link to="/dashboard/dropdown2" className="text-white hover:text-gray-300">
              Trending
            </Link>
          </div>

          {/* User Profile */}
          <div ref={dropdownRef} className="items-center hidden space-x-4 lg:flex">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className={`inline-flex items-center border border-transparent font-medium rounded-full text-white bg-gray-800  ${
                  isOpen ? "" : "hover:border-gray-400"
                }  ${isOpen ? "focus:ring focus:ring-blue-700 " : ""}`}
                onClick={toggleDropdown}
              >
                {/* You may replace this with your Avatar component */}
                <div className="flex items-center justify-center ">
                  {image ? (
                    <div className="  size-[3.5rem] ">
                      <img
                        src={
                          "https://imgs.search.brave.com/Untz9IPAq0oiUcfN8fk7HLba5S-y5zmEOXfDG5xp1zk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE0/NDQ3MDM2ODY5ODEt/YTNhYmJjNGQ0ZmUz/P3E9ODAmdz0xMDAw/JmF1dG89Zm9ybWF0/JmZpdD1jcm9wJml4/bGliPXJiLTQuMC4z/Jml4aWQ9TTN3eE1q/QTNmREI4TUh4elpX/RnlZMmg4T0h4OGNH/bGpkSFZ5Wlh4bGJu/d3dmSHd3Zkh4OE1B/PT0.jpeg"
                        }
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
                <div className="origin-top-right absolute z-50 right-0 mt-2  min-w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none *:font-libre">
                  <div className="flex justify-evenly items-center realtive pt-1">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="p-2 bg-blue-500 text-white rounded-full size-6 fa-duotone"
                    />
                    <div className=" text-black-800 ">
                      <div className=" text-[1rem]  ">{user.username}</div>
                      <ul className=" text-xs text-blue-500 font-libre">
                        <li>Free</li>
                        <li>online</li>
                      </ul>
                    </div>
                  </div>

                  <hr className="mt-3" />
                  <div className="py-1 *:">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      <Link to="/dashboard/profile"> Edit Profile</Link>
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      Earnings
                    </button>
                    <hr className="my-1" />
                    <button
                      className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Additional content or search functionality */}
      <div className="flex items-center p-4 ml-auto space-x-4 bg-gray-800 place-content-center">
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
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
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

        {isSuccess && !isMovieLinkClicked && movies?.Response === "True" ? (
          <div
            className={`right-0 border-t-0 ml-0 top-[11rem] z-50 w-96 opacity-90 absolute transition-all ease-out ${
              isScrolled ? "hidden transition-all ease-in" : ""
            }`}
          >
            <Link to={`movie/${movies?.imdbID}`} onClick={handleMovieLinkClick}>
              <ul className="float-left w-full mt-0 text-black transition-opacity shadow-md bg-slate-950 bg-opacity-95">
                <li className="block float-left w-full p-3 border-b-2 border-current">
                  <div className="float-left inline-block mr-[20px] h-2/4 w-24  overflow-hidden">
                    <img
                      src={movies.Poster}
                      alt={movies.Title}
                      className="w-full h-full rounded-md"
                    />
                  </div>
                  <div className="mb-0 text-sm *:font-normal text-ellipsis whitespace-nowrap overflow-hidden text-white">
                    {movies.Title}{" "}
                    <span className="ml-1 text-[12px]">( {movies.Year} )</span>
                    <span className="float-end">⭐ {movies.imdbRating}</span>
                  </div>
                  <p className="font-mono text-sm font-thin text-white text-wrap text-ellipsis">
                    {movies.Plot}
                  </p>
                </li>
              </ul>
            </Link>
          </div>
        ) : (
          // Display a message when no data is available
          <div className="text-white">
            {movies?.Error === "Incorrect IMDb ID." ? "" : movies?.Error}
          </div>
        )}
      </div>
    </>
  );
};

export default NavBar;
