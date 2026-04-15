import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/css/staff-view.css";
import { useAuth } from "../../context/useAuth";
import PatientCard from "./components/PatientCard";
import PatientDeleteModal from "./components/PatientDeleteModal";
import PatientFormModal from "./components/PatientFormModal";
import {
  RECEPTIONIST_API_BASE,
  createInitialPatientForm,
  normalizeDateInput,
} from "./patientUtils";

const PatientView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isReceptionist = user?.role === "RECEPTIONIST";
  const isDoctor = user?.role === "DOCTOR";
  const canViewPatients = isReceptionist || isDoctor;
  const canManagePatients = isReceptionist;

  const [patientList, setPatientList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("ADD");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState(createInitialPatientForm);

  const fetchPatients = async (searchValue = keyword) => {
    if (!canViewPatients) {
      setPatientList([]);
      return;
    }

    try {
      const response = await axios.get(`${RECEPTIONIST_API_BASE}/patients`, {
        params: {
          page: 0,
          size: 20,
          keyword: searchValue.trim() || undefined,
        },
      });

      const patients = response.data?.content || [];
      setPatientList(patients.filter((patient) => patient.active !== false));
    } catch (error) {
      console.error("Lỗi khi tải danh sách bệnh nhân:", error);
    }
  };

  useEffect(() => {
    if (!canViewPatients) return;
    fetchPatients();
  }, [canViewPatients]);

  useEffect(() => {
    if (!canViewPatients) return;

    const timer = setTimeout(() => {
      fetchPatients(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [canViewPatients, keyword]);

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

  const handleCloseFormModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPatient(null);
  };

  const openAddModal = () => {
    if (!canManagePatients) return;

    setModalMode("ADD");
    setSelectedPatient(null);
    setFormData(createInitialPatientForm());
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

      handleCloseFormModal();
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
      handleCloseDeleteModal();
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
            <button className="btn btn-success shadow-sm" onClick={openAddModal}>
              <i className="fa-solid fa-plus me-1"></i> Thêm bệnh nhân
            </button>
          )}
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 staff-view-grid">
        {patientList.map((patient) => {
          const patientKey = patient.patientId ?? patient.id;

          return (
            <PatientCard
              key={patientKey}
              patient={patient}
              canManagePatients={canManagePatients}
              isDropdownOpen={openDropdownId === patientKey}
              onToggleDropdown={() =>
                setOpenDropdownId((currentId) =>
                  currentId === patientKey ? null : patientKey,
                )
              }
              onOpenDetail={() => navigate(`/dashboard/patients/${patientKey}`)}
              onEdit={() => {
                setOpenDropdownId(null);
                openEditModal(patient);
              }}
              onDelete={() => {
                setOpenDropdownId(null);
                setSelectedPatient(patient);
                setShowDeleteModal(true);
              }}
            />
          );
        })}
      </div>

      {patientList.length === 0 && (
        <div className="text-center py-5 text-muted">
          Không có bệnh nhân nào phù hợp.
        </div>
      )}

      {canManagePatients && showModal && (
        <PatientFormModal
          mode={modalMode}
          formData={formData}
          onChange={handleInputChange}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmit}
        />
      )}

      {canManagePatients && showDeleteModal && (
        <PatientDeleteModal
          patient={selectedPatient}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default PatientView;