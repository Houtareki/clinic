import {
  getDayDate,
  getDayName,
  hasShiftOnDate,
  SHIFT_TIME_LABELS,
} from "../../utils/doctorScheduleUtils";

function WeeklyScheduleGrid({ weekDays, shifts, isToday }) {
  return (
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
              style={date.getDay() === 0 ? { backgroundColor: "#fdf2f2" } : undefined}
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
              style={date.getDay() === 0 ? { backgroundColor: "#fdf2f2" } : undefined}
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
              style={date.getDay() === 0 ? { backgroundColor: "#fdf2f2" } : undefined}
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
  );
}

export default WeeklyScheduleGrid;
