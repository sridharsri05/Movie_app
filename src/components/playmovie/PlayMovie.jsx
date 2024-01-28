import { useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";

const PlayMovie = () => {
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data } = useSearchByidQuery(imdbID);
  console.log(data, "movie data");

  return (
    <div className="">
      <div>video</div>
      {/* leftside card */}
      <div>
        <div className="">
          <img src={data?.Poster} alt={data?.Title} />
        </div>
      </div>
      {/* rightside part */}
      <div>
        <div>
          <div>{data?.Title}</div>
        </div>
        <div>
          <div>
            <span>
              {" "}
              {data?.Year} . {data?.Runtime}
            </span>
            {/* svg */}
            <div>
              <div>{data?.Genre}</div>
            </div>
          </div>
          <div></div>
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
  );
};

export default PlayMovie;
