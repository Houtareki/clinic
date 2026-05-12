import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import "../styles/shift.css";
import ShiftCalendarGrid from "../components/schedule/ShiftCalendarGrid";
import ShiftDrawer from "../components/management/ShiftDrawer";
import ShiftFormFields from "../components/management/ShiftFormFields";
import ShiftToolbar from "../components/management/ShiftToolbar";
import { useShiftManagement } from "../hooks/useShiftManagement";

function ShiftView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    if (searchParams.get("quickAction") !== "add-shift" || !isReceptionist) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      openCreateDrawer();
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.delete("quickAction");
        return nextParams;
      }, { replace: true });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isReceptionist, openCreateDrawer, searchParams, setSearchParams]);

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
