import { Spin } from "antd";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  allShows,
  currentPageSelector,
  setCurrentPage,
  setTvshows,
} from "../../Redux/movieDetailsSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetNewlyAddedTvShowsQuery,
  useGetRecentlyAddedMoviesQuery,
} from "../../Redux/Services/MovieApi";
import MovieCardSkeleton from "../Cards/MovieCardSkeleton";
import MovieCards from "../Cards/MovieCards";
import { toast } from "react-toastify";

//<=======================----------------------------------------------------------------------------------------------------------->

export const TvShows = () => {
  const tvShows = useSelector(allShows);

  const currentPage = useSelector(currentPageSelector);
  const PageSelector = (state) => state.movie.page;
  const page = useSelector(PageSelector);
  const [showMore, setShowMore] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { data, isLoading } = useGetNewlyAddedTvShowsQuery(currentPage);
  const { data: recent } = useGetRecentlyAddedMoviesQuery(page);

  console.log(data, "de");
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
              axios.post("https://server-mu-bice.vercel.app/getAddedTVShows", {
                imdbIds: [imdbId],
              })
            )
          );

          const movieList = responses
            .map((response) => response.data)
            .flat() // Flatten the nested arrays
            .filter(Boolean);

          console.log("show List:", movieList); // Log the flattened movieList
          dispatch(setTvshows(movieList));
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
  const thresholdMovies = 0.3;

  const handleViewMore = () => {
    setShowMore(true); // Show more items when "View More" button is clicked
  };

  const MovieCardsMemoized = React.memo(MovieCards);
  let skeletonCards = [];
  if (loading || isLoading) {
    // Render a fixed number of skeleton cards (e.g., 10)
    for (let i = 0; i < 15; i++) {
      skeletonCards.push(<MovieCardSkeleton key={i} />);
    }
  }
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

  const movies = tvShows
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
          link={`/dashboard/tvSeries/${details?.imdbID}`}
        />
      </motion.div>
    ));

  return (
    <div className="min-h-screen ">
      {/* <NavBar /> */}

      <div className="p-4 bg-gray-800 ">
        <header className="pl-2 mt-2 text-xl text-white border-l-4 border-orange-500 font-libre">
          🔥Recently Added
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
            <div className="text-center my-2">
              <button
                onClick={handleViewMore}
                className="   hover:scale-110  text-yellow-500 font-bold py-2 px-4 rounded"
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
