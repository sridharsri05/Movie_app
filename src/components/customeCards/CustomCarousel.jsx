import React, { useState, useEffect } from "react";
import Card from "../Cards/Card";

const CustomCarousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(4); // lg
      } else if (window.innerWidth >= 768) {
        setItemsPerPage(3); // md
      } else if (window.innerWidth >= 425) {
        setItemsPerPage(2); // l
      } else {
        setItemsPerPage(1); // sm and xs
      }
    };

    window.addEventListener("resize", updateItemsPerPage);
    updateItemsPerPage();

    return () => {
      window.removeEventListener("resize", updateItemsPerPage);
    };
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0
        ? Math.max(items.length - itemsPerPage, 0)
        : prevIndex - itemsPerPage
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerPage >= items.length ? 0 : prevIndex + itemsPerPage
    );
  };

  return (
    <div className="relative overflow">
      <button
        className="absolute lg:left-[-.8rem] left-[-1rem] s:left-[2rem] l:left-[-1rem] top-[44%] transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-10"
        onClick={handlePrev}
      >
        <svg
          className="size-5 sm:size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
      <div className="overflow-hidden">
        <div
          className="grid grid-flow-col auto-cols-[100%] l:auto-cols-[calc(100%/2)] md:auto-cols-[calc(100%/3)] lg:auto-cols-[calc(100%/4)]  md:gap-1 lg:gap-1 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${(currentIndex / itemsPerPage) * 100}%)` }}
        >
          {items
            .filter((i) => i.imdbId !== null)
            .map((item, i) => (
              <div key={i} className="p-2">
                <Card
                  title={item.title}
                  poster={item.poster}
                  year={item.year}
                  rating={item.rating}
                  // link={`/dashboard/${item?.type}/${item?.imdbId}`}
                  link={
                    item.type === "movie"
                      ? `/dashboard/movie/${item?.imdbId}`
                      : `/dashboard/tvSeries/${item?.imdbId}`
                  }
                />
              </div>
            ))}
        </div>
      </div>
      <button
        className="absolute lg:right-[-1.3rem] s:right-[2rem] right-[-1.5rem] l:right-[-1rem] top-[44%] transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 z-10"
        onClick={handleNext}
      >
        <svg
          className="size-5 sm:size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default CustomCarousel;
