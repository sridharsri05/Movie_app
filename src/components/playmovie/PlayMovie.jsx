import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";

const PlayMovie = () => {
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data } = useSearchByidQuery(imdbID);
  console.log(data, "movie data");

  return (
    <>
      <div className=" bg-black pt-6">
        <div className=" mx-14 mb-8  h-[31rem] ">
          <iframe
            className=" w-full  h-full rounded-2xl"
            src={`https://vidsrc.to/embed/movie/${imdbID}`}
            allowFullScreen
          ></iframe>
        </div>

        {/* leftside card */}

        <div className="relative ">
          <div className="mx-auto max-w-[1920px] relative w-full">
            <div className=" flex flex-wrap mx-16">
              <div className=" flex-grow-0 flex-shrink-0 basis-1/4 max-w-[25%] min-h-[1px] px-1 relative w-full ">
                <div className=" mb-8 sticky z-10 w-full mx-[-24px]">
                  <div className=" rounded-r rounded-l flex overflow-hidden relative w-full">
                    <div className=" flex-1 h-0 py-[71.75%] px-0 relative transition-transform  duration-300 ease w-full ">
                      <img
                        className=" h-full left-0 object-cover absolute top-0 w-full border-none box-border "
                        src={data?.Poster}
                        alt={data?.Title}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* rightside part */}
              <div className="lg:flex-grow-0 flex-shrink-0 basis-3/4 max-w-[75%]">
                <div className=" text-white  text-5xl font-extrabold  leading-[56px] mt-0 mr-o mb-2  font-libre">
                  {data?.Title}
                </div>

                <div className=" text-white text-opacity-75 text-sm font-medium leading-6 tracking-normal ">
                  <div className=" items-center flex flex-wrap gap-x-1">
                    <span className=" mr-3">
                      {" "}
                      {data?.Year} - {data?.Runtime}
                    </span>
                    {/* svg */}
                    {/* Rating */}
                    <div className=" inline-flex ">
                      <div className=" items-center flex -mt-[1px]">
                        <div className=" bg-white bg-opacity-20 text-white text-opacity-80 text-xs font-black leading-4 tracking-normal rounded-lg  pt-0 pr-2 pb-0 pl-2 ">
                          {data?.Rated}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" block  ">
                    <div className="  text-white cursor-pointer inline-block  leading-normal relative  transition-opacity duration-300  bg-transparent font-normal">
                      {data?.Genre}
                    </div>
                  </div>
                  <p className=" text-[16px]  leading-6 mt-2 mb-4 max-w-2xl">
                    {data?.Plot}
                  </p>
                  <div className=" text-[16px]  leading-6 relative w-Full mb-20 ">
                    <div className=" flex">
                      <span className=" inline-block flex-grow-0 flex-shrink w-40  text-white  text-[16px]  leading-6 ">
                        {" "}
                        Starring{" "}
                      </span>
                      <span className="text-white text-opacity-75  text-[16px]  leading-6 relative w-full">
                        {data?.Actors}
                      </span>
                    </div>
                    <div className=" flex">
                      <span className="text-white text-opacity-75 inline-block flex-grow-0 flex-shrink-0 w-[8.5rem]">
                        Directed by
                      </span>
                      <span className="text-[16px] leading-6 opacity-100 cursor-pointer inline-block relative  transition-opacity duration-300 font-normal ">
                        {data?.Director}
                      </span>
                    </div>
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
