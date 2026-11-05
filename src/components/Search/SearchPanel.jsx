import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { tmdbGet } from "../../api/tmdb";
import { Apis } from "../../api/api";

const TMDB = `${Apis.baseURL}/tmdb`;
const thumb = (path) => (path ? `https://image.tmdb.org/t/p/w92${path}` : null);

const routeFor = (type, imdbId) =>
  `/dashboard/${type === "series" || type === "tv" ? "tvSeries" : "movie"}/${imdbId}`;

const TypeBadge = ({ type }) => {
  const tv = type === "tv" || type === "series";
  return (
    <span
      className={`rounded px-1.5 py-px text-[0.6rem] font-bold uppercase tracking-wider ${
        tv ? "bg-cyan-400/15 text-cyan-300" : "bg-fuchsia-400/15 text-fuchsia-300"
      }`}
    >
      {tv ? "Series" : "Movie"}
    </span>
  );
};

const Poster = ({ src, alt }) =>
  src && src !== "N/A" ? (
    <img src={src} alt={alt} loading="lazy" className="h-14 w-10 shrink-0 rounded-md object-cover ring-1 ring-white/10" />
  ) : (
    <div className="h-14 w-10 shrink-0 rounded-md bg-white/5 ring-1 ring-white/10" />
  );

const Row = ({ children, onClick }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // keep input focus so the panel doesn't close first
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none"
  >
    {children}
    <svg viewBox="0 0 20 20" className="ml-auto h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-rose-400" fill="currentColor">
      <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4z" />
    </svg>
  </button>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 px-2.5 pb-2 pt-1">
    <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
    <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gray-400">{children}</span>
  </div>
);

// Trending list shown when the search box is focused but empty. One cached TMDB call;
// the IMDb id (needed by our routes) is looked up only for the item the user clicks.
const Trending = ({ onNavigate }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    tmdbGet(`${TMDB}/trending/all/day`)
      .then(({ data }) => {
        if (!alive) return;
        setItems(
          data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv").slice(0, 6)
        );
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  const open = async (item) => {
    try {
      const { data } = await tmdbGet(`${TMDB}/${item.media_type}/${item.id}/external_ids`);
      if (data.imdb_id) onNavigate(routeFor(item.media_type, data.imdb_id));
    } catch (error) {
      console.error("Could not open trending title:", error);
    }
  };

  return (
    <>
      <SectionTitle>Trending now</SectionTitle>
      {items === null
        ? Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-2.5 py-2">
              <div className="h-14 w-10 animate-pulse rounded-md bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))
        : items.map((item, i) => (
            <Row key={item.id} onClick={() => open(item)}>
              <span className="w-6 shrink-0 text-center font-gilroy text-2xl font-bold italic leading-none text-transparent bg-clip-text bg-gradient-to-b from-violet-300 to-rose-500">
                {i + 1}
              </span>
              <Poster src={thumb(item.poster_path)} alt={item.title || item.name} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{item.title || item.name}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <TypeBadge type={item.media_type} />
                  {(item.release_date || item.first_air_date || "").slice(0, 4)}
                  {item.vote_average > 0 && (
                    <span className="text-amber-300">★ {item.vote_average.toFixed(1)}</span>
                  )}
                </span>
              </span>
            </Row>
          ))}
    </>
  );
};

const SearchPanel = ({ query, results, loading, error, onClose, onSeeAll }) => {
  const navigate = useNavigate();
  const typing = query.trim().length > 0;
  const tooShort = typing && query.trim().length < 3;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-[26rem] rounded-2xl bg-gradient-to-br from-violet-500/40 via-white/10 to-rose-500/40 p-px shadow-2xl shadow-black/60"
    >
      <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-[#0d0a16]/95 p-2 backdrop-blur-xl">
        {!typing && <Trending onNavigate={go} />}

        {tooShort && (
          <p className="px-3 py-6 text-center text-sm text-gray-400">Keep typing… (3+ characters)</p>
        )}

        {typing && !tooShort && loading && (
          <p className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-rose-400" />
            Searching for “{query.trim()}”…
          </p>
        )}

        {typing && !tooShort && !loading && error && (
          <p className="px-3 py-6 text-center text-sm text-gray-400">
            No results for <span className="text-white">“{query.trim()}”</span>
          </p>
        )}

        {typing && !tooShort && !loading && !error && results.length > 0 && (
          <>
            <SectionTitle>Results</SectionTitle>
            {results.slice(0, 6).map((movie) => (
              <Row key={movie.imdbID} onClick={() => go(routeFor(movie.Type, movie.imdbID))}>
                <Poster src={movie.Poster} alt={movie.Title} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{movie.Title}</span>
                  <span className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <TypeBadge type={movie.Type} />
                    {movie.Year}
                    {movie.imdbRating && movie.imdbRating !== "N/A" && !isNaN(movie.imdbRating) && (
                      <span className="text-amber-300">★ {movie.imdbRating}</span>
                    )}
                  </span>
                </span>
              </Row>
            ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onSeeAll}
              className="mt-1 w-full rounded-xl border border-white/10 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-gray-300 transition-colors hover:border-rose-500/50 hover:text-white"
            >
              See all results
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SearchPanel;
