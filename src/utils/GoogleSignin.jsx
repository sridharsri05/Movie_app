import React from "react";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../components/firebase/Firebase";
import { useDispatch } from "react-redux";
import { googleSign, setLoading } from "../Redux/authSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import svg6 from "../../public/flatcoloriconsgoogle.svg";

const GoogleSignin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const googleSignin = async () => {
    dispatch(setLoading(true));
    try {
      const Provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const res = await signInWithPopup(auth, Provider);
      const data = {
        username: res.user.displayName,
        email: res.user.email,
        photo: res.user.photoURL,
      };
      console.log(res);
      const signinData = await dispatch(googleSign(data)).unwrap();
      console.log(signinData, "data");
      if (signinData && signinData.status === "success") {
        toast.success(signinData.message, {
          position: "top-right",
          autoClose: 2000,
        });
        console.log("User successfully registered:", signinData.message);
        const { role } = signinData.user;
        if (role === "admin") {
          navigate("/admindashboard");
        } else {
          navigate("/dashboard");
        }
      }
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      toast.error(error?.error?.message || error, {
        position: "top-right",
        autoClose: 2000,
      });
      console.log(error, "can't signin with google");
    }
  };

  return (
    <div onClick={googleSignin}>
      <img src={svg6} alt="gooogle" className="rounded-21xl border size-6 " />
    </div>
  );
};

export default GoogleSignin;
