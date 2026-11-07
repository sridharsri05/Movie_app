import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLibrary, useRemoveHistoryItemMutation } from "../../Redux/Services/LibraryApi";
import { tmdbGet } from "../../api/tmdb";
import { Apis } from "../../api/api";

const TMDB = `${Apis.baseURL}/tmdb`;
const img = (size, path) => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);

// ---------- data ----------

const normalize = (r, fallbackType) => ({
  id: r.id,
  media_type: r.media_type || fallbackType,
  title: r.title || r.name,
  year: (r.release_date || r.first_air_date || "").slice(0, 4),
  rating: r.vote_average,
  poster: r.poster_path,
  backdrop: r.backdrop_path,
  popularity: r.popularity || 0,
});

// One cached TMDB list request; only runs once `enabled` (i.e. the row is near the viewport).
const useTmdbList = (path, params, { enabled = true, type, limit = 20, needs = "poster" } = {}) => {
  const [items, setItems] = useState(null);
  const paramsKey = JSON.stringify(params || {});
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setItems(null);
    tmdbGet(`${TMDB}/${path}`, { params: JSON.parse(paramsKey) })
      .then(({ data }) => {
        if (!alive) return;
        const key = needs === "backdrop" ? "backdrop_path" : "poster_path";
        setItems(
          data.results
            .filter((r) => (r.media_type || type) !== "person" && r[key])
            .slice(0, limit)
            .map((r) => normalize(r, type))
        );
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [enabled, path, paramsKey, type, limit, needs]);
  return items;
};

// Load a row only when it scrolls within `rootMargin` of the viewport.
const useInView = (rootMargin = "400px") => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (inView || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView, rootMargin]);
  return [ref, inView];
};

// Our routes are keyed by IMDb id; TMDB lists aren't, so look it up only for the clicked title.
export const useOpenTitle = () => {
  const navigate = useNavigate();
  return useCallback(
    async (item) => {
      try {
        const { data } = await tmdbGet(`${TMDB}/${item.media_type}/${item.id}/external_ids`);
        if (data.imdb_id) {
          navigate(`/dashboard/${item.media_type === "tv" ? "tvSeries" : "movie"}/${data.imdb_id}`);
        }
      } catch (error) {
        console.error("Could not open title:", error);
      }
    },
    [navigate]
  );
};

// ---------- building blocks ----------

