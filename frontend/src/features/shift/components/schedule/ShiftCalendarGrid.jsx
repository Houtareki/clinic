import React from "react";
import {
  CALENDAR_HOURS,
  formatApiDate,
  getShiftDayShortLabel,
  getShiftPeriodTime,
} from "../../utils/shiftManagementUtils";

function ShiftCalendarGrid({
  weekDays,
  shiftBlocks,
  canOpenShiftDetail,
  onShiftSelect,
}) {
  return (
    <div className="calendar-grid">
      {weekDays.map((date, index) => (
        <div
          key={formatApiDate(date)}
          className="cal-header"
          style={{ gridColumn: index + 2, gridRow: 1 }}
        >
          <span className="day">{getShiftDayShortLabel(date)}</span>
          <span className="date">{date.getDate()}</span>
        </div>
      ))}

      {CALENDAR_HOURS.map((hour, index) => {
        const row = 2 + index * 2;

        return (
          <React.Fragment key={hour}>
            <div className="time-label" style={{ gridColumn: 1, gridRow: row }}>
              {String(hour).padStart(2, "0")}:00
            </div>
            <div className="grid-line" style={{ gridRow: row }}></div>
          </React.Fragment>
        );
      })}

      {shiftBlocks.map((shift) => (
        <div
          key={shift.shiftId}
          className={`shift-block border-cyan ${
            canOpenShiftDetail ? "shift-block-clickable" : ""
          }`}
          style={{
            gridColumn: shift.gridColumn,
            gridRow: shift.gridRow,
          }}
          onClick={
            canOpenShiftDetail ? () => onShiftSelect(shift.shiftId) : undefined
          }
        >
          <div className="shift-time">
            {shift.periodDisplay || getShiftPeriodTime(shift.period)}
          </div>

          <div className="shift-detail mb-1">
            <i className="fa-regular fa-clock me-1"></i>
            4h
          </div>

          <div className="shift-detail fw-bold text-dark mb-1">
            <i className="fa-solid fa-door-open me-1"></i>
            {shift.roomNames || "Chưa phân phòng"}
          </div>

          <div className="avatar-group pt-2">
            {shift.doctors.map((doctor) => (
              <img
                key={doctor.doctorId}
                src={
                  doctor.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    doctor.doctorName || "Doctor",
                  )}&background=random`
                }
                title={doctor.doctorName}
                alt={doctor.doctorName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ShiftCalendarGrid;
