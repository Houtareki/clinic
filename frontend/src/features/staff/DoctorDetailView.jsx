import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../../assets/css/doctor-detail.css";

import { useAuth } from "../../context/useAuth";
import DoctorWeeklySchedule from "../shift/DoctorWeeklySchedule";

const ADMIN_API_BASE = "http://localhost:8080/api/admin";
const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

const SPECIALTY_OPTIONS = [
  "Khoa noi",
  "Khoa ngoai",
  "Khoa nhi",
  "Khoa tim mach",
  "Khoa da lieu",
  "Khoa tai mui hong",
  "Khoa than kinh",
  "Khoa san",
  "Khoa mat",
];

const DATE_FIELD_CANDIDATES = [
  "createdAt",
  "createdDate",
  "joinedAt",
  "joinDate",
  "registeredAt",
];

const isPresent = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
};

const pickFirstValue = (sources, keys, fallback = "") => {
  for (const source of sources) {
    if (!source) continue;

    for (const key of keys) {
      const value = source[key];

      if (isPresent(value)) {
        return value;
      }
    }
  }

  return fallback;
};

const extractListItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const getRecordId = (record) =>
  Number(
    record?.id ?? record?.doctorId ?? record?.accountId ?? record?.employeeId,
  );

const buildDoctorRecord = (doctorId, sources) => {
  const availableSources = sources.filter(Boolean);

  if (availableSources.length === 0) {
    return null;
  }

  const firstSource = availableSources[0];

  return {
    ...firstSource,
    id: pickFirstValue(
      availableSources,
      ["id", "doctorId", "accountId"],
      doctorId,
    ),
    role: "DOCTOR",
    fullName: pickFirstValue(availableSources, ["fullName", "name"]),
    phone: pickFirstValue(availableSources, ["phone", "phoneNumber"]),
    email: pickFirstValue(availableSources, ["email"]),
    username: pickFirstValue(availableSources, ["username"]),
    avatarUrl: pickFirstValue(availableSources, ["avatarUrl", "avatar"]),
    specialty: pickFirstValue(availableSources, ["specialty"]),
    degree: pickFirstValue(availableSources, ["degree"]),
    bio: pickFirstValue(availableSources, ["bio", "description"]),
    createdAt: pickFirstValue(availableSources, DATE_FIELD_CANDIDATES, null),
    active: pickFirstValue(availableSources, ["active", "isActive"], true),
  };
};

const DoctorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageDoctor = user?.role === "ADMIN";

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
    const doctorId = Number(id);
    const isAdminViewer = user?.role === "ADMIN";

    const requestConfigs = isAdminViewer
      ? [
          { type: "detail", url: `${ADMIN_API_BASE}/doctors/${id}` },
          {
            type: "doctor-list",
            url: `${ADMIN_API_BASE}/doctors`,
            params: { page: 0, size: 100 },
          },
          {
            type: "employee-list",
            url: `${ADMIN_API_BASE}/employees`,
            params: { page: 0, size: 100 },
          },
        ]
      : [
          { type: "detail", url: `${RECEPTIONIST_API_BASE}/doctors/${id}` },
          {
            type: "doctor-list",
            url: `${RECEPTIONIST_API_BASE}/doctors`,
            params: { page: 0, size: 100 },
          },
          { type: "fallback-detail", url: `${ADMIN_API_BASE}/doctors/${id}` },
          {
            type: "fallback-doctor-list",
            url: `${ADMIN_API_BASE}/doctors`,
            params: { page: 0, size: 100 },
          },
        ];

    const results = await Promise.allSettled(
      requestConfigs.map((config) =>
        axios.get(config.url, { params: config.params }),
      ),
    );

    const matchedSources = [];
    let lastError = null;

    results.forEach((result, index) => {
      const config = requestConfigs[index];

      if (result.status !== "fulfilled") {
        lastError = result.reason;
        return;
      }

      const payload = result.value.data;

      if (config.type.includes("list")) {
        const matchedRecord = extractListItems(payload).find(
          (record) => getRecordId(record) === doctorId,
        );

        if (matchedRecord) {
          matchedSources.push(matchedRecord);
        }

        return;
      }

      if (payload) {
        matchedSources.push(payload);
      }
    });

    const mergedDoctor = buildDoctorRecord(doctorId, matchedSources);

    if (!mergedDoctor) {
      console.error("Loi khi tai chi tiet bac si:", lastError);
      setErrorText(
        lastError?.response?.data ||
          "Khong the tai thong tin bac si tu he thong.",
      );
      setDoctor(null);
      setLoading(false);
      return;
    }

    setDoctor(mergedDoctor);
    setFormData({
      fullName: mergedDoctor.fullName || "",
      phone: mergedDoctor.phone || "",
      email: mergedDoctor.email || "",
      username: mergedDoctor.username || "",
      password: "",
      avatarUrl: mergedDoctor.avatarUrl || "",
      specialty: mergedDoctor.specialty || "",
      degree: mergedDoctor.degree || "",
      bio: mergedDoctor.bio || "",
    });
    setLoading(false);
  }, [id, user?.role]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (!canManageDoctor) return;

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

      await axios.put(`${ADMIN_API_BASE}/doctors/${id}`, payload);
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
    if (!canManageDoctor || !doctor?.active) return;

    setLocking(true);

    try {
      await axios.delete(`${ADMIN_API_BASE}/employees/${id}`);
      setShowDeleteModal(false);

      setDoctor((prev) =>
        prev
          ? {
              ...prev,
              active: false,
              isActive: false,
            }
          : prev,
      );

      alert("Khóa tài khoản thành công!");
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

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctor?.fullName || "Doctor",
  )}&background=eaf7ed&color=264b33&size=120`;

  const avatarSrc =
    doctor?.avatarUrl && doctor.avatarUrl.trim() !== ""
      ? doctor.avatarUrl
      : fallbackAvatar;

  if (loading) {
    return <div className="container-fluid p-4">Đang tải...</div>;
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
          onClick={(event) => {
            event.preventDefault();
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
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackAvatar;
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
                    className="badge bg-light text-success border border-success-subtle px-3 py-2 rounded-pill text-start"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <i className="fa-solid fa-stethoscope me-1"></i>
                    {(doctor.degree || "Bác sĩ") +
                      " - " +
                      (doctor.specialty || "Chưa cập nhật")}
                  </div>
                </div>
              </div>

              {canManageDoctor && (
                <button
                  className="btn btn-light rounded-circle border shadow-sm"
                  style={{ width: "45px", height: "45px" }}
                  title="Chỉnh sửa hồ sơ"
                  type="button"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fa-solid fa-pen text-muted"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <DoctorWeeklySchedule
              doctorId={doctor.id || id}
              viewerRole={user?.role || "RECEPTIONIST"}
              viewerId={Number(user?.accountId) || Number(doctor.id) || 1}
            />

            <div className="detail-card p-4 doctor-bio-card text-start">
              <h6
                className="fw-bold text-muted mb-3 text-start"
                style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
              >
                Giới thiệu
              </h6>
              <p
                className="text-muted mb-0 text-start"
                style={{ fontSize: "0.95rem", lineHeight: 1.6 }}
              >
                {doctor.bio ||
                  "Hiện chưa có thông tin giới thiệu của bác sĩ này."}
              </p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="detail-card p-4 h-100 text-start">
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
                    {doctor.phone || "Chua cap nhat"}
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
                    {doctor.email || "Chua cap nhat"}
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

              {canManageDoctor && (
                <>
                  <hr className="text-muted opacity-25 my-4" />

                  <button
                    className="btn btn-outline-danger w-100 fw-bold rounded-pill"
                    type="button"
                    onClick={() => {
                      if (doctor?.active) {
                        setShowDeleteModal(true);
                      }
                    }}
                    disabled={locking || !doctor?.active}
                  >
                    <i className="fa-solid fa-lock me-2"></i>
                    {doctor?.active ? "Khóa tài khoản" : "Tài khoản đã khóa"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {canManageDoctor && showEditModal && (
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
                  <i className="fa-solid fa-user-doctor me-2"></i> Cap nhat ho
                  so
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
                        placeholder="VD: Nguyen Van A"
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
                        placeholder="........"
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
                        placeholder="VD: Tien si"
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
                      <label className="form-label fw-medium">Tiểu sử</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Nhap kinh nghiem lam viec, gioi thieu ban than..."
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
                      {saving ? "Dang luu..." : "Luu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {canManageDoctor && doctor?.active && showDeleteModal && (
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

                <h5 className="fw-bold mb-2 text-dark">Xac nhan khoa?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống ?
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
