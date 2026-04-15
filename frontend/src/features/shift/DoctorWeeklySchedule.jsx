import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import WeeklyScheduleGrid from "./components/WeeklyScheduleGrid";
import {
  extractErrorMessage,
  filterDoctorShifts,
  getScheduleRequestHeaders,
  getWeekRange,
  getWeekRangeLabel,
  SHIFT_API,
} from "./doctorScheduleUtils";

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

  const now = useMemo(() => new Date(), []);
  const {
    dates: weekDays,
    startDate,
    endDate,
  } = useMemo(() => getWeekRange(baseDate), [baseDate]);
  const requestHeaders = useMemo(
    () => getScheduleRequestHeaders(doctorId, viewerRole, viewerId),
    [doctorId, viewerId, viewerRole],
  );
  const weekRangeLabel = useMemo(() => getWeekRangeLabel(weekDays), [weekDays]);

  const isToday = useCallback(
    (date) =>
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear(),
    [now],
  );

  useEffect(() => {
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
          "X-User-Role": requestHeaders.role,
          "X-User-Id": requestHeaders.userId,
        },
      });

      const allShifts = Array.isArray(response.data) ? response.data : [];
      const doctorShifts = filterDoctorShifts(allShifts, doctorId);

      setHasAnyDoctorShift(doctorShifts.length > 0);
      setNoticeText("");
      setShifts(doctorShifts);
    } catch (error) {
      console.error("Lỗi khi tải lịch trực:", error);
      setErrorText(
        extractErrorMessage(error, "Không thể tải lịch trực của bác sĩ."),
      );
      setShifts([]);
      setHasAnyDoctorShift(null);
    } finally {
      setLoading(false);
    }
  }, [doctorId, endDate, requestHeaders.role, requestHeaders.userId, startDate]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const updateWeek = (offset) => {
    setNoticeText("");
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
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
            onClick={() => updateWeek(-7)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <span className="fw-bold px-2 text-muted" style={{ fontSize: "0.9rem" }}>
            {weekRangeLabel}
          </span>

          <button
            className="btn btn-light border rounded-circle"
            style={{ width: "35px", height: "35px", padding: 0 }}
            type="button"
            onClick={() => updateWeek(7)}
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

      <WeeklyScheduleGrid weekDays={weekDays} shifts={shifts} isToday={isToday} />

      <div className="text-muted mt-3" style={{ fontSize: "0.9rem" }}>
        {loading
          ? "Đang tải lịch trực..."
          : errorText
            ? errorText
            : shifts.length > 0
              ? "Đã tải thành công."
              : hasAnyDoctorShift === false
                ? "Bác sĩ này chưa được gán ca trực nào trong hệ thống."
                : "Bác sĩ chưa có lịch trực trong tuần đang xem."}
      </div>
    </div>
  );
};

export default DoctorWeeklySchedule;