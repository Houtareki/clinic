import React from "react";
import { PERIOD_OPTIONS } from "../../utils/shiftManagementUtils";
import ShiftAssignmentFields from "./ShiftAssignmentFields";

function ShiftFormFields({
  formData,
  canEdit,
  assignmentLabel,
  roomOptions,
  doctorOptions,
  doctorLookup,
  onFormChange,
  onRoomChange,
  onDoctorToggle,
  onAddAssignment,
  onRemoveAssignment,
}) {
  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label
            className="form-label text-muted fw-bold"
            style={{ fontSize: "0.85rem" }}
          >
            Ngày trực
          </label>
          <input
            type="date"
            className="form-control custom-input"
            name="shiftDate"
            value={formData.shiftDate}
            onChange={onFormChange}
            disabled={!canEdit}
          />
        </div>
        <div className="col-md-6">
          <label
            className="form-label text-muted fw-bold"
            style={{ fontSize: "0.85rem" }}
          >
            Ca làm việc
          </label>
          <select
            className="form-select custom-input"
            name="period"
            value={formData.period}
            onChange={onFormChange}
            disabled={!canEdit}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.key} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {canEdit && formData.isRecurring !== undefined && (
          <div className="col-12 mt-2 mb-3 p-3 bg-success bg-opacity-10 rounded border border-success border-opacity-25">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) =>
                  onFormChange({
                    target: { name: "isRecurring", value: e.target.checked },
                  })
                }
              />
              <label
                className="form-check-label fw-bold text-success"
                htmlFor="isRecurring"
              >
                <i className="fa-solid fa-repeat me-2"></i> Lặp lại hàng tuần
              </label>
            </div>

            {formData.isRecurring && (
              <div className="d-flex align-items-center mt-2 ps-4">
                <span
                  className="me-2 text-muted fw-medium"
                  style={{ fontSize: "0.85rem" }}
                >
                  Sinh lịch cho:
                </span>
                <input
                  type="number"
                  className="form-control form-control-sm border-success text-center fw-bold"
                  style={{ width: "70px" }}
                  name="recurringWeeks"
                  min="2"
                  max="12"
                  value={formData.recurringWeeks}
                  onChange={onFormChange}
                />
                <span
                  className="ms-2 text-muted fw-medium"
                  style={{ fontSize: "0.85rem" }}
                >
                  tuần liên tiếp
                </span>
              </div>
            )}
          </div>
        )}
        <div className="col-12">
          <label
            className="form-label text-muted fw-bold"
            style={{ fontSize: "0.85rem" }}
          >
            Ghi chú
          </label>
          <textarea
            className="form-control custom-input"
            rows="2"
            name="note"
            value={formData.note}
            onChange={onFormChange}
            disabled={!canEdit}
          ></textarea>
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <label
          className="form-label text-muted fw-bold mb-0"
          style={{ fontSize: "0.85rem" }}
        >
          {assignmentLabel}
        </label>

        {canEdit && (
          <button
            type="button"
            className="btn btn-primary-custom btn-sm"
            style={{ borderRadius: "25px" }}
            onClick={onAddAssignment}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        )}
      </div>

      {formData.assignments.map((assignment, index) => (
        <ShiftAssignmentFields
          key={assignment.assignmentId}
          assignment={assignment}
          index={index}
          canEdit={canEdit}
          canRemove={canEdit && formData.assignments.length > 1}
          roomOptions={roomOptions}
          doctorOptions={doctorOptions}
          doctorLookup={doctorLookup}
          onRoomChange={onRoomChange}
          onDoctorToggle={onDoctorToggle}
          onRemove={onRemoveAssignment}
        />
      ))}
    </>
  );
}

export default ShiftFormFields;
