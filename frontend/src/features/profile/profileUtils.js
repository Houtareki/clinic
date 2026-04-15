export const API_BASE = "http://localhost:8080/api/profile";
export const ADMIN_API_BASE = "http://localhost:8080/api/admin";

export const createEmptyProfile = () => ({
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
});

export const createEmptyPasswordForm = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

export const getRoleLabel = (role) => {
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

export const formatProfileDate = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const normalizeProfileData = (data, fallback = createEmptyProfile()) => ({
  ...createEmptyProfile(),
  ...fallback,
  ...data,
  active:
    data?.active ?? data?.isActive ?? fallback.active ?? createEmptyProfile().active,
});

export const getProfileAvatar = (profile) => {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    profile.fullName || profile.username || "User",
  )}&background=0d6efd&color=fff&size=200`;

  return profile.avatarUrl && profile.avatarUrl.trim() !== ""
    ? profile.avatarUrl
    : fallbackAvatar;
};