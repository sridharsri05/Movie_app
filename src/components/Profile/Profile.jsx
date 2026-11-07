import { useState, useEffect, useRef } from "react";
import {
  deleteUserAccount,
  logout,
  selectAuth,
  updateProfile,
} from "../../Redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { libraryApi } from "../../Redux/Services/LibraryApi";
import { getFirebase } from "../firebase/Firebase";

import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";


const EASE = [0.22, 1, 0.36, 1];

// Avatars render at most ~130px, so a 512px JPEG is plenty and keeps every upload far under the
// bucket's 2 MB limit (phone photos are typically 3-6 MB).
const AVATAR_MAX_PX = 512;

async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    const scale = Math.min(1, AVATAR_MAX_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("encode");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const uploadErrorMessage = (error) => {
  switch (error?.code) {
    case "storage/unauthorized":
      return "Upload not allowed";
    case "storage/retry-limit-exceeded":
    case "storage/network-request-failed":
      return "Network error. Try again";
    case "storage/quota-exceeded":
      return "Storage is full. Try later";
    default:
      return "Upload failed. Try again";
  }
};
// each section fades up on its own (no parent-variant propagation)
const rise = (i = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE, delay: 0.05 + i * 0.07 },
});
const pop = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 },
};
const inputClass =
  "w-full rounded-xl bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/30 ring-1 ring-white/10 outline-none transition focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-400/60";

const Svg = ({ d }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const CameraIcon = () => <Svg d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;

const Field = ({ label, htmlFor, hint, wide, children }) => (
  <div className={wide ? "sm:col-span-2" : ""}>
    <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>}
  </div>
);

