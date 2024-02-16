import React from "react";
import { Link } from "react-router-dom";
import playbutton from "/play1.svg";
const MovieCard = ({ imageUrl, title, year, rating, link }) => {
  return (
    <article className="border-0 relative">
      <Link to={link}>
        <div className="max-w-sm rounded overflow-hidden group">
          <div className="relative overflow-hidden  s:h-60  l:h-60 sm:h-72  rounded-md md:h-[19rem] lg:h-[20rem] 3xl:h-96  ">
            <img
              className="w-full h-full  object-cover transition-transform transform scale-100 group-hover:scale-110 opacity-100 group-hover:opacity-35 group-hover:blur-sm duration-300"
              src={imageUrl}
              alt={title}
            />

            <div className="absolute top-0 left-0 w-full h-full opacity-0 transition-opacity custom-transition group-hover:opacity-100 flex justify-center items-center">
              <img className="text-white h-14 w-14" src={playbutton} alt="Play Button" />
            </div>

            <div className="absolute right-0 bottom-0 opacity-0 transition-opacity group-hover:opacity-100 p-2">
              {rating && rating.length > 0 && (
                <p className="text-white text-sm bg-gray-800 bg-opacity-75 rounded hover:bg-opacity-100 hover:text-opacity-100 hover:shadow hover:transition-all">
                  <span className="font-bold p-1">{rating}</span>
                </p>
              )}
            </div>
          </div>

          <div className="py-1 bg-transparent">
            <div className="font-bold text-white group-hover:text-yellow-400 text-sm text-start mb-2 truncate font-libre 3xl:text-2xl ">
              <p>{title}</p>
            </div>
            <p className="text-gray-700 text-sm 3xl:text-lg group-hover:text-sky-300">
              <span className="font-extrabold">{year}</span>
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default MovieCard;
