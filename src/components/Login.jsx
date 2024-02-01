import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../Redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
    // Dispatch the login action with the form data
    dispatch(login(formData)).then((response) => {
      console.log(response, "checkinggg");
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
          navigate("/dashboard");
        }
      } else {
        const { error } = response.payload;

        toast.error(error.message, {
          position: "top-right",
          autoClose: 2000,
        });
        // Handle login failure
        console.error("Login failed:", error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-600 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-blue-600"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-600 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-blue-600"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
          <span className=" px-2 ml-[3.5rem] text-gray-600  font-medium text-sm ">
            Don't have an account ?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline ">
              SignUp here
            </Link>{" "}
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
