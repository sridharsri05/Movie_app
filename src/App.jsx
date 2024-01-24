import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./components/Signup";
import Login from "./components/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import useAuthInitialization from "./Hooks/useAuthInitialization";
import Profile from "./components/Profile/Profile";

function App() {
  const { isAuthReady } = useAuthInitialization();

  // If authentication state is not ready, you can render a loading indicator
  if (!isAuthReady) {
    return <div>Loading...</div>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
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