// Library pages (built at /dashboard/library/:tab)
const LIBRARY = [
  { label: "Watchlist", hint: "Saved to watch later", to: "/dashboard/library/watchlist", d: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" },
  { label: "Liked", hint: "Titles you gave a thumbs up", to: "/dashboard/library/liked", d: "M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 2 2.3l-1.4 7a2 2 0 0 1-2 1.7H7V10l4-8a3 3 0 0 1 3 3.9z" },
  { label: "Watch history", hint: "Recently watched", to: "/dashboard/library/history", d: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" },
];

const Profile = () => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(""); // message to show; "" = no error
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: "",
  });
  const [, setUpdateSuccess] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading, role } = useSelector(selectAuth);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);

  const handleFileUpload = async (image) => {
    // Each new pick starts clean, so an earlier failure doesn't stick around.
    setImageError("");
    setImagePercent(0);

    if (!image.type.startsWith("image/")) {
      setImageError("Please choose an image");
      return;
    }

    let photo;
    try {
      photo = await shrinkImage(image);
    } catch {
      // e.g. HEIC on browsers that can't decode it
      setImageError("Can't read this image. Try a JPG or PNG");
      return;
    }

    let storageApi;
    let storage;
    try {
      const [app, mod] = await Promise.all([getFirebase(), import("firebase/storage")]);
      storageApi = mod;
      storage = mod.getStorage(app);
    } catch (error) {
      setImageError("Upload failed. Try again");
      console.log("Error loading storage:", error);
      return;
    }
    const { getDownloadURL, ref, uploadBytesResumable } = storageApi;
    const storageRef = ref(storage, `${Date.now()}.jpg`);
    const uploadTask = uploadBytesResumable(storageRef, photo, { contentType: "image/jpeg" });
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      (error) => {
        setImagePercent(0);
        setImageError(uploadErrorMessage(error));
        console.log("Error uploading image:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setFormData((prev) => ({ ...prev, profilePicture: downloadURL }));
            setUpdateSuccess(true);
          })
          .catch((error) => {
            setImagePercent(0);
            setImageError(uploadErrorMessage(error));
          });
      }
    );
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updatedUserData = { userId: user._id, ...formData };
      const resp = await dispatch(updateProfile(updatedUserData));

      if (resp) {
        toast.success(resp?.payload?.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error updating profile:", error);
    }
    setSaving(false);
    setUpdateSuccess(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      const resp = await dispatch(deleteUserAccount(user._id));
      if (resp) {
        toast.success(resp?.payload?.message, {
          position: "top-right",
          autoClose: 3000,
        });
        // Redirect or handle logout after successful deletion
      }
    } catch (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Error deleting account:", error);
    } finally {
      setDeletingAccount(false);
    }
  };
  const handleSignOut = () => {
    dispatch(logout());
    dispatch(libraryApi.util.resetApiState()); // drop this user's cached library
  };
  // ----- view (logic above is unchanged) -----
  const avatarSrc = formData.profilePicture || user?.profilePicture;
  const uploading = imagePercent > 0 && imagePercent < 100;
  const ring = 2 * Math.PI * 62; // upload progress ring circumference

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0b0614] px-4 pb-20 pt-24 text-white">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-96 w-96 rounded-full bg-violet-700/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-64 -z-10 h-96 w-96 rounded-full bg-rose-700/15 blur-3xl" />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* ---------- hero ---------- */}
        <motion.section
          {...rise(0)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-rose-600/30 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {/* avatar with camera overlay + circular upload progress */}
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              aria-label="Change profile picture"
              className="group relative h-32 w-32 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
            >
              <svg viewBox="0 0 132 132" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                <defs>
                  <linearGradient id="pf-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
                <circle cx="66" cy="66" r="62" fill="none" stroke="url(#pf-ring)" strokeWidth="3" opacity={uploading ? 0.25 : 1} />
                {uploading && (
                  <motion.circle
                    cx="66"
                    cy="66"
                    r="62"
                    fill="none"
                    stroke="url(#pf-ring)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={ring}
                    animate={{ strokeDashoffset: ring * (1 - imagePercent / 100) }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </svg>
              <motion.span
                whileHover={{ scale: 1.03 }}
                className="absolute inset-[7px] block overflow-hidden rounded-full bg-[#0b0614]"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-rose-500 text-4xl font-bold">
                    {(user?.username || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <CameraIcon />
                  {uploading ? `${imagePercent}%` : "Change"}
                </span>
              </motion.span>
            </button>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              name="profilePicture"
              className="hidden"
              ref={fileRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImage(file);
                e.target.value = ""; // allow picking the same file again after a failure
              }}
            />

            <div className="min-w-0">
              <h1 className="truncate font-gilroy text-3xl font-bold sm:text-4xl">{user?.username}</h1>
              <p className="mt-1 truncate text-sm text-white/60">{user?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10">
                  {role === "admin" ? "Admin" : "Member"}
                </span>
                <AnimatePresence mode="wait">
                  {imageError ? (
                    <motion.span key="err" {...pop} className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-200 ring-1 ring-rose-400/30">
                      {imageError}
                    </motion.span>
                  ) : imagePercent === 100 ? (
                    <motion.span key="ok" {...pop} className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/30">
                      Photo uploaded. Save to apply
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---------- library shortcuts ---------- */}
        <div className="grid gap-3 sm:grid-cols-3">
          {LIBRARY.map((l, i) => (
            <motion.div key={l.label} {...rise(1 + i)} whileHover={{ y: -3 }}>
              <Link
                to={l.to}
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-white/15 via-white/[0.05] to-transparent p-px transition-colors duration-300 hover:from-violet-400/60 hover:via-fuchsia-500/30 hover:to-rose-500/40"
              >
                <span className="flex w-full items-center gap-4 rounded-[15px] bg-[#120c1d] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-rose-500/20 text-violet-200 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:text-white">
                    <Svg d={l.d} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{l.label}</span>
                    <span className="block truncate text-xs text-white/50">{l.hint}</span>
                  </span>
                  <span className="text-white/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rose-300">→</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ---------- account settings ---------- */}
        <motion.section {...rise(4)} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
          <h2 className="font-gilroy text-xl font-semibold">Account settings</h2>
          <p className="mt-1 text-sm text-white/55">Update your display name or password.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Display name" htmlFor="username">
              <input
                className={inputClass}
                id="username"
                type="text"
                name="username"
                placeholder="Username"
                defaultValue={user?.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Field>
            <Field label="Email" htmlFor="email" hint="Email can't be changed">
              <div className="relative">
                <input
                  className={`${inputClass} cursor-not-allowed pr-10 text-white/60`}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  defaultValue={user?.email}
                  disabled
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Svg d="M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5z" />
                </span>
              </div>
            </Field>
            <Field label="New password" htmlFor="password" hint="Leave blank to keep your current password" wide>
              <div className="relative">
                <input
                  className={`${inputClass} pr-11`}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                >
                  <Svg d={showPassword ? "M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c5 0 9 4 10 7a11 11 0 0 1-2.4 3.6M6.6 6.6A11 11 0 0 0 2 12c1 3 5 7 10 7a10 10 0 0 0 4.4-1" : "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"} />
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-7 flex justify-end">
            <motion.button
              type="button"
              onClick={handleUpdate}
              disabled={saving || loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Svg d="M5 13l4 4L19 7" />
              )}
              {saving ? "Saving…" : "Save changes"}
            </motion.button>
          </div>
        </motion.section>

        {/* ---------- session + danger zone ---------- */}
        <motion.section {...rise(5)} className="rounded-3xl bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-gilroy text-xl font-semibold">Session</h2>
              <p className="mt-1 text-sm text-white/55">Sign out of MovieNexus on this device.</p>
            </div>
            <motion.button
              type="button"
              onClick={handleSignOut}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.1]"
            >
              <Svg d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              Sign out
            </motion.button>
          </div>

          <div className="mt-6 rounded-2xl bg-rose-500/[0.06] p-5 ring-1 ring-rose-400/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-rose-200">Delete account</h3>
                <p className="mt-1 text-sm text-rose-100/60">Permanently removes your account and data. This can&apos;t be undone.</p>
              </div>
              {!confirmDelete && (
                <motion.button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-rose-200 ring-1 ring-rose-400/30 transition-colors hover:bg-rose-500/25"
                >
                  <Svg d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  Delete account
                </motion.button>
              )}
            </div>
            {/* inline confirmation: account deletion used to happen on a single click */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 flex flex-col gap-3 border-t border-rose-400/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-rose-100">Are you sure? Your account will be deleted permanently.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/[0.08]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-70"
                      >
                        {deletingAccount && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        {deletingAccount ? "Deleting…" : "Yes, delete"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Profile;
