// Light deterrents against casual copying. These are NOT real protection: browsers can't block OS
// screenshots (Snipping Tool, phone buttons) and DevTools stay reachable from the browser menu.
// They only stop the one-click paths (right-click > Inspect / Save image, F12, Ctrl+U, Ctrl+S, print).
// Disabled in development so local debugging is unaffected.

const isEditable = (el) =>
  el instanceof Element &&
  (el.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']") !== null);

function blockedShortcut(e) {
  const key = e.key?.toLowerCase();
  const mod = e.ctrlKey || e.metaKey;
  if (key === "f12") return true;
  // Ctrl+Shift+I/J/C (Windows/Linux) and Cmd+Opt+I/J/C (macOS): DevTools panels
  if (mod && (e.shiftKey || e.altKey) && ["i", "j", "c"].includes(key)) return true;
  // View source, save page, print
  if (mod && !e.shiftKey && ["u", "s", "p"].includes(key)) return true;
  return false;
}

export function enableContentProtection() {
  if (import.meta.env.DEV || typeof window === "undefined") return;

  // Right-click menu (keeps it in form fields so paste/spellcheck still work).
  document.addEventListener("contextmenu", (e) => {
    if (!isEditable(e.target)) e.preventDefault();
  });

  document.addEventListener(
    "keydown",
    (e) => {
      if (blockedShortcut(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  // Print Screen: briefly blur the page and, where the browser allows it, overwrite the captured
  // image on the clipboard. Snipping tools and phone screenshots are unaffected.
  document.addEventListener("keyup", (e) => {
    if (e.key !== "PrintScreen") return;
    document.documentElement.classList.add("mn-shield");
    setTimeout(() => document.documentElement.classList.remove("mn-shield"), 1200);
    navigator.clipboard?.writeText?.("").catch(() => {});
  });

  // Don't let posters be dragged out to the desktop.
  document.addEventListener("dragstart", (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });
}
