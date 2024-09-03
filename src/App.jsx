import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignUp from "./components/Signup";
import Login from "./components/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import useAuthInitialization from "./Hooks/useAuthInitialization";
import Profile from "./components/Profile/Profile";
import PlayMovie from "./components/playmovie/PlayMovie";

import DashboardLayout from "./components/Layout/DashboardLayout";
import Spinner from "./Spinner/Spinner";
import { TvShows } from "./components/recentlyadded/TvShows";
import SearchResults from "./components/SearchResults";
import PrivacyPolicy from "./components/Privacy/PrivacyPolicy";
import Dmca from "./components/Privacy/Dmca";
import PlayTvSeries from "./components/PlayTv/PlayTvseries";

function App() {
  const { isAuthReady } = useAuthInitialization();

  if (!isAuthReady) {
    return <Spinner />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" index element={<Login />} />
        <Route path="/login" index element={<Login />} />

        <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="tvShows" element={<TvShows />} />
            <Route path="movie/:imdbID" element={<PlayMovie />} />
            <Route path="episodes/:imdbID/:season/:epi" element={<PlayTvSeries />} />
            <Route path="tvSeries/:imdbID" element={<PlayTvSeries />} />
            <Route path="searchResults" element={<SearchResults />} />
            <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />
            <Route path="DMCA" element={<Dmca />} />
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
