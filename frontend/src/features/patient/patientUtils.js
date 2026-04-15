export const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

export const createInitialPatientForm = () => ({
  fullName: "",
  dateOfBirth: "",
  gender: "Nam",
  phone: "",
  address: "",
  medicalHistory: "",
  active: true,
});

export const normalizeDateInput = (value) => {
  if (!value) return "";

  const parts = String(value).split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  return String(value).slice(0, 10);
};

export const getPatientMeta = (patient) => {
  const parts = [];

  if (patient.age !== null && patient.age !== undefined) {
    parts.push(`${patient.age} tuổi`);
  }

  if (patient.gender) {
    parts.push(patient.gender);
  }

  return parts.length > 0 ? parts.join(", ") : "Chưa cập nhật";
};

export const getPatientAvatar = (patient) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    patient.fullName || "Bệnh nhân",
  )}&background=eaf7ed&color=264b33&size=120`;