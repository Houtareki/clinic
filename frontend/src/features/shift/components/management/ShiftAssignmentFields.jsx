import React from "react";
import DoctorMultiSelect from "./DoctorMultiSelect";

function ShiftAssignmentFields({
  assignment,
  index,
  canEdit,
  canRemove,
  roomOptions,
  doctorOptions,
  doctorLookup,
  onRoomChange,
  onDoctorToggle,
  onRemove,
}) {
  return (
    <div className="border rounded-3 p-3 mb-3">
      <div className="mb-3">
        <label
          className="form-label text-muted fw-bold"
          style={{ fontSize: "0.85rem" }}
        >
          Phòng khám
        </label>
        <select
          className="form-select custom-input"
          value={assignment.roomId}
          onChange={(event) => onRoomChange(index, event.target.value)}
          disabled={!canEdit}
        >
          <option value="">Chọn phòng...</option>
          {roomOptions.map((room) => (
            <option key={room.roomId} value={room.roomId}>
              {room.roomName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label
          className="form-label text-muted fw-bold"
          style={{ fontSize: "0.85rem" }}
        >
          Bác sĩ phụ trách
        </label>

        <DoctorMultiSelect
          doctorOptions={doctorOptions}
          doctorLookup={doctorLookup}
          selectedDoctorIds={assignment.doctorIds}
          disabled={!canEdit}
          onToggleDoctor={(doctorId) => onDoctorToggle(index, doctorId)}
        />
      </div>

      {canRemove && (
        <div className="text-end">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onRemove(index)}
          >
            Xóa dòng này
          </button>
        </div>
      )}
    </div>
  );
}

export default ShiftAssignmentFields;
