import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login, setLoading } from "../Redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleSignin from "../utils/GoogleSignin";
import svg1 from "../../public/avatar-makata-vespa-04-2@2x.png";
import svg2 from "../../public/avatar-makata-vespa-04-1@2x.png";
import svg3 from "../../public/akariconsgithubfill.svg";
import fbsvg from "../../public/bifacebook.svg";
import svg5 from "../../public/clarityeyehideline.svg";
import svg6 from "../../public/flatcoloriconsgoogle.svg";
import Logo from "../../public/MovieHub.png";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    // Dispatch the login action with the form data
    dispatch(login(formData)).then((response) => {
      console.log(response, "checkinggg");
      dispatch(setLoading(false));
      if (response && response.payload.status === "success") {
        console.log("User successfully logged in:", response.payload);
        toast.success(response.payload.message, {
          position: "top-right",
          autoClose: 3000,
        });
        const { role } = response.payload.user;
        if (role === "admin") {
          navigate("/admindashboard");
        } else {
          navigate("/dashboard/");
        }
      } else {
        const { error } = response.payload;
        dispatch(setLoading(false));
        toast.error(error.message || error, {
          position: "top-right",
          autoClose: 2000,
        });
        // Handle login failure
        console.error("Login failed:", error);
      }
    });
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-indigo-500  ">
    //   <div className=" max-w-md w-full p-6 bg-white rounded-md shadow-md">
    //     <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
    //     <form onSubmit={handleSubmit}>
    //       <div className="mb-4">
    //         <label htmlFor="email" className="block text-gray-600 text-sm font-medium">
    //           Email
    //         </label>
    //         <input
    //           type="email"
    //           id="email"
    //           name="email"
    //           value={formData.email}
    //           onChange={handleChange}
    //           className="mt-1 p-2 w-full border rounded-md focus:outline-blue-600"
    //           required
    //         />
    //       </div>

    //       <div className="mb-4">
    //         <label htmlFor="password" className="block text-gray-600 text-sm font-medium">
    //           Password
    //         </label>
    //         <input
    //           type="password"
    //           id="password"
    //           name="password"
    //           value={formData.password}
    //           onChange={handleChange}
    //           className="mt-1 p-2 w-full border rounded-md focus:outline-blue-600"
    //           required
    //         />
    //       </div>

    //       <button
    //         type="submit"
    //         className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
    //       >
    //         Login
    //       </button>
    //       <span className=" px-2 ml-[3.5rem] text-gray-600  font-medium text-sm ">
    //         Don't have an account ?{" "}
    //         <Link to="/signup" className="text-blue-500 hover:underline ">
    //           SignUp here
    //         </Link>{" "}
    //       </span>
    //     </form>
    //     <div className=" flex place-content-center my-1">
    //       <hr className="  my-2 w-56     " />
    //     </div>

    //     <span className="flex place-content-center text-sm text-blue-400"> or </span>
    //     <GoogleSignin />
    //   </div>
    // </div>
    <div className="w-full  relative [background:linear-gradient(90deg,_#00b4db,_#0083b0)] md:p-3 overflow-hidden  text-[0.88rem] text-steelblue font-gilroy">
      <img
        className="absolute top-[0rem] left-[-6.9rem]  h-[37.92rem] object-cover "
        alt=""
        src={svg1}
      />
      <div className="min-h-screen flex justify-center items-center  ">
        <div className=" border  mx-auto bg-[#ffffff]  h-[28rem]  rounded-2xl z-[222]  shadow-2xl ">
          <div className=" flex  relative  ">
            <form onSubmit={handleSubmit} className="flex flex-col justify-center p-6   ">
              {/* <div>
                <img src={Logo} alt="Logo" />
              </div> */}
              <div className=" text-3xl my-1 font-gilroy font-medium ">Login</div>
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

              <div className=" *:rounded-2xl">
                <label
                  htmlFor="password"
                  className="block text-gray-600 text-sm font-medium"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border  focus:outline-blue-600"
                  required
                />
              </div>
              <div className="my-3 ">forget Password? </div>

              <button
                type="submit"
                className="bg-[#A93159] text-white py-2 px-4 rounded-2xl hover:bg-blue-600"
              >
                Login
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
                Don't have an account ?{" "}
                <Link to="/signup" className="text-blue-500 hover:underline ">
                  Register for free
                </Link>
              </span>
            </form>

            <img
              src={svg2}
              alt="svg1"
              className="size-[28rem]  object-fill  absolute right-[6.2rem] hidden sm:block  z-[-1] "
            />

            <div className="bg-[#E2EEF5] h-[28rem] w-[20rem] rounded-2xl ml-[6rem] hidden sm:block z-[-2]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
