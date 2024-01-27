import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";

const DashboardLayout = () => {
  return (
    <>
      <NavBar />

      <Outlet />
    </>
  );
};

export default DashboardLayout;
