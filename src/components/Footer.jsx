import { Link } from "react-router-dom";
import { useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Logo from "./Brand/Logo";

const EASE = [0.22, 1, 0.36, 1];

// Absolute paths (the old relative "DMCA"/"PrivacyPolicy" links broke on nested pages).
// "Top IMDb" used to be a dead "#" link; it now opens IMDb's official Top 250 chart.
const LINKS = [
  { label: "Home", to: "/dashboard" },
  { label: "TV Shows", to: "/dashboard/tvShows" },
  { label: "Top IMDb", href: "https://www.imdb.com/chart/top/" },
  { label: "My Profile", to: "/dashboard/profile" },
  { label: "DMCA", to: "/dashboard/DMCA" },
  { label: "Privacy Policy", to: "/dashboard/PrivacyPolicy" },
];

// Each element reveals itself when scrolled into view (independent triggers, once).
const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: EASE, delay: i * 0.08 },
});

const pillClass =
  "group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/70 transition-colors duration-300 hover:text-white";

// Glass pill whose border lights up with the brand gradient on hover.
const PillInner = ({ label, external }) => (
  <>
    <span className="absolute inset-0 rounded-full bg-white/[0.04] ring-1 ring-white/10 transition duration-300 group-hover:bg-white/[0.07] group-hover:ring-transparent" />
    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-500 p-px opacity-0 transition-opacity duration-300 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] group-hover:opacity-100" />
    <span className="relative">{label}</span>
    {external && (
      <svg viewBox="0 0 20 20" className="relative h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="currentColor" aria-hidden="true">
        <path d="M7 4a1 1 0 0 0 0 2h5.6l-7.3 7.3a1 1 0 1 0 1.4 1.4L14 7.4V13a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1H7z" />
      </svg>
    )}
  </>
);

// Interactive wordmark: a gradient spotlight follows the cursor, filling the outlined letters
// with colour. Motion values only (no React re-renders on move).
const W = 1200;
const H = 170;
const WORD_PROPS = {
  x: W / 2,
  y: 160,
  textAnchor: "middle",
  fontSize: 190,
  fontWeight: 800,
  fontFamily: "Gilroy, Poppins, sans-serif",
  letterSpacing: -4,
};

