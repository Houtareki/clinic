import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/shifts.css";

const SHIFT_API_BASE = "http://localhost:8080/api/shifts";
const DOCTOR_API_BASE = "http://localhost:8080/api/receptionist/doctors";
const ROOM_API_BASE = "http://localhost:8080/api/rooms";

const PERIOD_OPTIONS = [
  { value: "Sáng", label: "Ca sáng (08:00 - 12:00)", time: "08:00 - 12:00" },
  { value: "Chiều", label: "Ca chiều (13:00 - 17:00)", time: "13:00 - 17:00" },
];

const INITIAL_FORM = {
  shiftDate: "",
  period: "Sáng",
  note: "",
  assignments: [
    {
      roomId: "",
      doctorIds: [],
    },
  ],
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatIsoDate = (date) => {
  return date.toISOString().slice(0, 10);
};

const getMonday = (date) => {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const addDays = (date, days) => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
};

const getWeekDates = (weekStart) => {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

const getDayShort = (date) => {
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
};

const getPeriodGridRow = (period) => {
  if (String(period).toLowerCase().includes("chi")) {
    return "12 / 20";
  }

  return "2 / 10";
};

const flattenDoctors = (rooms = []) => {
  const map = new Map();

  rooms.forEach((room) => {
    (room.doctors || []).forEach((doctor) => {
      if (!map.has(doctor.doctorId)) {
        map.set(doctor.doctorId, doctor);
      }
    });
  });

  return Array.from(map.values());
};

const ShiftView = () => {
  const { user } = useAuth();
  const storedUser = getStoredUser();

  const userId =
    user?.id ||
    user?.accountId ||
    storedUser?.id ||
    storedUser?.accountId ||
    "";
  const userRole = user?.role || storedUser?.role || "";
  const isReceptionist = userRole === "RECEPTIONIST";

  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [shifts, setShifts] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(SHIFT_API_BASE, {
        params: {
          startDate: formatIsoDate(weekDates[0]),
          endDate: formatIsoDate(weekDates[6]),
        },
        headers: {
          "X-User-Role": userRole,
          "X-User-Id": userId,
        },
      });

      setShifts(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải lịch trực:", error);
      alert(error.response?.data || "Không thể tải lịch trực.");
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, weekDates]);

  const fetchDoctors = useCallback(async () => {
    if (!isReceptionist) return;

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
    if (!isReceptionist) return;

    try {
      const response = await axios.get(ROOM_API_BASE);
      setRoomOptions(response.data || []);
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

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM,
      shiftDate: formatIsoDate(weekDates[0]),
    });
  };

  const openAddPanel = () => {
    resetForm();
    setShowAddPanel(true);
  };

  const openEditPanel = async (shiftId) => {
    try {
      const response = await axios.get(`${SHIFT_API_BASE}/${shiftId}`, {
        headers: {
          "X-User-Role": userRole,
          "X-User-Id": userId,
        },
      });

      const shift = response.data;
      setSelectedShift(shift);

      setFormData({
        shiftDate: shift.shiftDate || "",
        period: shift.period || "Sáng",
        note: shift.note || "",
        assignments:
          (shift.rooms || []).map((room) => ({
            roomId: room.roomId,
            doctorIds: (room.doctors || []).map((doctor) => doctor.doctorId),
          })) || [],
      });

      setShowEditPanel(true);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết ca trực:", error);
      alert(error.response?.data || "Không thể tải chi tiết ca trực.");
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignmentRoomChange = (index, roomId) => {
    setFormData((prev) => {
      const nextAssignments = [...prev.assignments];
      nextAssignments[index] = {
        ...nextAssignments[index],
        roomId,
      };

      return {
        ...prev,
        assignments: nextAssignments,
      };
    });
  };

  const handleAssignmentDoctorsChange = (index, event) => {
    const doctorIds = Array.from(event.target.selectedOptions).map((option) =>
      Number(option.value),
    );

    setFormData((prev) => {
      const nextAssignments = [...prev.assignments];
      nextAssignments[index] = {
        ...nextAssignments[index],
        doctorIds,
      };

      return {
        ...prev,
        assignments: nextAssignments,
      };
    });
  };

  const addAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      assignments: [
        ...prev.assignments,
        {
          roomId: "",
          doctorIds: [],
        },
      ],
    }));
  };

  const removeAssignment = (index) => {
    setFormData((prev) => ({
      ...prev,
      assignments:
        prev.assignments.length === 1
          ? prev.assignments
          : prev.assignments.filter(
              (_, currentIndex) => currentIndex !== index,
            ),
    }));
  };

  const handleCreateShift = async () => {
    try {
      setSaving(true);

      const payload = {
        shiftDate: formData.shiftDate,
        period: formData.period,
        note: formData.note,
        assignments: formData.assignments
          .filter(
            (assignment) =>
              assignment.roomId &&
              Array.isArray(assignment.doctorIds) &&
              assignment.doctorIds.length > 0,
          )
          .map((assignment) => ({
            roomId: Number(assignment.roomId),
            doctorIds: assignment.doctorIds.map(Number),
          })),
      };

      await axios.post(SHIFT_API_BASE, payload, {
        headers: {
          "X-User-Role": userRole,
        },
      });

      setShowAddPanel(false);
      await fetchShifts();
      alert("Tạo ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo ca trực:", error);
      alert(error.response?.data || "Không thể tạo ca trực.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateShift = async () => {
    if (!selectedShift?.shiftId) return;

    try {
      setSaving(true);

      const payload = {
        shiftDate: formData.shiftDate,
        period: formData.period,
        note: formData.note,
        assignments: formData.assignments
          .filter(
            (assignment) =>
              assignment.roomId &&
              Array.isArray(assignment.doctorIds) &&
              assignment.doctorIds.length > 0,
          )
          .map((assignment) => ({
            roomId: Number(assignment.roomId),
            doctorIds: assignment.doctorIds.map(Number),
          })),
      };

      await axios.put(`${SHIFT_API_BASE}/${selectedShift.shiftId}`, payload, {
        headers: {
          "X-User-Role": userRole,
        },
      });

      setShowEditPanel(false);
      setSelectedShift(null);
      await fetchShifts();
      alert("Cập nhật ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật ca trực:", error);
      alert(error.response?.data || "Không thể cập nhật ca trực.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async () => {
    if (!selectedShift?.shiftId) return;

    try {
      setDeleting(true);

      await axios.delete(`${SHIFT_API_BASE}/${selectedShift.shiftId}`, {
        headers: {
          "X-User-Role": userRole,
        },
      });

      setShowEditPanel(false);
      setSelectedShift(null);
      await fetchShifts();
      alert("Xóa ca trực thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa ca trực:", error);
      alert(error.response?.data || "Không thể xóa ca trực.");
    } finally {
      setDeleting(false);
    }
  };

  const groupedShiftBlocks = shifts.map((shift) => {
    const shiftDate = new Date(shift.shiftDate);
    const jsDay = shiftDate.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

    const doctors = flattenDoctors(shift.rooms || []);
    const roomNames = (shift.rooms || [])
      .map((room) => room.roomName)
      .join(", ");

    return {
      ...shift,
      dayIndex,
      gridColumn: dayIndex + 2,
      gridRow: getPeriodGridRow(shift.period),
      roomNames,
      doctors,
    };
  });

  return (
    <div className="container-fluid p-4">
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
                onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>

              <span className="fw-bold px-2">
                {formatIsoDate(weekDates[0])} - {formatIsoDate(weekDates[6])}
              </span>

              <button
                className="btn btn-light border rounded-circle"
                style={{ width: "35px", height: "35px", padding: 0 }}
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Đang tải lịch trực...</div>
      ) : (
        <div className="calendar-grid">
          {weekDates.map((date, index) => (
            <div
              key={formatIsoDate(date)}
              className="cal-header"
              style={{ gridColumn: index + 2, gridRow: 1 }}
            >
              <span className="day">{getDayShort(date)}</span>
              <span className="date">{date.getDate()}</span>
            </div>
          ))}

          {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((hour, index) => {
            const row = 2 + index * 2;

            return (
              <React.Fragment key={hour}>
                <div
                  className="time-label"
                  style={{ gridColumn: 1, gridRow: row }}
                >
                  {String(hour).padStart(2, "0")}:00
                </div>
                <div className="grid-line" style={{ gridRow: row }}></div>
              </React.Fragment>
            );
          })}

          {groupedShiftBlocks.map((shift) => (
            <div
              key={shift.shiftId}
              className="shift-block border-cyan"
              style={{
                gridColumn: shift.gridColumn,
                gridRow: shift.gridRow,
                cursor: "pointer",
              }}
              onClick={() => openEditPanel(shift.shiftId)}
            >
              <div className="shift-time">
                {shift.periodDisplay ||
                  PERIOD_OPTIONS.find((item) => item.value === shift.period)
                    ?.time}
              </div>

              <div className="shift-detail mb-1">
                <i className="fa-regular fa-clock me-1"></i>
                {shift.period === "Chiều" ? "4h" : "4h"}
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
      )}

      {isReceptionist && (
        <button
          className="btn-floating-add"
          type="button"
          onClick={openAddPanel}
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      )}

      {isReceptionist && showAddPanel && (
        <div
          className="offcanvas offcanvas-end show shadow-lg"
          style={{
            width: "400px",
            borderLeft: "none",
            visibility: "visible",
            backgroundColor: "#fff",
          }}
        >
          <div
            className="offcanvas-header"
            style={{ borderBottom: "1px solid #eaedf1", padding: "20px 24px" }}
          >
            <h5
              className="offcanvas-title fw-bold"
              style={{ color: "#212529" }}
            >
              Thêm ca trực
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-primary-custom rounded-pill px-3 ms-auto"
              onClick={handleCreateShift}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Xác nhận"}
            </button>

            <button
              type="button"
              className="btn-close m-0"
              onClick={() => setShowAddPanel(false)}
            ></button>
          </div>

          <div
            className="offcanvas-body p-4"
            style={{ backgroundColor: "#ffffff" }}
          >
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
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
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
                  onChange={handleFormChange}
                ></textarea>
              </div>
            </div>

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <label
                className="form-label text-muted fw-bold mb-0"
                style={{ fontSize: "0.85rem" }}
              >
                Phân công bác sĩ theo phòng
              </label>

              <button
                type="button"
                className="btn btn-primary-custom btn-sm"
                style={{ borderRadius: "25px" }}
                onClick={addAssignment}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>

            {formData.assignments.map((assignment, index) => (
              <div key={index} className="border rounded-3 p-3 mb-3">
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
                    onChange={(event) =>
                      handleAssignmentRoomChange(index, event.target.value)
                    }
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
                  <select
                    multiple
                    className="form-select custom-input"
                    value={assignment.doctorIds.map(String)}
                    onChange={(event) =>
                      handleAssignmentDoctorsChange(index, event)
                    }
                    style={{ minHeight: "120px" }}
                  >
                    {doctorOptions.map((doctor) => {
                      const doctorId =
                        doctor.id || doctor.doctorId || doctor.accountId;

                      return (
                        <option key={doctorId} value={doctorId}>
                          {doctor.fullName}
                          {doctor.specialty ? ` - ${doctor.specialty}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {formData.assignments.length > 1 && (
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeAssignment(index)}
                    >
                      Xóa dòng này
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showEditPanel && (
        <div
          className="offcanvas offcanvas-end show shadow-lg"
          style={{
            width: "400px",
            borderLeft: "none",
            visibility: "visible",
            backgroundColor: "#fff",
          }}
        >
          <div
            className="offcanvas-header"
            style={{ borderBottom: "1px solid #eaedf1", padding: "20px 24px" }}
          >
            <h5
              className="offcanvas-title fw-bold"
              style={{ color: "#212529" }}
            >
              {isReceptionist ? "Chi tiết ca trực" : "Lịch trực của tôi"}
            </h5>

            {isReceptionist && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-dark rounded-pill px-3 ms-auto"
                  onClick={handleDeleteShift}
                  disabled={deleting}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-primary-custom rounded-pill px-3 ms-2"
                  onClick={handleUpdateShift}
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Xác nhận"}
                </button>
              </>
            )}

            <button
              type="button"
              className="btn-close m-0 ms-2"
              onClick={() => {
                setShowEditPanel(false);
                setSelectedShift(null);
              }}
            ></button>
          </div>

          <div
            className="offcanvas-body p-4"
            style={{ backgroundColor: "#ffffff" }}
          >
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
                  onChange={handleFormChange}
                  disabled={!isReceptionist}
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
                  onChange={handleFormChange}
                  disabled={!isReceptionist}
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
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
                  onChange={handleFormChange}
                  disabled={!isReceptionist}
                ></textarea>
              </div>
            </div>

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <label
                className="form-label text-muted fw-bold mb-0"
                style={{ fontSize: "0.85rem" }}
              >
                Phân công bác sĩ
              </label>

              {isReceptionist && (
                <button
                  type="button"
                  className="btn btn-primary-custom btn-sm"
                  style={{ borderRadius: "25px" }}
                  onClick={addAssignment}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              )}
            </div>

            {formData.assignments.map((assignment, index) => (
              <div key={index} className="border rounded-3 p-3 mb-3">
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
                    onChange={(event) =>
                      handleAssignmentRoomChange(index, event.target.value)
                    }
                    disabled={!isReceptionist}
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
                  <select
                    multiple
                    className="form-select custom-input"
                    value={assignment.doctorIds.map(String)}
                    onChange={(event) =>
                      handleAssignmentDoctorsChange(index, event)
                    }
                    disabled={!isReceptionist}
                    style={{ minHeight: "120px" }}
                  >
                    {doctorOptions.map((doctor) => {
                      const doctorId =
                        doctor.id || doctor.doctorId || doctor.accountId;

                      return (
                        <option key={doctorId} value={doctorId}>
                          {doctor.fullName}
                          {doctor.specialty ? ` - ${doctor.specialty}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {isReceptionist && formData.assignments.length > 1 && (
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeAssignment(index)}
                    >
                      Xóa dòng này
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftView;
