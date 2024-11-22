// import React, { useState } from "react";
// import playbutton from "/play1.svg";
// export const DropdownCarousel = ({ episodes }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const cardsToShow = 3;
//   const totalCards = episodes.length;

//   const handlePrev = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex - cardsToShow >= 0 ? prevIndex - cardsToShow : 0
//     );
//   };

//   const handleNext = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex + cardsToShow < totalCards
//         ? prevIndex + cardsToShow
//         : totalCards - cardsToShow
//     );
//   };

//   const showLeftButton = currentIndex > 0;
//   const showRightButton =
//     currentIndex + cardsToShow < totalCards || totalCards <= cardsToShow;

//   return (
//     <div className="relative">
//       <div className="overflow-hidden">
//         <div
//           className="flex transition-transform duration-500 ease-in-out"
//           style={{
//             transform: `translateX(-${(currentIndex / totalCards) * 100}%)`,
//             width: `${(totalCards * 100) / cardsToShow}%`, // Adjust width based on total cards and visible cards
//           }}
//         >
//           {episodes.map((episode) => (
//             <div key={episode.id} className="flex-shrink-0 w-full max-w-xs p-2 group">
//               <div className="bg-gray-800 rounded-lg p-3 relative">
//                 <img
//                   src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
//                   alt={episode.name}
//                   className="w-full h-auto rounded-lg transition-transform transform scale-100 group-hover:scale-110 opacity-100 group-hover:opacity-35 group-hover:blur-sm duration-300"
//                 />
//                 <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity group-hover:opacity-100 flex justify-center items-center">
//                   <img className="h-14 w-14" src={playbutton} alt="Play Button" />
//                 </div>
//                 <h3 className="text-lg font-libre text-white mt-1 truncate">
//                   {`S${String(episode.season_number).padStart(2, "0")}:E${String(
//                     episode.episode_number
//                   ).padStart(2, "0")} - ${episode.name}`}
//                 </h3>
//                 <p className="text-sm text-gray-400 truncate">{episode.overview}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       {showLeftButton && (
//         <button
//           className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
//           onClick={handlePrev}
//         >
//           &lt;
//         </button>
//       )}
//       {showRightButton && (
//         <button
//           className="absolute top-1/2 right-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
//           onClick={handleNext}
//         >
//           &gt;
//         </button>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect, useRef } from "react";
import playbutton from "/play1.svg";
import { Link, useParams } from "react-router-dom";

// export const DropdownCarousel = ({ episodes }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [cardsToShow, setCardsToShow] = useState(3); // Default to 3 cards

//   const containerRef = useRef(null);

//   const totalCards = episodes.length;
//   const totalPages = Math.ceil(totalCards / cardsToShow);
//   const { imdbID } = useParams();
//   // Update the number of cards based on screen width
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setCardsToShow(4); // Large screens
//       } else if (window.innerWidth >= 768) {
//         setCardsToShow(3); // Medium screens
//       } else if (window.innerWidth >= 640) {
//         setCardsToShow(2); // Small screens
//       } else {
//         setCardsToShow(1); // Extra small screens
//       }
//     };

//     // Set initial number of cards
//     handleResize();

//     // Add resize event listener
//     window.addEventListener("resize", handleResize);

