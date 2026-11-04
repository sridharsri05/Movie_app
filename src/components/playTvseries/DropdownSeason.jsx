import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { tmdbGet } from "../../api/tmdb";
import { MediaRow } from "../Rows/HomeRows";

const TMDB = "https://api.themoviedb.org/3";
const STILL = "https://image.tmdb.org/t/p/w500";
const ease = [0.22, 1, 0.36, 1];
const MAX_PILLS = 8;
const FRAME = "mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 2xl:mx-14 3xl:mx-16";

const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => {
  if (!d) return null;
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const SeasonPicker = ({ seasons, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Many seasons: one styled dropdown instead of a wall of pills.
  if (seasons.length > MAX_PILLS) {
    return (
      <div ref={ref} className="relative inline-block">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-400 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110"
        >
          {value === 0 ? "Specials" : `Season ${value}`}
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.16, ease }}
              className="absolute left-0 top-full z-30 mt-2 max-h-72 w-48 origin-top-left overflow-y-auto rounded-xl bg-[#15101f]/95 p-1.5 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl [scrollbar-width:thin]"
            >
              {seasons.map((s) => {
                const active = s.season_number === value;
                return (
                  <li key={s.season_number} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(s.season_number);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active ? "bg-white/10 font-semibold text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {s.season_number === 0 ? "Specials" : `Season ${s.season_number}`}
                      {active && <span className="h-2 w-2 rounded-full bg-gradient-to-r from-violet-400 to-rose-500" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Seasons">
      {seasons.map((s) => {
        const active = s.season_number === value;
        return (
          <motion.button
            key={s.season_number}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(s.season_number)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold ring-1 transition-colors duration-300 ${
              active ? "text-white ring-transparent" : "bg-white/10 text-white/80 ring-white/15 hover:bg-white/20 hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId="season-pill"
                transition={{ duration: 0.35, ease }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 to-rose-500 shadow-lg shadow-violet-500/25"
              />
            )}
            <span className="relative">{s.season_number === 0 ? "Specials" : `Season ${s.season_number}`}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

const EpisodeSkeleton = () => (
  <div className="w-64 shrink-0 snap-start animate-pulse sm:w-72">
    <div className="aspect-video rounded-xl bg-white/[0.07]" />
    <div className="mt-3 h-4 w-3/4 rounded bg-white/[0.07]" />
    <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.05]" />
    <div className="mt-2 h-3 w-full rounded bg-white/[0.05]" />
  </div>
);

const EpisodeCard = ({ ep, index, current, onOpen, fallbackImg }) => {
  const ref = useRef(null);

  // Bring the playing episode into view inside the row (without scrolling the page).
  useEffect(() => {
    if (!current) return;
    const id = requestAnimationFrame(() => {
      const el = ref.current;
      const track = el?.parentElement;
      if (!el || !track) return;
      track.scrollTo({ left: Math.max(0, el.offsetLeft - (track.clientWidth - el.clientWidth) / 2), behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [current]);

  const date = fmtDate(ep.air_date);
  // Not aired yet (or no air date): TMDB has no still/overview until release, and there is
  // nothing to stream, so show it as "upcoming" and don't navigate to an empty player.
  const upcoming = !ep.air_date || new Date(ep.air_date + "T00:00:00") > new Date();
  const img = ep.still_path ? `${STILL}${ep.still_path}` : fallbackImg;
  const meta = [ep.runtime ? `${ep.runtime}m` : null, date].filter(Boolean).join(" · ");

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => !upcoming && onOpen(ep)}
      disabled={upcoming}
      title={upcoming ? (date ? `Airs ${date}` : "Not aired yet") : undefined}
      aria-current={current ? "true" : undefined}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease, delay: Math.min(index, 8) * 0.04 }}
      whileHover={upcoming ? undefined : { y: -4 }}
      className={`group w-64 shrink-0 snap-start rounded-2xl p-[2px] text-left transition-shadow duration-300 sm:w-72 ${
        current
          ? "bg-gradient-to-br from-violet-400 to-rose-500 shadow-lg shadow-fuchsia-500/25"
          : upcoming
          ? "cursor-default bg-white/[0.06]"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      <span className="block h-full overflow-hidden rounded-[14px] bg-[#120c1d]">
        <span className="relative block aspect-video overflow-hidden bg-gradient-to-br from-[#1a1326] to-[#120c1d]">
          {img ? (
            <img
              src={img}
              alt=""
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition duration-500 ${
                ep.still_path ? "group-hover:scale-105" : "scale-105 opacity-40 blur-[2px] grayscale-[30%]"
              }`}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-gilroy text-4xl font-extrabold text-white/20">
              {pad(ep.episode_number)}
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white ring-1 ring-white/20">
            S{pad(ep.season_number)} · E{pad(ep.episode_number)}
          </span>
          {current && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-lg">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Now playing
            </span>
          )}
          {upcoming && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                </svg>
                {date ? `Airs ${date}` : "Coming soon"}
              </span>
            </span>
          )}
          <span className={`absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ${upcoming ? "hidden" : "group-hover:opacity-100"}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[#0b0614] shadow-xl">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M6 4l14 8-14 8V4z" />
              </svg>
            </span>
          </span>
        </span>
        <span className="block p-3">
          <span className="block truncate text-sm font-semibold text-white">{ep.name}</span>
          {meta && <span className="mt-0.5 block text-xs text-white/60">{meta}</span>}
          {ep.overview ? (
            <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-white/70">{ep.overview}</span>
          ) : upcoming ? (
            <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-white/45">
              Hasn&apos;t aired yet. Details will appear after release.
            </span>
          ) : null}
        </span>
      </span>
    </motion.button>
  );
};

export const DropdownSeason = memo(function DropdownSeason({ tvId, imdbID, season, epi }) {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [episodes, setEpisodes] = useState(null); // null = loading
  const [seasonsFailed, setSeasonsFailed] = useState(false);
  const [epFailed, setEpFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [showBackdrop, setShowBackdrop] = useState(null); // fallback image for episodes without a still

  // Season list for this show (regular seasons; "Specials" only if it's all there is).
  useEffect(() => {
    let c = false;
    setSeasons([]);
    setSelected(null);
    setSeasonsFailed(false);
    tmdbGet(`${TMDB}/tv/${tvId}`)
      .then(({ data }) => {
        if (c) return;
        if (data?.backdrop_path) setShowBackdrop(`${STILL}${data.backdrop_path}`);
        const all = data?.seasons || [];
        const regular = all.filter((s) => s.season_number > 0);
        setSeasons(regular.length ? regular : all);
      })
      .catch(() => !c && setSeasonsFailed(true));
    return () => {
      c = true;
    };
  }, [tvId, retry]);

  // Pick the season: the one being played (route), else keep the user's choice, else the first.
  useEffect(() => {
    if (!seasons.length) return;
    const routeS = Number(season);
    setSelected((prev) => {
      if (seasons.some((s) => s.season_number === routeS)) return routeS;
      if (prev != null && seasons.some((s) => s.season_number === prev)) return prev;
      return seasons[0].season_number;
    });
  }, [seasons, season]);

  useEffect(() => {
    if (selected == null) return;
    let c = false;
    setEpisodes(null);
    setEpFailed(false);
    tmdbGet(`${TMDB}/tv/${tvId}/season/${selected}`)
      .then(({ data }) => !c && setEpisodes(data?.episodes || []))
      .catch(() => !c && setEpFailed(true));
    return () => {
      c = true;
    };
  }, [tvId, selected, retry]);

  if (seasonsFailed) {
    return (
      <section className={`${FRAME} mt-12 flex flex-wrap items-center gap-3`}>
        <span className="h-7 w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-rose-500" />
        <h2 className="font-gilroy text-2xl font-bold">Episodes</h2>
        <span className="text-sm text-white/60">Couldn&apos;t load episodes.</span>
        <button
          type="button"
          onClick={() => setRetry((n) => n + 1)}
          className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/20"
        >
          Retry
        </button>
      </section>
    );
  }
  if (!seasons.length) return null;

  const open = (ep) => navigate(`/dashboard/episodes/${imdbID}/${ep.season_number}/${ep.episode_number}`);

  return (
    <div className="mt-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease }}
        className={FRAME}
      >
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          <span className="h-3.5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-rose-500" />
          Seasons
        </h3>
        <SeasonPicker seasons={seasons} value={selected} onChange={setSelected} />
      </motion.div>

      <MediaRow
        title={selected === 0 ? "Specials" : `Season ${selected ?? ""}`}
        trackKey={`${tvId}-${selected}`}
        frameClassName={`${FRAME} mt-6`}
        right={
          episodes && episodes.length > 0 ? (
            <span className="text-sm text-white/60">
              {episodes.length} episode{episodes.length > 1 ? "s" : ""}
            </span>
          ) : null
        }
      >
        {episodes === null && !epFailed && Array.from({ length: 6 }, (_, i) => <EpisodeSkeleton key={i} />)}
        {epFailed && (
          <div className="flex items-center gap-3 py-6 text-sm text-white/60">
            Couldn&apos;t load episodes.
            <button
              type="button"
              onClick={() => setRetry((n) => n + 1)}
              className="rounded-full bg-white/10 px-4 py-1.5 font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        )}
        {episodes?.length === 0 && <p className="py-6 text-sm text-white/60">No episodes listed for this season yet.</p>}
        {episodes?.map((ep, i) => (
          <EpisodeCard
            key={ep.id}
            ep={ep}
            index={i}
            onOpen={open}
            fallbackImg={showBackdrop}
            current={String(ep.season_number) === String(season) && String(ep.episode_number) === String(epi)}
          />
        ))}
      </MediaRow>
    </div>
  );
});
