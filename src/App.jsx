import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./components/Signup";
import Login from "./components/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import useAuthInitialization from "./Hooks/useAuthInitialization";
import Profile from "./components/Profile/Profile";
import PlayMovie from "./components/playmovie/PlayMovie";
import NavBar from "./components/NavBar";
import DashboardLayout from "./components/Layout/DashboardLayout";

function App() {
  const { isAuthReady } = useAuthInitialization();

  if (!isAuthReady) {
    return <div>Loading...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="movie/:imdbID" element={<PlayMovie />} />
          </Route>
        </Route>

        <Route
          path="/admindashboard/*"
          element={<ProtectedRoute allowedRoles={["admin"]} />}
        >
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
