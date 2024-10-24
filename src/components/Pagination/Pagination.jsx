// import React, { useEffect, useState } from "react";
// import {
//   resetSearchResults,
//   selectCurrentPage,
//   selectSearchQuery,
//   selectTotalResults,
//   setCurrentPage,
//   setDataLoading,
//   setSearchResults,
//   setTotalResults,
// } from "../../Redux/searchSlice";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
// import { useSearchByQueryQuery } from "../../Redux/Services/MovieApi";
// import { Pagination as AntPagination, ConfigProvider } from "antd";

// const Pagination = () => {
//   const [screenSize, setScreenSize] = useState("lg");
//   const [theme, setTheme] = useState("light"); // State to manage theme
//   const dispatch = useDispatch();

//   const SearchQuery = useSelector(selectSearchQuery);
//   const currentPage = useSelector(selectCurrentPage);
//   const totalResults = useSelector(selectTotalResults);

//   // Fetch data using the query and current page
//   const { data: movies, isSuccess } = useSearchByQueryQuery(
//     { query: SearchQuery, page: currentPage },
//     { skip: !SearchQuery }
//   );

//   // Calculate total pages
//   const totalPages = Math.ceil(totalResults / 10);

//   // Detect system dark mode preference
//   useEffect(() => {
//     const handleThemeChange = (e) => {
//       setTheme(e.matches ? "dark" : "light");
//     };

//     // Check initial theme
//     const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
//     setTheme(darkModeMediaQuery.matches ? "dark" : "light");

//     // Listen for changes in theme
//     darkModeMediaQuery.addEventListener("change", handleThemeChange);

//     // Clean up event listener on unmount
//     return () => darkModeMediaQuery.removeEventListener("change", handleThemeChange);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       const windowWidth = window.innerWidth;
//       if (windowWidth < 320) {
//         setScreenSize("s");
//       } else if (windowWidth < 375) {
//         setScreenSize("m");
//       } else if (windowWidth < 425) {
//         setScreenSize("l");
//       } else if (windowWidth < 768) {
//         setScreenSize("md");
//       } else if (windowWidth < 1024) {
//         setScreenSize("lg");
//       } else {
//         setScreenSize("xl");
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize();
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchSearchResults = async () => {
//       if (isSuccess && movies) {
//         try {
//           dispatch(setDataLoading(true));
//           dispatch(resetSearchResults());
//           if (movies.Response === "True") {
//             dispatch(setTotalResults(Number(movies.totalResults)));

//             const combinedResults = await Promise.all(
//               movies.Search.map(async (movie) => {
//                 try {
//                   const detailResponse = await axios.get(
//                     `https://www.omdbapi.com/?i=${movie.imdbID}&apikey=8d58c823`
//                   );
//                   const movieDetails = detailResponse.data;

//                   return {
//                     ...movie,
//                     Plot: movieDetails.Plot || "Plot not available",
//                     Genre: movieDetails.Genre || "Genre not available",
//                     Director: movieDetails.Director || "Director not available",
//                     Actors: movieDetails.Actors || "Actors not available",
//                     imdbRating: movieDetails.imdbRating || "Rating not available",
//                   };
//                 } catch (error) {
//                   console.error(`Error fetching details for ${movie.imdbID}:`, error);
//                   return movie;
//                 }
//               })
//             );

//             dispatch(setSearchResults(combinedResults));
//             dispatch(setDataLoading(false));
//           }
//         } catch (error) {
//           console.error("Error handling search:", error);
//           dispatch(setDataLoading(false));
//         }
//       }
//     };

//     fetchSearchResults();
//   }, [movies, isSuccess, dispatch, SearchQuery, currentPage]);

//   const onPageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       dispatch(setCurrentPage(page));
//     }
//   };

//   return (
//     <ConfigProvider
//       theme={{
//         token: {
//           colorPrimary: theme === "light" ? "#1890ff" : "#177ddc", // Customize the primary color
//           colorBgContainer: theme === "light" ? "#ffffff" : "#001529", // Background color
//           colorText: theme === "light" ? "#000000" : "#ffffff", // Text color
//         },
//       }}
//     >
//       <div className="flex flex-col justify-center items-center mt-6">
//         {/* Ant Design Pagination Component */}
//         <AntPagination
//           current={currentPage}
//           total={totalResults}
//           pageSize={10}
//           onChange={onPageChange}
//           showSizeChanger={false}
//           showQuickJumper
//           showTotal={(total) => `Total ${total} items`}
//           className={`${
//             theme === "dark" ? "ant-pagination-dark" : "ant-pagination-light"
//           }`}
//         />
//       </div>
//     </ConfigProvider>
//   );
// };

// export default Pagination;

import React, { useEffect, useState } from "react";
import {
  resetSearchResults,
  selectCurrentPage,
  selectSearchQuery,
  selectTotalResults,
  setCurrentPage,
  setDataLoading,
  setSearchResults,
  setTotalResults,
} from "../../Redux/searchSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useSearchByQueryQuery } from "../../Redux/Services/MovieApi";
import { Pagination as AntPagination, ConfigProvider } from "antd";

const Pagination = () => {
  const [screenSize, setScreenSize] = useState("lg");
  const [theme, setTheme] = useState("light"); // State to manage theme
  const dispatch = useDispatch();

  const SearchQuery = useSelector(selectSearchQuery);
  const currentPage = useSelector(selectCurrentPage);
  const totalResults = useSelector(selectTotalResults);

  // Fetch data using the query and current page
  const { data: movies, isSuccess } = useSearchByQueryQuery(
    { query: SearchQuery, page: currentPage },
    { skip: !SearchQuery }
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / 10);

  // Detect system dark mode preference
  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.matches ? "dark" : "light");
    };

    // Check initial theme
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(darkModeMediaQuery.matches ? "dark" : "light");

    // Listen for changes in theme
    darkModeMediaQuery.addEventListener("change", handleThemeChange);

    // Clean up event listener on unmount
    return () => darkModeMediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 320) {
        setScreenSize("s");
      } else if (windowWidth < 375) {
        setScreenSize("m");
      } else if (windowWidth < 425) {
        setScreenSize("l");
      } else if (windowWidth < 768) {
        setScreenSize("md");
      } else if (windowWidth < 1024) {
        setScreenSize("lg");
      } else {
        setScreenSize("xl");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (isSuccess && movies) {
        try {
          dispatch(setDataLoading(true));
          dispatch(resetSearchResults());
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
            dispatch(setDataLoading(false));
          }
        } catch (error) {
          console.error("Error handling search:", error);
          dispatch(setDataLoading(false));
        }
      }
    };

    fetchSearchResults();
  }, [movies, isSuccess, dispatch, SearchQuery, currentPage]);

  const onPageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(setCurrentPage(page));
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme === "light" ? "#1890ff" : "#177ddc", // Customize the primary color
          colorBgContainer: theme === "light" ? "#ffffff" : "#001529", // Background color
          colorText: theme === "light" ? "#000000" : "#ffffff", // Text color
        },
      }}
    >
      {/* Responsive Pagination Container */}
      <div className="flex justify-center items-center mt-6 w-full">
        <AntPagination
          current={currentPage}
          total={totalResults}
          pageSize={10}
          onChange={onPageChange}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
          className={`${
            theme === "dark" ? "ant-pagination-dark" : "ant-pagination-light"
          }`}
          style={{
            maxWidth: "100%", // Limit the width to 100% of its container
            overflow: "hidden", // Prevent overflow without scrolling
            fontSize: "14px", // Adjust font size for responsiveness
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default Pagination;
