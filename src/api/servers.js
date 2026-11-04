// Embed hosts for the players, ordered by reliability (first = default).
// Verified 2026-11-04 with curl for tt0468569 (movie) and tt0903747 S1E1 (tv).
// Dropped: vidsrc.xyz / .icu / .in (DNS fails), vidsrc.net (connection reset),
// vidsrc.cc (timeout), vidsrc.me (just redirects to vidsrc.sh).
export const SERVERS = [
  {
    id: "sh",
    name: "Server 1",
    host: "vidsrc.sh",
    movie: (id) => `https://vidsrc.sh/embed/movie?imdb=${id}`,
    tv: (id, s, e) => `https://vidsrc.sh/embed/tv?imdb=${id}&season=${s}&episode=${e}`,
  },
  {
    id: "to",
    name: "Server 2",
    host: "vidsrc.to",
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    // Verified 2026-11-04: 200 for real titles (movie + tv), proper 404 for fake ids.
    // Note: it wraps vidsrc.sh in its own page (plus an ad script), so it's an alternate
    // route to the same player rather than an independent source.
    id: "mov",
    name: "Server 3",
    host: "vidsrc.mov",
    movie: (id) => `https://vidsrc.mov/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.mov/embed/tv/${id}/${s}/${e}`,
  },
];

export const DEFAULT_SERVER = SERVERS[0];
