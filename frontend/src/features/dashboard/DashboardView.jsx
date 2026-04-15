import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function StatCard({ icon, iconColor, title, value }) {
  return (
    <div className="col">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-3">
          <div className={`fs-3 mb-2 ${iconColor}`}>
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <div className="text-muted small">{title}</div>
          <div className="fs-4 fw-bold mt-1">{value ?? "--"}</div>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ to, icon, title, description, iconColor }) {
  return (
    <div className="col">
      <Link
        to={to}
        className="card border-0 shadow-sm h-100 text-decoration-none text-dark"
      >
        <div className="card-body p-3">
          <div className={`fs-3 mb-3 ${iconColor}`}>
            <i className={`fa-solid ${icon}`}></i>
          </div>
          <h6 className="fw-bold mb-2">{title}</h6>
          <p className="text-muted mb-0 small">{description}</p>
        </div>
      </Link>
    </div>
  );
}

function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = {
          totalDoctors: 24,
          todayPatients: 150,
          todayShifts: 8,
          satisfaction: "99%",
        };
        setStats(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
        <p className="mt-2 text-muted">Đang tải...</p>
      </div>
    );
  }

  let quickLinks = [];

  if (user?.role === "RECEPTIONIST") {
    quickLinks = [
      {
        to: "/dashboard/patients",
        icon: "fa-hospital-user",
        iconColor: "text-success",
        title: "Danh sách bệnh nhân",
      },
      {
        to: "/dashboard/staff",
        icon: "fa-user-doctor",
        iconColor: "text-primary",
        title: "Danh sách bác sĩ",
      },
    ];
  } else if (user?.role === "DOCTOR") {
    quickLinks = [
      {
        to: "/dashboard/patients",
        icon: "fa-hospital-user",
        iconColor: "text-success",
        title: "Danh sách bệnh nhân",
        description: "Xem hồ sơ bệnh nhân và vào nhanh chi tiết khám bệnh.",
      },
    ];
  } else if (user?.role === "ADMIN") {
    quickLinks = [
      {
        to: "/dashboard/staff",
        icon: "fa-users",
        iconColor: "text-danger",
        title: "Quản lý nhân sự",
      },
    ];
  }

  return (
    <div>
      <div
        className="rounded-4 p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #198754, #20c997)" }}
      >
        <h4 className="fw-bold mb-1">Chào mừng trở lại!</h4>
        <p className="mb-0 opacity-75">
          {user?.fullName} - {user?.role}
        </p>
      </div>

      <h5 className="fw-bold mb-3">Tổng quan hệ thống</h5>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        <StatCard
          icon="fa-user-doctor"
          iconColor="text-primary"
          title="Tổng bác sĩ"
          value={stats?.totalDoctors}
        />
        <StatCard
          icon="fa-users"
          iconColor="text-success"
          title="Bệnh nhân hôm nay"
          value={stats?.todayPatients}
        />
        <StatCard
          icon="fa-calendar-check"
          iconColor="text-info"
          title="Ca trực hôm nay"
          value={stats?.todayShifts}
        />
        <StatCard
          icon="fa-arrow-trend-up"
          iconColor="text-warning"
          title="Tỷ lệ hài lòng"
          value={stats?.satisfaction}
        />
      </div>

      {quickLinks.length > 0 && (
        <>
          <h5 className="fw-bold mt-4 mb-3">Truy cap nhanh</h5>
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            {quickLinks.map((item) => (
              <QuickLinkCard key={item.to} {...item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardView;
