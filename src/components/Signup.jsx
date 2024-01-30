import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signUp } from "../Redux/authSlice"; // Import your signUp action
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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

    // Dispatch the signUp action with the form data
    dispatch(signUp(formData))
      .unwrap() // Unwraps the result from createAsyncThunk
      .then((response) => {
        // Additional logic if needed, such as redirecting after successful sign-up

        if (response && response.status === "success") {
          console.log("User successfully registered:", response.message);
          navigate("/login");
        }
      })
      .catch((error) => {
        // Handle registration failure
        console.error("Registration failed:", error.error.message);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-400 ">
      <div className="max-w-md w-full p-6  rounded-md shadow-green-600  bg-green-200">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-600 text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-blue-600"
              required
            />
          </div>

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
            Sign Up
          </button>
          <span className=" px-2 ml-[3.5rem] text-gray-600  font-medium text-sm">
            Already have an account ?
            <Link to="/login" className="text-blue-500 hover:underline ">
              Login here
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
