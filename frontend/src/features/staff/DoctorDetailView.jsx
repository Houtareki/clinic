import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/admin";

const DoctorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const adminMenuRef = useRef(null);

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    avatarUrl: "",
    specialty: "",
    degree: "",
    bio: "",
  });

  const specialtyOptions = [
    "Khoa nội",
    "Khoa ngoại",
    "Khoa nhi",
    "Khoa tim mạch",
    "Khoa da liễu",
    "Khoa tai mũi họng",
    "Khoa thần kinh",
    "Khoa sản",
    "Khoa mắt",
  ];

  const specialtySelectOptions = useMemo(() => {
    if (!formData.specialty || specialtyOptions.includes(formData.specialty)) {
      return specialtyOptions;
    }
    return [formData.specialty, ...specialtyOptions];
  }, [formData.specialty]);

  const loadDoctor = useCallback(async () => {
    setLoading(true);
    setErrorText("");

    try {
      const response = await axios.get(`${API_BASE}/doctors/${id}`);
      const data = response.data;

      setDoctor(data);
      setFormData({
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        email: data?.email || "",
        username: data?.username || "",
        password: "",
        avatarUrl: data?.avatarUrl || "",
        specialty: data?.specialty || "",
        degree: data?.degree || "",
        bio: data?.bio || "",
      });
    } catch (error) {
      console.error("Lỗi khi tải chi tiết bác sĩ:", error);
      setErrorText(
        error.response?.data || "Không thể tải thông tin bác sĩ từ hệ thống.",
      );
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setShowAdminMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
        specialty: formData.specialty,
        degree: formData.degree,
        bio: formData.bio,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await axios.put(`${API_BASE}/doctors/${id}`, payload);
      setShowEditModal(false);
      await loadDoctor();
      alert("Cập nhật hồ sơ bác sĩ thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật bác sĩ:", error);
      alert(error.response?.data || "Không thể cập nhật hồ sơ bác sĩ.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockAccount = async () => {
    setLocking(true);

    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      setShowDeleteModal(false);
      alert("Khóa tài khoản thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi khóa tài khoản:", error);
      alert(error.response?.data || "Không thể khóa tài khoản.");
    } finally {
      setLocking(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Chưa cập nhật";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
    return date.toLocaleDateString("vi-VN");
  };

  const now = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const dayIndex = (today.getDay() + 6) % 7;
    monday.setDate(today.getDate() - dayIndex);
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, []);

  const weekRangeLabel = useMemo(() => {
    const formatShort = (date) =>
      `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
    return `${formatShort(weekDays[0])} - ${formatShort(weekDays[6])}`;
  }, [weekDays]);

  const getDayName = (date) => {
    const day = date.getDay();
    if (day === 0) return "CN";
    return `Thứ ${day + 1}`;
  };

  const getDayDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

  const isToday = (date) =>
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctor?.fullName || "Doctor",
  )}&background=eaf7ed&color=264b33&size=120`;

  const avatarSrc =
    doctor?.avatarUrl && doctor.avatarUrl.trim() !== ""
      ? doctor.avatarUrl
      : fallbackAvatar;

  if (loading) {
    return <div className="container-fluid p-4">Đang tải dữ liệu...</div>;
  }

  if (!doctor) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger mb-0">
          {errorText || "Không tìm thấy thông tin bác sĩ."}
        </div>
      </div>
    );
  }

  return (
    <>
      <section>
        <input type="checkbox" id="sidebar-toggle" hidden />
        <aside className="sidebar shadow-sm">
          <div className="brand">
            <i className="fa-solid fa-hospital-user text-success me-2 fs-4"></i>
            Trustcare Clinic
          </div>
          <ul className="sidebar-menu">
            <li className="menu-title">Tổng quan</li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <i className="fa-solid fa-house"></i> Dashboard
              </a>
            </li>
            <li className="active">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <i className="fa-solid fa-users"></i> Quản lý Nhân sự
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <i className="fa-solid fa-user"></i> Danh sách bệnh nhân
              </a>
            </li>
          </ul>
        </aside>
      </section>

      <main className="main-wrapper">
        <header className="top-header shadow-sm">
          <div className="search-bar">
            <i className="fa-solid fa-magnifying-glass text-muted"></i>
            <input type="text" placeholder="Tìm kiếm..." />
          </div>

          <div className="dropdown" ref={adminMenuRef}>
            <div
              className="d-flex align-items-center gap-3 dropdown-toggle dropdown-toggle-no-caret"
              style={{ cursor: "pointer" }}
              onClick={() => setShowAdminMenu((prev) => !prev)}
            >
              <div className="text-end d-none d-md-block">
                <div className="fw-bold fs-6">Admin Tuấn</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  System Administrator
                </div>
              </div>
              <img
                src="https://ui-avatars.com/api/?name=Tuan&background=0d6efd&color=fff"
                className="rounded-circle shadow-sm"
                width="40"
                height="40"
                alt="Admin Avatar"
              />
            </div>

            <ul
              className={`dropdown-menu dropdown-menu-end shadow-sm border-0 mt-3 ${
                showAdminMenu ? "show" : ""
              }`}
              style={{ minWidth: "200px" }}
            >
              <li className="px-3 py-2 d-md-none">
                <span className="fw-bold d-block">Admin Tuấn</span>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  System Administrator
                </span>
                <hr className="dropdown-divider mt-2 mb-0" />
              </li>

              <li>
                <a
                  className="dropdown-item py-2 mt-1"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa-regular fa-user me-2 text-primary"></i> Hồ sơ
                  cá nhân
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item py-2"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa-solid fa-gear me-2 text-secondary"></i> Cài
                  đặt
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a
                  className="dropdown-item py-2 text-danger fw-bold mb-1"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                  Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </header>

        <div className="container-fluid p-4">
          <a
            href="#"
            className="text-decoration-none text-muted mb-4 d-inline-block fw-bold back-link"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
          >
            <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
          </a>

          <div className="row align-items-start g-4">
            <div className="col-12">
              <div className="detail-card p-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="profile-avatar me-4"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderWidth: "3px",
                    }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackAvatar;
                    }}
                  />
                  <div>
                    <div
                      className="text-primary fw-bold mb-1"
                      style={{ fontSize: "0.85rem" }}
                    >
                      #DT-{String(doctor.id || id).padStart(4, "0")}
                    </div>
                    <h3 className="fw-bold text-dark mb-2">
                      {doctor.fullName || "Chưa cập nhật"}
                    </h3>
                    <div
                      className="badge bg-light text-success border border-success-subtle px-3 py-2 rounded-pill"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <i className="fa-solid fa-stethoscope me-1"></i>
                      {(doctor.degree || "Bác sĩ") +
                        " - " +
                        (doctor.specialty || "Chưa cập nhật")}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-light rounded-circle border shadow-sm"
                  style={{ width: "45px", height: "45px" }}
                  title="Chỉnh sửa hồ sơ"
                  type="button"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fa-solid fa-pen text-muted"></i>
                </button>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="detail-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold text-dark mb-0">Lịch trực tuần này</h5>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-light border rounded-circle"
                      style={{ width: "35px", height: "35px", padding: 0 }}
                      type="button"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <span
                      className="fw-bold px-2 text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {weekRangeLabel}
                    </span>
                    <button
                      className="btn btn-light border rounded-circle"
                      style={{ width: "35px", height: "35px", padding: 0 }}
                      type="button"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <div className="weekly-schedule-wrapper mt-3">
                  <div className="timetable-grid">
                    <div className="time-col-header"></div>

                    {weekDays.map((date) => {
                      const sunday = date.getDay() === 0;
                      const current = isToday(date);

                      return (
                        <div
                          key={`header-${date.toISOString()}`}
                          className={`day-header text-center ${current ? "current-day" : ""}`}
                        >
                          <div
                            className={`day-name ${
                              sunday
                                ? "text-danger"
                                : current
                                  ? "text-primary"
                                  : ""
                            }`}
                          >
                            {getDayName(date)}
                          </div>
                          <div
                            className={`day-date ${
                              sunday
                                ? "text-danger"
                                : current
                                  ? "text-primary"
                                  : ""
                            }`}
                          >
                            {getDayDate(date)}
                          </div>
                        </div>
                      );
                    })}

                    <div className="shift-row-label bg-light-success text-success border-bottom">
                      <i className="fa-regular fa-sun mb-1 fs-5"></i>
                      <span>Ca Sáng</span>
                    </div>

                    {weekDays.map((date) => (
                      <div
                        key={`morning-${date.toISOString()}`}
                        className="timetable-cell border-bottom"
                        style={
                          date.getDay() === 0
                            ? { backgroundColor: "#fdf2f2" }
                            : undefined
                        }
                      ></div>
                    ))}

                    <div className="shift-row-label bg-light-warning text-warning-dark">
                      <i className="fa-solid fa-cloud-sun mb-1 fs-5"></i>
                      <span>Ca Chiều</span>
                    </div>

                    {weekDays.map((date) => (
                      <div
                        key={`afternoon-${date.toISOString()}`}
                        className="timetable-cell"
                        style={
                          date.getDay() === 0
                            ? { backgroundColor: "#fdf2f2" }
                            : undefined
                        }
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>
                  Chưa kết nối API lịch trực.
                </div>
              </div>

              <div className="detail-card p-4">
                <h6
                  className="fw-bold text-muted mb-3"
                  style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
                >
                  Giới thiệu (Bio)
                </h6>
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: "0.95rem", lineHeight: 1.6 }}
                >
                  {doctor.bio ||
                    "Hiện chưa có thông tin giới thiệu cho bác sĩ này."}
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="detail-card p-4 h-100">
                <h6
                  className="fw-bold text-muted mb-4"
                  style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
                >
                  Thông tin liên hệ
                </h6>

                <div className="d-flex align-items-center mb-4">
                  <div
                    className="me-3 bg-light text-primary rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Điện thoại
                    </div>
                    <span className="fw-bold text-dark">
                      {doctor.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div
                    className="me-3 bg-light text-danger rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <div>
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Email
                    </div>
                    <span
                      className="fw-bold text-dark"
                      style={{ wordBreak: "break-all" }}
                    >
                      {doctor.email || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div
                    className="me-3 bg-light text-success rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className="fa-regular fa-calendar-check"></i>
                  </div>
                  <div>
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      Ngày gia nhập
                    </div>
                    <span className="fw-bold text-dark">
                      {formatDate(doctor.createdAt)}
                    </span>
                  </div>
                </div>

                <hr className="text-muted opacity-25 my-4" />

                <button
                  className="btn btn-outline-danger w-100 fw-bold rounded-pill"
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fa-solid fa-lock me-2"></i> Khóa tài khoản
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEditModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          aria-labelledby="editDoctorModalLabel"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#f5f8fa",
                  borderRadius: "16px 16px 0 0",
                }}
              >
                <h5
                  className="modal-title fw-bold text-success"
                  id="editDoctorModalLabel"
                >
                  <i className="fa-solid fa-user-doctor me-2"></i> Cập nhật hồ
                  sơ
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={handleSubmitEdit}>
                  <h6 className="fw-bold mb-3 text-muted">
                    1. Thông tin Tài khoản
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Họ và Tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="VD: Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="VD: xx xxx xxx"
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-medium">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="VD: abc@xyz.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        disabled
                        readOnly
                        placeholder="username"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <hr className="text-muted" />

                  <h6 className="fw-bold mb-3 text-muted">
                    2. Hồ sơ chuyên môn
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Chuyên khoa <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn khoa ...</option>
                        {specialtySelectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Bằng cấp <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        placeholder="VD: Tiến sĩ"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Ảnh đại diện
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleInputChange}
                        placeholder="link url"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Giới thiệu tiểu sử
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Nhập kinh nghiệm làm việc, giới thiệu bản thân..."
                      ></textarea>
                    </div>
                  </div>

                  <div
                    className="modal-footer mt-4"
                    style={{
                      borderTop: "1px solid #eaedf1",
                      paddingTop: "1rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowEditModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary-custom"
                      disabled={saving}
                    >
                      {saving ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          aria-hidden="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div className="text-danger mb-3">
                  <i
                    className="fa-solid fa-circle-exclamation"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>

                <h5 className="fw-bold mb-2 text-dark">Xác nhận khóa?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Bạn có chắc chắn muốn khóa tài khoản bác sĩ này khỏi hệ thống?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 shadow-sm"
                    onClick={handleLockAccount}
                    disabled={locking}
                  >
                    {locking ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorDetailView;
