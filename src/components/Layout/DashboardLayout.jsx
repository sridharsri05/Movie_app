import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import React from "react";
const NavBar = React.lazy(() => import("../NavBar"));
const Footer = React.lazy(() => import("../Footer"));

// SPAs keep the scroll position between pages, so opening a title from a row near the bottom
// landed on the footer. Jump to the top on every page change; hash links (/dashboard#anime)
// are left alone so they can scroll to their section.
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
};

const DashboardLayout = () => {
  return (
    <>
      <ScrollToTop />
      <NavBar />

      <Outlet />
      <Footer />
    </>
  );
};

export default DashboardLayout;
