// Inside ProtectedRoute.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectAuth } from "../Redux/authSlice";

const ProtectedRoute = ({ allowedRoles, ...props }) => {
  const { isAuthenticated, role } = useSelector(selectAuth);
  console.log(isAuthenticated, "auth");
  console.log(role, "auth");
  // If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If allowedRoles is specified and the user's role is not in the list, redirect
  if (allowedRoles && !allowedRoles.includes(role)) {
    // You can redirect to a different page or route, or render an unauthorized message
    return <Navigate to="/unauthorized" />;
  }
  if (role === "admin") {
    return <Outlet {...props} />;
  }
  // If authenticated and the role is allowed, render the nested routes
  return <Outlet />;
};

export default ProtectedRoute;