const ArrowButton = ({ dir, disabled, onClick }) => (
  <button
    type="button"
    aria-label={dir < 0 ? "Scroll left" : "Scroll right"}
    disabled={disabled}
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-white/5"
  >
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${dir < 0 ? "rotate-180" : ""}`} fill="currentColor" aria-hidden="true">
      <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4z" />
    </svg>
  </button>
);

const Tabs = ({ options, value, onChange }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`relative py-1 text-sm font-semibold transition-colors ${
          value === o.value ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        {o.label}
        <span
          className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-rose-500 transition-opacity ${
            value === o.value ? "opacity-100" : "opacity-0"
          }`}
        />
      </button>
    ))}
  </div>
);

// Section with a heading, optional controls, and a horizontally scrolling track with arrows
// (no visible scrollbar). Exported so other pages' rows behave the same; `frameClassName`
// overrides the outer spacing for pages that don't use the centred container.
export const MediaRow = ({
  title,
  right,
  children,
  sectionRef,
  trackKey,
  id,
  frameClassName = "container mx-auto px-4 lg:px-6 pt-10",
}) => {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    if (track.current) track.current.scrollLeft = 0;
    update();
  }, [update, trackKey]);

  // Re-check the arrows whenever the row's contents or size change. Rows mount with a few skeletons
  // that fit on screen; without this, "next" stayed disabled after the real titles loaded until the
  // user scrolled the row by hand.
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener("resize", update);
    return () => {
      mo.disconnect();
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section ref={sectionRef} id={id} className={`scroll-mt-24 ${frameClassName}`}>
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <h2 className="flex items-center gap-3 font-gilroy text-xl font-semibold text-white lg:text-2xl before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-violet-400 before:to-rose-500 before:content-['']">
          {title}
        </h2>
        <div className="ml-auto flex items-center gap-4">
          {right}
          <div className="hidden items-center gap-2 sm:flex">
            <ArrowButton dir={-1} disabled={edges.start} onClick={() => scroll(-1)} />
            <ArrowButton dir={1} disabled={edges.end} onClick={() => scroll(1)} />
          </div>
        </div>
      </div>
      <div className="relative">
        <div
          ref={track}
          onScroll={update}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b0614] to-transparent transition-opacity ${
            edges.end ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    </section>
  );
};

const Meta = ({ item }) => (
  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
    {item.rating > 0 && <span className="text-amber-300">★ {item.rating.toFixed(1)}</span>}
    {item.rating > 0 && item.year && <span className="h-0.5 w-0.5 rounded-full bg-gray-500" />}
    {item.year}
    <span className="h-0.5 w-0.5 rounded-full bg-gray-500" />
    {item.media_type === "tv" ? "Series" : "Movie"}
  </p>
);

const PlayOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
    <span className="flex h-11 w-11 scale-90 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-300 group-hover:scale-100">
      <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
      </svg>
    </span>
  </div>
);

const tileFrame =
  "relative overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-1 group-hover:ring-white/25 group-hover:shadow-[0_12px_30px_-10px_rgba(168,85,247,0.45)]";

const PosterTile = ({ item, onOpen }) => (
  <button type="button" onClick={() => onOpen(item)} className="group w-36 shrink-0 snap-start text-left sm:w-40 lg:w-44 2xl:w-48">
    <div className={`${tileFrame} aspect-[2/3]`}>
      <img src={img("w342", item.poster)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <PlayOverlay />
    </div>
    <p className="mt-2.5 truncate font-gilroy text-sm font-semibold text-gray-100">{item.title}</p>
    <Meta item={item} />
  </button>
);

// Netflix-style ranking: a big outlined number (in the brand gradient) with the poster overlapping it.
const RankTile = ({ item, rank, onOpen }) => (
  <button type="button" onClick={() => onOpen(item)} className="group flex shrink-0 snap-start items-end text-left">
    <svg viewBox={rank === 10 ? "0 0 150 150" : "0 0 90 150"} className={`h-40 sm:h-44 lg:h-52 shrink-0 ${rank === 10 ? "w-[6.5rem] sm:w-28 lg:w-[8.5rem]" : "w-[4rem] sm:w-[4.5rem] lg:w-20"}`} aria-hidden="true">
      <defs>
        <linearGradient id="rank-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <text x="100%" y="146" textAnchor="end" fontSize="150" fontWeight="800" fontFamily="Gilroy, Poppins, sans-serif" fill="#0b0614" stroke="url(#rank-stroke)" strokeWidth="3" letterSpacing="-8">
        {rank}
      </text>
    </svg>
    <div className="-ml-4 w-28 sm:w-32 lg:w-36">
      <div className={`${tileFrame} aspect-[2/3]`}>
        <img src={img("w342", item.poster)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <PlayOverlay />
      </div>
    </div>
  </button>
);

const BackdropTile = ({ item, onOpen }) => (
  <button type="button" onClick={() => onOpen(item)} className="group w-72 shrink-0 snap-start text-left sm:w-80 lg:w-96">
    <div className={`${tileFrame} aspect-video`}>
      <img src={img("w780", item.backdrop)} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <PlayOverlay />
    </div>
    <p className="mt-2.5 truncate font-gilroy text-sm font-semibold text-gray-100">{item.title}</p>
    <Meta item={item} />
  </button>
);

const Skeletons = ({ kind = "poster", count = 7 }) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className={`shrink-0 ${kind === "backdrop" ? "w-72 sm:w-80 lg:w-96" : "w-36 sm:w-40 lg:w-44 2xl:w-48"}`}>
      <div className={`animate-pulse rounded-xl bg-white/[0.06] ${kind === "backdrop" ? "aspect-video" : "aspect-[2/3]"}`} />
      <div className="mt-2.5 h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
    </div>
  ));

// ---------- rows ----------

// Follows the platform picked in "Browse by service" (movies + series on it, ranked by TMDB's daily
// popularity); "Everywhere" switches back to the global trending Top 10.
const Top10Row = ({ onOpen, tvOnly = false, service }) => {
  const [ref, inView] = useInView();
  const [scope, setScope] = useState("service");
  useEffect(() => setScope("service"), [service?.id]); // picking a platform jumps back to it
  const byService = scope === "service" && Boolean(service);

  const params = service ? providerParams(service) : null;
  const global = useTmdbList(tvOnly ? "trending/tv/day" : "trending/all/day", null, {
    enabled: inView && !byService,
    limit: 10,
    type: tvOnly ? "tv" : undefined,
  });
  const serviceTv = useTmdbList("discover/tv", params, { enabled: inView && byService, type: "tv" });
  const serviceMovies = useTmdbList("discover/movie", params, {
    enabled: inView && byService && !tvOnly,
    type: "movie",
  });

  let items = global;
  if (byService) {
    items =
      serviceTv && (tvOnly || serviceMovies)
        ? [...serviceTv, ...(tvOnly ? [] : serviceMovies)].sort((a, b) => b.popularity - a.popularity).slice(0, 10)
        : null;
  }

  const what = tvOnly ? "TV Shows" : "";
  const title = byService ? `Top 10 ${what} on ${service.name} Today`.replace(/\s+/g, " ") : tvOnly ? "Top 10 TV Shows Today" : "Top 10 Today";

  return (
    <MediaRow
      id="top10"
      title={title}
      sectionRef={ref}
      trackKey={`${scope}-${service?.id}`}
      right={
        service ? (
          <Tabs
            value={scope}
            onChange={setScope}
            options={[
              { value: "service", label: service.name },
              { value: "all", label: "Everywhere" },
            ]}
          />
        ) : null
      }
    >
      {items ? (
        items.map((item, i) => <RankTile key={`${item.media_type}-${item.id}`} item={item} rank={i + 1} onOpen={onOpen} />)
      ) : (
        <Skeletons count={6} />
      )}
    </MediaRow>
  );
};

const TrendingRow = ({ onOpen }) => {
  const [ref, inView] = useInView();
  const [type, setType] = useState("movie");
  const items = useTmdbList(`trending/${type}/day`, null, { enabled: inView, type, needs: "backdrop" });
  return (
    <MediaRow
      id="trending"
      title="Trending Today"
      sectionRef={ref}
      trackKey={type}
      right={<Tabs value={type} onChange={setType} options={[{ value: "movie", label: "Movies" }, { value: "tv", label: "Series" }]} />}
    >
      {items ? items.map((item) => <BackdropTile key={item.id} item={item} onOpen={onOpen} />) : <Skeletons kind="backdrop" count={4} />}
    </MediaRow>
  );
};

// Regional cinema, styled like "Trending Today". Popular titles from the last two years in the chosen
// language (Tamil by default); on the TV Shows page it lists series instead.
const REGIONAL = [
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "ml", label: "Malayalam" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
];

const RegionalRow = ({ onOpen, tvOnly = false }) => {
  const [ref, inView] = useInView();
  const [lang, setLang] = useState("ta");
  const type = tvOnly ? "tv" : "movie";
  const since = daysAgo(730);
  const items = useTmdbList(
    `discover/${type}`,
    {
      with_original_language: lang,
      sort_by: "popularity.desc",
      [tvOnly ? "first_air_date.gte" : "primary_release_date.gte"]: since,
      "vote_count.gte": 3,
    },
    { enabled: inView, type, needs: "backdrop" }
  );
  const label = REGIONAL.find((l) => l.value === lang)?.label;
  return (
    <MediaRow
      id="regional"
      title={`Trending ${label} ${tvOnly ? "Series" : "Movies"}`}
      sectionRef={ref}
      trackKey={lang}
      right={<Tabs value={lang} onChange={setLang} options={REGIONAL} />}
    >
      {items ? (
        items.length ? (
          items.map((item) => <BackdropTile key={item.id} item={item} onOpen={onOpen} />)
        ) : (
          <p className="py-10 text-sm text-gray-400">Nothing trending in {label} right now.</p>
        )
      ) : (
        <Skeletons kind="backdrop" count={4} />
      )}
    </MediaRow>
  );
};

const DiscoverRow = ({ id, title, params, onOpen, type = "tv" }) => {
  const [ref, inView] = useInView();
  const items = useTmdbList(`discover/${type}`, params, { enabled: inView, type });
  return (
    <MediaRow id={id} title={title} sectionRef={ref}>
      {items ? items.map((item) => <PosterTile key={item.id} item={item} onOpen={onOpen} />) : <Skeletons />}
    </MediaRow>
  );
};

// TMDB watch-provider ids. `region` is the catalogue to browse: the Indian services are only
// listed for IN on TMDB, the rest use the US catalogue.
const SERVICES = [
  { id: 8, name: "Netflix", region: "US" },
  { id: 9, name: "Prime Video", region: "US" },
  { id: 2336, name: "JioHotstar", region: "IN" },
  { id: 337, name: "Disney+", region: "US" },
  { id: 1899, name: "Max", region: "US" },
  { id: 350, name: "Apple TV+", region: "US" },
  { id: 232, name: "Zee5", region: "IN" },
  { id: 237, name: "Sony LIV", region: "IN" },
  { id: 309, name: "Sun NXT", region: "IN" },
  { id: 532, name: "aha", region: "IN" },
  { id: 315, name: "Hoichoi", region: "IN" },
  { id: 515, name: "MX Player", region: "IN" },
  { id: 15, name: "Hulu", region: "US" },
  { id: 2303, name: "Paramount+", region: "US" },
  { id: 386, name: "Peacock", region: "US" },
  { id: 283, name: "Crunchyroll", region: "US" },
];
const SERVICE_REGIONS = [...new Set(SERVICES.map((s) => s.region))];
const providerParams = (service) => ({
  with_watch_providers: service.id,
  watch_region: service.region,
  sort_by: "popularity.desc",
});

const ServiceRow = ({ onOpen, service, setService }) => {
  const [ref, inView] = useInView();
  const [type, setType] = useState("tv");
  const [logos, setLogos] = useState({});

  useEffect(() => {
    if (!inView) return;
    // Logos come from each region's provider list (JioHotstar etc. only appear in IN's).
    Promise.all(
      SERVICE_REGIONS.map((region) =>
        tmdbGet(`${TMDB}/watch/providers/tv`, { params: { watch_region: region } })
          .then(({ data }) => data.results.map((p) => [p.provider_id, p.logo_path]))
          .catch(() => [])
      )
    ).then((lists) => setLogos(Object.fromEntries(lists.flat())));
  }, [inView]);

  const items = useTmdbList(`discover/${type}`, providerParams(service), { enabled: inView, type });

  return (
    <div ref={ref} id="services" className="scroll-mt-24">
      <section className="container mx-auto px-4 lg:px-6 pt-10">
        <h2 className="mb-4 flex items-center gap-3 font-gilroy text-xl font-semibold text-white lg:text-2xl before:h-6 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-violet-400 before:to-rose-500 before:content-['']">
          Browse by service
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SERVICES.map((s) => {
            const active = s.id === service.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setService(s)}
                className={`group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24 ${active ? "" : "opacity-70 hover:opacity-100"}`}
              >
                <span
                  className={`block rounded-2xl p-[2px] transition ${
                    active ? "bg-gradient-to-br from-violet-400 to-rose-500 shadow-[0_0_18px_rgba(217,70,239,0.45)]" : "bg-white/10"
                  }`}
                >
                  {logos[s.id] ? (
                    <img src={img("w154", logos[s.id])} alt={s.name} loading="lazy" className="h-16 w-16 rounded-[14px] object-cover sm:h-20 sm:w-20" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-[#15101f] text-xs font-bold text-gray-300 sm:h-20 sm:w-20">
                      {s.name}
                    </span>
                  )}
                </span>
                <span className={`text-xs font-medium ${active ? "text-white" : "text-gray-400"}`}>{s.name}</span>
              </button>
            );
          })}
        </div>
      </section>
      <MediaRow
        title={`Popular on ${service.name}`}
        trackKey={`${service.id}-${type}`}
        right={<Tabs value={type} onChange={setType} options={[{ value: "tv", label: "Series" }, { value: "movie", label: "Movies" }]} />}
      >
        {items ? items.map((item) => <PosterTile key={item.id} item={item} onOpen={onOpen} />) : <Skeletons />}
      </MediaRow>
    </div>
  );
};

// Browse rows. variant="home" (movies dashboard) or "tv" (TV Shows page: TV-only Top 10, no
// movie/series Trending row). Each row fetches its list (one cached TMDB call) only when scrolled near.
// ---------- continue watching (from the account's watch history) ----------

const timeAgo = (when) => {
  const s = Math.max(0, (Date.now() - new Date(when).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d ago`;
  return new Date(when).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const pad2 = (n) => String(n).padStart(2, "0");
const resumeHref = (h) =>
  h.type === "tv"
    ? h.season != null && h.episode != null
      ? `/dashboard/episodes/${h.imdbId}/${h.season}/${h.episode}`
      : `/dashboard/tvSeries/${h.imdbId}`
    : `/dashboard/movie/${h.imdbId}`;

const ContinueCard = ({ item, index }) => {
  // History stores an OMDb poster; prefer a wide TMDB backdrop (one cached lookup per title).
  const [art, setArt] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    tmdbGet(`${TMDB}/find/${item.imdbId}`, { params: { external_source: "imdb_id" } })
      .then(({ data }) => {
        const hit = [...(data?.movie_results || []), ...(data?.tv_results || [])][0];
        if (alive && hit) setArt(img("w780", hit.backdrop_path) || img("w342", hit.poster_path));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [item.imdbId]);
  const src = art || (item.poster && item.poster !== "N/A" ? item.poster : null);
  const episode = item.type === "tv" && item.season != null && item.episode != null;
  const [removeHistoryItem, { isLoading: removing }] = useRemoveHistoryItemMutation();

  return (
    <div
      className="group relative w-64 shrink-0 snap-start sm:w-72 lg:w-80"
      style={{ animation: `fadeUp .5s ${Math.min(index, 8) * 0.05}s both cubic-bezier(.22,1,.36,1)` }}
    >
    {/* Sibling of the link (a button can't live inside <a>); shown on hover, always on touch screens. */}
    <button
      type="button"
      onClick={() => removeHistoryItem(item.imdbId)}
      disabled={removing}
      aria-label={`Remove ${item.title} from Continue watching`}
      title="Remove from history"
      className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/80 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-rose-500/80 hover:text-white focus-visible:opacity-100 disabled:opacity-50 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
    <Link to={resumeHref(item)} className="block">
      <div className={`${tileFrame} aspect-video`}>
        {src && !failed ? (
          <img src={src} alt={item.title} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${art ? "" : "object-top"}`} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/50 to-rose-900/40 p-3 text-center font-gilroy font-semibold text-white/80">{item.title}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        {episode && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm">
            S{pad2(item.season)} · E{pad2(item.episode)}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-gilroy text-sm font-semibold text-white">{item.title}</p>
            <p className="text-[11px] text-white/60">Watched {timeAgo(item.watchedAt)}</p>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-lg shadow-fuchsia-500/30 transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
    </div>
  );
};

// Shown only to signed-in users with history; hidden while loading or on error.
const ContinueRow = ({ tvOnly }) => {
  const { history, isLoading, isError } = useLibrary();
  const items = (history || []).filter((h) => !tvOnly || h.type === "tv").slice(0, 12);
  if (isLoading || isError || !items.length) return null;
  return (
    <MediaRow
      id="continue"
      title="Continue watching"
      right={
        <Link to="/dashboard/library/history" className="text-sm font-semibold text-gray-400 transition-colors hover:text-white">
          See all
        </Link>
      }
    >
      {items.map((item, i) => (
        <ContinueCard key={`${item.imdbId}-${item.season ?? ""}-${item.episode ?? ""}`} item={item} index={i} />
      ))}
    </MediaRow>
  );
};

// YYYY-MM-DD for `days` ago. Day granularity keeps the request (and the proxy's cache key) stable all day.
const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

// Popular titles released in the last 60 days; unlike "Trending", old titles can't show up here.
const hottestParams = (tv) =>
  tv
    ? { "first_air_date.gte": daysAgo(60), sort_by: "popularity.desc", "vote_count.gte": 10 }
    : { "primary_release_date.gte": daysAgo(60), sort_by: "popularity.desc", "vote_count.gte": 20 };

// Mainstream R / NC-17 films (US ratings). include_adult stays false: TMDB's "adult" flag means porn.
const MATURE_PARAMS = {
  certification_country: "US",
  "certification.gte": "R",
  include_adult: "false",
  sort_by: "popularity.desc",
  "vote_count.gte": 200,
};

const HomeRows = ({ variant = "home" }) => {
  const onOpen = useOpenTitle();
  const tv = variant === "tv";
  // Shared by "Browse by service" and Top 10, so the Top 10 follows the selected platform.
  const [service, setService] = useState(SERVICES[0]);
  // Navbar "Browse" links use /dashboard#anime etc.: scroll smoothly to that row.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => clearTimeout(t);
  }, [hash]);
  return (
    <div className="bg-[#0b0614]">
      <ContinueRow tvOnly={tv} />
      <ServiceRow onOpen={onOpen} service={service} setService={setService} />
      <Top10Row onOpen={onOpen} tvOnly={tv} service={service} />
      {!tv && <TrendingRow onOpen={onOpen} />}
      <RegionalRow onOpen={onOpen} tvOnly={tv} />
      <DiscoverRow
        id="hottest"
        title="Hottest Right Now"
        type={tv ? "tv" : "movie"}
        onOpen={onOpen}
        params={hottestParams(tv)}
      />
      <DiscoverRow
        id="anime"
        title="Anime"
        onOpen={onOpen}
        params={{ with_genres: 16, with_original_language: "ja", sort_by: "popularity.desc" }}
      />
      <DiscoverRow
        id="kdrama"
        title="K-Drama"
        onOpen={onOpen}
        params={{ with_genres: 18, with_original_language: "ko", sort_by: "popularity.desc" }}
      />
      {!tv && <DiscoverRow id="mature" title="Mature (18+)" type="movie" onOpen={onOpen} params={MATURE_PARAMS} />}
    </div>
  );
};

export default HomeRows;
