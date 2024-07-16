import React from "react";
import { useSelector } from "react-redux";
import { selectSearchResults } from "../Redux/searchSlice";

const SearchResults = () => {
  const { search } = useSelector((state) => state.search);
  console.log(search, "searchResults");

  return (
    <>
      <div>SearchResults</div>
      <>
        <ul key={search.imdbID}>
          <li>{search.Title}</li>
          <li>{search.Actors}</li>
          <li></li>
          <li></li>
        </ul>
      </>
      ;
    </>
  );
};

export default SearchResults;
