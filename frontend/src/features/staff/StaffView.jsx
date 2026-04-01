import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { getAllEmployees, getDoctors } from "../../api/staffApi";

function StaffCard({ staff, canEdit }) {
  const roleMap = {
    ADMIN: {
      label: "Quản trị viên",
      badge: "danger",
      spec: "System Administrator",
    },
    DOCTOR: { label: "Bác sĩ", badge: "primary", spec: "Khoa Khám bệnh" },
    RECEPTIONIST: { label: "Lễ tân", badge: "success", spec: "Quầy tiếp đón" },
  };

  const { label, badge, spec } = roleMap[staff.role] || {};
  const firstName = staff.fullName?.split(" ").pop() || "?";
  const avatar =
    staff.avatarUrl ||
    `https://ui-avatars.com/api/?name=${firstName}&background=random&color=fff&size=120`;

  return (
    <div className="col">
      <div className="card border-0 shadow-sm h-100 position-relative">
        {canEdit && (
          <div
            className="dropdown position-absolute top-0 end-0 m-2"
            style={{ zIndex: 2 }}
          >
            <button
              className="btn btn-sm btn-light border-0"
              data-bs-toggle="dropdown"
            >
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end border-0 shadow">
              <li>
                <button className="dropdown-item">
                  <i className="fa-regular fa-pen-to-square me-2 text-primary"></i>
                  Sửa
                </button>
              </li>
              <li>
                <button className="dropdown-item text-danger">
                  <i className="fa-regular fa-trash-can me-2"></i>Xóa
                </button>
              </li>
            </ul>
          </div>
        )}

        <div className="card-body d-flex gap-3 p-3">
          <img
            src={avatar}
            className="rounded-circle shadow-sm flex-shrink-0"
            width="70"
            height="70"
            style={{ objectFit: "cover" }}
            alt={staff.fullName}
          />
          <div>
            <span
              className={`badge bg-${badge}-subtle text-${badge} border border-${badge}-subtle mb-1`}
            >
              {label}
            </span>
            <h6 className="fw-bold mb-1">{staff.fullName}</h6>
            <div className="text-muted small">{spec}</div>
            <div className="text-muted small mt-1">
              <i className="fa-solid fa-envelope me-1"></i>
              {staff.email}
            </div>
            <div className="text-muted small">
              <i className="fa-solid fa-phone me-1"></i>
              {staff.phone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffView() {
  const { user } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    async function fetchData() {
      try {
        const data = isAdmin ? await getAllEmployees() : await getDoctors();
        setStaffList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin]);

  const displayList =
    filter === "ALL" ? staffList : staffList.filter((s) => s.role === filter);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
        <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fa-solid fa-circle-exclamation me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          {isAdmin ? "Quản lý Nhân sự" : "Danh sách Bác sĩ"}
        </h5>
        {isAdmin && (
          <button className="btn btn-success">
            <i className="fa-solid fa-plus me-1"></i>Thêm Nhân sự
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {["ALL", "DOCTOR", "RECEPTIONIST", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`btn rounded-pill ${
                filter === role ? "btn-success" : "btn-outline-secondary"
              }`}
            >
              {role === "ALL"
                ? "Tất cả"
                : role === "DOCTOR"
                  ? "Bác sĩ"
                  : role === "RECEPTIONIST"
                    ? "Lễ tân"
                    : "Quản trị viên"}
            </button>
          ))}
        </div>
      )}

      {displayList.length === 0 ? (
        <p className="text-muted text-center mt-5">
          Không tìm thấy nhân sự nào.
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {displayList.map((staff) => (
            <StaffCard key={staff.accountId} staff={staff} canEdit={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

export default StaffView;
