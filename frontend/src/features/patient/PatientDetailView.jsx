import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/patient-detail.css";

const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";
const RECORD_API_BASE = "http://localhost:8080/api/records";

const PATIENT_INFO = {
  patientId: "",
  fullName: "",
  gender: "",
  phone: "",
  address: "",
  medicalHistory: "",
  active: true,
  age: "",
  dateOfBirth: "",
  registeredAt: "",
};

const PATIENT_FORM = {
  fullName: "",
  phone: "",
  dateOfBirth: "",
  gender: "Nam",
  address: "",
  medicalHistory: "",
  active: true,
};

const ADD_RECORD_FORM = {
  doctorId: "",
  symptoms: "",
  note: "",
};

const EDIT_RECORD_FORM = {
  recordId: "",
  diagnosis: "",
  note: "",
  symptoms: "",
  status: "",
};

const extractListItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const toInputDate = (value) => {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
};

const toApiDate = (value) => {
  if (!value) return null;
  return value;
};

const splitDateTime = (value) => {
  if (!value) {
    return {
      date: "Chưa cập nhật",
      time: "",
    };
  }

  const [date, time] = String(value).split(" ");
  return {
    date: date || "Chưa cập nhật",
    time: time || "",
  };
};

const getStatusClassName = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("đã khám") ||
    normalized.includes("completed") ||
    normalized.includes("hoàn thành")
  ) {
    return "status-badge status-completed";
  }

  if (normalized.includes("huỷ") || normalized.includes("cancel")) {
    return "status-badge status-cancelled";
  }

  return "status-badge status-pending";
};

const PatientDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isReceptionist = user?.role === "RECEPTIONIST";
  const isDoctor = user?.role === "DOCTOR";

  const canEditPatient = isReceptionist;
  const canDeletePatient = isReceptionist;
  const canCreateAppointment = isReceptionist;
  const canManageRecords = isDoctor;

  const [patient, setPatient] = useState(PATIENT_INFO);
  const [records, setRecords] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [openRecordDropdownId, setOpenRecordDropdownId] = useState(null);

  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showDeletePatientModal, setShowDeletePatientModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false);

  const [savingPatient, setSavingPatient] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);

  const [patientForm, setPatientForm] = useState(PATIENT_FORM);
  const [addRecordForm, setAddRecordForm] = useState(ADD_RECORD_FORM);
  const [editRecordForm, setEditRecordForm] = useState(EDIT_RECORD_FORM);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fallbackAvatar = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        patient.fullName || "Patient",
      )}&background=eaf7ed&color=264b33&size=120`,
    [patient.fullName],
  );

  const loadPatient = useCallback(async () => {
    const response = await axios.get(`${RECEPTIONIST_API_BASE}/patients/${id}`);
    const payload = response.data || {};

    setPatient({
      ...PATIENT_INFO,
      ...payload,
    });

    setPatientForm({
      fullName: payload.fullName || "",
      phone: payload.phone || "",
      dateOfBirth: toInputDate(payload.dateOfBirth),
      gender: payload.gender || "Nam",
      address: payload.address || "",
      medicalHistory: payload.medicalHistory || "",
      active: payload.active ?? true,
    });
  }, [id]);

  const loadRecords = useCallback(async () => {
    const response = await axios.get(`${RECORD_API_BASE}/patient/${id}`);
    setRecords(extractListItems(response.data));
  }, [id]);

  const loadDoctors = useCallback(async () => {
    if (!isReceptionist) return;

    const response = await axios.get(`${RECEPTIONIST_API_BASE}/doctors`, {
      params: { page: 0, size: 100 },
    });

    setDoctorOptions(extractListItems(response.data));
  }, [isReceptionist]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorText("");

      await Promise.all([loadPatient(), loadRecords(), loadDoctors()]);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết bệnh nhân:", error);
      setErrorText(
        error.response?.data || "Không thể tải thông tin bệnh nhân.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadDoctors, loadPatient, loadRecords]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest("[data-record-dropdown-root]")) {
        setOpenRecordDropdownId(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handlePatientFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setPatientForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddRecordFormChange = (event) => {
    const { name, value } = event.target;

    setAddRecordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditRecordFormChange = (event) => {
    const { name, value } = event.target;

    setEditRecordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenEditRecordModal = (record) => {
    setSelectedRecord(record);
    setEditRecordForm({
      recordId: record.recordId || "",
      diagnosis: record.diagnosis || "",
      note: record.note || "",
      symptoms: record.symptoms || "",
      status: record.status || "",
    });
    setShowEditRecordModal(true);
    setOpenRecordDropdownId(null);
  };

  const handleOpenDeleteRecordModal = (record) => {
    setSelectedRecord(record);
    setShowDeleteRecordModal(true);
    setOpenRecordDropdownId(null);
  };

  const handleUpdatePatient = async (event) => {
    event.preventDefault();
    if (!canEditPatient) return;

    try {
      setSavingPatient(true);

      const payload = {
        fullName: patientForm.fullName,
        phone: patientForm.phone,
        dateOfBirth: toApiDate(patientForm.dateOfBirth),
        gender: patientForm.gender,
        address: patientForm.address,
        medicalHistory: patientForm.medicalHistory,
        active: patientForm.active,
      };

      await axios.put(`${RECEPTIONIST_API_BASE}/patients/${id}`, payload);
      setShowEditPatientModal(false);
      await loadPatient();
      alert("Cập nhật bệnh nhân thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật bệnh nhân:", error);
      alert(error.response?.data || "Không thể cập nhật bệnh nhân.");
    } finally {
      setSavingPatient(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!canDeletePatient || !patient?.active) return;

    try {
      setDeletingPatient(true);
      await axios.delete(`${RECEPTIONIST_API_BASE}/patients/${id}`);
      setShowDeletePatientModal(false);
      setPatient((prev) => ({ ...prev, active: false }));
      setPatientForm((prev) => ({ ...prev, active: false }));
      alert("Xóa bệnh nhân thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Lỗi khi xóa bệnh nhân:", error);
      alert(error.response?.data || "Không thể xóa bệnh nhân.");
    } finally {
      setDeletingPatient(false);
    }
  };

  const handleCreateRecord = async (event) => {
    event.preventDefault();
    if (!canCreateAppointment) return;

    try {
      setSavingRecord(true);

      const payload = {
        doctor: {
          id: Number(addRecordForm.doctorId),
        },
        symptoms: addRecordForm.symptoms,
        note: addRecordForm.note,
      };

      await axios.post(`${RECORD_API_BASE}/patient/${id}`, payload);

      setAddRecordForm(ADD_RECORD_FORM);
      setShowAddRecordModal(false);
      await loadRecords();

      alert("Tạo lịch khám thành công!");
    } catch (error) {
      console.error("Lỗi khi tạo lịch khám:", error);
      alert(
        error.response?.data ||
          "Không thể tạo lịch khám. Kiểm tra lại bác sĩ và ca trực.",
      );
    } finally {
      setSavingRecord(false);
    }
  };

  const handleUpdateRecord = async (event) => {
    event.preventDefault();
    if (!canManageRecords || !editRecordForm.recordId) return;

    try {
      setSavingRecord(true);

      const payload = {
        diagnosis: editRecordForm.diagnosis,
        note: editRecordForm.note,
        symptoms: editRecordForm.symptoms,
        status: editRecordForm.status,
      };

      await axios.put(`${RECORD_API_BASE}/${editRecordForm.recordId}`, payload);

      setShowEditRecordModal(false);
      setSelectedRecord(null);
      await loadRecords();

      alert("Cập nhật hồ sơ khám thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ khám:", error);
      alert(error.response?.data || "Không thể cập nhật hồ sơ khám.");
    } finally {
      setSavingRecord(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!canManageRecords || !selectedRecord?.recordId) return;

    try {
      setDeletingRecord(true);

      await axios.delete(`${RECORD_API_BASE}/${selectedRecord.recordId}`);

      setShowDeleteRecordModal(false);
      setSelectedRecord(null);
      await loadRecords();

      alert("Xóa lịch sử khám thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử khám:", error);
      alert(error.response?.data || "Không thể xóa lịch sử khám.");
    } finally {
      setDeletingRecord(false);
    }
  };

  if (loading) {
    return <div className="container-fluid p-4">Đang tải...</div>;
  }

  if (errorText) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger mb-0">{errorText}</div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-4 text-start">
        <a
          href="#"
          className="text-decoration-none text-muted mb-4 d-inline-block fw-bold back-link"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
        </a>

        <div className="row align-items-start g-4">
          <div className="col-12">
            <div className="detail-card p-4 d-flex align-items-center justify-content-between position-relative">
              <div className="d-flex align-items-center">
                <img
                  src={fallbackAvatar}
                  alt="Avatar"
                  className="profile-avatar me-4"
                />
                <div className="d-flex flex-column align-items-start text-start">
                  <div
                    className="text-primary fw-bold mb-1 text-start w-100"
                    style={{ fontSize: "0.85rem" }}
                  >
                    #PT-{String(patient.patientId || id).padStart(4, "0")}
                  </div>

                  <h3 className="fw-bold text-dark mb-2 text-start w-100">
                    {patient.fullName || "Chưa cập nhật"}
                  </h3>

                  <div
                    className="d-flex gap-4 text-muted text-start w-100"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <span>
                      <i className="fa-regular fa-calendar me-1"></i>
                      {patient.dateOfBirth || "Chưa cập nhật"}
                    </span>
                    <span>
                      <i className="fa-solid fa-venus-mars me-1"></i>
                      {patient.gender || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              {isReceptionist && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light rounded-circle border shadow-sm"
                    style={{ width: "45px", height: "45px" }}
                    title="Chỉnh sửa hồ sơ"
                    type="button"
                    onClick={() => setShowEditPatientModal(true)}
                  >
                    <i className="fa-solid fa-pen text-muted"></i>
                  </button>

                  <button
                    className="btn btn-primary-custom px-4 shadow-sm"
                    style={{ borderRadius: "8px" }}
                    type="button"
                    onClick={() => setShowAddRecordModal(true)}
                  >
                    <i className="fa-regular fa-calendar-plus me-2"></i>
                    Đặt lịch khám
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <div className="detail-card mb-4 p-0 overflow-hidden">
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="fw-bold text-dark mb-0">Lịch sử khám bệnh</h5>
              </div>

              <div className="p-0 table-responsive">
                <table className="table table-custom table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "25%", paddingLeft: "24px" }}>
                        Ngày khám
                      </th>
                      <th style={{ width: "25%" }}>Bác sĩ phụ trách</th>
                      <th style={{ width: "30%" }}>Chẩn đoán</th>
                      <th style={{ width: "15%", textAlign: "center" }}>
                        Trạng thái
                      </th>
                      {canManageRecords && (
                        <th style={{ width: "5%", textAlign: "center" }}></th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {records.length === 0 && (
                      <tr>
                        <td
                          colSpan={canManageRecords ? 5 : 4}
                          className="text-center text-muted py-4"
                        >
                          Chưa có lịch sử khám bệnh.
                        </td>
                      </tr>
                    )}

                    {records.map((record) => {
                      const { date, time } = splitDateTime(
                        record.examinedAt || record.createdAt,
                      );

                      return (
                        <tr key={record.recordId}>
                          <td style={{ paddingLeft: "24px" }}>
                            <div className="fw-bold">{date}</div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {time}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  record.doctorName || "Doctor",
                                )}&background=random`}
                                className="rounded-circle me-2"
                                width="32"
                                height="32"
                                alt={record.doctorName}
                              />
                              <div>
                                <div
                                  className="fw-bold text-dark"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {record.doctorName || "Chưa cập nhật"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="text-muted fst-italic">
                            {record.diagnosis ||
                              record.symptoms ||
                              "Chưa có chẩn đoán"}
                          </td>

                          <td className="text-center">
                            <span className={getStatusClassName(record.status)}>
                              {record.status || "Chưa cập nhật"}
                            </span>
                          </td>

                          {canManageRecords && (
                            <td className="text-center">
                              <div
                                className="dropdown"
                                data-record-dropdown-root
                              >
                                <button
                                  className="action-btn dropdown-toggle dropdown-toggle-no-caret"
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenRecordDropdownId((currentId) =>
                                      currentId === record.recordId
                                        ? null
                                        : record.recordId,
                                    );
                                  }}
                                >
                                  <i className="fa-solid fa-ellipsis-vertical"></i>
                                </button>

                                <ul
                                  className={`dropdown-menu dropdown-menu-end shadow-sm border-0 ${
                                    openRecordDropdownId === record.recordId
                                      ? "show"
                                      : ""
                                  }`}
                                >
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() =>
                                        handleOpenEditRecordModal(record)
                                      }
                                    >
                                      <i className="fa-solid fa-stethoscope me-2"></i>
                                      Cập nhật
                                    </button>
                                  </li>
                                  <li>
                                    <hr className="dropdown-divider" />
                                  </li>
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item text-danger"
                                      onClick={() =>
                                        handleOpenDeleteRecordModal(record)
                                      }
                                    >
                                      <i className="fa-regular fa-trash-can me-2"></i>
                                      Xóa
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="detail-card p-4 h-100 text-start">
              <h6
                className="fw-bold text-muted mb-4 text-start"
                style={{ fontSize: "0.85rem", textTransform: "uppercase" }}
              >
                Thông tin cơ bản
              </h6>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="me-3 bg-light text-primary rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
                >
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div className="text-start">
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Điện thoại
                  </div>
                  <span className="fw-bold text-dark">
                    {patient.phone || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="me-3 bg-light text-danger rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
                >
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div className="text-start">
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Địa chỉ
                  </div>
                  <span
                    className="fw-bold text-dark d-block"
                    style={{ wordBreak: "break-word" }}
                  >
                    {patient.address || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4">
                <div
                  className="me-3 bg-light text-success rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="text-start">
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Ngày đăng ký hệ thống
                  </div>
                  <span className="fw-bold text-dark">
                    {patient.registeredAt || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-items-start mb-4">
                <div
                  className="me-3 bg-light text-warning rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: "45px", height: "45px", fontSize: "1.1rem" }}
                >
                  <i className="fa-solid fa-notes-medical"></i>
                </div>
                <div className="text-start">
                  <div
                    className="text-muted"
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Tiền sử bệnh lý
                  </div>
                  <span
                    className="fw-bold text-dark d-block"
                    style={{ wordBreak: "break-word" }}
                  >
                    {patient.medicalHistory || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
              {isReceptionist && (
                <>
                  <hr className="text-muted opacity-25 my-4" />

                  <button
                    className="btn btn-outline-danger w-100 fw-bold rounded-pill"
                    type="button"
                    onClick={() => setShowDeletePatientModal(true)}
                    disabled={deletingPatient || !patient.active}
                  >
                    <i className="fa-solid fa-trash-can me-2"></i>
                    {patient.active ? "Xóa bệnh nhân" : "Bệnh nhân đã bị khóa"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isReceptionist && showEditPatientModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header text-start"
                style={{
                  backgroundColor: "#f5f8fa",
                  borderRadius: "16px 16px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold text-primary text-start w-100">
                  <i className="fa-regular fa-pen-to-square me-2"></i>
                  Cập nhật hồ sơ bệnh nhân
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditPatientModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-start">
                <form onSubmit={handleUpdatePatient}>
                  <h6 className="fw-bold mb-3 text-muted text-start">
                    1. Thông tin Hành chính
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Họ và Tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={patientForm.fullName}
                        onChange={handlePatientFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={patientForm.phone}
                        onChange={handlePatientFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Ngày sinh <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateOfBirth"
                        value={patientForm.dateOfBirth}
                        onChange={handlePatientFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Giới tính <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="gender"
                        value={patientForm.gender}
                        onChange={handlePatientFormChange}
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Địa chỉ liên hệ
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={patientForm.address}
                        onChange={handlePatientFormChange}
                      />
                    </div>
                  </div>

                  <hr className="text-muted opacity-25" />

                  <h6 className="fw-bold mb-3 text-muted text-start">
                    2. Thông tin Y tế
                  </h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Tiền sử bệnh lý
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="medicalHistory"
                        value={patientForm.medicalHistory}
                        onChange={handlePatientFormChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Trạng thái hồ sơ
                      </label>
                      <select
                        className="form-select"
                        name="active"
                        value={String(patientForm.active)}
                        onChange={(event) =>
                          setPatientForm((prev) => ({
                            ...prev,
                            active: event.target.value === "true",
                          }))
                        }
                      >
                        <option value="true">Đang hoạt động</option>
                        <option value="false">Đã khóa / Lưu trữ</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className="modal-footer mt-4"
                    style={{
                      borderTop: "1px solid #eaedf1",
                      paddingTop: "1rem",
                      paddingBottom: 0,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowEditPatientModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary-custom"
                      disabled={savingPatient}
                    >
                      {savingPatient ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReceptionist && showAddRecordModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header text-start"
                style={{
                  backgroundColor: "#f5f8fa",
                  borderRadius: "16px 16px 0 0",
                }}
              >
                <h5 className="modal-title fw-bold text-success text-start w-100">
                  <i className="fa-regular fa-calendar-plus me-2"></i>
                  Đặt lịch / Thêm ca khám mới
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddRecordModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-start">
                <form onSubmit={handleCreateRecord} className="text-start">
                  <h6 className="fw-bold mb-3 text-muted text-start">
                    1. Phân công bác sĩ
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Bác sĩ phụ trách <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="doctorId"
                        value={addRecordForm.doctorId}
                        onChange={handleAddRecordFormChange}
                        required
                      >
                        <option value="">Chọn bác sĩ...</option>
                        {doctorOptions.map((doctor) => (
                          <option
                            key={
                              doctor.id || doctor.doctorId || doctor.accountId
                            }
                            value={
                              doctor.id || doctor.doctorId || doctor.accountId
                            }
                          >
                            {doctor.fullName}
                            {doctor.specialty ? ` - ${doctor.specialty}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <hr className="text-muted opacity-25" />

                  <h6 className="fw-bold mb-3 text-muted text-start">
                    2. Tình trạng bệnh nhân
                  </h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium text-start d-block">
                        Triệu chứng / Lý do khám{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="symptoms"
                        value={addRecordForm.symptoms}
                        onChange={handleAddRecordFormChange}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium text-start d-block">
                        Ghi chú
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="note"
                        value={addRecordForm.note}
                        onChange={handleAddRecordFormChange}
                      ></textarea>
                    </div>
                  </div>

                  <div
                    className="modal-footer mt-4"
                    style={{
                      borderTop: "1px solid #eaedf1",
                      paddingTop: "1rem",
                      paddingBottom: 0,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowAddRecordModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success px-4 text-white fw-bold shadow-sm"
                      style={{ borderRadius: "8px" }}
                      disabled={savingRecord}
                    >
                      {savingRecord ? "Đang tạo..." : "Tạo lịch khám"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDoctor && showEditRecordModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header text-start"
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "16px 16px 0 0",
                  borderBottom: "2px solid #eaedf1",
                }}
              >
                <h5 className="modal-title fw-bold text-primary text-start w-100">
                  <i className="fa-solid fa-stethoscope me-2"></i>
                  Hồ sơ khám bệnh
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditRecordModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-start">
                <form onSubmit={handleUpdateRecord} className="text-start">
                  <div className="bg-light p-3 rounded-3 mb-4 border">
                    <div
                      className="row g-2 text-muted"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <div className="col-md-4">
                        <div className="fw-bold text-dark">Ngày khám:</div>
                        {selectedRecord?.examinedAt ||
                          selectedRecord?.createdAt ||
                          "Chưa cập nhật"}
                      </div>
                      <div className="col-md-4">
                        <div className="fw-bold text-dark">Bác sĩ:</div>
                        {selectedRecord?.doctorName || "Chưa cập nhật"}
                      </div>
                      <div className="col-12 mt-2">
                        <div className="fw-bold text-dark">
                          Triệu chứng ban đầu:
                        </div>
                        <span className="text-danger">
                          {selectedRecord?.symptoms || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 text-muted text-start">
                    Kết quả khám & chẩn đoán
                  </h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium text-start d-block">
                        Chẩn đoán <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="diagnosis"
                        value={editRecordForm.diagnosis}
                        onChange={handleEditRecordFormChange}
                        required
                      />
                    </div>

                    <div className="col-12 mt-3">
                      <label className="form-label fw-medium text-start d-block">
                        Ghi chú & kê đơn
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="note"
                        value={editRecordForm.note}
                        onChange={handleEditRecordFormChange}
                      ></textarea>
                    </div>

                    <div className="col-12 mt-3">
                      <label className="form-label fw-medium text-start d-block">
                        Triệu chứng
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="symptoms"
                        value={editRecordForm.symptoms}
                        onChange={handleEditRecordFormChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6 mt-3">
                      <label className="form-label fw-medium text-start d-block">
                        Cập nhật trạng thái
                      </label>
                      <select
                        className="form-select bg-light fw-medium border-success-subtle"
                        name="status"
                        value={editRecordForm.status}
                        onChange={handleEditRecordFormChange}
                      >
                        <option value="Đã khám">Đã khám</option>
                        <option value="Đang chờ">Đang chờ</option>
                        <option value="Huỷ">Huỷ</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className="modal-footer mt-4"
                    style={{
                      borderTop: "1px solid #eaedf1",
                      paddingTop: "1rem",
                      paddingBottom: 0,
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowEditRecordModal(false)}
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary-custom px-4"
                      disabled={savingRecord}
                    >
                      {savingRecord ? "Đang lưu..." : "Lưu kết quả khám"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDoctor && showDeleteRecordModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div className="text-danger mb-3">
                  <i
                    className="fa-solid fa-circle-exclamation"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>

                <h5 className="fw-bold mb-2 text-dark">Xóa ca khám?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Bạn có chắc chắn muốn xóa ca khám này không?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => setShowDeleteRecordModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 shadow-sm"
                    onClick={handleDeleteRecord}
                    disabled={deletingRecord}
                  >
                    {deletingRecord ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReceptionist && showDeletePatientModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div className="modal-body p-4 text-center">
                <div className="text-danger mb-3">
                  <i
                    className="fa-solid fa-circle-exclamation"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>

                <h5 className="fw-bold mb-2 text-dark">Xác nhận xóa?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Bạn có chắc chắn muốn xóa bệnh nhân này khỏi hệ thống?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => setShowDeletePatientModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 shadow-sm"
                    onClick={handleDeletePatient}
                    disabled={deletingPatient}
                  >
                    {deletingPatient ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDetailView;
