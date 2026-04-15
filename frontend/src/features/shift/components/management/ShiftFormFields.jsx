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
