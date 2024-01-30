import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";

const PlayMovie = () => {
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data } = useSearchByidQuery(imdbID);
  console.log(data, "movie data");

  return (
    <div className="">
      <div>
        <iframe src={`https://vidsrc.to/embed/movie/${imdbID}`} allowFullScreen></iframe>
      </div>
      {/* leftside card */}

      <div className="">
        <div className="mx-auto max-w-[1920px] relative w-full">
          <div className=" flex flex-wrap mx-16">
            <div className=" flex-grow-0 flex-shrink-0 basis-1/4 max-w-[25%]">
              <div className=" mb-8 sticky top-[108px] z-10 w-full mx-[-24px]">
                <div className=" rounded-r flex overflow-hidden relative w-full">
                  <div className=" flex-1 h-0 py-[71.75%] px-0 relative transition-transform  duration-300 ease-in-out w-full ">
                    <img
                      className=" h-full left-0 object-cover absolute top-0 w-full"
                      src={data?.Poster}
                      alt={data?.Title}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* rightside part */}
            <div className="lg:flex-grow-0 flex-shrink-0 basis-3/4 max-w-[75%]">
              <div>
                <div className=" font-black text-5xl tracking-tighter leading-14">
                  {data?.Title}
                </div>
              </div>
              <div className=" text-white text-opacity-75 text-sm font-medium leading-6 tracking-normal ">
                <div className=" items-center flex flex-wrap gap-x-1">
                  <span className=" mr-3">
                    {" "}
                    {data?.Year} . {data?.Runtime}
                  </span>
                  {/* svg */}
                  {/* Rating */}
                  <div className=" inline-flex ">
                    <div className=" items-center flex -mt-[1px]">
                      <div className=" bg-white bg-opacity-20 text-white text-opacity-80 text-xs font-black leading-4 tracking-normal rounded-md  px-0 py-2 ">
                        {data?.Rated}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div>{data?.Genre}</div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>

          {/* description */}
          <p>{data?.Plot}</p>
          <div>
            <div>
              <span> Starring </span>
              <span>{data?.Actors}</span>
            </div>
            <div>
              <span>Directed by</span>
              <span>{data?.Director}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayMovie;
