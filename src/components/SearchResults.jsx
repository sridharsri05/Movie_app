import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { selectisLoading, selectSearchResults, selectTotalResults } from "../Redux/searchSlice";
import { tmdbGet } from "../api/tmdb";
import { Apis } from "../api/api";
import { useOpenTitle } from "./Rows/HomeRows";
import Pagination from "./Pagination/Pagination";

const TMDB = `${Apis.baseURL}/tmdb`;
const POSTER = "https://image.tmdb.org/t/p/w342";

// Language filter. OMDb (the default search) can't filter by language, so picking one switches the
// search to TMDB, which knows each title's original language.
const LANGUAGES = [
  { code: "", label: "All languages" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "hi", label: "Hindi" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "es", label: "Spanish" },
];
const TYPES = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];
const TMDB_PAGES = 3; // per media type; 3 × 20 results is plenty to filter by language

const omdbHref = (m) => (m.Type === "series" ? `/dashboard/tvSeries/${m.imdbID}` : `/dashboard/movie/${m.imdbID}`);
const validPoster = (p) => (p && p !== "N/A" ? p : null);

const fromTmdb = (r, type) => ({
  key: `${type}-${r.id}`,
  id: r.id,
  media_type: type,
  title: r.title || r.name,
  year: (r.release_date || r.first_air_date || "").slice(0, 4),
  rating: r.vote_average ? r.vote_average.toFixed(1) : null,
  poster: r.poster_path ? `${POSTER}${r.poster_path}` : null,
  plot: r.overview,
  popularity: r.popularity || 0,
  language: r.original_language,
});

// Search TMDB (movies + series) for `query` and keep titles in `lang`. If nothing matches, fall back
// to that language's most popular titles so the user still has something to browse.
function useLanguageSearch(query, lang) {
  const [state, setState] = useState({ items: null, fallback: false, error: false });
  useEffect(() => {
    if (!lang) return;
    let alive = true;
    setState({ items: null, fallback: false, error: false });
    const pages = Array.from({ length: TMDB_PAGES }, (_, i) => i + 1);
    const search = (type) =>
      Promise.all(
        pages.map((page) =>
          tmdbGet(`${TMDB}/search/${type}`, { params: { query, page: String(page) } })
            .then(({ data }) => (data?.results || []).map((r) => fromTmdb(r, type)))
            .catch(() => [])
        )
      ).then((lists) => lists.flat());

    Promise.all([search("movie"), search("tv")])
      .then(async ([movies, shows]) => {
        let items = [...movies, ...shows].filter((i) => i.language === lang && i.poster);
        let fallback = false;
        if (!items.length) {
          fallback = true;
          const params = { with_original_language: lang, sort_by: "popularity.desc" };
          const [m, t] = await Promise.all([
            tmdbGet(`${TMDB}/discover/movie`, { params }).then(({ data }) => data.results.map((r) => fromTmdb(r, "movie"))),
            tmdbGet(`${TMDB}/discover/tv`, { params }).then(({ data }) => data.results.map((r) => fromTmdb(r, "tv"))),
          ]);
          items = [...m, ...t].filter((i) => i.poster);
        }
        items.sort((a, b) => b.popularity - a.popularity);
        if (alive) setState({ items, fallback, error: false });
      })
      .catch(() => alive && setState({ items: [], fallback: false, error: true }));
    return () => {
      alive = false;
    };
  }, [query, lang]);
  return state;
}

// ---------- UI ----------

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-gradient-to-r from-violet-400 to-rose-500 text-white shadow-lg shadow-violet-500/20"
        : "bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const CardBody = ({ poster, title, year, rating, typeLabel, genre, plot }) => (
  <>
    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-violet-900/40 to-rose-900/30 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-white/25 group-hover:shadow-[0_12px_30px_-10px_rgba(168,85,247,0.45)]">
      {poster ? (
        <img src={poster} alt={title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4 text-center font-gilroy text-lg font-semibold text-white/70">{title}</div>
      )}
      {rating && rating !== "N/A" && (
        <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-bold text-amber-300 ring-1 ring-white/15 backdrop-blur-sm">
          ★ {rating}
        </span>
      )}
      <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85 ring-1 ring-white/15 backdrop-blur-sm">
        {typeLabel}
      </span>
      {plot && plot !== "N/A" && (
        <div className="absolute inset-0 hidden flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-black/10 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
          <p className="line-clamp-5 text-xs leading-5 text-white/85">{plot}</p>
        </div>
      )}
    </div>
    <p className="mt-2.5 truncate font-gilroy text-sm font-semibold text-gray-100">{title}</p>
    <p className="mt-0.5 truncate text-xs text-gray-400">{[year, genre].filter(Boolean).join(" · ")}</p>
  </>
);

