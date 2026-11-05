// Turns any sign-in / sign-up failure into one readable sentence for a toast.
// Errors arrive in many shapes: Firebase errors ({ code: "auth/..." }), the thunks'
// rejectWithValue({ error }) where error can be a string, the server's JSON, or Vercel's
// plain-text crash page. Showing the raw object rendered an empty toast.

const FIREBASE = {
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the Google popup. Allow popups for this site and try again.",
  "auth/network-request-failed": "Can't reach Google. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled.",
};

const SERVER_DOWN = "Our server is having trouble right now. Please try again in a minute.";
const OFFLINE = "Can't reach the server. Check your connection and try again.";
const GENERIC = "Something went wrong. Please try again.";

const text = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");

export const authErrorMessage = (err) => {
  if (!err) return GENERIC;
  if (typeof err === "string") return err === "Network Error" ? OFFLINE : err;

  // Firebase (Google popup)
  if (typeof err.code === "string" && err.code.startsWith("auth/")) return FIREBASE[err.code] || GENERIC;

  // rejectWithValue({ error }) from the auth thunks
  const inner = err.error !== undefined ? err.error : err;
  if (typeof inner === "string") {
    if (inner === "Network Error") return OFFLINE;
    // Vercel returns plain text like "A server error has occurred" when the function crashes
    if (/server error|FUNCTION_INVOCATION_FAILED/i.test(inner)) return SERVER_DOWN;
    return inner;
  }

  const status = Number(inner?.code || inner?.status || err?.status) || 0;
  const message = text(inner?.message) || text(inner?.error) || text(err?.message);
  if (message && !/server error has occurred/i.test(message)) return message;
  if (status >= 500 || /server error/i.test(message)) return SERVER_DOWN;
  return GENERIC;
};
