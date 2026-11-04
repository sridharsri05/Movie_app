import { useEffect, useMemo, useState } from "react";
import { tmdbGet } from "../../api/tmdb";
import { Link, Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Seo from "../../utils/Seo";
import {
  useLibrary,
  useRemoveFromListMutation,
  useRemoveHistoryItemMutation,
  useClearHistoryMutation,
} from "../../Redux/Services/LibraryApi";

const EASE = [0.22, 1, 0.36, 1];

const TABS = [
  { key: "watchlist", label: "Watchlist" },
  { key: "liked", label: "Liked" },
  { key: "history", label: "History" },
];

const EMPTY_COPY = {
  watchlist: { title: "Your watchlist is empty", text: "Tap \"Add to My List\" on any movie or series to save it here for later." },
  liked: { title: "Nothing liked yet", text: "Hit the thumbs up on titles you love and they will show up here." },
  history: { title: "No watch history", text: "Movies and episodes you open will be tracked here automatically." },
};

const hrefFor = (item) => {
  if (item.type === "tv") {
    return item.season != null && item.episode != null
      ? `/dashboard/episodes/${item.imdbId}/${item.season}/${item.episode}`
      : `/dashboard/tvSeries/${item.imdbId}`;
  }
  return `/dashboard/movie/${item.imdbId}`;
};

const pad = (n) => String(n).padStart(2, "0");

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  if (d < 60) return `${Math.floor(d / 7)}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const groupHistory = (items) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = start.getTime();
  const week = today - 6 * 86400000;
  const groups = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  items.forEach((i) => {
    const t = new Date(i.watchedAt).getTime();
    (t >= today ? groups[0] : t >= week ? groups[1] : groups[2]).items.push(i);
  });
  return groups.filter((g) => g.items.length);
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const TabIcon = ({ k }) => {
  const p = { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (k === "watchlist") return <svg {...p}><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></svg>;
  if (k === "liked") return <svg {...p}><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
};

// ---------- card ----------

// Saved posters come from OMDb, whose image links often go stale. If one fails (or is missing),
// look the title up on TMDB by IMDb id (one cached call) and use its poster instead.
const TMDB_POSTER = "https://image.tmdb.org/t/p/w342";
const findTmdbPoster = async (imdbId) => {
  const { data } = await tmdbGet(`https://api.themoviedb.org/3/find/${imdbId}`, {
    params: { external_source: "imdb_id" },
  });
  const hit = [...(data?.movie_results || []), ...(data?.tv_results || [])].find((r) => r.poster_path);
  return hit ? TMDB_POSTER + hit.poster_path : null;
};

const Card = ({ item, index, isHistory, onRemove }) => {
  const [src, setSrc] = useState(item.poster && item.poster !== "N/A" ? item.poster : null);
  const [triedTmdb, setTriedTmdb] = useState(false);
  const [broken, setBroken] = useState(false);
  const repair = () => {
    if (triedTmdb) return setBroken(true);
    setTriedTmdb(true);
    findTmdbPoster(item.imdbId)
      .then((url) => (url ? setSrc(url) : setBroken(true)))
      .catch(() => setBroken(true));
  };
  // no saved poster at all: try TMDB once on mount
  useEffect(() => {
    if (!item.poster || item.poster === "N/A") repair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.imdbId]);
  const showPoster = src && !broken;
  const episode = isHistory && item.season != null && item.episode != null;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25, ease: EASE } }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 14) * 0.04, layout: { duration: 0.4, ease: EASE } }}
      className="group relative"
    >
      <Link to={hrefFor(item)} className="block focus:outline-none">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.05] ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-violet-400/50 group-focus-within:ring-violet-400/60">
          {showPoster ? (
            <img
              src={src}
              alt={item.title}
              loading="lazy"
              onError={repair}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/25 to-rose-500/25 p-3 text-center font-gilroy text-sm font-semibold text-white/80">
              {item.title || "Untitled"}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
          <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/15 backdrop-blur">
            {item.type === "tv" ? "Series" : "Movie"}
          </span>
          {episode && (
            <span className="absolute bottom-2 right-2 rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              S{pad(item.season)} · E{pad(item.episode)}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-1 font-gilroy text-sm font-semibold text-white">{item.title || "Untitled"}</h3>
        <p className="mt-0.5 text-xs text-white/55">
          {isHistory ? `Watched ${timeAgo(item.watchedAt)}` : item.year || (item.type === "tv" ? "Series" : "Movie")}
        </p>
      </Link>
      <button
        type="button"
        aria-label={`Remove ${item.title || "title"}`}
        onClick={() => onRemove(item)}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-rose-500 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <CloseIcon />
      </button>
    </motion.li>
  );
};

const Grid = ({ items, isHistory, onRemove, offset = 0 }) => (
  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
    <AnimatePresence mode="popLayout" initial>
      {items.map((item, i) => (
        <Card key={item.imdbId} item={item} index={i + offset} isHistory={isHistory} onRemove={onRemove} />
      ))}
    </AnimatePresence>
  </ul>
);

// ---------- states ----------

const Skeletons = () => (
  <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7" aria-busy="true">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.li
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE, delay: i * 0.03 }}
      >
        <div className="aspect-[2/3] animate-pulse rounded-xl bg-white/[0.06] ring-1 ring-white/10" />
        <div className="mt-2 h-3.5 w-3/4 animate-pulse rounded bg-white/[0.08]" />
        <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-white/[0.05]" />
      </motion.li>
    ))}
  </ul>
);