const Wordmark = () => {
  const mx = useMotionValue(0.5); // cursor position, 0..1 across the wordmark
  const my = useMotionValue(0.5);
  const glow = useMotionValue(0); // spotlight opacity
  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const spotX = useSpring(useTransform(mx, [0, 1], [0, W]), spring);
  const spotY = useSpring(useTransform(my, [0, 1], [0, H]), spring);
  const spotOpacity = useSpring(glow, { stiffness: 120, damping: 20 });

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  // First time the wordmark scrolls into view: the spotlight sweeps once left → right, then fades.
  // Hovering at any point cancels the sweep and hands control to the cursor.
  const reduceMotion = useReducedMotion();
  const swept = useRef(false);
  const sweep = useRef([]);
  const stopSweep = () => {
    sweep.current.forEach((c) => c.stop());
    sweep.current = [];
  };
  const runSweep = () => {
    if (swept.current || reduceMotion) return;
    swept.current = true;
    mx.jump(0);
    my.jump(0.65);
    sweep.current = [
      animate(mx, 1, { duration: 2, ease: EASE, delay: 0.4 }),
      animate(glow, [0, 1, 1, 0], { duration: 2.4, times: [0, 0.15, 0.8, 1], delay: 0.4 }),
    ];
  };

  const onEnter = () => {
    stopSweep();
    glow.set(1);
  };
  const onLeave = () => {
    glow.set(0);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onViewportEnter={runSweep}
      transition={{ duration: 1, ease: EASE }}
      className="relative mt-10 select-none px-4"
    >
      <motion.div
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="mx-auto w-full max-w-4xl cursor-default"
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="fw-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="fw-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="fw-fade-mask">
              <rect width={W} height={H} fill="url(#fw-fade)" />
            </mask>
            <radialGradient id="fw-spot">
              <stop offset="0%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id="fw-spot-mask">
              <motion.circle cx={spotX} cy={spotY} r="230" fill="url(#fw-spot)" style={{ opacity: spotOpacity }} />
            </mask>
          </defs>

          {/* resting state: faint outline fading downwards */}
          <text {...WORD_PROPS} fill="rgba(167,139,250,0.04)" stroke="url(#fw-stroke)" strokeWidth="1.5" mask="url(#fw-fade-mask)">
            MOVIENEXUS
          </text>
          {/* hover: gradient-filled, brighter-stroked letters revealed under the spotlight */}
          <g mask="url(#fw-spot-mask)">
            <text {...WORD_PROPS} fill="url(#fw-stroke)" fillOpacity="0.35" stroke="url(#fw-stroke)" strokeWidth="2.5">
              MOVIENEXUS
            </text>
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
};

const Footer = () => {
  const year = new Date().getFullYear();
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden bg-[#08040f] text-white">
      {/* top hairline + glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[48rem] max-w-full -translate-x-1/2 rounded-full bg-violet-600/[0.12] blur-3xl" />

      <div className="container relative mx-auto flex flex-col items-center px-4 pt-14 text-center lg:px-6">
        <motion.div {...reveal(0)}>
          <Link to="/dashboard" aria-label="MovieNexus home" className="inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60">
            <Logo />
          </Link>
        </motion.div>

        <motion.p {...reveal(1)} className="mt-4 max-w-md text-sm leading-6 text-white/60">
          Discover trending movies and TV shows, all in one place.
        </motion.p>

        <motion.nav {...reveal(2)} aria-label="Footer" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-2.5">
            {LINKS.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <a href={l.href} target="_blank" rel="noreferrer" className={pillClass}>
                    <PillInner label={l.label} external />
                  </a>
                ) : (
                  <Link to={l.to} className={pillClass}>
                    <PillInner label={l.label} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </motion.nav>

        <motion.p {...reveal(3)} className="mt-8 max-w-2xl text-xs leading-5 text-white/35">
          Disclaimer: MovieNexus does not store any files on its server. All content is provided by
          non-affiliated third parties. For legal issues, please contact the appropriate media file owners
          or host sites.
        </motion.p>
      </div>

      <Wordmark />

      {/* bottom bar */}
      <div className="relative border-t border-white/[0.06]">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-5 text-xs text-white/45 sm:flex-row sm:justify-between lg:px-6">
          {/* left: brand copyright + beating heart */}
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
            <span className="text-white/60">
              © {year}{" "}
              <span className="font-gilroy font-semibold text-white">
                Movie
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Nexus</span>
              </span>
            </span>
            <span className="hidden h-3 w-px bg-white/15 sm:inline-block" />
            <span className="inline-flex items-center gap-1.5">
              Crafted with
              <motion.span
                aria-label="love"
                role="img"
                className="inline-block text-rose-500"
                animate={{ scale: [1, 1.25, 1, 1.18, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
              >
                ♥
              </motion.span>
              for film lovers
            </span>
          </p>

          {/* right: data credits as glowing chips + back to top */}
          <div className="flex items-center gap-3">
            <span className="text-white/40">Powered by</span>
            {[
              { label: "TMDB", href: "https://www.themoviedb.org" },
              { label: "OMDb", href: "https://www.omdbapi.com" },
            ].map((c) => (
              <motion.a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -2 }}
                className="rounded-md bg-white/[0.05] px-2.5 py-1 font-semibold tracking-wide text-white/70 ring-1 ring-white/10 transition-[color,box-shadow,background-color] duration-300 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_16px_rgba(217,70,239,0.35)] hover:ring-fuchsia-400/40"
              >
                {c.label}
              </motion.a>
            ))}
          <motion.button
            type="button"
            onClick={toTop}
            aria-label="Back to top"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-rose-500 text-white shadow-lg shadow-fuchsia-500/25"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M10 4.5a1 1 0 0 1 .7.3l5 5a1 1 0 0 1-1.4 1.4L11 7.9V15a1 1 0 1 1-2 0V7.9l-3.3 3.3a1 1 0 0 1-1.4-1.4l5-5a1 1 0 0 1 .7-.3z" />
            </svg>
          </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
