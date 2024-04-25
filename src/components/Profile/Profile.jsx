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
    <div className="max-w-md mx-auto mt-8 px-4 py-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-semibold mb-4 text-center">Profile</h2>
      <div className="flex flex-col items-center">
        <div className="mb-4 cursor-pointer">
          <img
            src={formData.profilePicture || user.profilePicture}
            alt="Profile"
            className="w-24 h-24 rounded-full"
            onClick={() => fileRef.current.click()}
          />
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
        </div>
        {imageError ? (
          <span className="text-red-700">
            Error uploading image (file size must be less than 2 MB)
          </span>
        ) : imagePercent > 0 && imagePercent < 100 ? (
          <span className="text-slate-700">{`Uploading: ${imagePercent} %`}</span>
        ) : imagePercent === 100 && !updateSuccess ? (
          <span className="text-green-700">Image uploaded successfully</span>
        ) : (
          ""
        )}
        <div className="mb-4">
          <input
            className="w-full px-4 py-2 text-gray-800 border rounded-md"
            id="username"
            type="text"
            name="username"
            placeholder="Username"
            defaultValue={user.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <input
            className="w-full px-4 py-2 text-gray-800 border rounded-md"
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            defaultValue={user.email}
            disabled
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <input
            className="w-full px-4 py-2 text-gray-800 border rounded-md"
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            defaultValue={user.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-2"
          onClick={handleUpdate}
          disabled={saving || loading}
        >
          {saving ? "Loading..." : "Update"}
        </button>

        <button
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mb-2"
          onClick={handleDeleteAccount}
          disabled={deletingAccount}
        >
          {deletingAccount ? "Deleting Account..." : "Delete Account"}
        </button>

        <button
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
