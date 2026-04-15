import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./features/auth/LoginPage";
import DashboardView from "./features/dashboard/DashboardView";
import StaffView from "./features/staff/StaffView";
import DoctorDetailView from "./features/staff/DoctorDetailView";
import PatientView from "./features/patient/PatientView";
import ProfileView from "./features/profile/ProfileView";
import PatientDetailView from "./features/patient/PatientDetailView";
import "./assets/css/index.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return roles.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardView />} />
          <Route
            path="staff"
            element={
              <RoleRoute roles={["ADMIN", "RECEPTIONIST"]}>
                <StaffView />
              </RoleRoute>
            }
          />
          <Route
            path="doctors/:id"
            element={
              <RoleRoute roles={["ADMIN", "RECEPTIONIST", "DOCTOR"]}>
                <DoctorDetailView />
              </RoleRoute>
            }
          />

          <Route
            path="patients"
            element={
              <RoleRoute roles={["RECEPTIONIST", "DOCTOR"]}>
                <PatientView />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<ProfileView />} />
          <Route path="profile/:id" element={<ProfileView />} />
          <Route
            path="patients/:id"
            element={
              <RoleRoute roles={["RECEPTIONIST", "DOCTOR"]}>
                <PatientDetailView />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
