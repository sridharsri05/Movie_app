
import { useParams } from "react-router-dom";
import {
  useGetPlayableMovieQuery,
  useSearchByidQuery,
} from "../../Redux/Services/MovieApi";

const PlayMovie = () => {
  const imdbID = useParams();
  console.log(imdbID.imdbID);

  const { data } = useSearchByidQuery(imdbID.imdbID);
  console.log(data, "movie data");

  const { data: videos, status } = useGetPlayableMovieQuery(imdbID.imdbID);
  console.log(videos, "vido");
  return <div>{status}\</div>;
};

export default PlayMovie;
