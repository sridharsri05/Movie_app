// MovieNexus brand: a low-poly faceted "M" (vector redraw of the original MovieHub.png icon),
// followed by the wordmark. Each facet is a triangle with its own colour; a soft highlight on top
// gives it depth. public/favicon.svg is generated from the same FACETS; keep them in sync.
const M_OUTLINE = "M4 6H13L20 17 27 6H36V34H27V20L20 31 13 20V34H4Z";

const FACETS = [
  // left leg: cyan -> teal -> green/lime
  ["4,6 13,6 4,18", "#4fd6e8"],
  ["13,6 13,20 4,18", "#33a8e3"],
  ["4,18 13,20 4,26", "#2fbba3"],
  ["4,26 13,20 13,34", "#3cb46b"],
  ["4,26 13,34 4,34", "#a8d83c"],
  // left diagonal: blues
  ["13,6 20,17 13,20", "#3b8fe8"],
  ["13,20 20,17 20,31", "#3a5fd4"],
  // right diagonal: violets
  ["20,17 27,6 27,20", "#7b4fd8"],
  ["20,17 27,20 20,31", "#5b42c8"],
  // right leg: purple -> magenta -> pink -> red
  ["27,6 36,6 36,15", "#ad6fdd"],
  ["27,6 36,15 27,20", "#8d4ccf"],
  ["27,20 36,15 36,24", "#c23db4"],
  ["27,20 36,24 27,34", "#e2368b"],
  ["27,34 36,24 36,34", "#e5273f"],
];

const LogoMark = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="mn-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity=".28" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    {FACETS.map(([points, color]) => (
      // Stroke in the same colour closes hairline gaps between neighbouring facets.
      <polygon key={points} points={points} fill={color} stroke={color} strokeWidth=".35" strokeLinejoin="round" />
    ))}
    <path d={M_OUTLINE} fill="url(#mn-shine)" />
  </svg>
);

const Logo = ({ compact = false }) => (
  <span className="group inline-flex items-center gap-2.5 select-none">
    <span className="transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(139,92,246,0.55)]">
      <LogoMark className={compact ? "h-8 w-8" : "h-9 w-9 lg:h-10 lg:w-10"} />
    </span>
    <span
      className={`font-gilroy font-bold tracking-tight text-white leading-none ${
        compact ? "text-xl" : "text-xl lg:text-2xl"
      }`}
    >
      Movie
      <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
        Nexus
      </span>
    </span>
  </span>
);

export default Logo;
