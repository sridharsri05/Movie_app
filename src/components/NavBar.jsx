// NavBar.js
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useSearchByQueryQuery } from "../Redux/Services/MovieApi";
import {
  resetSearchResults,
  selectCurrentPage,
  setDataLoading,
  setSearchQuery,
  setSearchResults,
  setTotalResults,
} from "../Redux/searchSlice";
import { logout, selectAuth } from "../Redux/authSlice";
import { libraryApi } from "../Redux/Services/LibraryApi";
import { motion } from "framer-motion";
import { enrichSearchResults } from "../api/enrichSearchResults";
import { debounce } from "lodash";
import { useCallback } from "react";
import Logo from "./Brand/Logo";
import ProfileMenu from "./Nav/ProfileMenu";
import BrowseMenu, { BROWSE_LINKS } from "./Nav/BrowseMenu";
import SearchPanel from "./Search/SearchPanel";

const NAV_LINKS = [
  { to: "/dashboard", label: "Home" },
  { to: "/dashboard/tvShows", label: "TV Shows" },
];

const NavBar = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const location = useLocation();
  const [error, setError] = useState(null);
  const [resultsFor, setResultsFor] = useState(""); // query that Data/error belong to
  const [Data, setData] = useState([]);
  const { user, role } = useSelector(selectAuth);
  const currentPage = useSelector(selectCurrentPage);
  // Search OMDb only after typing pauses, not on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    // OMDb answers "Too many results" for 1–2 letter queries, so wait for 3+ characters.
    const q = query.trim();
    const timer = setTimeout(() => setDebouncedQuery(q.length >= 3 ? q : ""), 400);
    return () => clearTimeout(timer);
  }, [query]);
  const { currentData: movies, isSuccess } = useSearchByQueryQuery(
    {
      query: debouncedQuery,
      page: currentPage,
    },
    { skip: !debouncedQuery }
  );

  // Press "/" anywhere (outside a text field) to jump to search.
  const searchRef = useRef(null);
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
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

            const combinedResults = await enrichSearchResults(movies.Search);

            dispatch(setSearchResults(combinedResults));
            setData(combinedResults);
            dispatch(setDataLoading(false));
            dispatch(setSearchQuery(debouncedQuery));
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
          dispatch(setSearchQuery(debouncedQuery));
          setResultsFor(debouncedQuery);
        }
      }
    }, 150),
    [isSuccess, movies, dispatch, debouncedQuery]
  );

  // Enrich results once OMDb has answered for the current (debounced) query.
  useEffect(() => {
    if (debouncedQuery && isSuccess && movies) handleSearch();
  }, [debouncedQuery, isSuccess, movies, handleSearch]);

  // Search panel (trending when empty, live results while typing) opens on focus.
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);
  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) setSearchOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        searchRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setIsOffCanvasOpen(false);
  };

  // Enter or "See all results": open the full results page (it fetches by the stored query).
  const openAllResults = () => {
    const q = query.trim();
    if (q.length < 3) return;
    dispatch(setSearchQuery(q));
    closeSearch();
    searchRef.current?.blur();
    navigate(`/dashboard/searchResults/${encodeURIComponent(q)}`);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") openAllResults();
  };

  const handleSignOut = () => {
    dispatch(logout());
    dispatch(libraryApi.util.resetApiState()); // drop this user's cached library
  };
  const menuVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      <nav
        style={{
          background:
            "linear-gradient(180deg, rgba(5,0,15,.92) 0%, rgba(5,0,15,.65) 50%, rgba(5,0,15,.25) 80%, rgba(5,0,15,0) 100%)",
          backgroundBlendMode: "multiply",
        }}
        className={`p-2  fixed top-0 left-0 w-full z-50 transition-transform h-[4.5rem] duration-500 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container flex items-center justify-between h-full px-2 lg:px-6 mx-auto">
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
            aria-label="MovieNexus home"
            // No box after a mouse click; keyboard users still get a visible focus ring.
            className="mx-auto lg:mx-0 shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
          >
            <Logo />
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
                  <div className="px-4 pb-4 mb-2 border-b border-white/10">
                    <Logo compact />
                  </div>

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
                    <p className="mt-4 px-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      Browse
                    </p>
                    {BROWSE_LINKS.map((l) => (
                      <Link
                        key={l.label}
                        to={l.to}
                        onClick={toggleOffCanvas}
                        className="text-white/80 hover:text-white py-2 px-4 font-libre block"
                      >
                        {l.label}
                      </Link>
                    ))}
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
          <div className="hidden lg:flex items-center gap-8 lg:ml-12 mr-auto">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname.toLowerCase() === to.toLowerCase();
              return (
                <Link
                  key={label}
                  to={to}
                  className={`relative py-2 text-[0.8rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-rose-500 transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
            <BrowseMenu active={location.pathname === "/dashboard" && Boolean(location.hash)} />
          </div>
          {/* search bar */}
          <div
            ref={searchWrapRef}
            className="relative text-gray-400 focus-within:text-white ml-4 lg:mr-5 z-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
            </span>
            <input
              ref={searchRef}
              type="search"
              className={`s:focus:w-[180px] l:focus:w-[200px] transition-all duration-500 ease-in-out w-0 lg:w-72 xl:w-80 lg:focus:w-96 py-2.5 pl-11 lg:pr-12 rounded-full text-sm text-white placeholder:text-gray-400 bg-white/5 backdrop-blur-md border border-white/15 hover:border-white/30 focus:border-rose-500/70 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                isLoading ? "hide-clear-button" : ""
              }`}
              placeholder="Search movies & TV shows..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                setSearchOpen(true);
              }}
              onKeyPress={handleKeyPress}
            />
            <span className="absolute s:hidden lg:flex inset-y-0 right-0 items-center pr-3 pointer-events-none">
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-sm text-rose-400" />
              ) : (
                !query && (
                  <kbd className="rounded-md border border-white/20 px-1.5 text-[0.7rem] leading-5 text-gray-400 font-sans">
                    /
                  </kbd>
                )
              )}
            </span>
            {searchOpen && !isOffCanvasOpen && (
              <SearchPanel
                query={query}
                results={Data}
                loading={query.trim().length >= 3 && (isLoading || resultsFor !== query.trim())}
                error={error}
                onClose={closeSearch}
                onSeeAll={openAllResults}
              />
            )}
          </div>
          <ProfileMenu user={user} role={role} onSignOut={handleSignOut} />
        </div>
      </nav>

    </>
  );
};

export default NavBar;