const Panel = ({ title, text, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: EASE }}
    className="mx-auto mt-6 flex max-w-lg flex-col items-center rounded-2xl bg-white/[0.05] px-6 py-14 text-center ring-1 ring-white/10 backdrop-blur"
  >
    <h2 className="font-gilroy text-xl font-semibold text-white">{title}</h2>
    <p className="mt-2 text-sm text-white/55">{text}</p>
    <div className="mt-6 flex gap-3">{children}</div>
  </motion.div>
);

const gradientBtn =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

// ---------- page ----------

function Library() {
  const { tab } = useParams();
  const { watchlist, liked, history, isLoading, isError, refetch } = useLibrary();
  const [removeFromList] = useRemoveFromListMutation();
  const [removeHistoryItem] = useRemoveHistoryItemMutation();
  const [clearHistory] = useClearHistoryMutation();
  const [confirming, setConfirming] = useState(false);

  const lists = { watchlist, liked, history };
  const items = lists[tab];
  const groups = useMemo(() => (tab === "history" ? groupHistory(history) : []), [tab, history]);

  if (!items) return <Navigate to="/dashboard/library/watchlist" replace />;

  const isHistory = tab === "history";
  const onRemove = (item) =>
    isHistory ? removeHistoryItem(item.imdbId) : removeFromList({ list: tab, imdbId: item.imdbId });
  const empty = EMPTY_COPY[tab];

  return (
    <div className="min-h-screen bg-[#0b0614] pb-20 pt-24 text-white">
      <Seo title="My Library" />
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">Saved to your account</p>
            <h1 className="mt-1 bg-gradient-to-r from-violet-400 to-rose-500 bg-clip-text font-gilroy text-3xl font-bold text-transparent sm:text-4xl">
              My Library
            </h1>
          </div>
          <AnimatePresence initial={false}>
            {isHistory && history.length > 0 && (
              <motion.div
                key="clear"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-center gap-2"
              >
                {confirming ? (
                  <>
                    <span className="text-sm text-white/70">Clear all history?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearHistory();
                        setConfirming(false);
                      }}
                      className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                    >
                      Yes, clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="rounded-full bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="rounded-full bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
                  >
                    Clear history
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <motion.nav
          aria-label="Library sections"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.08 }}
          className="mt-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10 backdrop-blur [scrollbar-width:none]"
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                to={`/dashboard/library/${t.key}`}
                onClick={() => setConfirming(false)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  active ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="library-tab-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-rose-500 shadow-lg shadow-violet-900/40"
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <TabIcon k={t.key} />
                  {t.label}
                  <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/25" : "bg-white/10"}`}>
                    {lists[t.key].length}
                  </span>
                </span>
              </Link>
            );
          })}
        </motion.nav>

        <div className="mt-8">
          {isLoading ? (
            <Skeletons />
          ) : isError ? (
            <Panel title="Couldn't load your library" text="Something went wrong while talking to the server.">
              <button type="button" onClick={refetch} className={gradientBtn}>
                Retry
              </button>
            </Panel>
          ) : items.length === 0 ? (
            <Panel key={tab} title={empty.title} text={empty.text}>
              <Link to="/dashboard" className={gradientBtn}>
                Browse trending
              </Link>
            </Panel>
          ) : isHistory ? (
            <div className="space-y-10">
              {groups.map((g) => (
                <motion.section
                  key={g.label}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <h2 className="mb-4 flex items-center gap-3 font-gilroy text-lg font-semibold text-white before:h-5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-violet-400 before:to-rose-500 before:content-['']">
                    {g.label}
                    <span className="text-xs font-medium uppercase tracking-wider text-white/55">{g.items.length}</span>
                  </h2>
                  <Grid items={g.items} isHistory onRemove={onRemove} />
                </motion.section>
              ))}
            </div>
          ) : (
            <Grid key={tab} items={items} isHistory={false} onRemove={onRemove} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Library;
