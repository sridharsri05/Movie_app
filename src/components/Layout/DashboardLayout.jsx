import { Outlet } from "react-router-dom";

import React from "react";
const NavBar = React.lazy(() => import("../NavBar"));
const Footer = React.lazy(() => import("../Footer"));

const DashboardLayout = () => {
  return (
    <>
      <NavBar />

      <Outlet />
      <Footer />
    </>
  );
};

export default DashboardLayout;
