import React, { useState } from "react";
import axios from "axios";
import { Apis } from "../../api/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import svg1 from "/avatar-makata-vespa-04-2@2x.png";
import svg2 from "/avatar-makata-vespa-04-1@2x.png";
import Spinner from "../../Spinner/Spinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${Apis.baseURL}/forgot-password`, { email });
      toast.success("Reset link sent to your email!", {
        position: "top-right",
        autoClose: 3000,
      });
      console.log(response);
    } catch (error) {
      // Handle errors (e.g., show error message)
      console.error(error);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full relative [background:linear-gradient(90deg,_#00b4db,_#0083b0)] md:p-3 overflow-hidden text-[0.88rem] text-steelblue font-gilroy"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        className="absolute top-[0rem] left-[-6.9rem] h-[37.92rem] object-cover"
        alt=""
        src={svg1}
      />

      <motion.div
        className="min-h-screen flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="border mx-auto bg-[#ffffff] h-[28rem] rounded-2xl z-[222] shadow-2xl"
          initial={{ y: "-100vh" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <motion.div
            className="flex relative"
            initial={{ x: "-100vw" }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col justify-center p-6">
              <motion.div
                className="text-3xl my-1 font-gilroy font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Forgot Password
              </motion.div>
              <div className="mb-4 ">
                <label
                  htmlFor="email"
                  className="block text-gray-600 text-sm font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 p-2 w-full  border  focus:outline-blue-600 rounded-2xl  "
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#A93159] text-white py-2 px-4 rounded-2xl hover:bg-blue-600"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <span className="text-center mt-2">
                Remembered your password?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Login here
                </Link>
              </span>
            </form>

            <img
              src={svg2}
              alt="svg1"
              className="size-[28rem] object-fill absolute right-[6.2rem] hidden sm:block z-[-1]"
            />

            <div className="bg-[#E2EEF5] h-[28rem] w-[20rem] rounded-2xl ml-[6rem] hidden sm:block z-[-2]"></div>
          </motion.div>
        </motion.div>
        {isLoading && <Spinner />}
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;
