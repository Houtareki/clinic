import React from "react";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/shifts.css";
import ShiftCalendarGrid from "./components/ShiftCalendarGrid";
import ShiftDrawer from "./components/ShiftDrawer";
import ShiftFormFields from "./components/ShiftFormFields";
import ShiftToolbar from "./components/ShiftToolbar";
import { useShiftManagement } from "./useShiftManagement";

function ShiftView() {
  const { user } = useAuth();
  const {
    isReceptionist,
    loading,
    saving,
    deleting,
    weekDays,
    weekRangeLabel,
    shiftBlocks,
    formData,
    roomOptions,
    availableDoctorOptions,
    doctorLookup,
    isCreateDrawerOpen,
    isEditDrawerOpen,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    updateWeek,
    handleFormChange,
    handleAssignmentRoomChange,
    handleAssignmentDoctorToggle,
    addAssignment,
    removeAssignment,
    handleCreateShift,
    handleUpdateShift,
    handleDeleteShift,
  } = useShiftManagement(user);

  return (
    <div className="container-fluid p-4">
      <ShiftToolbar
        isReceptionist={isReceptionist}
        weekRangeLabel={weekRangeLabel}
        onPreviousWeek={() => updateWeek(-7)}
        onNextWeek={() => updateWeek(7)}
      />

      {loading ? (
        <div className="text-center py-5">Đang tải lịch trực...</div>
      ) : (
        <ShiftCalendarGrid
          weekDays={weekDays}
          shiftBlocks={shiftBlocks}
          canOpenShiftDetail={isReceptionist}
          onShiftSelect={openEditDrawer}
        />
      )}

      {isReceptionist && (
        <button
          className="btn-floating-add"
          type="button"
          onClick={openCreateDrawer}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      )}

      <ShiftDrawer
        show={isCreateDrawerOpen}
        title="Thêm ca trực"
        confirmLabel={saving ? "Đang lưu..." : "Xác nhận"}
        confirmDisabled={saving}
        onConfirm={handleCreateShift}
        onClose={closeDrawer}
      >
        <ShiftFormFields
          formData={formData}
          canEdit
          assignmentLabel="Phân công bác sĩ theo phòng"
          roomOptions={roomOptions}
          doctorOptions={availableDoctorOptions}
          doctorLookup={doctorLookup}
          onFormChange={handleFormChange}
          onRoomChange={handleAssignmentRoomChange}
          onDoctorToggle={handleAssignmentDoctorToggle}
          onAddAssignment={addAssignment}
          onRemoveAssignment={removeAssignment}
        />
      </ShiftDrawer>

      <ShiftDrawer
        show={isEditDrawerOpen}
        title="Chi tiết ca trực"
        confirmLabel={saving ? "Đang lưu..." : "Xác nhận"}
        confirmDisabled={saving}
        onConfirm={handleUpdateShift}
        onClose={closeDrawer}
        onDelete={handleDeleteShift}
        deleteDisabled={deleting}
      >
        <ShiftFormFields
          formData={formData}
          canEdit={isReceptionist}
          assignmentLabel="Phân công bác sĩ"
          roomOptions={roomOptions}
          doctorOptions={availableDoctorOptions}
          doctorLookup={doctorLookup}
          onFormChange={handleFormChange}
          onRoomChange={handleAssignmentRoomChange}
          onDoctorToggle={handleAssignmentDoctorToggle}
          onAddAssignment={addAssignment}
          onRemoveAssignment={removeAssignment}
        />
      </ShiftDrawer>
    </div>
  );
}

export default ShiftView;
