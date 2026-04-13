import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../assets/css/doctor-detail.css";

import { useAuth } from "../../context/useAuth";
import DoctorWeeklySchedule from "../shift/DoctorWeeklySchedule";

const API_BASE = "http://localhost:8080/api/admin";
const SPECIALTY_OPTIONS = [
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

const DoctorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
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

  const specialtySelectOptions = useMemo(() => {
    if (!formData.specialty || SPECIALTY_OPTIONS.includes(formData.specialty)) {
      return SPECIALTY_OPTIONS;
    }

    return [formData.specialty, ...SPECIALTY_OPTIONS];
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

  const getDayName = (date) => {
    const day = date.getDay();
    if (day === 0) return "CN";
    return `Thứ ${day + 1}`;
  };

  const getDayDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

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
      <div className="container-fluid p-4">
        <a
          href="#"
          className="text-decoration-none text-muted mb-4 d-inline-block fw-bold back-link text-start w-100"
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
                <div className="d-flex flex-column align-items-start">
                  <div
                    className="text-primary fw-bold mb-1 text-start"
                    style={{ fontSize: "0.85rem" }}
                  >
                    #DT-{String(doctor.id || id).padStart(4, "0")}
                  </div>
                  <h3 className="fw-bold text-dark mb-2 text-start">
                    {doctor.fullName || "Chưa cập nhật"}
                  </h3>
                  <div
                    className="badge bg-light text-success border border-success-subtle px-3 py-2 rounded-pill  text-start"
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
            <DoctorWeeklySchedule
              doctorId={doctor.id || id}
              viewerRole={"RECEPTIONIST"}
              viewerId={Number(user?.accountId) || Number(doctor.id) || 1}
            />

            <div className="detail-card p-4 doctor-bio-card text-start">
              <h6
                className="fw-bold text-muted mb-3 text-start"
                style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
              >
                Giới thiệu (Bio)
              </h6>
              <p
                className="text-muted mb-0 text-start"
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
                    1. Thông tin tài khoản
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Họ và tên <span className="text-danger">*</span>
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
                        placeholder="VD: 09xx xxx xxx"
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
                        placeholder="Link URL"
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
