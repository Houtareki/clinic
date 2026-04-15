import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/profile.css";
import ProfileBasicSection from "./components/ProfileBasicSection";
import ProfileDoctorSection from "./components/ProfileDoctorSection";
import ProfileLockModal from "./components/ProfileLockModal";
import ProfilePasswordSection from "./components/ProfilePasswordSection";
import ProfileSidebarCard from "./components/ProfileSidebarCard";
import {
  ADMIN_API_BASE,
  API_BASE,
  createEmptyPasswordForm,
  createEmptyProfile,
  getRoleLabel,
  getStoredUser,
  normalizeProfileData,
} from "./profileUtils";

const ProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(createEmptyProfile);
  const [initialProfile, setInitialProfile] = useState(createEmptyProfile);
  const [passwordForm, setPasswordForm] = useState(createEmptyPasswordForm);
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
    setPasswordForm(createEmptyPasswordForm());
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
      setPasswordForm(createEmptyPasswordForm());

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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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

  const handleUnlockAccount = async () => {
    if (!canLockAccount || profile.active) return;

    try {
      setLocking(true);
      await axios.put(`${ADMIN_API_BASE}/employees/${targetUserId}/unlock`);
      setShowLockModal(false);
      setProfile((prev) => ({ ...prev, active: true }));
      setInitialProfile((prev) => ({ ...prev, active: true }));
      alert("Mở khóa tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi khi mở khóa tài khoản:", error);
      alert(error.response?.data || "Không thể mở khóa tài khoản!");
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
          <ProfileSidebarCard
            profile={profile}
            roleLabel={roleLabel}
            isDoctor={isDoctor}
            uploadingAvatar={uploadingAvatar}
            canLockAccount={canLockAccount}
            locking={locking}
            fileInputRef={fileInputRef}
            onAvatarUpload={handleAvatarUpload}
            onOpenFilePicker={() => fileInputRef.current?.click()}
            onToggleLock={() => setShowLockModal(true)}
          />
        </div>

        <div className="col-lg-8">
          <div className="detail-card p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <ProfileBasicSection profile={profile} onChange={handleProfileChange} />
              <ProfileDoctorSection visible={isDoctor} profile={profile} onChange={handleProfileChange} />
              <ProfilePasswordSection
                canChangePassword={canChangePassword}
                isViewingOwnProfile={isViewingOwnProfile}
                isManagedEmployeeProfile={isManagedEmployeeProfile}
                passwordForm={passwordForm}
                onChange={handlePasswordChange}
              />

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
        <ProfileLockModal
          active={profile.active}
          locking={locking}
          onClose={() => setShowLockModal(false)}
          onConfirm={profile.active ? handleLockAccount : handleUnlockAccount}
        />
      )}
    </div>
  );
};

export default ProfileView;