//     // Clean up event listener on component unmount
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handlePrev = () => {
//     setCurrentIndex((prevIndex) => Math.max(prevIndex - cardsToShow, 0));
//   };

//   const handleNext = () => {
//     setCurrentIndex((prevIndex) =>
//       Math.min(prevIndex + cardsToShow, (totalPages - 1) * cardsToShow)
//     );
//   };

//   const showLeftButton = currentIndex > 0;
//   const showRightButton = currentIndex + cardsToShow < totalCards;

//   useEffect(() => {
//     const container = containerRef.current;
//     container.style.transform = `translateX(-${(currentIndex / totalCards) * 100}%)`;
//   }, [currentIndex, totalCards]);

//   return (
//     <div className="relative">
//       <div className="overflow-hidden">
//         <div
//           ref={containerRef}
//           className={`grid grid-flow-col auto-cols-[calc(100%/${cardsToShow})] gap-4 transition-transform duration-300 ease-in-out`}
//         >
//           {episodes.map((episode) => (
//             <Link
//               key={episode.id}
//               to={`/dashboard/episodes/${imdbID}/${episode.season_number}/${episode.episode_number}`}
//             >
//               <div className="flex-shrink-0 w-full max-w-xs group">
//                 <div className="bg-gray-800 rounded-lg p-3 relative">
//                   <img
//                     src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
//                     alt={episode.name}
//                     className="w-full h-auto rounded-lg transition-transform transform scale-100 group-hover:scale-110 opacity-100 group-hover:opacity-35 group-hover:blur-sm duration-300"
//                   />
//                   <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity group-hover:opacity-100 flex justify-center items-center">
//                     <img className="h-14 w-14" src={playbutton} alt="Play Button" />
//                   </div>
//                   <h3 className="text-lg font-libre text-white mt-1  truncate">
//                     {`S${String(episode.season_number).padStart(2, "0")}:E${String(
//                       episode.episode_number
//                     ).padStart(2, "0")} - ${episode.name}`}
//                   </h3>
//                   <p className="text-sm text-gray-400 truncate">{episode.overview}</p>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       {showLeftButton && (
//         <button
//           className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
//           onClick={handlePrev}
//         >
//           &lt;
//         </button>
//       )}
//       {showRightButton && (
//         <button
//           className="absolute top-1/2 right-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
//           onClick={handleNext}
//         >
//           &gt;
//         </button>
//       )}
//     </div>
//   );
// };
export const DropdownCarousel = ({ episodes }) => {
  const [cardsToShow, setCardsToShow] = useState(3); // Default to 3 cards
  const containerRef = useRef(null);

  const totalCards = episodes.length;
  const { imdbID } = useParams();

  // Update the number of cards based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setCardsToShow(4); // Large screens
      } else if (window.innerWidth >= 768) {
        setCardsToShow(3); // Medium screens
      } else if (window.innerWidth >= 640) {
        setCardsToShow(2); // Small screens
      } else {
        setCardsToShow(1); // Extra small screens
      }
    };

    // Set initial number of cards
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    const container = containerRef.current;
    const scrollAmount = container.offsetWidth / cardsToShow;
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const handleNext = () => {
    const container = containerRef.current;
    const scrollAmount = container.offsetWidth / cardsToShow;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className={`flex gap-4 scroll-snap-x-mandatory scroll-snap-align-start overflow-x-auto scrollbar-none hide-scrollbar`}
          style={{ scrollSnapType: "x mandatory" }}
        >
          {episodes.map((episode) => (
            <Link
              key={episode.id}
              to={`/dashboard/episodes/${imdbID}/${episode.season_number}/${episode.episode_number}`}
            >
              <div
                className="flex-shrink-0 w-full max-w-xs group"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="bg-gray-800 rounded-lg p-3 relative">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                    alt={episode.name}
                    className="w-full h-auto rounded-lg transition-transform transform scale-100 group-hover:scale-110 opacity-100 group-hover:opacity-35 group-hover:blur-sm duration-300"
                  />
                  <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity group-hover:opacity-100 flex justify-center items-center">
                    <img className="h-14 w-14" src={playbutton} alt="Play Button" />
                  </div>
                  <h3 className="text-lg font-libre text-white mt-1 truncate">
                    {`S${String(episode.season_number).padStart(2, "0")}:E${String(
                      episode.episode_number
                    ).padStart(2, "0")} - ${episode.name}`}
                  </h3>
                  <p className="text-sm text-gray-400 truncate line-clamp-3">{episode.overview}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        onClick={handlePrev}
      >
        &lt;
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2 px-3 py-1 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        onClick={handleNext}
      >
        &gt;
      </button>
    </div>
  );
};
