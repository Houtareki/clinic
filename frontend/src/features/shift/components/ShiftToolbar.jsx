import React from "react";

function ShiftToolbar({
  isReceptionist,
  weekRangeLabel,
  onPreviousWeek,
  onNextWeek,
}) {
  return (
    <div className="schedule-wrapper">
      <div className="schedule-toolbar">
        <div className="view-tabs">
          <span className="view-tab active">
            <i className="fa-regular fa-clock me-2"></i>
            {isReceptionist ? "Shifts view" : "Lịch trực của tôi"}
          </span>
        </div>

        <div className="d-flex gap-3 align-items-center">
          <button className="btn btn-light border fw-medium rounded-pill px-4">
            Week
          </button>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-light border rounded-circle"
              style={{ width: "35px", height: "35px", padding: 0 }}
              onClick={onPreviousWeek}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <span className="fw-bold px-2">{weekRangeLabel}</span>

            <button
              className="btn btn-light border rounded-circle"
              style={{ width: "35px", height: "35px", padding: 0 }}
              onClick={onNextWeek}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShiftToolbar;
