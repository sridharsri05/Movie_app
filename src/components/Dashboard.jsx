import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import MovieCards from "./Cards/MovieCards";
import useGreeting from "../Hooks/useGreeting";
import {
  allDetails,
  currentPageSelector,
  setMovieDetails,
  setCurrentPage,
} from "../Redux/movieDetailsSlice";
import axios from "axios";
import { selectAuth } from "../Redux/authSlice";
import {
  useGetNewlyAddedMovies2Query,
  useGetRecentlyAddedMoviesQuery,
} from "../Redux/Services/MovieApi";
import MovieCardSkeleton from "./Cards/MovieCardSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";
import { Spin } from "antd";
import { Apis } from "../api/api";
import NavBarCarousel from "./customeCards/NavBarCarousel";
import SEO from "../Seo/seo";
const Dashboard = () => {
  const movieDetails = useSelector(allDetails);
  const { greeting, showGreeting } = useGreeting();
  const { user } = useSelector(selectAuth);
  const currentPage = useSelector(currentPageSelector);
  const PageSelector = (state) => state.movie.page;
  const page = useSelector(PageSelector);
  const [showMore, setShowMore] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { data, isLoading, error } = useGetNewlyAddedMovies2Query(currentPage);
  const { data: recent } = useGetRecentlyAddedMoviesQuery(page);

  // console.log(data, "de");
  // console.log(recent, "sri");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (data && data.result && data.result) {
        const imdbIds = data.result.map((item) => item.imdb_id) || [];
        console.log({ imdbIds });
        console.log("page no :", currentPage);

        try {
          const responses = await axios.all(
            imdbIds.map((imdbId) =>
              axios.post(`${Apis.baseURL}/getLatestMovies`, {
                imdbIds: [imdbId],
              })
            )
          );

          const movieList = responses
            .map((response) => response.data)
            .flat() // Flatten the nested arrays
            .filter(Boolean);

          // console.log("Movie List:", movieList); // Log the flattened movieList
          dispatch(setMovieDetails(movieList));
          setLoading(false);
        } catch (error) {
          toast.error(error, {
            position: "top-right",
            autoClose: 3000,
          });
          console.error("Error fetching new movie details:", error);
        }
      }
    };

    fetchMovieDetails();
  }, [currentPage, data, dispatch, recent]);

  // Show more items when "View More" button is clicked

  const thresholdMovies = 0.3;
  const handleViewMore = () => {
    setShowMore(true);
  };

  const MovieCardsMemoized = React.memo(MovieCards);
  let skeletonCards = [];
  if (loading || isLoading) {
    // Render a fixed number of skeleton cards (e.g., 10)
    for (let i = 0; i < 15; i++) {
      skeletonCards.push(<MovieCardSkeleton key={i} />);
    }
  }
  // if (error) {
  //   return (
  //     <div className="min-h-screen mt-[4rem] p-4 text-center text-red-500">
  //       <h2 className="text-2xl">An error occurred while fetching movies.</h2>
  //       <p>{error.error || "Please try again later or might be cors origin issue."}</p>
  //     </div>
  //   );
  // }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const movies = movieDetails
    ?.filter((details) => details.Response === "True")
    .map((details) => (
      <motion.div
        key={details?.imdbID}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <MovieCardsMemoized
          key={details?.imdbID}
          imageUrl={details?.Poster}
          title={details?.Title}
          year={details?.Year}
          rating={details?.imdbRating}
          featured={true}
          link={`movie/${details?.imdbID}`}
        />
      </motion.div>
    ));
  // for seo

  const title = "MovieNexus - Discover Trending Movies";
  const description =
    "Explore top-rated and trending movies on MovieNexus. Stay updated with the latest releases and reviews.";
  const image = "../../public/MovieHub.png";
  const keywords = "movies, trending movies, top-rated movies, MovieNexus";

  return (
    <div className="min-h-screen relative ">
      <SEO title={title} description={description} image={image} keywords={keywords} />
      <NavBarCarousel />
      <main
        className={`container mx-auto  bg-transparent mt-8 p-4 sm:p-8 lg:p-12 ${
          !showGreeting && "hidden"
        }`}
      >
        {showGreeting && (
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">
              Welcome back, <span className="text-blue-600">{user.username}</span>!
            </h1>
            <p className="mb-8 text-lg font-bold text-gray-600">{greeting} buddy! ❤️</p>
          </div>
        )}
      </main>

      <div className="p-4 bg-gray-800   ">
        <header className="pl-2 mt-2 text-xl text-white border-l-4 border-orange-500 font-libre">
          🔥Latest Added
        </header>

        <InfiniteScroll
          style={{ overflow: "hidden" }}
          dataLength={movies.length} //This is important field to render the next data
          next={() => dispatch(setCurrentPage(currentPage + 1))}
          scrollThreshold={thresholdMovies}
          hasMore={showMore} // Set to true to enable infinite scroll
          loader={
            <div className=" flex justify-center items-center ">
              <Spin size="large " /> <p className=" mx-2 text-slate-50">Loading ...</p>
            </div>
          }
          endMessage={
            showMore && (
              <p className="text-center ">
                <b>Yay! You have seen it all</b>
              </p>
            )
          }
        >
          <motion.section
            className="grid s:grid-cols-1 m:grid-cols-2 gap-4 s:px-2 m:px-1 px-3 py-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 3xl:grid-cols-6 "
            initial="hidden"
            animate="visible"
            variants={container}
          >
            {loading || isLoading ? skeletonCards : movies}
          </motion.section>
          {!showMore && (
            <div className="text-center my-2  relative">
              <button
                onClick={handleViewMore}
                className="hover:scale-110  text-yellow-500 font-bold py-2 px-4 rounded"
              >
                View More
              </button>
            </div>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};
const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};
export default Dashboard;
