import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const Avatar = ({ user, size = "h-10 w-10", text = "text-sm" }) =>
  user?.profilePicture ? (
    <img src={user.profilePicture} alt="" className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} ${text} flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-rose-500 font-bold text-white`}>
      {(user?.username || "?").charAt(0).toUpperCase()}
    </span>
  );

// Avatar button + dropdown. Opens on click (hover-only menus don't work on touch), closes on
// outside click, Esc, or navigation.
const ProfileMenu = ({ user, role, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
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

  const items = [
    { label: "My Profile", to: "/dashboard/profile", d: "M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" },
    { label: "Watchlist", to: "/dashboard/library/watchlist", d: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" },
    { label: "Liked", to: "/dashboard/library/liked", d: "M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7a2 2 0 0 1-2 1.7H7V10l4-8a3 3 0 0 1 3 3.9z" },
    { label: "Watch history", to: "/dashboard/library/history", d: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" },
    role === "admin" && { label: "Admin dashboard", to: "/admindashboard", d: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  ].filter(Boolean);

  return (
    <div ref={ref} className="relative hidden lg:block">
      <motion.button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`rounded-full p-[2px] transition-shadow duration-300 ${
          open
            ? "bg-gradient-to-br from-violet-400 to-rose-500 shadow-[0_0_18px_rgba(217,70,239,0.45)]"
            : "bg-gradient-to-br from-violet-400/70 to-rose-500/70 hover:shadow-[0_0_14px_rgba(217,70,239,0.35)]"
        }`}
      >
        <span className="block rounded-full bg-[#0b0614] p-[2px]">
          <Avatar user={user} />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 top-full z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl bg-[#120c1d]/95 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-violet-600/25 blur-2xl" />
            <div className="relative flex items-center gap-3 border-b border-white/[0.08] p-4">
              <Avatar user={user} size="h-11 w-11" text="text-base" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.username || "Guest"}</p>
                {user?.email && <p className="truncate text-xs text-white/50">{user.email}</p>}
                {role === "admin" && (
                  <span className="mt-1 inline-block rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-2 py-px text-[10px] font-bold uppercase tracking-wider text-white">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="relative p-1.5">
              {items.map((it, i) => (
                <motion.div
                  key={it.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: EASE, delay: 0.04 + i * 0.04 }}
                >
                  <Link
                    role="menuitem"
                    to={it.to}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/60 ring-1 ring-white/10 transition-colors group-hover:text-violet-200">
                      <Icon d={it.d} />
                    </span>
                    {it.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="relative border-t border-white/[0.08] p-1.5">
              <button
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 ring-1 ring-rose-400/20">
                  <Icon d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </span>
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileMenu;
