import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./utils/ProtectedRoute";
import useAuthInitialization from "./Hooks/useAuthInitialization";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Spinner from "./Spinner/Spinner";
import UpdatePrompt from "./components/UpdatePrompt";
import React, { Suspense } from "react";

const AdminDashboard = React.lazy(() => import("./components/AdminDashboard"));
const TvShows = React.lazy(() => import("./components/recentlyadded/TvShows"));
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const PrivacyPolicy = React.lazy(() => import("./components/Privacy/PrivacyPolicy"));
const Dmca = React.lazy(() => import("./components/Privacy/Dmca"));
const TvSeries = React.lazy(() => import("./components/playTvseries/TvSeries"));
const Library = React.lazy(() => import("./components/Library/Library"));
const Profile = React.lazy(() => import("./components/Profile/Profile"));
const PlayMovie = React.lazy(() => import("./components/playmovie/PlayMovie"));
const SearchResults = React.lazy(() => import("./components/SearchResults"));
const SignUp = React.lazy(() => import("./components/Signup"));
const Login = React.lazy(() => import("./components/Login"));
const ForgotPassword = React.lazy(() =>
  import("./components/passwordReset/ForgotPassword")
);
const ResetPassword = React.lazy(() =>
  import("./components/passwordReset/ResetPassword")
);

function App() {
  const { isAuthReady } = useAuthInitialization();

  if (!isAuthReady) {
    return <Spinner />;
  }
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" index element={<Login />} />
          <Route path="/login" index element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="library/:tab" element={<Library />} />
              <Route path="tvShows" element={<TvShows />} />
              <Route path="movie/:imdbID" element={<PlayMovie />} />
              <Route path="episodes/:imdbID/:season/:epi" element={<TvSeries />} />
              <Route path="tvSeries/:imdbID" element={<TvSeries />} />
              <Route path="searchResults/:query" element={<SearchResults />} />
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
      </Suspense>
      <UpdatePrompt />
    </BrowserRouter>
  );
}

export default App;
