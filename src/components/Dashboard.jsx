import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import { useDispatch, useSelector } from "react-redux";
import MovieCards from "./Cards/MovieCards";
import useGreeting from "../Hooks/useGreeting";
import { allDetails, setMovieDetails } from "../Redux/movieDetailsSlice";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { selectAuth } from "../Redux/authSlice";
import { useGetNewlyAddedMoviesQuery } from "../Redux/Services/MovieApi";
import { Pagination } from "flowbite-react";

const Dashboard = () => {
  const movieDetails = useSelector(allDetails);
  const { greeting, showGreeting } = useGreeting();
  const { user } = useSelector(selectAuth);
  const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch();

  const onPageChange = (page) => setCurrentPage(page);
  const queryClient = useQueryClient();

  const { data } = useGetNewlyAddedMoviesQuery(currentPage);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (data && data.result && data.result.items) {
        const imdbIds = data.result.items.map((item) => item.imdb_id) || [];
        console.log({ imdbIds });

        try {
          const responses = await axios.all(
            imdbIds.map((imdbId) =>
              axios.post("https://server-coral-delta.vercel.app/getLatestMovies", {
                imdbIds: [imdbId],
              })
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

  const movies = movieDetails
    ?.filter((details) => details.Response === "True")
    .map((details) => (
      <MovieCardsMemoized
        key={details?.imdbID}
        imageUrl={details?.Poster}
        title={details?.Title}
        year={details?.Year}
        rating={details?.imdbRating}
        featured={true}
        link={`movie/${details?.imdbID}`}
      />
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
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome back, <span className="text-blue-600">{user.username}</span>!
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-bold">{greeting} buddy! ❤️</p>
          </div>
        )}
      </main>

      <div className="p-4 bg-gray-800  ">
        <header className="border-l-4 pl-2 border-orange-500 text-white mt-2 font-libre text-xl">
          🔥Latest Added
        </header>
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 py-5 px-3 gap-4 ">
          {movies}
        </section>
      </div>

      <div className="flex justify-center my-8">
        <button
          type="button"
          onClick={() => {
            setCurrentPage((prevPage) => prevPage + 1);
            queryClient.invalidateQueries("movieDetails");
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md mx-2"
        >
          Load More
        </button>
        <div className="flex overflow-x-auto sm:justify-center">
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

export default Dashboard;
