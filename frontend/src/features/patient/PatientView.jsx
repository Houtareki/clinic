import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/css/staff-view.css";
import { useAuth } from "../../context/useAuth";

const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

const PatientView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isReceptionist = user?.role === "RECEPTIONIST";
  const isDoctor = user?.role === "DOCTOR";
  const canViewPatients = isReceptionist || isDoctor;
  const canManagePatients = isReceptionist;

  const API_BASE = RECEPTIONIST_API_BASE;
  const [patientList, setPatientList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("ADD");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "Nam",
    phone: "",
    address: "",
    medicalHistory: "",
    active: true,
  });

  const normalizeDateInput = (value) => {
    if (!value) return "";

    const parts = String(value).split("/");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }

    return String(value).slice(0, 10);
  };

  const getPatientMeta = (patient) => {
    const parts = [];

    if (patient.age !== null && patient.age !== undefined) {
      parts.push(`${patient.age} tuổi`);
    }

    if (patient.gender) {
      parts.push(patient.gender);
    }

    return parts.length > 0 ? parts.join(", ") : "Chưa cập nhật";
  };

  const fetchPatients = async (searchValue = keyword) => {
    if (!canViewPatients) {
      setPatientList([]);
      return;
    }

    try {
      const patientRes = await axios.get(`${API_BASE}/patients`, {
        params: {
          page: 0,
          size: 20,
          keyword: searchValue.trim() || undefined,
        },
      });

      const patients = patientRes.data?.content || [];
      const activePatients = patients.filter(
        (patient) => patient.active !== false,
      );

      setPatientList(activePatients);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bệnh nhân:", error);
    }
  };

  useEffect(() => {
    if (!canViewPatients) return;
    fetchPatients();
  }, [canViewPatients, API_BASE]);

  useEffect(() => {
    if (!canViewPatients) return;

    const timer = setTimeout(() => {
      fetchPatients(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [canViewPatients, keyword, API_BASE]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest("[data-patient-dropdown-root]")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    if (!canManagePatients) return;

    setModalMode("ADD");
    setSelectedPatient(null);
    setFormData({
      fullName: "",
      dateOfBirth: "",
      gender: "Nam",
      phone: "",
      address: "",
      medicalHistory: "",
      active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    if (!canManagePatients) return;

    setModalMode("EDIT");
    setSelectedPatient(patient);
    setFormData({
      fullName: patient.fullName || "",
      dateOfBirth: normalizeDateInput(patient.dateOfBirth),
      gender: patient.gender || "Nam",
      phone: patient.phone || "",
      address: patient.address || "",
      medicalHistory: patient.medicalHistory || "",
      active: patient.active ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManagePatients) return;

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        medicalHistory: formData.medicalHistory.trim(),
        active: formData.active,
      };

      if (modalMode === "ADD") {
        await axios.post(`${RECEPTIONIST_API_BASE}/patients`, payload);
        alert("Thêm thành công!");
      } else {
        await axios.put(
          `${RECEPTIONIST_API_BASE}/patients/${selectedPatient.patientId}`,
          payload,
        );
        alert("Cập nhật thành công!");
      }

      setShowModal(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Lỗi khi lưu bệnh nhân:", error);
      alert(error.response?.data || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async () => {
    if (!selectedPatient || !canManagePatients) return;

    try {
      await axios.delete(
        `${RECEPTIONIST_API_BASE}/patients/${selectedPatient.patientId}`,
      );
      setShowDeleteModal(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Lỗi khi xóa bệnh nhân:", error);
      alert(error.response?.data || "Không thể xóa bệnh nhân này!");
    }
  };

  if (!canViewPatients) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning mb-0">
          Chỉ lễ tân hoặc bác sĩ mới có quyền xem danh sách bệnh nhân!
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="staff-view-header">
        <div className="staff-view-header-main">
          <h4 className="fw-bold mb-0">Danh sách bệnh nhân</h4>
        </div>

        <div className="staff-view-controls">
          <div className="position-relative staff-view-search">
            <i
              className="fa-solid fa-magnifying-glass text-muted position-absolute top-50 translate-middle-y"
              style={{ left: "14px" }}
            ></i>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Tim theo tên hoặc số điện thoại..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          {canManagePatients && (
            <button
              className="btn btn-success shadow-sm"
              onClick={openAddModal}
            >
              <i className="fa-solid fa-plus me-1"></i> Thêm bệnh nhân
            </button>
          )}
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 staff-view-grid">
        {patientList.map((patient) => {
          const patientKey = patient.patientId ?? patient.id;
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            patient.fullName || "Bệnh nhân",
          )}&background=eaf7ed&color=264b33&size=120`;

          return (
            <div className="col" key={patientKey}>
              <div
                className={`doctor-card staff-card position-relative h-100 ${
                  openDropdownId === patientKey
                    ? "staff-card-dropdown-open"
                    : ""
                }`}
                onClick={() => navigate(`/dashboard/patients/${patientKey}`)}
                style={{ cursor: "pointer" }}
              >
                {canManagePatients && (
                  <div
                    className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                    data-patient-dropdown-root
                    style={{ zIndex: 30 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="action-btn border-0 bg-transparent p-1 dropdown-toggle dropdown-toggle-no-caret"
                      type="button"
                      aria-expanded={openDropdownId === patientKey}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenDropdownId((currentId) =>
                          currentId === patientKey ? null : patientKey,
                        );
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    <ul
                      className={`dropdown-menu dropdown-menu-end shadow-sm border-0 staff-action-menu ${
                        openDropdownId === patientKey ? "show" : ""
                      }`}
                    >
                      <li>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setOpenDropdownId(null);
                            openEditModal(patient);
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square me-2 text-primary"></i>
                          Sửa
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => {
                            setOpenDropdownId(null);
                            setSelectedPatient(patient);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="fa-regular fa-trash-can me-2"></i>
                          Xóa
                        </button>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="d-flex gap-3 text-decoration-none text-dark align-items-start staff-card-body">
                  <div className="staff-avatar-box shadow-sm">
                    <img
                      src={fallbackAvatar}
                      className="staff-avatar"
                      alt={patient.fullName}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackAvatar;
                      }}
                    />
                  </div>

                  <div className="doctor-info staff-card-info flex-grow-1">
                    <span className="badge staff-role-badge bg-success bg-opacity-10 text-success mb-2 border border-success border-opacity-25">
                      Bệnh nhân
                    </span>

                    <h5 className="staff-card-name">{patient.fullName}</h5>

                    <div className="text-muted mb-1 staff-card-specialty">
                      {getPatientMeta(patient)}
                    </div>

                    <div className="text-muted staff-card-contact">
                      <i className="fa-solid fa-phone me-2"></i>
                      {patient.phone || "Chưa cập nhật"}
                    </div>

                    <div className="text-muted staff-card-contact">
                      <i className="fa-solid fa-location-dot me-2"></i>
                      {patient.address || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {patientList.length === 0 && (
        <div className="text-center py-5 text-muted">
          Không có bệnh nhân nào phù hợp.
        </div>
      )}

      {canManagePatients && showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "16px" }}
            >
              <div
                className="modal-header bg-light"
                style={{ borderRadius: "16px 16px 0 0" }}
              >
                <h5 className="modal-title fw-bold text-success">
                  {modalMode === "ADD" ? (
                    <>
                      <i className="fa-solid fa-user-plus me-2"></i>
                      Thêm bệnh nhân
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-pen-to-square me-2"></i>
                      Cập nhật hồ sơ
                    </>
                  )}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <h6 className="fw-bold mb-3 text-muted">
                    1. Thông tin cá nhân
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Họ và tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="VD: Nguyen Van A"
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
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
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
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        Số điện thoại <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="VD: 09xx xxxx xxx"
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-medium">
                        Địa chỉ <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="VD: Ha Noi"
                        required
                      />
                    </div>
                  </div>

                  <hr className="text-muted" />

                  <h6 className="fw-bold mb-3 text-muted">
                    2. Thông tin bổ sung
                  </h6>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">
                        Tiền sử bệnh án
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleInputChange}
                        placeholder="Nhap tien su benh neu co..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer mt-4 px-0 pb-0 border-top pt-3">
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary-custom">
                      {modalMode === "ADD" ? "Lưu bệnh nhân" : "Cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {canManagePatients && showDeleteModal && (
        <div
          className="modal fade show d-block"
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
                  Bạn có chắc chắn muốn xóa bệnh nhân{" "}
                  <strong>{selectedPatient?.fullName}</strong> khỏi hệ thống?
                </p>

                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 shadow-sm"
                    onClick={handleDelete}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
