import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import MovieCards from "./Cards/MovieCards";
import useGreeting from "../Hooks/useGreeting";
import { allDetails, setMovieDetails } from "../Redux/movieDetailsSlice";
import { useQueryClient } from "react-query";
import axios from "axios";
import { selectAuth } from "../Redux/authSlice";
import { useGetNewlyAddedMoviesQuery } from "../Redux/Services/MovieApi";
import MovieCardSkeleton from "./Cards/MovieCardSkeleton";
import Pagination from "./Pagination/Pagination";

const Dashboard = () => {
  const movieDetails = useSelector(allDetails);
  const { greeting, showGreeting } = useGreeting();
  const { user } = useSelector(selectAuth);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();

  const onPageChange = (page) => setCurrentPage(page);
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetNewlyAddedMoviesQuery(currentPage);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (data && data.result && data.result.items) {
        const imdbIds = data.result.items.map((item) => item.imdb_id) || [];
        console.log({ imdbIds });

        try {
          const responses = await axios.all(
            imdbIds.map((imdbId) =>
              axios.post(
                "https://server-coral-delta.vercel.app/getLatestMovies",
                {
                  imdbIds: [imdbId],
                }
              )
            )
          );

          const movieList = responses
            .map((response) => response.data)
            .flat() // Flatten the nested arrays
            .filter(Boolean);

          console.log("Movie List:", movieList); // Log the flattened movieList
          dispatch(setMovieDetails(movieList));
        } catch (error) {
          console.error("Error fetching new movie details:", error);
        }
      }
    };

    fetchMovieDetails();
  }, [data, dispatch]);

  const MovieCardsMemoized = React.memo(MovieCards);
  let skeletonCards = [];
  if (isLoading) {
    // Render a fixed number of skeleton cards (e.g., 10)
    for (let i = 0; i < 10; i++) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <NavBar /> */}
      <main
        className={`container mx-auto mt-8 p-4 sm:p-8 lg:p-12 ${
          !showGreeting && "hidden"
        }`}
      >
        {showGreeting && (
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              Welcome back,{" "}
              <span className="text-blue-600">{user.username}</span>!
            </h1>
            <p className="mb-8 text-lg font-bold text-gray-600">
              {greeting} buddy! ❤️
            </p>
          </div>
        )}
      </main>

      <div className="p-4 bg-gray-800 ">
        <header className="pl-2 mt-2 text-xl text-white border-l-4 border-orange-500 font-libre">
          🔥Latest Added
        </header>
        <motion.section
          className="grid grid-cols-2 gap-4 px-3 py-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 "
          initial="hidden"
          animate="visible"
          variants={container}
        >
          {isLoading ? skeletonCards : movies}
        </motion.section>
        <div className="flex justify-center my-8 ">
          <Pagination
            currentPage={currentPage}
            totalPages={100}
            onPageChange={onPageChange}
            showIcons
          />
        </div>
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
