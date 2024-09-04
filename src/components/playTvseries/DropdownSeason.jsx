import React, { useState, useEffect } from "react";
import axios from "axios";
import { DropdownCarousel } from "../customeCards/DropdownCarousel";

export const DropdownSeason = ({ seriesId }) => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const apiKey = "6a42205b97295fef4aea5d2775c755ba";

  useEffect(() => {
    axios
      .get(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`)
      .then((response) => {
        const regularSeasons = response.data.seasons.filter(
          (season) => season.season_number > 0
        );
        setSeasons(regularSeasons);
        if (regularSeasons.length > 0) {
          setSelectedSeason(regularSeasons[0].season_number);
        }
      })
      .catch((error) => console.error("Error fetching TV show details:", error));
  }, [seriesId]);

  useEffect(() => {
    if (selectedSeason) {
      axios
        .get(
          `https://api.themoviedb.org/3/tv/${seriesId}/season/${selectedSeason}?api_key=${apiKey}`
        )
        .then((response) => {
          setEpisodes(response.data.episodes);
        })
        .catch((error) => console.error("Error fetching episodes:", error));
    }
  }, [selectedSeason, seriesId]);

  const handleSeasonChange = (e) => {
    const seasonNumber = parseInt(e.target.value, 10);
    setSelectedSeason(seasonNumber);
  };

  return (
    <div className="max-w-screen-3xl p-4 bg-gray-900 rounded-lg shadow-md">
      {/* Dropdown for selecting season */}
      <div className="relative mb-4 max-w-[19rem] ">
        <select
          className="block w-full p-3 text-white bg-gray-800 border border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 max-h-60 overflow-y-auto"
          onChange={handleSeasonChange}
          value={selectedSeason || ""}
        >
          <option value="" disabled>
            Select Season
          </option>
          {seasons.map((season) => (
            <option key={season.season_number} value={season.season_number}>
              Season {season.season_number}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Carousel */}
      {selectedSeason && (
        <div>
          {/* <h2 className="text-xl font-bold text-white mb-4">Season {selectedSeason}</h2> */}
          <DropdownCarousel episodes={episodes} />
        </div>
      )}
    </div>
  );
};
