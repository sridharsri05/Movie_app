import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// Sections of the home page rows (ids are set in Rows/HomeRows.jsx).
export const BROWSE_LINKS = [
  { label: "Top 10 Today", hint: "What everyone's watching", to: "/dashboard#top10", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { label: "Trending", hint: "Hot movies & series today", to: "/dashboard#trending", d: "M3 17l6-6 4 4 8-8M14 7h7v7" },
  { label: "Tamil & Indian", hint: "Trending Tamil, Telugu, Malayalam…", to: "/dashboard#regional", d: "M4 18h16M6 18V9l6-5 6 5v9M10 18v-5h4v5" },
  { label: "Hottest", hint: "Big new releases this month", to: "/dashboard#hottest", d: "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.5 3 2.5 3-1-2.5-1-5 0-8z" },
  { label: "Anime", hint: "Popular Japanese animation", to: "/dashboard#anime", d: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" },
  { label: "K-Drama", hint: "Top Korean dramas", to: "/dashboard#kdrama", d: "M4 6h16v12H4zM8 2l4 4 4-4" },
  { label: "Mature (18+)", hint: "R & NC-17 rated films", to: "/dashboard#mature", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16h.01" },
  { label: "By service", hint: "Netflix, Prime, Disney+…", to: "/dashboard#services", d: "M3 5h18v12H3zM8 21h8M12 17v4" },
];

// "BROWSE ▾": opens on hover (desktop) or click, with an animated panel of home sections.
const BrowseMenu = ({ active }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // small delay on leave so moving the mouse from the button to the panel doesn't close it
  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 py-2 text-[0.8rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ${
          open || active ? "text-white" : "text-gray-400 hover:text-white"
        }`}
      >
        Browse
        <motion.svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} aria-hidden="true">
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
        </motion.svg>
        <span className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full bg-rose-500 transition-all duration-300 ${active ? "w-full" : "w-0"}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute left-1/2 top-full z-50 mt-3 w-[22rem] -translate-x-1/2 origin-top overflow-hidden rounded-2xl bg-[#120c1d]/95 p-2 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-violet-600/25 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-14 -right-10 h-36 w-36 rounded-full bg-rose-600/20 blur-2xl" />
            {BROWSE_LINKS.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE, delay: 0.03 + i * 0.04 }}
                className="relative"
              >
                <Link
                  role="menuitem"
                  to={l.to}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.07]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-rose-500/20 text-violet-200 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={l.d} />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{l.label}</span>
                    <span className="block truncate text-xs text-white/50">{l.hint}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseMenu;
