import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, signUp } from "../Redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleSignin from "../utils/GoogleSignin";
import svg1 from "/avatar-makata-vespa-04-2@2x.png";
import svg2 from "/avatar-makata-vespa-04-1@2x.png";
import svg3 from "/akariconsgithubfill.svg";
import fbsvg from "/bifacebook.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../Spinner/Spinner";
import { motion } from "framer-motion";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    dispatch(signUp(formData))
      .unwrap() // Unwraps the result from createAsyncThunk
      .then((response) => {
        if (response && response.status === "success") {
          dispatch(setLoading(false));
          toast.success(response.message, {
            position: "top-right",
            autoClose: 2000,
          });
          console.log("User successfully registered:", response.message);
          dispatch(setLoading(false));
          navigate("/login");
        }
      })
      .catch((error) => {
        dispatch(setLoading(false));
        console.log(error, "error");
        if (error) {
          // CORS error
          toast.error(error?.error?.message, {
            position: "top-right",
            autoClose: 3000,
          });
          console.error("CORS policy error: Request blocked by server");
        } else {
          // Other errors
          toast.error(error.error.message ? error.error.message : error, {
            position: "top-right",
            autoClose: 3000,
          });
          console.error("Registration failed:", error.error.message);
        }
      });
  };

  return (
    <motion.div
      className="w-full  relative [background:linear-gradient(90deg,_#00b4db,_#0083b0)] md:p-3 overflow-hidden  text-[0.88rem] text-steelblue font-gilroy"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        className="absolute top-[0rem] left-[-6.9rem]  h-[37.92rem] object-cover "
        alt=""
        src={svg1}
      />
      <motion.div
        className="min-h-screen flex justify-center items-center  "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className=" border  mx-auto bg-[#ffffff]  h-[29rem]  rounded-2xl z-[222]  shadow-2xl "
          initial={{ y: "-100vh" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <motion.div
            className=" flex  relative  "
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col justify-center p-6   ">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className=" text-3xl my-1 font-gilroy font-medium "
              >
                SignUp
              </motion.div>
              <div className="mb-3 *:rounded-2xl">
                <label
                  htmlFor="username"
                  className="block text-gray-600 text-sm font-medium"
                >
                  UserName
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full  border  focus:outline-blue-600"
                  required
                />
              </div>
              <div className="mb-4 *:rounded-2xl">
                <label
                  htmlFor="email"
                  className="block text-gray-600 text-sm font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full  border  focus:outline-blue-600"
                  required
                />
              </div>

              <div className="relative *:rounded-2xl">
                <label
                  htmlFor="password"
                  className="block text-gray-600 text-sm font-medium"
                >
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border  focus:outline-blue-600"
                  required
                />
                <span
                  className={`absolute inset-y-11 right-0 flex items-center pr-6 cursor-pointer ${
                    showPassword ? "text-sky-700" : "text-slate-700"
                  }`}
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </span>
              </div>

              <button
                type="submit"
                className="bg-[#A93159] text-white mt-3 py-2 px-4 rounded-2xl hover:bg-blue-600"
              >
                SignUp
              </button>
              <span className=" text-center mt-2"> or continue with</span>

              <div className=" grid grid-cols-3  gap-1 my-3 *:p-2 *:flex *:justify-center *:cursor-pointer  *:rounded-full *:border *:w-[6rem] ">
                <GoogleSignin />

                <div>
                  <img src={fbsvg} alt=" github" className="rounded-21xl  size-6 " />
                </div>
                <div className="">
                  <img src={svg3} alt="facebook" className="rounded-21xl  size-6" />
                </div>
              </div>

              <span className="  text-center text-gray-600  font-medium text-sm ">
                Already have an account ?{" "}
                <Link to="/login" className="text-blue-500 hover:underline ">
                  Login here
                </Link>
              </span>
            </form>

            <img
              src={svg2}
              alt="svg1"
              className="size-[29rem]  object-fill  absolute right-[5.6rem] hidden sm:block  z-[-1] "
            />

            <div className="bg-[#E2EEF5] h-[29rem] w-[20rem] rounded-2xl ml-[6rem] hidden sm:block z-[-2]"></div>
          </motion.div>
        </motion.div>
        {isLoading && <Spinner />}
      </motion.div>
    </motion.div>
  );
};

export default SignUp;
