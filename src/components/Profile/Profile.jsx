import { useState, useEffect, useRef } from "react";
import {
  deleteUserAccount,
  logout,
  selectAuth,
  updateProfile,
} from "../../Redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { app } from "../firebase/Firebase";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faSave,
  faTrash,
  faRightFromBracket,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const Profile = () => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: "",
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading } = useSelector(selectAuth);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);

  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      (error) => {
        setImageError(true);
        console.log("Error uploading image:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, profilePicture: downloadURL });
          setUpdateSuccess(true); // Set updateSuccess to true when download URL is obtained
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
        console.log(resp.payload, "from profile");
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
      setImageError(true);
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
  };
  return (
    <div className="max-w-2xl mx-auto mt-20 px-4">
      <div className="rounded-2xl border border-gray-700 bg-gray-800 shadow-xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white text-center">Profile</h2>
          <p className="text-center text-sm text-gray-300 mt-1">
            Update your personal info and avatar.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileRef.current.click()}
              >
                <img
                  src={formData.profilePicture || user.profilePicture}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover ring-2 ring-cyan-400"
                />
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
                    <FontAwesomeIcon icon={faCamera} /> Change
                  </span>
                </button>
              </div>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                name="profilePicture"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  setImage(e.target.files[0]);
                }}
              />

              {imageError && (
                <span className="mt-3 text-sm text-red-400">
                  Error uploading image (file size must be less than 2 MB)
                </span>
              )}

              {imagePercent > 0 && imagePercent < 100 && (
                <div className="w-full mt-3">
                  <div className="w-48 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${imagePercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-300 mt-1 text-center">
                    Uploading {imagePercent}%
                  </div>
                </div>
              )}

              {imagePercent === 100 && !updateSuccess && (
                <span className="mt-3 text-xs text-green-400">
                  Image uploaded successfully
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-300 mb-1">
                Display name
              </label>
              <input
                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                id="username"
                type="text"
                name="username"
                placeholder="Username"
                defaultValue={user.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                Email
              </label>
              <input
                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg opacity-80"
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                defaultValue={user.email}
                disabled
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full pr-10 px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  defaultValue={user.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg"
              onClick={handleUpdate}
              disabled={saving || loading}
            >
              <FontAwesomeIcon icon={faSave} /> {saving ? "Loading..." : "Update"}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              <FontAwesomeIcon icon={faTrash} />{" "}
              {deletingAccount ? "Deleting Account..." : "Delete Account"}
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg"
              onClick={handleSignOut}
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
