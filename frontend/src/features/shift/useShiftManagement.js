import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  DOCTOR_API_BASE,
  ROOM_API_BASE,
  SHIFT_API_BASE,
  buildAvailableDoctorOptions,
  buildDoctorLookup,
  buildShiftBlocks,
  buildShiftPayload,
  createEmptyAssignment,
  createInitialShiftForm,
  extractErrorMessage,
  getShiftViewerContext,
  getStoredUser,
  getWeekRange,
  getWeekRangeLabel,
  mapShiftToFormData,
  shiftDateByDays,
} from "./shiftManagementUtils";

const DRAWER_MODES = {
  CREATE: "create",
  EDIT: "edit",
};

export const useShiftManagement = (user) => {
  const storedUser = getStoredUser();
  const { userId, userRole, isReceptionist } = getShiftViewerContext(
    user,
    storedUser,
  );

  const [baseDate, setBaseDate] = useState(() => new Date());
  const [shifts, setShifts] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeDrawer, setActiveDrawer] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  const { dates: weekDays, startDate, endDate } = useMemo(
    () => getWeekRange(baseDate),
    [baseDate],
  );
  const weekRangeLabel = useMemo(
    () => getWeekRangeLabel(weekDays),
    [weekDays],
  );

  const [formData, setFormData] = useState(() => createInitialShiftForm(startDate));

  const availableDoctorOptions = useMemo(
    () => buildAvailableDoctorOptions(doctorOptions, selectedShift),
    [doctorOptions, selectedShift],
  );
  const doctorLookup = useMemo(
    () => buildDoctorLookup(availableDoctorOptions),
    [availableDoctorOptions],
  );
  const shiftBlocks = useMemo(() => buildShiftBlocks(shifts), [shifts]);

  const isCreateDrawerOpen = activeDrawer === DRAWER_MODES.CREATE;
  const isEditDrawerOpen = activeDrawer === DRAWER_MODES.EDIT;

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(SHIFT_API_BASE, {
        params: { startDate, endDate },
        headers: {
          "X-User-Role": userRole,
          "X-User-Id": userId,
        },
      });

      setShifts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi tải lịch trực:", error);
      alert(extractErrorMessage(error, "Không thể tải lịch trực."));
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate, userId, userRole]);

  const fetchDoctors = useCallback(async () => {
    if (!isReceptionist) {
      setDoctorOptions([]);
      return;
    }

    try {
      const response = await axios.get(DOCTOR_API_BASE, {
        params: { page: 0, size: 100 },
      });

      setDoctorOptions(response.data?.content || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bác sĩ:", error);
    }
  }, [isReceptionist]);

  const fetchRooms = useCallback(async () => {
    if (!isReceptionist) {
      setRoomOptions([]);
      return;
    }

    try {
      const response = await axios.get(ROOM_API_BASE);
      setRoomOptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error);
    }
  }, [isReceptionist]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    fetchDoctors();
    fetchRooms();
  }, [fetchDoctors, fetchRooms]);

  const closeDrawer = useCallback(() => {
    setActiveDrawer(null);
    setSelectedShift(null);
  }, []);

  const openCreateDrawer = useCallback(() => {
    setSelectedShift(null);
    setFormData(createInitialShiftForm(startDate));
    setActiveDrawer(DRAWER_MODES.CREATE);
  }, [startDate]);

  const openEditDrawer = useCallback(
    async (shiftId) => {
      if (!isReceptionist) {
        return;
      }

      try {
        const response = await axios.get(`${SHIFT_API_BASE}/${shiftId}`, {
          headers: {
            "X-User-Role": userRole,
            "X-User-Id": userId,
          },
        });

        const shift = response.data;
        setSelectedShift(shift);
        setFormData(mapShiftToFormData(shift));
        setActiveDrawer(DRAWER_MODES.EDIT);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết ca trực:", error);
        alert(extractErrorMessage(error, "Không thể tải chi tiết ca trực."));
      }
    },
    [isReceptionist, userId, userRole],
  );

  const updateWeek = useCallback((offset) => {
    setBaseDate((currentDate) => shiftDateByDays(currentDate, offset));
  }, []);

  const handleFormChange = useCallback((event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const updateAssignment = useCallback((index, updater) => {
    setFormData((prev) => {
      const nextAssignments = [...prev.assignments];
      nextAssignments[index] = updater(nextAssignments[index]);

      return {
        ...prev,
        assignments: nextAssignments,
      };
    });
  }, []);

  const handleAssignmentRoomChange = useCallback(
    (index, roomId) => {
      updateAssignment(index, (assignment) => ({
        ...assignment,
        roomId,
      }));
    },
    [updateAssignment],
  );

  const handleAssignmentDoctorToggle = useCallback(
    (index, doctorId) => {
      updateAssignment(index, (assignment) => {
        const normalizedDoctorId = Number(doctorId);
        const currentDoctorIds = assignment.doctorIds || [];
        const nextDoctorIds = currentDoctorIds.includes(normalizedDoctorId)
          ? currentDoctorIds.filter(
              (currentDoctorId) => currentDoctorId !== normalizedDoctorId,
            )
          : [...currentDoctorIds, normalizedDoctorId];

        return {
          ...assignment,
          doctorIds: nextDoctorIds,
        };
      });
    },
    [updateAssignment],
  );

  const addAssignment = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      assignments: [...prev.assignments, createEmptyAssignment()],
    }));
  }, []);

  const removeAssignment = useCallback((index) => {
    setFormData((prev) => {
      if (prev.assignments.length === 1) {
        return prev;
      }

      return {
        ...prev,
        assignments: prev.assignments.filter(
          (_, currentIndex) => currentIndex !== index,
        ),
      };
    });
  }, []);

  const handleCreateShift = useCallback(async () => {
    try {
      setSaving(true);

      await axios.post(SHIFT_API_BASE, buildShiftPayload(formData), {
        headers: {
          "X-User-Role": userRole,
        },
      });

      closeDrawer();
      await fetchShifts();
      alert("Tạo ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo ca trực:", error);
      alert(extractErrorMessage(error, "Không thể tạo ca trực."));
    } finally {
      setSaving(false);
    }
  }, [closeDrawer, fetchShifts, formData, userRole]);

  const handleUpdateShift = useCallback(async () => {
    if (!selectedShift?.shiftId) {
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${SHIFT_API_BASE}/${selectedShift.shiftId}`,
        buildShiftPayload(formData),
        {
          headers: {
            "X-User-Role": userRole,
          },
        },
      );

      closeDrawer();
      await fetchShifts();
      alert("Cập nhật ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật ca trực:", error);
      alert(extractErrorMessage(error, "Không thể cập nhật ca trực."));
    } finally {
      setSaving(false);
    }
  }, [closeDrawer, fetchShifts, formData, selectedShift?.shiftId, userRole]);

  const handleDeleteShift = useCallback(async () => {
    if (!selectedShift?.shiftId) {
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(`${SHIFT_API_BASE}/${selectedShift.shiftId}`, {
        headers: {
          "X-User-Role": userRole,
        },
      });

      closeDrawer();
      await fetchShifts();
      alert("Xóa ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa ca trực:", error);
      alert(extractErrorMessage(error, "Không thể xóa ca trực."));
    } finally {
      setDeleting(false);
    }
  }, [closeDrawer, fetchShifts, selectedShift?.shiftId, userRole]);

  return {
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
  };
};
