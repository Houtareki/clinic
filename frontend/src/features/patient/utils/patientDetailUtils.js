export const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";
export const RECORD_API_BASE = "http://localhost:8080/api/records";

export const createEmptyPatientInfo = () => ({
  patientId: "",
  fullName: "",
  gender: "",
  phone: "",
  address: "",
  medicalHistory: "",
  active: true,
  age: "",
  dateOfBirth: "",
  registeredAt: "",
});

export const createInitialPatientForm = () => ({
  fullName: "",
  phone: "",
  dateOfBirth: "",
  gender: "Nam",
  address: "",
  medicalHistory: "",
  active: true,
});

export const createAddRecordForm = () => ({
  doctorId: "",
  symptoms: "",
  note: "",
});

export const createEditAppointmentForm = () => ({
  recordId: "",
  doctorId: "",
  symptoms: "",
  note: "",
});

export const createEditRecordForm = () => ({
  recordId: "",
  diagnosis: "",
  note: "",
  symptoms: "",
  status: "",
});

export const extractListItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export const toInputDate = (value) => {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

export const toApiDate = (value) => {
  if (!value) return null;
  return value;
};

export const splitDateTime = (value) => {
  if (!value) {
    return {
      date: "Chưa cập nhật",
      time: "",
    };
  }

  const [date, time] = String(value).split(" ");
  return {
    date: date || "Chưa cập nhật",
    time: time || "",
  };
};

export const getStatusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("đã khám") ||
    normalized.includes("completed") ||
    normalized.includes("hoàn thành")
  ) {
    return "status-badge status-completed";
  }

  if (normalized.includes("huỷ") || normalized.includes("cancel")) {
    return "status-badge status-cancelled";
  }

  return "status-badge status-pending";
};

export const getPatientDetailAvatar = (patient) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    patient.fullName || "Patient",
  )}&background=eaf7ed&color=264b33&size=120`;
