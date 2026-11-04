import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  allShows,
  tvCurrentPageSelector,
  setTvCurrentPage,
  setTvshows,
} from "../../Redux/movieDetailsSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetNewlyAddedTvShowsQuery,
} from "../../Redux/Services/MovieApi";
import MovieCardSkeleton from "../Cards/MovieCardSkeleton";
import MovieCards from "../Cards/MovieCards";
import { toast } from "react-toastify";
import { Apis } from "../../api/api";
import Seo from "../../utils/Seo";
import NavBarCarousel from "../customeCards/NavBarCarousel";
import HomeRows from "../Rows/HomeRows";

//<=======================----------------------------------------------------------------------------------------------------------->

const TvShows = () => {
  const tvShows = useSelector(allShows);

  const tvCurrentPage = useSelector(tvCurrentPageSelector);
  const [showMore, setShowMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // a next page is being fetched
  const [reachedEnd, setReachedEnd] = useState(false); // the list API returned nothing more
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { data, isLoading } = useGetNewlyAddedTvShowsQuery(tvCurrentPage);

  // console.log(recent, "sri");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (data && data.result && data.result) {
        const imdbIds = data.result.map((item) => item.imdb_id).filter(Boolean);

        try {
          // One batched request per page; the server skips IDs it can't resolve.
          const { data: showList } = await axios.post(`${Apis.baseURL}/getAddedTVShows`, {
            imdbIds,
          });
          dispatch(setTvshows(showList.filter(Boolean)));
          setLoadingMore(false);
          if (!imdbIds.length) setReachedEnd(true);
          setLoading(false);
        } catch (error) {
          toast.error(error, {
            position: "top-right",
            autoClose: 3000,
          });
          console.error("Error fetching new movie details:", error);
          setLoadingMore(false);
        }
      }
    };
    fetchMovieDetails();
  }, [tvCurrentPage, data, dispatch]);
  const thresholdMovies = 0.3;

  const loadNextPage = () => {
    if (loadingMore || reachedEnd) return;
    setLoadingMore(true);
    dispatch(setTvCurrentPage(tvCurrentPage + 1));
  };
  const handleViewMore = () => {
    setShowMore(true);
    loadNextPage();
  };

  let skeletonCards = [];
  if (loading || isLoading) {
    // Render a fixed number of skeleton cards (e.g., 10)
    for (let i = 0; i < 14; i++) {
      skeletonCards.push(<MovieCardSkeleton key={i} />);
    }
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
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
        <MovieCards
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
    <div className="min-h-screen bg-[#0b0614]">
      <Seo
        title="Discover Trending TV Series - MovieNexus"
        description="Explore the best TV series on MovieNexus. Watch top-rated shows and stay updated on your favorites."
        image="/../public/MovieHub.png"
        keywords="TV series, trending series, popular shows, MovieNexus"
      />
      {/* Same hero as the movies dashboard, fed with this week's trending TV shows */}
      <NavBarCarousel type="tv" />
      <HomeRows variant="tv" />
      <div className="bg-[#0b0614] pb-12">
        <header className="container mx-auto px-4 lg:px-6 pt-8 flex items-center gap-3 text-xl lg:text-2xl font-semibold text-white font-gilroy before:content-[''] before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-violet-400 before:to-rose-500">
          Recently Added
        </header>

        <InfiniteScroll
          style={{ overflow: "hidden" }}
          dataLength={movies.length} //This is important field to render the next data
          next={loadNextPage}
          scrollThreshold={thresholdMovies}
          hasMore={showMore && !reachedEnd}
          loader={null}
          endMessage={null}
        >
          <motion.section
            className="container mx-auto px-4 lg:px-6 py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-x-4 gap-y-7"
            initial="hidden"
            animate="visible"
            variants={container}
          >
            {loading || isLoading ? skeletonCards : movies}
            {loadingMore && !(loading || isLoading) && skeletonCards.length === 0 &&
              Array.from({ length: 7 }, (_, i) => <MovieCardSkeleton key={`more-${i}`} />)}
          </motion.section>
          {!showMore && !(loading || isLoading) && (
            <div className="mt-4 flex justify-center">
              <motion.button
                type="button"
                onClick={handleViewMore}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-gradient-to-r from-violet-400 to-rose-500 p-px shadow-lg shadow-fuchsia-500/20"
              >
                <span className="flex items-center gap-2 rounded-full bg-[#0b0614] px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#160d24]">
                  View more
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
                  </svg>
                </span>
              </motion.button>
            </div>
          )}
          {showMore && reachedEnd && (
            <p className="mt-6 text-center text-sm text-white/50">You&apos;ve reached the end of the list.</p>
          )}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default TvShows;
const container = { hidden: {}, visible: {} };
