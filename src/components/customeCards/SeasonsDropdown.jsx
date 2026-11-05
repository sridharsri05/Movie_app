import { useState, useEffect } from "react";
import { tmdbGet } from "../../api/tmdb";
import { Apis } from "../../api/api";

const SeasonsDropdown = ({ seriesId }) => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // Fetch all seasons when the component mounts
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await tmdbGet(
          `${Apis.baseURL}/tmdb/tv/${seriesId}`
        );
        setSeasons(response.data.seasons);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
  }, [seriesId]);
  // Fetch episodes when a season is selected
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;

      try {
        const response = await tmdbGet(
          `${Apis.baseURL}/tmdb/tv/${seriesId}/season/${selectedSeason}`
        );
        setEpisodes(response.data.episodes);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, seriesId]);

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
  };

  return (
    <div>
      <h2>Select a Season</h2>
      <select onChange={handleSeasonChange} value={selectedSeason || ""}>
        <option value="" disabled>
          Select a season
        </option>
        {seasons.map((season) => (
          <option key={season.id} value={season.season_number}>
            {season.name}
          </option>
        ))}
      </select>

      {episodes.length > 0 && (
        <div>
          <h3>Episodes</h3>
          <ul>
            {episodes.map((episode) => (
              <li key={episode.id}>
                {episode.episode_number}. {episode.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeasonsDropdown;
