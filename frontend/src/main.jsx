import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./features/auth/LoginPage";
import DashboardView from "./features/dashboard/DashboardView";
import StaffView from "./features/staff/StaffView";

// Giống như Angela Yu dạy: bọc route cần bảo vệ trong component riêng
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — có navbar + footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Login — trang riêng, không có layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard — cần đăng nhập */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardView />} />
          <Route path="staff" element={<StaffView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
