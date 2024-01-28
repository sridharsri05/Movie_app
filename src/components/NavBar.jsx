// NavBar.js
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered, faUser, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { useSearchMoviesQuery } from "../Redux/Services/MovieApi";
import { setSearchResults } from "../Redux/searchSlice";

const NavBar = ({ image = true }) => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMovieLinkClicked, setIsMovieLinkClicked] = useState(false);
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

  const { data: movies, isSuccess } = useSearchMoviesQuery(query);
  const handleMovieLinkClick = () => {
    // Set the state to true when a movie link is clicked
    setIsMovieLinkClicked(true);
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
      }
    } catch (error) {
      console.error("Error handling search:", error);
    }
  };
  return (
    <>
      <nav className="bg-gray-800 p-4 border-b-2 border-gray-900 ">
        <div className="container mx-auto flex items-center justify-between">
          {/* Mobile Menu Icon */}
          <button className="lg:hidden text-white focus:outline-none">
            <FontAwesomeIcon className="fa-solid" icon={faBarsStaggered} />
          </button>

          {/* Logo or Brand (centered) */}
          <Link
            to="/dashboard"
            className="text-white text-4xl font-libre font-bold mx-auto lg:mx-0"
          >
            MovieHub
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex space-x-4 ml-[28rem]">
            <Link to="/dashboard" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/dashboard/dropdown1" className="text-white hover:text-gray-300">
              Dropdown 1
            </Link>
            <Link to="/dashboard/dropdown2" className="text-white hover:text-gray-300">
              Dropdown 2
            </Link>
          </div>
          {/* User Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className={`inline-flex items-center border border-transparent font-medium rounded-full text-white bg-gray-800  ${
                  isOpen ? "" : "hover:border-gray-400"
                }  ${isOpen ? "focus:ring focus:ring-blue-700 " : ""}`}
                onClick={toggleDropdown}
              >
                {/* You may replace this with your Avatar component */}
                <div className=" flex justify-center items-center ">
                  {image ? (
                    <div className="  size-[3.5rem] ">
                      <img
                        src={
                          "https://imgs.search.brave.com/Untz9IPAq0oiUcfN8fk7HLba5S-y5zmEOXfDG5xp1zk/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE0/NDQ3MDM2ODY5ODEt/YTNhYmJjNGQ0ZmUz/P3E9ODAmdz0xMDAw/JmF1dG89Zm9ybWF0/JmZpdD1jcm9wJml4/bGliPXJiLTQuMC4z/Jml4aWQ9TTN3eE1q/QTNmREI4TUh4elpX/RnlZMmg4T0h4OGNH/bGpkSFZ5Wlh4bGJu/d3dmSHd3Zkh4OE1B/PT0.jpeg"
                        }
                        className="fa-duotone text-3xl text-white h-full w-full  border border-gray-800 object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <FontAwesomeIcon
                      icon={faUser}
                      className="fa-duotone text-3xl text-white h-full w-full "
                    />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="origin-top-right absolute z-50 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none *:font-libre">
                  <div className="py-1">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                    >
                      <Link to="/dashboard/profile">Profile</Link>
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
      <div className="flex items-center space-x-4 ml-auto bg-gray-800 p-4 place-content-center">
        <div className="relative text-gray-600 focus-within:text-gray-400 w-[70rem]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <FontAwesomeIcon icon={faSearch} className="text-lg" />
          </span>
          <input
            type="search"
            className="py-2 pl-10 pr-4 border rounded-md focus:outline-none border-green-500 focus:border-green-500 bg-transparent w-full"
            placeholder="Search Movies & Tv Shows/ webSeries"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className=" mt-2">
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
              <ul className="bg-slate-950 bg-opacity-95 shadow-md text-black float-left w-full mt-0 transition-opacity">
                <li className="float-left w-full block p-3 border-b-2 border-current">
                  <div className="float-left inline-block mr-[20px] h-2/4 w-24  overflow-hidden">
                    <img
                      src={movies.Poster}
                      alt={movies.Title}
                      className="w-full h-full rounded-md"
                    />
                  </div>
                  <div className="mb-0 text-sm *:font-normal text-ellipsis whitespace-nowrap overflow-hidden text-white">
                    {movies.Title}{" "}
                    <span className="ml-1 text-[12px]">( {movies.Year} )</span>{" "}
                    <span className="float-end">⭐ {movies.imdbRating}</span>
                  </div>
                  <p className="text-white text-wrap text-sm font-thin text-ellipsis font-mono">
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
