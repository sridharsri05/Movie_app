import { useParams } from "react-router-dom";
import {
  useSearchByidQuery,
} from "../../Redux/Services/MovieApi";

const PlayMovie = () => {
  const { imdbID } = useParams();
  console.log(imdbID);

  const { data } = useSearchByidQuery(imdbID);
  console.log(data, "movie data");

  return (
    <div className="">
      <iframe src={`https://vidsrc.to/embed/movie/${imdbID}`} allowFullScreen></iframe>
    </div>
  );
};

export default PlayMovie;
