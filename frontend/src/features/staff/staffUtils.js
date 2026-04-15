export const ADMIN_API_BASE = "http://localhost:8080/api/admin";
export const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

export const STAFF_FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "DOCTOR", label: "Bác sĩ" },
  { value: "RECEPTIONIST", label: "Lễ tân" },
  { value: "ADMIN", label: "Quản trị viên" },
];

export const createInitialStaffForm = (role = "DOCTOR") => ({
  role,
  username: "",
  password: "",
  fullName: "",
  phone: "",
  email: "",
  avatarUrl: "",
  specialty: "",
  degree: "",
  bio: "",
});

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

export const normalizeDoctorRecord = (doctor) => {
  const sources = [
    doctor,
    doctor?.account,
    doctor?.user,
    doctor?.employee,
  ].filter(Boolean);

  return {
    ...doctor,
    id: pickFirstValue(
      sources,
      ["id", "accountId", "doctorId", "employeeId"],
      doctor?.id,
    ),
    accountId: pickFirstValue(
      sources,
      ["accountId", "id"],
      doctor?.accountId ?? doctor?.id,
    ),
    doctorId: pickFirstValue(
      sources,
      ["doctorId"],
      doctor?.doctorId,
    ),
    role: "DOCTOR",
    fullName: pickFirstValue(sources, ["fullName", "name"], ""),
    phone: pickFirstValue(sources, ["phone", "phoneNumber"], ""),
    email: pickFirstValue(sources, ["email"], ""),
    username: pickFirstValue(sources, ["username"], ""),
    avatarUrl: pickFirstValue(sources, ["avatarUrl", "avatar"], ""),
    specialty: pickFirstValue(sources, ["specialty"], ""),
    degree: pickFirstValue(sources, ["degree"], ""),
    bio: pickFirstValue(sources, ["bio", "description"], ""),
  };
};

export const getRoleUI = (role) => {
  switch (role) {
    case "DOCTOR":
      return {
        name: "Bác sĩ",
        bg: "success",
        color: "264b33",
        hex: "eaf7ed",
      };
    case "RECEPTIONIST":
      return {
        name: "Lễ tân",
        bg: "primary",
        color: "4f46e5",
        hex: "eef2ff",
      };
    case "ADMIN":
      return {
        name: "Quản trị viên",
        bg: "danger",
        color: "e53e3e",
        hex: "fff5f5",
      };
    default:
      return {
        name: "Nhân viên",
        bg: "secondary",
        color: "000000",
        hex: "eeeeee",
      };
  }
};

export const getStaffAvatar = (staff, roleUI) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    staff.fullName || "Nhan vien",
  )}&background=${roleUI.hex}&color=${roleUI.color}&size=120`;
