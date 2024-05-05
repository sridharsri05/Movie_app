import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";
import MovieCard from "../Cards/MovieCards";
import { useState } from "react";

const PlayMovie = () => {
  const [movieview, setMovieView] = useState(true);
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data } = useSearchByidQuery(imdbID);
  console.log(data, "movie data");

  function minTohours(min) {
    const hours = Math.floor(min / 60);
    const minutes = min % 60;
    return `${hours}- ${minutes}`;
}
if (data){
console.log(minTohours(data?.Runtime))
}

  return (
    <>
      <div className="pt-6 bg-black ">
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16    3xl:h-[40rem] mb-8 sm:h-[31rem] ">
          {movieview ? (
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://vidsrc.xyz/embed/movie/${imdbID}`}
              allowFullScreen
            ></iframe>
          ) : (
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://vidsrc.to/embed/movie/${imdbID}`}
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* leftside card */}
        <div className=" flex justify-center mb-5">
          <button
            type="button"
            className="md:right-14 md:absolute l:mx-5  z-50 px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:text-blue-400 md:px-2 md:py-2  text-white font-semibold rounded-md shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => setMovieView((prev) => !prev)}
          >
            Change Server
          </button>
        </div>

        <div className="relative  ">
          <div className="mx-auto max-w-[2560px] relative w-full  ">
            <div className="flex flex-wrap mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-16 ">
              <div className="  flex-grow-0 flex-shrink-0 sm:basis-full md:basis-1/4 max-w-full min-h-[1px] px-1 relative w-full  sm:w-1/2 md:w-1/3 lg:w-1/4">
                <div className=" mb-1 md:mb-8 sticky z-10 w-full sm:mx-[-24px]">
                  <div className="relative flex w-full  ">
                    <div className="flex-1  l:pb-[20rem]  md:py-[71.75%] px-0 relative  w-full">
                      <img
                        className="  absolute s:relative l:absolute  s:mt-2 top-0 left-0 object-cover  w-full s:h-[20rem]  md:h-full"
                        src={data?.Poster}
                        alt={data?.Title}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* rightside part */}
              <div className="lg:flex-grow-0 flex-shrink-0 sm:basis-full md:basis-3/4 max-w-full sm:w-full md:w-2/3 lg:w-3/4  l:mt-4">
                <div className="text-white text-5xl font-extrabold leading-[56px] mt-0 mr-o mb-2 font-libre ">
                  {data?.Title}
                </div>

                <div className="text-sm font-medium leading-6 tracking-normal text-white text-opacity-75 ">
                  <div className="flex flex-wrap items-center gap-x-1">
                    <span className="mr-3 ">
                      {" "}
                      {data?.Year} - {minTohours(data?.Runtime)}
                    </span>
                    {/* svg */}
                    {/* Rating */}
                    <div className="inline-flex ">
                      <div className="items-center flex -mt-[1px]">
                        <div className="pt-0 pb-0 pl-2 pr-2 text-xs font-black leading-4 tracking-normal text-white bg-white rounded-lg bg-opacity-20 text-opacity-80">
                          {data?.Rated}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="block ">
                    <div className="relative inline-block font-normal leading-normal text-white transition-opacity duration-300 bg-transparent cursor-pointer ">
                      {data?.Genre}
                    </div>
                  </div>
                  <p className="text-[16px] leading-6 mt-2 mb-4 max-w-2xl">
                    {data?.Plot}
                  </p>
                  <div className="text-[16px] leading-6 relative w-full mb-20 ">
                    <div className="flex ">
                      <span className="inline-block flex-grow-0 flex-shrink w-40 text-white text-[16px] leading-6 ">
                        {" "}
                        Starring{" "}
                      </span>
                      <span className="text-white text-opacity-75 text-[16px] leading-6 relative w-full">
                        {data?.Actors}
                      </span>
                    </div>
                    <div className="flex ">
                      <span className="text-white text-opacity-75 inline-block flex-grow-0 flex-shrink-0  s:w-[6.4rem]  m:w-[6.8rem] l:w-[7.1rem] lg:w-[8.1rem] ">
                        Directed by
                      </span>
                      <span className="text-[16px] leading-6 opacity-100 cursor-pointer inline-block relative transition-opacity duration-300 font-normal ">
                        {data?.Director}
                      </span>
                    </div>
                    <div className="my-10 border-b border-gray-700 border-"></div>
                    <div className="text-2xl text-white">You May Also Like</div>
                  </div>
                </div>
              </div>
            </div>
            {/* description */}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayMovie;
