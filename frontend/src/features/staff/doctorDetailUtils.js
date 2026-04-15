export const ADMIN_API_BASE = "http://localhost:8080/api/admin";
export const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

export const SPECIALTY_OPTIONS = [
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

export const extractListItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

export const getDoctorRecordId = (record) =>
  Number(
    record?.id ?? record?.doctorId ?? record?.accountId ?? record?.employeeId,
  );

export const buildDoctorRecord = (doctorId, sources) => {
  const availableSources = sources.filter(Boolean);

  if (availableSources.length === 0) {
    return null;
  }

  const firstSource = availableSources[0];

  return {
    ...firstSource,
    id: pickFirstValue(availableSources, ["id", "doctorId", "accountId"], doctorId),
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

export const createInitialDoctorForm = () => ({
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

export const formatDoctorDate = (value) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return date.toLocaleDateString("vi-VN");
};

export const getDoctorAvatar = (doctor) => {
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    doctor?.fullName || "Doctor",
  )}&background=eaf7ed&color=264b33&size=120`;

  return doctor?.avatarUrl && doctor.avatarUrl.trim() !== ""
    ? doctor.avatarUrl
    : fallbackAvatar;
};