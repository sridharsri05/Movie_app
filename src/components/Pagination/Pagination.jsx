// Pagination.js
import React, { useEffect, useState } from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const pagesToShow = {
    s: 2, // 320px
    m: 3, // 375px
    l: 5, // 425px
    md: 7, // 768px
    lg: 10, // 1024px
    xl: 12, // 1440px
  };

  // Determine the current screen size based on window width
  const [screenSize, setScreenSize] = useState("lg"); // Default to large size initially

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 320) {
        setScreenSize("s");
      } else if (windowWidth < 375) {
        setScreenSize("m");
      } else if (windowWidth < 425) {
        setScreenSize("sm");
      } else if (windowWidth < 768) {
        setScreenSize("md");
      } else if (windowWidth < 1024) {
        setScreenSize("lg");
      } else {
        setScreenSize("xl");
      }
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Call resize handler once to set initial screen size
    handleResize();

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pagesToDisplay = pagesToShow[screenSize];
  const startPage = Math.max(1, currentPage - Math.floor(pagesToDisplay / 2));
  const endPage = Math.min(totalPages, startPage + pagesToDisplay - 1);

  return (
    <nav className="flex justify-center mt-4">
      <ul className="flex space-x-2">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-blue-600 font-semibold rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
        </li>
        {range(startPage, endPage).map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white font-semibold"
                  : "text-blue-600 hover:bg-blue-100"
              }`}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-blue-600 font-semibold rounded ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