const GRID = "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6";

const SkeletonGrid = () => (
  <div className={GRID}>
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i}>
        <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="mt-2.5 h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
      </div>
    ))}
  </div>
);

const Empty = ({ children }) => (
  <div className="flex flex-col items-center gap-3 py-24 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </span>
    <p className="max-w-sm text-sm text-white/60">{children}</p>
  </div>
);

const SearchResults = () => {
  const { query } = useParams();
  const [params, setParams] = useSearchParams();
  const lang = LANGUAGES.some((l) => l.code === params.get("lang")) ? params.get("lang") : "";
  const [type, setType] = useState("all");

  const omdbResults = useSelector(selectSearchResults);
  const omdbLoading = useSelector(selectisLoading);
  const omdbTotal = useSelector(selectTotalResults);
  const tmdb = useLanguageSearch(query, lang);
  const openTitle = useOpenTitle();

  const setLang = (code) => {
    const next = new URLSearchParams(params);
    if (code) next.set("lang", code);
    else next.delete("lang");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [omdbResults, lang]);

  const omdbItems = useMemo(
    () => (omdbResults || []).filter((m) => type === "all" || (type === "tv" ? m.Type === "series" : m.Type !== "series")),
    [omdbResults, type]
  );
  const tmdbItems = useMemo(
    () => (tmdb.items || []).filter((i) => type === "all" || i.media_type === type),
    [tmdb.items, type]
  );

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.label;
  const loading = lang ? tmdb.items === null : omdbLoading;
  const count = lang ? tmdbItems.length : omdbTotal;

  return (
    <div className="min-h-screen bg-[#0b0614] pb-16 pt-24">
      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14">
        {/* header */}
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
          <span className="h-3.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-rose-500" />
          Search results
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
          <h1 className="font-gilroy text-3xl font-bold text-white sm:text-4xl">
            &ldquo;<span className="bg-gradient-to-r from-violet-300 to-rose-400 bg-clip-text text-transparent">{query}</span>&rdquo;
          </h1>
          {!loading && count > 0 && (
            <span className="pb-1 text-sm text-white/50">
              {count.toLocaleString()} result{count === 1 ? "" : "s"}
              {lang && !tmdb.fallback ? ` in ${langLabel}` : ""}
            </span>
          )}
        </div>

        {/* filters */}
        <div className="mt-6 space-y-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {LANGUAGES.map((l) => (
              <Chip key={l.code || "all"} active={lang === l.code} onClick={() => setLang(l.code)}>
                {l.label}
              </Chip>
            ))}
          </div>
          <div className="inline-flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={type === t.value}
                className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                  type === t.value ? "bg-white text-[#0b0614]" : "text-white/60 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {lang && tmdb.fallback && !loading && (
          <p className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-sm text-white/70 ring-1 ring-white/10">
            No {langLabel} titles match &ldquo;{query}&rdquo;. Here are popular {langLabel} movies and series instead.
          </p>
        )}

        {/* results */}
        <div className="mt-8">
          {loading ? (
            <SkeletonGrid />
          ) : lang ? (
            tmdb.error ? (
              <Empty>Couldn&apos;t load results. Check your connection and try again.</Empty>
            ) : tmdbItems.length ? (
              <div className={GRID}>
                {tmdbItems.map((i) => (
                  <button key={i.key} type="button" onClick={() => openTitle(i)} className="group text-left">
                    <CardBody
                      poster={i.poster}
                      title={i.title}
                      year={i.year}
                      rating={i.rating}
                      typeLabel={i.media_type === "tv" ? "Series" : "Movie"}
                      plot={i.plot}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <Empty>No {type === "tv" ? "series" : type === "movie" ? "movies" : "titles"} found in {langLabel}.</Empty>
            )
          ) : omdbItems.length ? (
            <div className={GRID}>
              {omdbItems.map((m) => (
                <Link key={m.imdbID} to={omdbHref(m)} className="group">
                  <CardBody
                    poster={validPoster(m.Poster)}
                    title={m.Title}
                    year={m.Year}
                    rating={m.imdbRating}
                    typeLabel={m.Type === "series" ? "Series" : "Movie"}
                    genre={m.Genre && m.Genre !== "N/A" ? m.Genre.split(",").slice(0, 2).join(", ") : null}
                    plot={m.Plot}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <Empty>
              {omdbResults?.length ? "Nothing of that type on this page." : <>No results for &ldquo;{query}&rdquo;. Try a different spelling or another title.</>}
            </Empty>
          )}
        </div>

        {/* OMDb paging (also loads the results); language mode shows everything on one page */}
        {!lang && <Pagination />}
      </div>
    </div>
  );
};

export default SearchResults;
