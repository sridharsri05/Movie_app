import React, { useState, useEffect } from "react";
import axios from "axios";

const SeasonsDropdown = ({ seriesId }) => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  // Fetch all seasons when the component mounts
  const apiKey = "6a42205b97295fef4aea5d2775c755ba";
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`
        );
        setSeasons(response.data.seasons);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
  }, [seriesId]);
  console.log(seriesId, "series");
  // Fetch episodes when a season is selected
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;

      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${selectedSeason}?api_key=${apiKey}`
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
