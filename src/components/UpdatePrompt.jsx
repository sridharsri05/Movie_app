/* global __APP_VERSION__ */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Tabs left open across a deploy keep running the old bundle. Each build publishes its ID in
// /version.json (see vite.config.js); when the deployed ID stops matching the one baked into this
// bundle, offer a refresh. Fresh visitors already match, so they never see the prompt.
const CURRENT = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : null;
const CHECK_EVERY_MS = 5 * 60 * 1000;
const RELOAD_GUARD_KEY = "mn:chunk-reload-at";

async function fetchDeployedVersion() {
  const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data?.version === "string" ? data.version : null;
}

export default function UpdatePrompt() {
  const [available, setAvailable] = useState(null); // deployed version newer than ours
  const dismissedRef = useRef(null);

  useEffect(() => {
    // No version.json exists under the dev server.
    if (import.meta.env.DEV || !CURRENT) return;

    let stopped = false;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const deployed = await fetchDeployedVersion();
        if (!stopped && deployed && deployed !== CURRENT && deployed !== dismissedRef.current) {
          setAvailable(deployed);
        }
      } catch {
        // Offline or a flaky network: try again on the next tick.
      }
    };

    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", check);

    // After a deploy, an old tab can fail to load a lazy route chunk that no longer exists.
    // Reload once to pick up the new build; if that just happened, show the prompt instead of looping.
    const onPreloadError = (event) => {
      event.preventDefault();
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY)) || 0;
      } catch {
        /* storage blocked */
      }
      if (Date.now() - last > 15000) {
        try {
          sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
        } catch {
          /* storage blocked */
        }
        window.location.reload();
      } else {
        setAvailable("chunk-error");
      }
    };
    window.addEventListener("vite:preloadError", onPreloadError);

    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", check);
      window.removeEventListener("vite:preloadError", onPreloadError);
    };
  }, []);

  const dismiss = () => {
    dismissedRef.current = available;
    setAvailable(null);
  };

  return (
    <AnimatePresence>
      {available && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-[#15101f]/95 p-3 pl-4 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-xl sm:bottom-6"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-400 to-rose-500" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-white">New update available</span>
            <span className="block text-xs text-white/60">Refresh to get the latest version of MovieNexus.</span>
          </span>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:text-white"
          >
            Later
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-rose-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-110"
          >
            Refresh
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
