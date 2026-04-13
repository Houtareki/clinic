import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";

const SHIFT_API = "/api/shifts";

const formatApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const SHIFT_TIME_LABELS = {
  morning: "08:00 - 12:00",
  afternoon: "13:00 - 17:00",
  evening: "17:00 - 21:00",
};

const getWeekRange = (baseDate) => {
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

const getDayName = (date) => {
  const day = date.getDay();
  if (day === 0) return "CN";
  return `Thứ ${day + 1}`;
};

const getDayDate = (date) =>
  `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;

const getWeekRangeLabel = (weekDays) => {
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

const parseApiDate = (value) => {
  if (!value) return null;

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
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

const hasShiftOnDate = (shifts, date, type) => {
  const dateKey = formatApiDate(date);

  return shifts.some(
    (shift) =>
      normalizeShiftDate(shift) === dateKey &&
      normalizeShiftType(shift) === type,
  );
};

const findNearestShiftDate = (shifts, referenceDate) => {
  const referenceTime = new Date(referenceDate).setHours(0, 0, 0, 0);

  return shifts.reduce((nearest, shift) => {
    const shiftDate = parseApiDate(normalizeShiftDate(shift));

    if (!shiftDate) {
      return nearest;
    }

    const distance = Math.abs(shiftDate.setHours(0, 0, 0, 0) - referenceTime);

    if (!nearest || distance < nearest.distance) {
      return {
        date: shiftDate,
        distance,
      };
    }

    return nearest;
  }, null);
};

const DoctorWeeklySchedule = ({
  doctorId,
  viewerRole = "RECEPTIONIST",
  viewerId = 1,
}) => {
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [noticeText, setNoticeText] = useState("");
  const [hasAnyDoctorShift, setHasAnyDoctorShift] = useState(null);
  const hasAutoJumpedRef = useRef(false);

  const now = useMemo(() => new Date(), []);
  const {
    dates: weekDays,
    startDate,
    endDate,
  } = useMemo(() => getWeekRange(baseDate), [baseDate]);

  const weekRangeLabel = useMemo(() => getWeekRangeLabel(weekDays), [weekDays]);

  const isToday = useCallback(
    (date) =>
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear(),
    [now],
  );

  useEffect(() => {
    hasAutoJumpedRef.current = false;
    setNoticeText("");
    setHasAnyDoctorShift(null);
    setBaseDate(new Date());
  }, [doctorId]);

  const loadShifts = useCallback(async () => {
    if (!doctorId) {
      setShifts([]);
      setErrorText("");
      setNoticeText("");
      setHasAnyDoctorShift(null);
      return;
    }

    setLoading(true);
    setErrorText("");

    try {
      const response = await axios.get(SHIFT_API, {
        params: { startDate, endDate },
        headers: {
          "X-User-Role": viewerRole,
          "X-User-Id": viewerId,
        },
      });

      const allShifts = Array.isArray(response.data) ? response.data : [];
      const doctorShifts = allShifts.filter((shift) =>
        matchesDoctor(shift, doctorId),
      );

      if (doctorShifts.length > 0) {
        setHasAnyDoctorShift(true);
      }

      if (doctorShifts.length === 0 && !hasAutoJumpedRef.current) {
        const searchStart = new Date(baseDate);
        const searchEnd = new Date(baseDate);
        searchStart.setFullYear(searchStart.getFullYear() - 1);
        searchEnd.setFullYear(searchEnd.getFullYear() + 1);

        const nearestResponse = await axios.get(SHIFT_API, {
          params: {
            startDate: formatApiDate(searchStart),
            endDate: formatApiDate(searchEnd),
          },
          headers: {
            "X-User-Role": viewerRole,
            "X-User-Id": viewerId,
          },
        });

        const nearbyShifts = Array.isArray(nearestResponse.data)
          ? nearestResponse.data.filter((shift) =>
              matchesDoctor(shift, doctorId),
            )
          : [];

        setHasAnyDoctorShift(nearbyShifts.length > 0);

        const nearestShift = findNearestShiftDate(nearbyShifts, baseDate);

        if (nearestShift) {
          hasAutoJumpedRef.current = true;
          setNoticeText("Đã chuyển đến tuần gần nhất có lịch trực.");
          setBaseDate(nearestShift.date);
          return;
        }
      }

      if (!hasAutoJumpedRef.current) {
        setNoticeText("");
      }
      setShifts(doctorShifts);
    } catch (error) {
      console.error("Lỗi khi tải lịch trực:", error);
      setErrorText(
        error.response?.data || "Không thể tải lịch trực của bác sĩ.",
      );
      setShifts([]);
      setHasAnyDoctorShift(null);
    } finally {
      setLoading(false);
    }
  }, [baseDate, doctorId, endDate, startDate, viewerId, viewerRole]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const goPrevWeek = () => {
    setNoticeText("");
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const goNextWeek = () => {
    setNoticeText("");
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  return (
    <div className="detail-card mb-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark mb-0">Lịch trực theo tuần</h5>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-light border rounded-circle"
            style={{ width: "35px", height: "35px", padding: 0 }}
            type="button"
            onClick={goPrevWeek}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <span
            className="fw-bold px-2 text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            {weekRangeLabel}
          </span>

          <button
            className="btn btn-light border rounded-circle"
            style={{ width: "35px", height: "35px", padding: 0 }}
            type="button"
            onClick={goNextWeek}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {noticeText ? (
        <div className="alert alert-info py-2 px-3 mb-3" role="status">
          {noticeText}
        </div>
      ) : null}

      <div className="weekly-schedule-wrapper mt-3">
        <div className="timetable-grid">
          <div className="time-col-header"></div>

          {weekDays.map((date) => {
            const sunday = date.getDay() === 0;
            const current = isToday(date);

            return (
              <div
                key={`header-${date.toISOString()}`}
                className={`day-header text-center ${current ? "current-day" : ""}`}
              >
                <div
                  className={`day-name ${
                    sunday ? "text-danger" : current ? "text-primary" : ""
                  }`}
                >
                  {getDayName(date)}
                </div>
                <div
                  className={`day-date ${
                    sunday ? "text-danger" : current ? "text-primary" : ""
                  }`}
                >
                  {getDayDate(date)}
                </div>
              </div>
            );
          })}

          <div className="shift-row-label bg-light-success text-success border-bottom">
            <i className="fa-regular fa-sun mb-1 fs-5"></i>
            <span>Ca sáng</span>
          </div>

          {weekDays.map((date) => {
            const active = hasShiftOnDate(shifts, date, "morning");

            return (
              <div
                key={`morning-${date.toISOString()}`}
                className="timetable-cell border-bottom d-flex align-items-center justify-content-center"
                style={
                  date.getDay() === 0
                    ? { backgroundColor: "#fdf2f2" }
                    : undefined
                }
              >
                {active ? (
                  <span className="badge bg-success-subtle text-success">
                    {SHIFT_TIME_LABELS.morning}
                  </span>
                ) : null}
              </div>
            );
          })}

          <div className="shift-row-label bg-light-warning text-warning-dark">
            <i className="fa-solid fa-cloud-sun mb-1 fs-5"></i>
            <span>Ca chiều</span>
          </div>

          {weekDays.map((date) => {
            const active = hasShiftOnDate(shifts, date, "afternoon");

            return (
              <div
                key={`afternoon-${date.toISOString()}`}
                className="timetable-cell d-flex align-items-center justify-content-center"
                style={
                  date.getDay() === 0
                    ? { backgroundColor: "#fdf2f2" }
                    : undefined
                }
              >
                {active ? (
                  <span className="badge bg-warning-subtle text-warning-emphasis">
                    {SHIFT_TIME_LABELS.afternoon}
                  </span>
                ) : null}
              </div>
            );
          })}

          <div className="shift-row-label bg-light-primary text-primary border-top">
            <i className="fa-regular fa-moon mb-1 fs-5"></i>
            <span>Ca tối</span>
          </div>

          {weekDays.map((date) => {
            const active = hasShiftOnDate(shifts, date, "evening");

            return (
              <div
                key={`evening-${date.toISOString()}`}
                className="timetable-cell border-top d-flex align-items-center justify-content-center"
                style={
                  date.getDay() === 0
                    ? { backgroundColor: "#fdf2f2" }
                    : undefined
                }
              >
                {active ? (
                  <span className="badge bg-primary-subtle text-primary">
                    {SHIFT_TIME_LABELS.evening}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>
        {loading
          ? "Đang tải lịch trực..."
          : errorText
            ? errorText
            : shifts.length > 0
              ? `Đã tải thành công.`
              : hasAnyDoctorShift === false
                ? "Bác sĩ này chưa được gán ca trực nào trong hệ thống."
                : "Bác sĩ chưa có lịch trực trong tuần đang xem."}
      </div>
    </div>
  );
};

export default DoctorWeeklySchedule;
