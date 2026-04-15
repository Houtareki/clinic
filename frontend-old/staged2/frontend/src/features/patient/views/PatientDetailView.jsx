import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/useAuth";
import "../styles/patient-detail.css";
import PatientAddRecordModal from "../components/detail/PatientAddRecordModal";
import PatientAppointmentEditModal from "../components/detail/PatientAppointmentEditModal";
import PatientConfirmModal from "../components/detail/PatientConfirmModal";
import PatientDetailHeader from "../components/detail/PatientDetailHeader";
import PatientEditModal from "../components/detail/PatientEditModal";
import PatientInfoCard from "../components/detail/PatientInfoCard";
import PatientRecordEditModal from "../components/detail/PatientRecordEditModal";
import PatientRecordsTable from "../components/detail/PatientRecordsTable";
import {
  createAddRecordForm,
  createEditAppointmentForm,
  createEditRecordForm,
  createEmptyPatientInfo,
  createInitialPatientForm,
  extractListItems,
  RECEPTIONIST_API_BASE,
  RECORD_API_BASE,
  toApiDate,
  toInputDate,
} from "../utils/patientDetailUtils";

const PatientDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isReceptionist = user?.role === "RECEPTIONIST";
  const isDoctor = user?.role === "DOCTOR";

  const canEditPatient = isReceptionist;
  const canDeletePatient = isReceptionist;
  const canCreateAppointment = isReceptionist;
  const canEditAppointment = isReceptionist;
  const canManageRecords = isDoctor;

  const [patient, setPatient] = useState(createEmptyPatientInfo);
  const [records, setRecords] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [openRecordDropdownId, setOpenRecordDropdownId] = useState(null);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showDeletePatientModal, setShowDeletePatientModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [showDeleteRecordModal, setShowDeleteRecordModal] = useState(false);
  const [savingPatient, setSavingPatient] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [patientForm, setPatientForm] = useState(createInitialPatientForm);
  const [addRecordForm, setAddRecordForm] = useState(createAddRecordForm);
  const [editAppointmentForm, setEditAppointmentForm] = useState(createEditAppointmentForm);
  const [editRecordForm, setEditRecordForm] = useState(createEditRecordForm);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadPatient = useCallback(async () => {
    const response = await axios.get(`${RECEPTIONIST_API_BASE}/patients/${id}`);
    const payload = response.data || {};

    setPatient({
      ...createEmptyPatientInfo(),
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
      setErrorText(error.response?.data || "Không thể tải thông tin bệnh nhân.");
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

  const handlePatientActiveChange = (event) => {
    setPatientForm((prev) => ({
      ...prev,
      active: event.target.value === "true",
    }));
  };

  const handleAddRecordFormChange = (event) => {
    const { name, value } = event.target;
    setAddRecordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAppointmentFormChange = (event) => {
    const { name, value } = event.target;
    setEditAppointmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditRecordFormChange = (event) => {
    const { name, value } = event.target;
    setEditRecordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEditAppointmentModal = (record) => {
    setSelectedRecord(record);
    setEditAppointmentForm({
      recordId: record.recordId || "",
      doctorId: record.doctorId ? String(record.doctorId) : "",
      symptoms: record.symptoms || "",
      note: record.note || "",
    });
    setShowEditAppointmentModal(true);
    setOpenRecordDropdownId(null);
  };

  const handleOpenEditRecordModal = (record) => {
    setSelectedRecord(record);
    setEditRecordForm({
      recordId: record.recordId || "",
      diagnosis: record.diagnosis || "",
      note: record.note || "",
      symptoms: record.symptoms || "",
      status:
        record.status === "Đã khám"
          ? "Hoàn thành"
          : record.status === "Huỷ"
            ? "Hủy"
            : record.status || "",
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
      setAddRecordForm(createAddRecordForm());
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

  const handleUpdateAppointment = async (event) => {
    event.preventDefault();
    if (!canEditAppointment || !editAppointmentForm.recordId) return;

    try {
      setSavingRecord(true);

      const payload = {
        doctor: {
          id: Number(editAppointmentForm.doctorId),
        },
        symptoms: editAppointmentForm.symptoms,
        note: editAppointmentForm.note,
      };

      await axios.put(`${RECORD_API_BASE}/${editAppointmentForm.recordId}`, payload);
      setShowEditAppointmentModal(false);
      setSelectedRecord(null);
      setEditAppointmentForm(createEditAppointmentForm());
      await loadRecords();
      alert("Cập nhật ca khám thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật ca khám:", error);
      alert(error.response?.data || "Không thể cập nhật ca khám.");
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
            <PatientDetailHeader
              patient={patient}
              patientId={id}
              isReceptionist={isReceptionist}
              onEditPatient={() => setShowEditPatientModal(true)}
              onAddRecord={() => setShowAddRecordModal(true)}
            />
          </div>

          <div className="col-lg-8">
            <PatientRecordsTable
              records={records}
              canManageRecords={canManageRecords}
              canEditAppointments={canEditAppointment}
              openRecordDropdownId={openRecordDropdownId}
              onToggleDropdown={(recordId) =>
                setOpenRecordDropdownId((currentId) =>
                  currentId === recordId ? null : recordId,
                )
              }
              onEditAppointment={handleOpenEditAppointmentModal}
              onEditRecord={handleOpenEditRecordModal}
              onDeleteRecord={handleOpenDeleteRecordModal}
            />
          </div>

          <div className="col-lg-4">
            <PatientInfoCard
              patient={patient}
              isReceptionist={isReceptionist}
              deletingPatient={deletingPatient}
              onDeletePatient={() => setShowDeletePatientModal(true)}
            />
          </div>
        </div>
      </div>

      {isReceptionist && showEditPatientModal && (
        <PatientEditModal
          patientForm={patientForm}
          savingPatient={savingPatient}
          onChange={handlePatientFormChange}
          onActiveChange={handlePatientActiveChange}
          onClose={() => setShowEditPatientModal(false)}
          onSubmit={handleUpdatePatient}
        />
      )}

      {isReceptionist && showAddRecordModal && (
        <PatientAddRecordModal
          doctorOptions={doctorOptions}
          formData={addRecordForm}
          savingRecord={savingRecord}
          onChange={handleAddRecordFormChange}
          onClose={() => setShowAddRecordModal(false)}
          onSubmit={handleCreateRecord}
        />
      )}

      {isReceptionist && showEditAppointmentModal && (
        <PatientAppointmentEditModal
          selectedRecord={selectedRecord}
          doctorOptions={doctorOptions}
          formData={editAppointmentForm}
          savingRecord={savingRecord}
          onChange={handleEditAppointmentFormChange}
          onClose={() => setShowEditAppointmentModal(false)}
          onSubmit={handleUpdateAppointment}
        />
      )}

      {isDoctor && showEditRecordModal && (
        <PatientRecordEditModal
          selectedRecord={selectedRecord}
          formData={editRecordForm}
          savingRecord={savingRecord}
          onChange={handleEditRecordFormChange}
          onClose={() => setShowEditRecordModal(false)}
          onSubmit={handleUpdateRecord}
        />
      )}

      {isDoctor && showDeleteRecordModal && (
        <PatientConfirmModal
          title="Xóa ca khám?"
          message="Bạn có chắc chắn muốn xóa ca khám này không?"
          processing={deletingRecord}
          onClose={() => setShowDeleteRecordModal(false)}
          onConfirm={handleDeleteRecord}
        />
      )}

      {isReceptionist && showDeletePatientModal && (
        <PatientConfirmModal
          title="Xác nhận xóa?"
          message="Bạn có chắc chắn muốn xóa bệnh nhân này khỏi hệ thống?"
          processing={deletingPatient}
          onClose={() => setShowDeletePatientModal(false)}
          onConfirm={handleDeletePatient}
        />
      )}
    </>
  );
};

export default PatientDetailView;
