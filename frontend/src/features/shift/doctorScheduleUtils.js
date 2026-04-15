export const SHIFT_API = "/api/shifts";

export const SHIFT_TIME_LABELS = {
  morning: "08:00 - 12:00",
  afternoon: "13:00 - 17:00",
  evening: "17:00 - 21:00",
};

export const formatApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getWeekRange = (baseDate) => {
  const current = new Date(baseDate);
  current.setHours(0, 0, 0, 0);

  const monday = new Date(current);
  const dayIndex = (current.getDay() + 6) % 7;
  monday.setDate(current.getDate() - dayIndex);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  return {
    dates,
    startDate: formatApiDate(dates[0]),
    endDate: formatApiDate(dates[6]),
  };
};

export const getDayName = (date) => {
  const day = date.getDay();
  if (day === 0) return "CN";
  return `Thứ ${day + 1}`;
};

export const getDayDate = (date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;

export const getWeekRangeLabel = (weekDays) => {
  const formatShort = (date) =>
    `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

  return `${formatShort(weekDays[0])} - ${formatShort(weekDays[6])}`;
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeShiftDate = (shift) => {
  const raw = shift?.shiftDate || shift?.date || shift?.workDate;
  return raw ? String(raw).slice(0, 10) : "";
};

const normalizeShiftType = (shift) => {
  const raw = normalizeText(
    shift?.periodDisplay ||
      shift?.period ||
      shift?.shiftType ||
      shift?.type ||
      shift?.session ||
      shift?.name,
  );

  if (
    raw.includes("sang") ||
    raw.includes("morning") ||
    raw.includes("am") ||
    raw.includes("ca 1") ||
    raw.includes("08:00")
  ) {
    return "morning";
  }

  if (
    raw.includes("chieu") ||
    raw.includes("afternoon") ||
    raw.includes("pm") ||
    raw.includes("ca 2") ||
    raw.includes("13:00")
  ) {
    return "afternoon";
  }

  if (
    raw.includes("toi") ||
    raw.includes("night") ||
    raw.includes("evening") ||
    raw.includes("ca 3") ||
    raw.includes("18:00")
  ) {
    return "evening";
  }

  return "";
};

const normalizeDoctorId = (shift) =>
  Number(
    shift?.doctorId ??
      shift?.doctor?.id ??
      shift?.accountId ??
      shift?.userId ??
      shift?.doctorAccountId,
  );

const getShiftDoctorIds = (shift) => {
  const doctorIds = [];
  const directDoctorId = normalizeDoctorId(shift);

  if (Number.isFinite(directDoctorId)) {
    doctorIds.push(directDoctorId);
  }

  for (const room of shift?.rooms || []) {
    for (const doctor of room?.doctors || []) {
      const nestedDoctorId = Number(
        doctor?.doctorId ?? doctor?.id ?? doctor?.accountId,
      );

      if (Number.isFinite(nestedDoctorId)) {
        doctorIds.push(nestedDoctorId);
      }
    }
  }

  return [...new Set(doctorIds)];
};

const matchesDoctor = (shift, doctorId) => {
  const targetDoctorId = Number(doctorId);

  if (!Number.isFinite(targetDoctorId)) {
    return false;
  }

  return getShiftDoctorIds(shift).includes(targetDoctorId);
};

export const hasShiftOnDate = (shifts, date, type) => {
  const dateKey = formatApiDate(date);

  return shifts.some(
    (shift) =>
      normalizeShiftDate(shift) === dateKey &&
      normalizeShiftType(shift) === type,
  );
};

const toFiniteNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const getScheduleRequestHeaders = (doctorId, viewerRole, viewerId) => {
  const normalizedDoctorId = toFiniteNumber(doctorId);
  const normalizedViewerId = toFiniteNumber(viewerId);
  const normalizedViewerRole = String(viewerRole || "")
    .trim()
    .toUpperCase();

  if (
    normalizedViewerRole === "DOCTOR" &&
    normalizedDoctorId !== null &&
    normalizedViewerId === normalizedDoctorId
  ) {
    return {
      role: "DOCTOR",
      userId: normalizedViewerId,
    };
  }

  return {
    role: "RECEPTIONIST",
    userId: normalizedViewerId ?? normalizedDoctorId ?? 1,
  };
};

export const extractErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim() !== "") {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    typeof responseData.message === "string" &&
    responseData.message.trim() !== ""
  ) {
    return responseData.message;
  }

  return fallbackMessage;
};

export const filterDoctorShifts = (allShifts, doctorId) =>
  allShifts.filter((shift) => matchesDoctor(shift, doctorId));