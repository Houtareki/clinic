import {
  extractErrorMessage,
  formatApiDate,
  getWeekRange,
  getWeekRangeLabel,
} from "./doctorScheduleUtils";

export {
  extractErrorMessage,
  formatApiDate,
  getWeekRange,
  getWeekRangeLabel,
};

export const SHIFT_API_BASE = "http://localhost:8080/api/shifts";
export const DOCTOR_API_BASE = "http://localhost:8080/api/receptionist/doctors";
export const ROOM_API_BASE = "http://localhost:8080/api/rooms";

export const PERIOD_OPTIONS = [
  {
    key: "morning",
    value: "Sáng",
    label: "Ca sáng (08:00 - 12:00)",
    time: "08:00 - 12:00",
  },
  {
    key: "afternoon",
    value: "Chiều",
    label: "Ca chiều (13:00 - 17:00)",
    time: "13:00 - 17:00",
  },
];

export const CALENDAR_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const DAY_SHORT_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

let assignmentIdSeed = 0;

export const normalizeShiftText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getShiftViewerContext = (user, storedUser = getStoredUser()) => {
  const userId =
    user?.id ||
    user?.accountId ||
    storedUser?.id ||
    storedUser?.accountId ||
    "";
  const userRole = user?.role || storedUser?.role || "";

  return {
    userId,
    userRole,
    isReceptionist: userRole === "RECEPTIONIST",
  };
};

export const shiftDateByDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const getShiftDayShortLabel = (date) => DAY_SHORT_LABELS[date.getDay()];

export const createEmptyAssignment = () => ({
  assignmentId: `assignment-${assignmentIdSeed++}`,
  roomId: "",
  doctorIds: [],
});

export const createInitialShiftForm = (shiftDate = "") => ({
  shiftDate,
  period: PERIOD_OPTIONS[0].value,
  note: "",
  assignments: [createEmptyAssignment()],
});

export const getDoctorOptionId = (doctor) =>
  Number(doctor?.doctorId ?? doctor?.id ?? doctor?.accountId);

export const getDoctorOptionName = (doctor) =>
  doctor?.fullName || doctor?.doctorName || doctor?.name || "";

export const getDoctorOptionLabel = (doctor) => {
  const doctorName = getDoctorOptionName(doctor) || "Bác sĩ";
  return doctor?.specialty ? `${doctorName} - ${doctor.specialty}` : doctorName;
};

export const buildDoctorLookup = (doctorOptions) =>
  new Map(
    doctorOptions
      .map((doctor) => {
        const doctorId = getDoctorOptionId(doctor);

        if (!Number.isFinite(doctorId)) {
          return null;
        }

        return [doctorId, { label: getDoctorOptionLabel(doctor) }];
      })
      .filter(Boolean),
  );

export const getDoctorSummary = (doctorIds, doctorLookup) => {
  const selectedLabels = doctorIds.map(
    (doctorId) =>
      doctorLookup.get(Number(doctorId))?.label || `Bác sĩ #${doctorId}`,
  );

  if (selectedLabels.length === 0) {
    return "Chọn bác sĩ...";
  }

  if (selectedLabels.length <= 2) {
    return selectedLabels.join(", ");
  }

  return `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;
};

export const getShiftPeriodKey = (period) => {
  const normalizedPeriod = normalizeShiftText(period);

  if (
    normalizedPeriod.includes("chieu") ||
    normalizedPeriod.includes("afternoon") ||
    normalizedPeriod.includes("13:00")
  ) {
    return "afternoon";
  }

  return "morning";
};

export const normalizeShiftPeriodValue = (period) =>
  PERIOD_OPTIONS.find((option) => option.key === getShiftPeriodKey(period))
    ?.value || PERIOD_OPTIONS[0].value;

export const getShiftPeriodTime = (period) =>
  PERIOD_OPTIONS.find((option) => option.key === getShiftPeriodKey(period))
    ?.time || PERIOD_OPTIONS[0].time;

export const getShiftPeriodGridRow = (period) =>
  getShiftPeriodKey(period) === "afternoon" ? "12 / 20" : "2 / 10";

export const flattenShiftDoctors = (rooms = []) => {
  const doctorMap = new Map();

  rooms.forEach((room) => {
    (room.doctors || []).forEach((doctor) => {
      const doctorId = getDoctorOptionId(doctor);

      if (!Number.isFinite(doctorId) || doctorMap.has(doctorId)) {
        return;
      }

      doctorMap.set(doctorId, {
        ...doctor,
        doctorId,
        doctorName: doctor.doctorName || doctor.fullName || doctor.name,
      });
    });
  });

  return Array.from(doctorMap.values());
};

export const buildAvailableDoctorOptions = (doctorOptions, selectedShift) => {
  const doctorMap = new Map();

  const registerDoctor = (doctor) => {
    const doctorId = getDoctorOptionId(doctor);

    if (!Number.isFinite(doctorId)) {
      return;
    }

    doctorMap.set(doctorId, {
      ...doctorMap.get(doctorId),
      ...doctor,
    });
  };

  doctorOptions.forEach(registerDoctor);
  (selectedShift?.rooms || []).forEach((room) => {
    (room.doctors || []).forEach(registerDoctor);
  });

  return Array.from(doctorMap.values()).sort((firstDoctor, secondDoctor) =>
    getDoctorOptionName(firstDoctor).localeCompare(
      getDoctorOptionName(secondDoctor),
      "vi",
      { sensitivity: "base" },
    ),
  );
};

export const mapShiftToFormData = (shift) => {
  const assignments = (shift?.rooms || []).map((room) => ({
    assignmentId: `assignment-${assignmentIdSeed++}`,
    roomId: String(room.roomId ?? ""),
    doctorIds: (room.doctors || [])
      .map((doctor) => getDoctorOptionId(doctor))
      .filter((doctorId) => Number.isFinite(doctorId)),
  }));

  return {
    shiftDate: shift?.shiftDate ? String(shift.shiftDate).slice(0, 10) : "",
    period: normalizeShiftPeriodValue(
      shift?.periodDisplay || shift?.period || PERIOD_OPTIONS[0].value,
    ),
    note: shift?.note || "",
    assignments: assignments.length > 0 ? assignments : [createEmptyAssignment()],
  };
};

export const buildShiftPayload = (formData) => ({
  shiftDate: formData.shiftDate,
  period: formData.period,
  note: formData.note,
  assignments: formData.assignments
    .filter(
      (assignment) =>
        assignment.roomId &&
        Array.isArray(assignment.doctorIds) &&
        assignment.doctorIds.length > 0,
    )
    .map((assignment) => ({
      roomId: Number(assignment.roomId),
      doctorIds: assignment.doctorIds.map(Number),
    })),
});

export const buildShiftBlocks = (shifts) =>
  shifts.map((shift) => {
    const shiftDate = new Date(shift.shiftDate);
    const jsDay = shiftDate.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

    return {
      ...shift,
      dayIndex,
      gridColumn: dayIndex + 2,
      gridRow: getShiftPeriodGridRow(shift.periodDisplay || shift.period),
      roomNames: (shift.rooms || []).map((room) => room.roomName).join(", "),
      doctors: flattenShiftDoctors(shift.rooms || []),
    };
  });
