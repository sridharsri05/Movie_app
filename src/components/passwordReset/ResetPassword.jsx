import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Apis } from "../../api/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import svg1 from "/avatar-makata-vespa-04-2@2x.png";
import svg2 from "/avatar-makata-vespa-04-1@2x.png";
import Spinner from "../../Spinner/Spinner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${Apis.baseURL}/reset-password/${token}`, {
        password,
      });
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      if (response.data.message === "Password reset successfully") {
        navigate("/login");
      }
    } catch (error) {
      // Handle errors (e.g., show error message)
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

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

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
                Reset Password
              </motion.div>

              <div className="mb-4 *:rounded-2xl">
                <label
                  htmlFor="password"
                  className="block text-gray-600 text-sm font-medium"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 p-2 w-full border focus:outline-blue-600"
                  required
                />
              </div>

              <div className="mb-4 *:rounded-2xl  ">
                <label
                  htmlFor="confirm-password"
                  className="block text-gray-600 text-sm font-medium"
                >
                  Re-enter Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 p-2 w-full border focus:outline-blue-600"
                  required
                />
                {confirmPassword && (
                  <p
                    className={`mt-2 text-sm ${
                      passwordsMatch ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? "Passwords match!" : "Passwords do not match!"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`bg-[#A93159] text-white py-2 px-4 rounded-2xl hover:bg-blue-600 ${
                  !passwordsMatch ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={!passwordsMatch} // Disable the button if passwords don't match
              >
                {isLoading ? "Setting..." : "Set New Password"}
              </button>
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

export default ResetPassword;
