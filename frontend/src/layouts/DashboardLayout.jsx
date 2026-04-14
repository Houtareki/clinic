import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const MENU_CONFIG = {
  ADMIN: [
    { path: "/dashboard", label: "Dashboard", icon: "fa-house" },
    { path: "/dashboard/staff", label: "Quản lý nhân sự", icon: "fa-users" },
  ],
  DOCTOR: [
    { path: "/dashboard", label: "Dashboard", icon: "fa-house" },
    { path: "/dashboard/shift", label: "Lịch trực", icon: "fa-calendar-days" },
  ],
  RECEPTIONIST: [
    { path: "/dashboard", label: "Dashboard", icon: "fa-house" },
    {
      path: "/dashboard/staff",
      label: "Danh sách bác sĩ",
      icon: "fa-user-doctor",
    },
    {
      path: "/dashboard/patients",
      label: "Danh sách bệnh nhân",
      icon: "fa-hospital-user",
    },
    {
      path: "/dashboard/shift",
      label: "Quản lý lịch trực",
      icon: "fa-calendar-days",
    },
  ],
};

function DashboardLayout() {
  const { user } = useAuth();
  const menus = MENU_CONFIG[user?.role] || [];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar menus={menus} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />

        <main className="p-4 bg-light flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ menus }) {
  return (
    <aside
      className="bg-white shadow-sm d-flex flex-column"
      style={{ width: "240px", minHeight: "100vh" }}
    >
      <div className="p-3 border-bottom">
        <span className="text-success fw-bold fs-5">
          <i className="fa-solid fa-hospital-user me-2"></i>
          Trustcare Clinic
        </span>
      </div>

      <ul className="list-unstyled p-3 flex-grow-1">
        <li
          className="text-muted mb-2"
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Tổng quan
        </li>

        {menus.map((item) => (
          <li key={item.path} className="mb-1">
            <NavLink
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none
                 ${isActive ? "bg-success text-white" : "text-dark hover-bg"}`
              }
            >
              <i
                className={`fa-solid ${item.icon}`}
                style={{ width: "18px" }}
              ></i>
              <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.fullName?.split(" ").pop() || "U";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="bg-white shadow-sm px-4 py-2 d-flex align-items-center">
      <div className="dropdown ms-auto">
        <div
          className="d-flex align-items-center gap-2 dropdown-toggle"
          data-bs-toggle="dropdown"
          style={{ cursor: "pointer" }}
        >
          <div className="text-end d-none d-md-block">
            <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
              {user?.fullName}
            </div>
            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
              {user?.role}
            </div>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${firstName}&background=198754&color=fff`}
            className="rounded-circle"
            width="38"
            height="38"
            alt="avatar"
          />
        </div>

        <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
          <li>
            <a className="dropdown-item py-2" href="#">
              <i className="fa-regular fa-user me-2 text-primary"></i>
              Hồ sơ cá nhân
            </a>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <button
              className="dropdown-item py-2 text-danger fw-bold"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default DashboardLayout;
