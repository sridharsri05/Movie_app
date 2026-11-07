import { useNavigate, useParams } from "react-router-dom";
import { useSearchByidQuery } from "../../Redux/Services/MovieApi";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { tmdbGet } from "../../api/tmdb";
import { SERVERS, DEFAULT_SERVER } from "../../api/servers";
import { AnimatePresence, motion } from "framer-motion";
import Spinner from "../../Spinner/Spinner";
import Seo from "../../utils/Seo";
import axios from "axios";
import { Apis } from "../../api/api";
import { MediaRow } from "../Rows/HomeRows";
import { useLibraryItem, useRecordHistory } from "../../Redux/Services/LibraryApi";

const TMDB = `${Apis.baseURL}/tmdb`;
const IMG = "https://image.tmdb.org/t/p/w342";

const minsToHours = (value) => {
  const minutes = parseInt(value, 10);
  if (!minutes) return null;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-5 w-5",
  "aria-hidden": true,
};

const ThumbUp = ({ filled }) => (
  <svg {...iconProps} fill={filled ? "currentColor" : "none"}>
    <path d="M7 10v11H3V10zM7 10l4-8a2.5 2.5 0 0 1 2.5 2.5V8H19a2 2 0 0 1 2 2.3l-1.3 8A2 2 0 0 1 17.7 20H7" />
  </svg>
);
const ThumbDown = ({ filled }) => (
  <svg {...iconProps} fill={filled ? "currentColor" : "none"}>
    <path d="M17 14V3h4v11zM17 14l-4 8a2.5 2.5 0 0 1-2.5-2.5V16H5a2 2 0 0 1-2-2.3l1.3-8A2 2 0 0 1 6.3 4H17" />
  </svg>
);
const Plus = () => (
  <svg {...iconProps}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const Check = () => (
  <svg {...iconProps}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const ShareIcon = () => (
  <svg {...iconProps}>
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" />
  </svg>
);
const Dots = () => (
  <svg {...iconProps} fill="currentColor" stroke="none">
    <circle cx="6" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="18" cy="12" r="1.6" />
  </svg>
);

const has = (v) => v && v !== "N/A";

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
const AVATAR_GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-fuchsia-500 to-rose-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-orange-400",
];
const avatarGradient = (name) =>
  AVATAR_GRADIENTS[[...name].reduce((h, ch) => (h + ch.charCodeAt(0)) % AVATAR_GRADIENTS.length, 0)];

// Compact money format for the highlights (e.g. $535M).
const fmtMoney = (v) =>
  "$" + (v >= 1e9 ? (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? Math.round(v / 1e6) + "M" : Math.round(v).toLocaleString("en-US"));



// OMDb lags on new releases (e.g. tt50389959 returns "Incorrect IMDb ID" while TMDB already has it).
// Build the same OMDb-shaped object from TMDB so the page still renders. Resolves null if TMDB
// doesn't know the title either.
const fmtReleased = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
const joinOr = (list, n) => (list?.length ? list.slice(0, n).join(", ") : "N/A");

async function tmdbMovieAsOmdb(imdbID) {
  const { data: found } = await tmdbGet(`${TMDB}/find/${imdbID}`, { params: { external_source: "imdb_id" } });
  const hit = found?.movie_results?.[0];
  if (!hit) return null;
  const { data: m } = await tmdbGet(`${TMDB}/movie/${hit.id}`, {
    params: { append_to_response: "credits,release_dates" },
  });
  const crew = m.credits?.crew || [];
  const usRelease = m.release_dates?.results?.find((r) => r.iso_3166_1 === "US");
  const rated = usRelease?.release_dates?.map((r) => r.certification).find(Boolean);
  return {
    Response: "True",
    Title: m.title,
    Year: (m.release_date || "").slice(0, 4) || "N/A",
    Poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "N/A",
    Plot: m.overview || "N/A",
    Genre: joinOr(m.genres?.map((g) => g.name), 4),
    Runtime: m.runtime ? `${m.runtime} min` : "N/A",
    imdbRating: m.vote_count > 0 ? m.vote_average.toFixed(1) : "N/A",
    Director: joinOr(crew.filter((c) => c.job === "Director").map((c) => c.name), 2),
    Writer: joinOr([...new Set(crew.filter((c) => c.department === "Writing").map((c) => c.name))], 3),
    Actors: joinOr(m.credits?.cast?.map((c) => c.name), 4),
    Released: fmtReleased(m.release_date),
    Rated: rated || "N/A",
    Language: joinOr(m.spoken_languages?.map((l) => l.english_name), 3),
    Country: joinOr(m.production_countries?.map((c) => c.name), 3),
    Awards: "N/A",
    BoxOffice: m.revenue > 0 ? fmtMoney(m.revenue) : "N/A",
  };
}

const PlayMovie = () => {
  const { imdbID } = useParams();
  const navigate = useNavigate();
  const { data: omdbData, isLoading, refetch } = useSearchByidQuery(imdbID);
  const omdbOk = omdbData?.Response === "True";

  // If the browser's OMDb request fails (network hiccup, rate limit), fall back to our backend,
  // which serves the same OMDb details from its 6h cache (with fixed posters). If OMDb doesn't know
  // the title at all (new releases), build the details from TMDB instead.
  // null = not tried / in progress, false = failed too.
  const [fallback, setFallback] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    setFallback(null);
    if (isLoading || omdbOk) return;
    let alive = true;
    axios
      .post(`${Apis.baseURL}/getLatestMovies`, { imdbIds: [imdbID] })
      .then(({ data }) => {
        const cached = data?.[0];
        if (cached && cached.Response !== "False" && cached.Title) return cached;
        return tmdbMovieAsOmdb(imdbID);
      })
      .catch(() => tmdbMovieAsOmdb(imdbID))
      .then((details) => alive && setFallback(details || false))
      .catch(() => alive && setFallback(false));
    return () => {
      alive = false;
    };
  }, [imdbID, isLoading, omdbOk, retryKey]);

  const movieData = omdbOk ? omdbData : fallback || undefined;
  const detailsFailed = !isLoading && !omdbOk && fallback === false;
  const retryDetails = () => {
    refetch();
    setRetryKey((k) => k + 1);
  };

  const [server, setServer] = useState(DEFAULT_SERVER);
  // Watchlist + Like are saved in the user's library; Dislike stays local and just clears Like.
  const [dislike, setDislike] = useState(false);
  const libMeta = { title: movieData?.Title, poster: movieData?.Poster, year: movieData?.Year };
  const lib = useLibraryItem(imdbID, "movie", libMeta);
  useRecordHistory(imdbID, "movie", libMeta);
  const inList = lib.inList;
  const reaction = lib.liked ? "like" : dislike ? "dislike" : null;
  const setInList = (next) => lib.setInList(typeof next === "function" ? next(inList) : next);
  const setReaction = (next) => {
    const r = typeof next === "function" ? next(reaction) : next;
    setDislike(r === "dislike");
    if ((r === "like") !== lib.liked) lib.setLiked(r === "like");
  };
  const [copied, setCopied] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);
  const [related, setRelated] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoReady, setLogoReady] = useState(false);
  const [cast, setCast] = useState([]); // TMDB cast with headshots
  const [backdrop, setBackdrop] = useState(null); // TMDB backdrop for the ambient page background
  const [bgReady, setBgReady] = useState(false);
  const [relatedFailed, setRelatedFailed] = useState(false);
  const [relatedRetry, setRelatedRetry] = useState(0);

  // Reset per-title UI state when navigating between movies.
  useEffect(() => {
    setDislike(false);
    setRelated([]);
    setLogoUrl(null);
    setLogoReady(false);
    setCast([]);
    setBackdrop(null);
    setBgReady(false);
  }, [imdbID]);

  // Related titles: one /find lookup for the TMDB id, then recommendations (or similar).
  useEffect(() => {
    let cancelled = false;
    setRelatedFailed(false);
    (async () => {
      try {
        const { data: found } = await tmdbGet(`${TMDB}/find/${imdbID}`, {
          params: { external_source: "imdb_id" },
        });
        const tmdbId = found?.movie_results?.[0]?.id;
        if (!tmdbId) return;
        tmdbGet(`${TMDB}/movie/${tmdbId}/images`, { params: { include_image_language: "en,null" } })
          .then(({ data: imgs }) => {
            const logos = imgs?.logos || [];
            const logo = logos.find((l) => l.iso_639_1 === "en") || logos[0];
            if (!cancelled && logo) setLogoUrl("https://image.tmdb.org/t/p/w500" + logo.file_path);
            const bd = (imgs?.backdrops || [])[0];
            if (!cancelled && bd) setBackdrop("https://image.tmdb.org/t/p/w1280" + bd.file_path);
          })
          .catch(() => {});
        tmdbGet(`${TMDB}/movie/${tmdbId}/credits`)
          .then(({ data: credits }) => {
            if (cancelled) return;
            setCast(
              (credits?.cast || []).slice(0, 10).map((c) => ({
                name: c.name,
                character: c.character,
                photo: c.profile_path ? "https://image.tmdb.org/t/p/w185" + c.profile_path : null,
              }))
            );
          })
          .catch(() => {});
        let { data } = await tmdbGet(`${TMDB}/movie/${tmdbId}/recommendations`);
        if (!data?.results?.length) {
          ({ data } = await tmdbGet(`${TMDB}/movie/${tmdbId}/similar`));
        }
        const items = (data?.results || [])
          .filter((m) => m.id !== tmdbId && m.poster_path)
          .slice(0, 14)
          .map((m) => ({
            id: m.id,
            title: m.title,
            year: m.release_date?.slice(0, 4),
            rating: m.vote_average ? m.vote_average.toFixed(1) : null,
            poster: `${IMG}${m.poster_path}`,
          }));
        if (!cancelled) setRelated(items);
      } catch (error) {
        console.error("Could not load related movies:", error);
        if (!cancelled) setRelatedFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imdbID, relatedRetry]);

  const openRelated = useCallback(
    async (item) => {
      try {
        const { data } = await tmdbGet(`${TMDB}/movie/${item.id}/external_ids`);
        if (data?.imdb_id) navigate(`/dashboard/movie/${data.imdb_id}`);
      } catch (error) {
        console.error("Could not open title:", error);
      }
    },
    [navigate]
  );

  const share = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movieData?.Title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // share dismissed or clipboard unavailable
    }
  }, [movieData?.Title]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0614]">
        <Spinner />
      </div>
    );

  const genres = has(movieData?.Genre) ? movieData.Genre.split(",").map((g) => g.trim()) : [];
  const runtime = minsToHours(movieData?.Runtime);
  const poster = has(movieData?.Poster) ? movieData.Poster : null;

  return (
    <motion.div
      className="relative isolate min-h-screen overflow-x-hidden bg-[#0b0614] pt-6 pb-16 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Seo
        title={`${movieData?.Title ?? "Watch"} - Watch Now | MovieNexus`}
        description={`Watch ${movieData?.Title} (${movieData?.Year}) - ${movieData?.Plot}`}
        image={movieData?.Poster}
        keywords={`watch ${movieData?.Title}, ${movieData?.Genre} movies, MovieNexus`}
        url={`https://movienexus-ruddy-nine.vercel.app/dashboard/movie/${imdbID}`}
      />

      {/* Ambient background (fixed, covers the whole page): the movie's backdrop (or blurred poster as a fallback), dimmed and
          faded into the page so text stays readable. Purely decorative. */}
      {(backdrop || poster) && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <motion.img
            key={backdrop || poster}
            src={backdrop || poster}
            alt=""
            onLoad={() => setBgReady(true)}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={bgReady ? { opacity: backdrop ? 0.9 : 0.5, scale: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full w-full object-cover object-center ${backdrop ? "blur-[0.5px]" : "blur-2xl"}`}
          />
          {/* even dim over the whole page, darker on the text side, vignette at the edges */}
          <div className="absolute inset-0 bg-[#0b0614]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0614]/70 via-[#0b0614]/5 to-[#0b0614]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(11,6,20,0.35)_100%)]" />
        </div>
      )}

      {/* Player */}
      <div className="mx-4 mt-[4.75rem] sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16">
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
          <iframe
            key={`${server.id}-${imdbID}`}
            title={movieData?.Title || "Player"}
            className="h-full w-full"
            src={server.movie(imdbID)}
            allowFullScreen
            referrerPolicy="origin"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
          <span className="mr-1">Video not loading? Try another server.</span>
          {SERVERS.map((s) => {
            const active = s.id === server.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => setServer(s)}
                title={s.host}
                className={`rounded-full px-4 py-1.5 font-medium ring-1 transition ${
                  active
                    ? "bg-gradient-to-r from-violet-400 to-rose-500 text-white ring-transparent shadow-lg shadow-violet-500/20"
                    : "bg-white/10 ring-white/15 hover:bg-white/20"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details unavailable: keep the player usable and offer a retry instead of a blank page */}
      {detailsFailed && (
        <div className="mx-4 mt-10 flex flex-col items-start gap-3 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16">
          <p className="font-gilroy text-lg font-semibold">Couldn&apos;t load the movie details.</p>
          <p className="text-sm text-white/60">Check your connection and try again. The player above may still work.</p>
          <button
            type="button"
            onClick={retryDetails}
            className="rounded-full bg-gradient-to-r from-violet-400 to-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
          >
            Retry
          </button>
        </div>
      )}

      {/* Details */}
      {movieData && (
      <div className="mx-4 mt-8 grid grid-cols-[6.5rem_1fr] grid-rows-[auto_auto_1fr_auto_auto_auto_auto_auto] gap-x-4 gap-y-2 sm:mx-6 sm:grid-cols-[8rem_1fr] md:mx-8 md:mt-10 md:flex md:flex-row md:gap-10 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16">
        {/* Poster + actions */}
        <motion.div
          className="contents md:block md:w-56 md:shrink-0 lg:w-64"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-md:col-start-1 max-md:row-span-3 max-md:row-start-1 max-md:self-start aspect-[2/3] overflow-hidden rounded-xl md:rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-violet-900/30">
            {poster && (
              <img className="h-full w-full object-cover" src={poster} alt={movieData?.Title} />
            )}
          </div>

          <div className="max-md:col-span-2 max-md:row-start-4 max-md:mt-1 grid grid-cols-[2.75rem_2.75rem_1fr_auto_2.75rem] gap-2 md:mt-4 md:grid-cols-2">
            {/* Like / dislike: label on md+, gradient ring + springy icon pop when active */}
            {[
              { key: "like", label: "Like", Icon: ThumbUp, ring: "from-violet-400 to-fuchsia-500", tint: "bg-violet-500/20", rot: -20 },
              { key: "dislike", label: "Dislike", Icon: ThumbDown, ring: "from-rose-400 to-orange-400", tint: "bg-rose-500/20", rot: 20 },
            ].map(({ key, label, Icon, ring, tint, rot }) => {
              const active = reaction === key;
              return (
                <motion.button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  aria-label={label}
                  onClick={() => setReaction((r) => (r === key ? null : key))}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  className={`relative rounded-xl p-px transition-colors duration-300 ${active ? `bg-gradient-to-r ${ring}` : "bg-white/10 hover:bg-white/25"}`}
                >
                  <span
                    className={`flex h-full items-center justify-center gap-2 rounded-[11px] px-3 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                      active ? `${tint} bg-[#120c1d] text-white` : "bg-gradient-to-b from-[#1a1326] to-[#120c1d] text-white/85 hover:text-white"
                    }`}
                  >
                    <motion.span
                      key={`${key}-${active}`}
                      initial={{ scale: active ? 0.4 : 1, rotate: active ? rot : 0 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 14 }}
                      className="inline-flex"
                    >
                      <Icon filled={active} />
                    </motion.span>
                    <span className="hidden md:inline">{label}</span>
                  </span>
                </motion.button>
              );
            })}

            {/* My List: label + icon cross-fade/slide between states */}
            <motion.button
              type="button"
              aria-pressed={inList}
              onClick={() => setInList((v) => !v)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`md:col-span-2 relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-[background-color,box-shadow,filter] duration-300 md:text-base ${
                inList
                  ? "bg-white/10 ring-1 ring-violet-400 text-white"
                  : "bg-gradient-to-r from-violet-500 to-rose-500 text-white shadow-lg shadow-fuchsia-500/25 hover:brightness-110"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={inList ? "in" : "add"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-2"
                >
                  {inList ? <Check /> : <Plus />}
                  {inList ? "In My List" : "Add to My List"}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Share: "Link copied" confirmation slides in */}
            <motion.button
              type="button"
              onClick={share}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative rounded-xl bg-white/10 p-px transition-colors duration-300 hover:bg-white/25"
            >
              <span className="flex h-full items-center justify-center overflow-hidden rounded-[11px] bg-gradient-to-b from-[#1a1326] to-[#120c1d] px-3 py-2.5 text-sm font-semibold text-white/85 hover:text-white">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={copied ? "copied" : "share"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`inline-flex items-center gap-2 ${copied ? "text-emerald-300" : ""}`}
                  >
                    {copied ? <Check /> : <ShareIcon />}
                    {copied ? "Link copied" : "Share"}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>

            {/* More: small animated menu (was a no-op button) */}
            <div ref={moreRef} className="relative">
              <motion.button
                type="button"
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                className={`relative h-full w-full rounded-xl p-px transition-colors duration-300 ${moreOpen ? "bg-gradient-to-r from-violet-400 to-rose-500" : "bg-white/10 hover:bg-white/25"}`}
              >
                <span className="flex h-full items-center justify-center rounded-[11px] bg-gradient-to-b from-[#1a1326] to-[#120c1d] px-3 py-2.5 text-white/85">
                  <motion.span animate={{ rotate: moreOpen ? 90 : 0 }} transition={{ duration: 0.25 }} className="inline-flex">
                    <Dots />
                  </motion.span>
                </span>
              </motion.button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full z-30 mt-2 w-48 origin-top-right overflow-hidden rounded-xl bg-[#15101f]/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl"
                  >
                    <a
                      role="menuitem"
                      href={`https://www.imdb.com/title/${imdbID}/`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      View on IMDb
                      <span aria-hidden="true" className="text-white/50">↗</span>
                    </a>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {
                          /* clipboard unavailable */
                        }
                        setMoreOpen(false);
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Copy link
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <div className="contents md:block md:min-w-0 md:flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-md:col-start-2 max-md:row-start-1 font-gilroy text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl"
          >
            {logoUrl && (
              <>
                <span className="sr-only">{movieData?.Title}</span>
                <motion.img
                  src={logoUrl}
                  alt=""
                  onLoad={() => setLogoReady(true)}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={logoReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`${logoReady ? "block" : "hidden"} w-auto max-w-full max-h-16 sm:max-h-20 lg:max-h-28 object-contain object-left drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]`}
                />
              </>
            )}
            {!logoReady && movieData?.Title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-md:col-start-2 max-md:row-start-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/75 md:mt-3"
          >
            {has(movieData?.imdbRating) && (
              <span className="inline-flex items-center gap-1 font-semibold text-white">
                <span className="text-amber-400">★</span>
                {movieData.imdbRating}
              </span>
            )}
            {has(movieData?.Year) && <span>{movieData.Year}</span>}
            {runtime && <span>{runtime}</span>}
            {has(movieData?.Rated) && (
              <span className="rounded border border-white/40 px-1.5 py-0.5 text-xs font-bold text-white/90">
                {movieData.Rated}
              </span>
            )}
          </motion.div>

          {genres.length > 0 && (
            <div className="max-md:col-start-2 max-md:row-start-3 max-md:self-start flex flex-wrap gap-2 md:mt-4">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {has(movieData?.Plot) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-md:col-span-2 max-md:row-start-5 max-md:mt-2 max-w-3xl text-[0.95rem] leading-7 text-white/80 md:mt-5 md:text-base"
            >
              {movieData.Plot}
            </motion.p>
          )}

          {/* Highlights + Cast & Crew (replaces the old details panel). OMDb data, plus TMDB cast photos. */}
          {(() => {
            const split = (v) => (has(v) ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
            const awards = has(movieData?.Awards) ? movieData.Awards : "";
            const oscars = Number(awards.match(/Won (\d+) Oscars?/i)?.[1] || 0);
            const wins = Number(awards.match(/(\d+) wins?/i)?.[1] || 0);
            const money = has(movieData?.BoxOffice) ? Number(movieData.BoxOffice.replace(/[^0-9]/g, "")) : 0;
            const awardText = oscars
              ? `${oscars} Oscar${oscars > 1 ? "s" : ""}${wins ? ` · ${wins} wins` : ""}`
              : wins
              ? `${wins} wins`
              : awards;

            const highlights = [
              awardText && { key: "awards", text: awardText, gold: true, d: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3" },
              money > 0 && { key: "money", text: `${fmtMoney(money)} box office`, d: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
              has(movieData?.Released) && { key: "date", text: movieData.Released, d: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
              split(movieData?.Language).length > 0 && { key: "lang", text: split(movieData.Language).join(", "), d: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" },
              split(movieData?.Country).length > 0 && { key: "country", text: split(movieData.Country).join(", "), d: "M4 22V4M4 4h13l-2 4 2 4H4" },
            ].filter(Boolean);

            // Cast: TMDB headshots when available, otherwise OMDb names with initials.
            const castList = cast.length
              ? cast
              : split(movieData?.Actors).map((name) => ({ name, character: "", photo: null }));
            const crew = [
              ...split(movieData?.Director).map((name) => ({ name, role: "Director" })),
              ...split(movieData?.Writer).map((name) => ({ name, role: "Writer" })),
            ].filter((c, i, arr) => arr.findIndex((x) => x.name === c.name && x.role === c.role) === i);

            const ease = [0.22, 1, 0.36, 1];
            const appear = (i) => ({
              initial: { opacity: 0, y: 12 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-20px" },
              transition: { duration: 0.45, ease, delay: Math.min(i, 10) * 0.05 },
            });
            const SectionLabel = ({ children }) => (
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                <span className="h-3.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-rose-500" />
                {children}
              </h3>
            );

            return (
              <>
                {highlights.length > 0 && (
                  <div className="max-md:col-span-2 max-md:row-start-6 max-md:mt-1 mt-6 flex max-w-3xl flex-wrap gap-2">
                    {highlights.map((h, i) => (
                      <motion.span
                        key={h.key}
                        {...appear(i)}
                        whileHover={{ y: -2 }}
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors duration-300 ${
                          h.gold
                            ? "bg-amber-400/10 text-amber-100 ring-amber-300/30 hover:bg-amber-400/15"
                            : "bg-white/[0.05] text-white/90 ring-white/10 hover:bg-white/[0.09]"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className={`h-4 w-4 ${h.gold ? "text-amber-300" : "text-white/60"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={h.d} />
                        </svg>
                        {h.text}
                      </motion.span>
                    ))}
                  </div>
                )}

                {castList.length > 0 && (
                  <div className="max-md:col-span-2 max-md:row-start-7 mt-8 max-w-3xl">
                    <SectionLabel>Cast</SectionLabel>
                    <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {castList.slice(0, 10).map((p, i) => (
                        <motion.div key={p.name} {...appear(i)} className="group w-20 shrink-0 text-center sm:w-24">
                          <div className="relative mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-violet-400/70 via-fuchsia-500/50 to-rose-500/70 p-[2px] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_-6px_rgba(217,70,239,0.55)] sm:h-20 sm:w-20">
                            {p.photo ? (
                              <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <span className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${avatarGradient(p.name)}`}>
                                {initials(p.name)}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-tight text-white">{p.name}</p>
                          {p.character && <p className="mt-0.5 line-clamp-1 text-[11px] text-white/50">{p.character}</p>}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {crew.length > 0 && (
                  <div className="max-md:col-span-2 max-md:row-start-8 mt-6 max-w-3xl">
                    <SectionLabel>Crew</SectionLabel>
                    <div className="flex flex-wrap gap-2.5">
                      {crew.map((c, i) => (
                        <motion.div
                          key={`${c.role}-${c.name}`}
                          {...appear(i)}
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-3 rounded-full bg-white/[0.05] py-1.5 pl-1.5 pr-4 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.09]"
                        >
                          <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarGradient(c.name)}`}>
                            {initials(c.name)}
                          </span>
                          <span className="leading-tight">
                            <span className="block text-sm font-semibold text-white">{c.name}</span>
                            <span className="block text-[11px] text-white/50">{c.role}</span>
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
      )}

      {/* Suggestions failed (TMDB unreachable): say so instead of silently hiding the section */}
      {relatedFailed && related.length === 0 && (
        <section className="mx-4 mt-14 flex flex-wrap items-center gap-3 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16">
          <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-rose-500" />
          <h2 className="font-gilroy text-2xl font-bold">You May Also Like</h2>
          <span className="text-sm text-white/60">Couldn&apos;t load suggestions.</span>
          <button
            type="button"
            onClick={() => setRelatedRetry((n) => n + 1)}
            className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/20"
          >
            Retry
          </button>
        </section>
      )}

      {/* You May Also Like */}
      {related.length > 0 && (
        // Same row as the dashboard: hidden scrollbar, arrow buttons, snap, edge fade
        <MediaRow
          title="You May Also Like"
          trackKey={imdbID}
          frameClassName="mx-4 mt-14 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16"
        >
            {related.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openRelated(m)}
                className="group w-36 shrink-0 snap-start text-left sm:w-40 lg:w-44"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:ring-violet-400/60">
                  <img
                    src={m.poster}
                    alt={m.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {m.rating && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold ring-1 ring-white/15">
                      <span className="text-amber-400">★</span>
                      {m.rating}
                    </span>
                  )}
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-white group-hover:text-violet-300">
                  {m.title}
                </p>
                {m.year && <p className="text-xs text-white/50">{m.year}</p>}
              </button>
            ))}
        </MediaRow>
      )}
    </motion.div>
  );
};

export default memo(PlayMovie);
