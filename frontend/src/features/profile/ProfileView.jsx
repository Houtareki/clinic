import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/profile.css";

const API_BASE = "http://localhost:8080/api/profile";
const ADMIN_API_BASE = "http://localhost:8080/api/admin";

const PROFILE_INFO = {
  id: "",
  username: "",
  fullName: "",
  email: "",
  phone: "",
  role: "",
  avatarUrl: "",
  active: true,
  specialty: "",
  degree: "",
  bio: "",
  createdAt: "",
};

const PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getRoleLabel = (role) => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "DOCTOR":
      return "Bác sĩ";
    case "RECEPTIONIST":
      return "Lễ tân";
    default:
      return role || "Người dùng";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const normalizeProfileData = (data, fallback = PROFILE_INFO) => ({
  ...PROFILE_INFO,
  ...fallback,
  ...data,
  active:
    data?.active ?? data?.isActive ?? fallback.active ?? PROFILE_INFO.active,
});

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const filterInput = useRef(null);

  const [profile, setProfile] = useState(PROFILE_INFO);
  const [initialProfile, setInitialProfile] = useState(PROFILE_INFO);
  const [passwordForm, setPasswordForm] = useState(PASSWORD_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [locking, setLocking] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const currentUserId = useMemo(() => {
    const storedUser = getStoredUser();

    return (
      user?.id ||
      user?.accountId ||
      storedUser?.id ||
      storedUser?.accountId ||
      null
    );
  }, [user]);

  const targetUserId = useMemo(() => {
    if (id) return Number(id);
    return currentUserId;
  }, [id, currentUserId]);

  const isViewingOwnProfile = Number(targetUserId) === Number(currentUserId);
  const isDoctor = profile.role === "DOCTOR";
  const isAdminViewer = user?.role === "ADMIN";
  const isManagedEmployeeProfile =
    isAdminViewer && !isViewingOwnProfile && !isDoctor;
  const canChangePassword = isViewingOwnProfile || isManagedEmployeeProfile;
  const canLockAccount = isManagedEmployeeProfile;
  const roleLabel = getRoleLabel(profile.role);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/me`, {
        headers: {
          "X-User-Id": targetUserId,
        },
      });

      const normalized = normalizeProfileData(response.data);
      setProfile(normalized);
      setInitialProfile(normalized);
    } catch (error) {
      alert(error.response?.data || error.message || "Không tải được hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!targetUserId) return;
    fetchProfile();
  }, [targetUserId]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setPasswordForm(PASSWORD_FORM);
  };

  const getPasswordAction = () => {
    const hasPasswordInput =
      passwordForm.currentPassword ||
      passwordForm.newPassword ||
      passwordForm.confirmPassword;

    if (!canChangePassword || !hasPasswordInput) {
      return null;
    }

    if (isViewingOwnProfile) {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        throw new Error("Vui lòng nhập đầy đủ thông tin đổi mật khẩu");
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error("Xác nhận mật khẩu mới không khớp");
      }

      return {
        mode: "SELF",
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
    }

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      throw new Error("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu mới");
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      throw new Error("Xác nhận mật khẩu mới không khớp");
    }

    return {
      mode: "ADMIN_RESET",
      newPassword: passwordForm.newPassword,
    };
  };

  const updateProfile = async (passwordAction) => {
    const payload = {
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      ...(isDoctor
        ? {
            specialty: profile.specialty,
            degree: profile.degree,
            bio: profile.bio,
          }
        : {}),
      ...(passwordAction?.mode === "ADMIN_RESET"
        ? { password: passwordAction.newPassword }
        : {}),
    };

    const response = isManagedEmployeeProfile
      ? await axios.put(`${ADMIN_API_BASE}/employees/${targetUserId}`, payload)
      : await axios.put(`${API_BASE}/profile`, payload, {
          headers: {
            "X-User-Id": targetUserId,
          },
        });

    const normalized = normalizeProfileData(response.data, profile);
    setProfile(normalized);
    setInitialProfile(normalized);
  };

  const updatePassword = async (passwordAction) => {
    if (!passwordAction || passwordAction.mode !== "SELF") return;

    await axios.put(
      `${API_BASE}/change-password`,
      {
        currentPassword: passwordAction.currentPassword,
        newPassword: passwordAction.newPassword,
      },
      {
        headers: {
          "X-User-Id": targetUserId,
        },
      },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const passwordAction = getPasswordAction();
      await updateProfile(passwordAction);
      await updatePassword(passwordAction);
      setPasswordForm(PASSWORD_FORM);

      alert("Cập nhật hồ sơ thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      alert(error.response?.data || error.message || "Có lỗi xảy ra!");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE}/upload-avatar`, formData, {
        headers: {
          "X-User-Id": targetUserId,
          "Content-Type": "multipart/form-data",
        },
      });

      const avatarUrl =
        typeof response.data === "string"
          ? response.data
          : response.data?.avatarUrl || "";

      setProfile((prev) => ({
        ...prev,
        avatarUrl,
      }));

      setInitialProfile((prev) => ({
        ...prev,
        avatarUrl,
      }));
    } catch (error) {
      console.error("Lỗi khi tải ảnh đại diện:", error);
      alert(error.response?.data || "Không thể tải ảnh đại diện!");
    } finally {
      setUploadingAvatar(false);

      if (filterInput.current) {
        filterInput.current.value = "";
      }
    }
  };

  const handleLockAccount = async () => {
    if (!canLockAccount || !profile.active) return;

    try {
      setLocking(true);
      await axios.delete(`${ADMIN_API_BASE}/employees/${targetUserId}`);
      setShowLockModal(false);
      setProfile((prev) => ({ ...prev, active: false }));
      setInitialProfile((prev) => ({ ...prev, active: false }));
      alert("Khóa tài khoản thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi khóa tài khoản:", error);
      alert(error.response?.data || "Không thể khóa tài khoản!");
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="detail-card p-4 text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="mb-0">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.fullName || profile.username || "User",
  )}&background=0d6efd&color=fff&size=200`;

  const avatarSrc =
    profile.avatarUrl && profile.avatarUrl.trim() !== ""
      ? profile.avatarUrl
      : fallbackAvatar;

  return (
    <div className="container-fluid p-4">
      {!isViewingOwnProfile && (
        <a
          href="#"
          className="text-decoration-none text-muted mb-4 d-inline-block fw-bold"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
        </a>
      )}

      <h3 className="fw-bold mb-4">
        {isViewingOwnProfile ? "Thiết lập Tài khoản" : "Hồ sơ nhân viên"}
      </h3>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="detail-card p-4 text-center h-100 d-flex flex-column">
            <div className="mb-4 position-relative d-inline-block">
              <img
                src={avatarSrc}
                alt="Profile"
                className="profile-avatar-large"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackAvatar;
                }}
              />
            </div>

            <h4 className="fw-bold text-dark mb-1">
              {profile.fullName || "Chưa cập nhật"}
            </h4>
            <p className="text-muted mb-2">{roleLabel}</p>

            {isDoctor ? (
              <p className="text-muted small mb-4">
                Ngày gia nhập: {formatDate(profile.createdAt)}
              </p>
            ) : (
              <p className="text-muted small mb-4">
                Trạng thái: {profile.active ? "Đang hoạt động" : "Đã khóa"}
              </p>
            )}

            <div className="mt-auto pt-4">
              <div className="upload-btn-wrapper w-100 mb-3">
                <button
                  className="btn btn-light border fw-medium w-100"
                  type="button"
                  onClick={() => filterInput.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <i className="fa-solid fa-camera me-2"></i>
                  {uploadingAvatar ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
                </button>

                <input
                  ref={filterInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </div>

              {canLockAccount && (
                <button
                  className="btn btn-outline-danger w-100 fw-bold rounded-pill mb-3"
                  type="button"
                  onClick={() => setShowLockModal(true)}
                  disabled={locking || !profile.active}
                >
                  <i className="fa-solid fa-lock me-2"></i>
                  {profile.active ? "Khóa tài khoản" : "Tài khoản đã khóa"}
                </button>
              )}

              <p className="text-muted fs-7 mb-0">
                Cho phép định dạng JPG, GIF hoặc PNG. Kích thước tối đa 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="detail-card p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">
                <i className="fa-regular fa-address-card me-2"></i>
                Thông tin cơ bản
              </div>

              <div className="row g-4 mb-5">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-muted">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="fullName"
                    value={profile.fullName || ""}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium text-muted">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className="form-control profile-readonly-field"
                    value={profile.username || ""}
                    readOnly
                    aria-readonly="true"
                    title="Không thể đổi tên đăng nhập"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium text-muted">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium text-muted">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    name="email"
                    value={profile.email || ""}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              {isDoctor && (
                <>
                  <div className="form-section-title d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fa-solid fa-user-doctor me-2"></i>
                      Hồ sơ Chuyên môn
                    </div>
                    <span className="badge bg-warning text-dark fs-7">
                      Chỉ dành cho Bác sĩ
                    </span>
                  </div>

                  <div className="row g-4 mb-5">
                    <div className="col-md-6">
                      <label className="form-label fw-medium text-muted">
                        Chuyên khoa
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        name="specialty"
                        value={profile.specialty || ""}
                        onChange={handleProfileChange}
                        placeholder="Nhập chuyên khoa"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium text-muted">
                        Bằng cấp
                      </label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        name="degree"
                        value={profile.degree || ""}
                        onChange={handleProfileChange}
                        placeholder="Nhập bằng cấp"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium text-muted">
                        Giới thiệu bản thân (Bio)
                      </label>
                      <textarea
                        className="form-control bg-light"
                        rows="4"
                        name="bio"
                        value={profile.bio || ""}
                        onChange={handleProfileChange}
                        placeholder="Nhập phần giới thiệu bản thân"
                      ></textarea>
                    </div>
                  </div>
                </>
              )}

              {canChangePassword && (
                <>
                  <div className="form-section-title d-flex justify-content-between align-items-center">
                    <div>
                      <i className="fa-solid fa-shield-halved me-2"></i>
                      Bảo mật tài khoản
                    </div>
                    {isManagedEmployeeProfile && (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                        Đặt mật khẩu mới
                      </span>
                    )}
                  </div>

                  <div className="row g-4 mb-4">
                    {isViewingOwnProfile ? (
                      <div className="col-12">
                        <label className="form-label fw-medium text-muted">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          className="form-control bg-light"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                        />
                      </div>
                    ) : null}

                    <div className="col-md-6">
                      <label className="form-label fw-medium text-muted">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control bg-light"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium text-muted">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        className="form-control bg-light"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                </>
              )}

              <hr className="text-muted opacity-25 mt-5 mb-4" />

              <div className="d-flex justify-content-end gap-3">
                <button
                  type="button"
                  className="btn btn-light border px-4 fw-medium"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="btn btn-primary-custom px-5 fw-bold shadow-sm"
                  style={{ borderRadius: "8px" }}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {canLockAccount && showLockModal && (
        <div
          className="modal fade show d-block"
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
                  Bạn có chắc chắn muốn khóa tài khoản này khỏi hệ thống?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => setShowLockModal(false)}
                    disabled={locking}
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
    </div>
  );
};

export default ProfileView;
