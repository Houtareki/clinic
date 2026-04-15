import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/useAuth";
import DoctorWeeklySchedule from "../../shift/components/schedule/DoctorWeeklySchedule";
import DoctorAccountStatusModal from "../components/detail/DoctorAccountStatusModal";
import DoctorBioCard from "../components/detail/DoctorBioCard";
import DoctorContactCard from "../components/detail/DoctorContactCard";
import DoctorDetailHeader from "../components/detail/DoctorDetailHeader";
import DoctorEditModal from "../components/detail/DoctorEditModal";
import {
  ADMIN_API_BASE,
  RECEPTIONIST_API_BASE,
  buildDoctorRecord,
  extractListItems,
  createInitialDoctorForm,
  getDoctorRecordId,
} from "../utils/doctorDetailUtils";

const DoctorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageDoctor = user?.role === "ADMIN";

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [formData, setFormData] = useState(createInitialDoctorForm);

  const loadDoctor = useCallback(async () => {
    setLoading(true);
    setErrorText("");
    const doctorId = Number(id);
    const isAdminViewer = user?.role === "ADMIN";

    const requestConfigs = isAdminViewer
      ? [
          { type: "detail", url: `${ADMIN_API_BASE}/doctors/${id}` },
          { type: "doctor-list", url: `${ADMIN_API_BASE}/doctors`, params: { page: 0, size: 100 } },
          { type: "employee-list", url: `${ADMIN_API_BASE}/employees`, params: { page: 0, size: 100 } },
        ]
      : [
          { type: "detail", url: `${RECEPTIONIST_API_BASE}/doctors/${id}` },
          { type: "doctor-list", url: `${RECEPTIONIST_API_BASE}/doctors`, params: { page: 0, size: 100 } },
          { type: "fallback-detail", url: `${ADMIN_API_BASE}/doctors/${id}` },
          { type: "fallback-doctor-list", url: `${ADMIN_API_BASE}/doctors`, params: { page: 0, size: 100 } },
        ];

    const results = await Promise.allSettled(
      requestConfigs.map((config) => axios.get(config.url, { params: config.params })),
    );

    const matchedSources = [];
    let lastError = null;

    results.forEach((result, index) => {
      const config = requestConfigs[index];

      if (result.status !== "fulfilled") {
        lastError = result.reason;
        return;
      }

      const payload = result.value.data;

      if (config.type.includes("list")) {
        const matchedRecord = extractListItems(payload).find(
          (record) => getDoctorRecordId(record) === doctorId,
        );

        if (matchedRecord) {
          matchedSources.push(matchedRecord);
        }

        return;
      }

      if (payload) {
        matchedSources.push(payload);
      }
    });

    const mergedDoctor = buildDoctorRecord(doctorId, matchedSources);

    if (!mergedDoctor) {
      console.error("Loi khi tai chi tiet bac si:", lastError);
      setErrorText(
        lastError?.response?.data || "Khong the tai thong tin bac si tu he thong.",
      );
      setDoctor(null);
      setLoading(false);
      return;
    }

    setDoctor(mergedDoctor);
    setFormData({
      fullName: mergedDoctor.fullName || "",
      phone: mergedDoctor.phone || "",
      email: mergedDoctor.email || "",
      username: mergedDoctor.username || "",
      password: "",
      avatarUrl: mergedDoctor.avatarUrl || "",
      specialty: mergedDoctor.specialty || "",
      degree: mergedDoctor.degree || "",
      bio: mergedDoctor.bio || "",
    });
    setLoading(false);
  }, [id, user?.role]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    if (!canManageDoctor) return;

    setSaving(true);

    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        avatarUrl: formData.avatarUrl,
        specialty: formData.specialty,
        degree: formData.degree,
        bio: formData.bio,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await axios.put(`${ADMIN_API_BASE}/doctors/${id}`, payload);
      setShowEditModal(false);
      await loadDoctor();
      alert("Cập nhật hồ sơ bác sĩ thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật bác sĩ:", error);
      alert(error.response?.data || "Không thể cập nhật hồ sơ bác sĩ.");
    } finally {
      setSaving(false);
    }
  };

  const handleLockAccount = async () => {
    if (!canManageDoctor || !doctor?.active) return;

    setLocking(true);

    try {
      await axios.delete(`${ADMIN_API_BASE}/employees/${id}`);
      setShowDeleteModal(false);
      setDoctor((prev) =>
        prev
          ? {
              ...prev,
              active: false,
              isActive: false,
            }
          : prev,
      );
      alert("Khóa tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi khi khóa tài khoản:", error);
      alert(error.response?.data || "Không thể khóa tài khoản.");
    } finally {
      setLocking(false);
    }
  };

  const handleUnlockAccount = async () => {
    if (!canManageDoctor || doctor?.active) return;

    setLocking(true);

    try {
      await axios.put(`${ADMIN_API_BASE}/employees/${id}/unlock`);
      setShowDeleteModal(false);
      setDoctor((prev) =>
        prev
          ? {
              ...prev,
              active: true,
              isActive: true,
            }
          : prev,
      );
      alert("Mở khóa tài khoản thành công!");
    } catch (error) {
      console.error("Lỗi khi mở khóa tài khoản:", error);
      alert(error.response?.data || "Không thể mở khóa tài khoản.");
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return <div className="container-fluid p-4">Đang tải...</div>;
  }

  if (!doctor) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger mb-0">
          {errorText || "Không tìm thấy thông tin bác sĩ."}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid p-4">
        <a
          href="#"
          className="text-decoration-none text-muted mb-4 d-inline-block fw-bold back-link text-start w-100"
          onClick={(event) => {
            event.preventDefault();
            navigate(-1);
          }}
        >
          <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
        </a>

        <div className="row align-items-start g-4">
          <div className="col-12">
            <DoctorDetailHeader
              doctor={doctor}
              doctorId={id}
              canManageDoctor={canManageDoctor}
              onEdit={() => setShowEditModal(true)}
            />
          </div>

          <div className="col-lg-8">
            <DoctorWeeklySchedule
              doctorId={doctor.doctorId || doctor.id || id}
              viewerRole={user?.role || "RECEPTIONIST"}
              viewerId={Number(user?.accountId) || Number(doctor.accountId) || Number(doctor.id) || 1}
            />
            <DoctorBioCard doctor={doctor} />
          </div>

          <div className="col-lg-4">
            <DoctorContactCard
              doctor={doctor}
              canManageDoctor={canManageDoctor}
              locking={locking}
              onToggleStatus={() => setShowDeleteModal(true)}
            />
          </div>
        </div>
      </div>

      {canManageDoctor && showEditModal && (
        <DoctorEditModal
          formData={formData}
          saving={saving}
          onChange={handleInputChange}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleSubmitEdit}
        />
      )}

      {canManageDoctor && showDeleteModal && (
        <DoctorAccountStatusModal
          doctor={doctor}
          locking={locking}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={doctor?.active ? handleLockAccount : handleUnlockAccount}
        />
      )}
    </>
  );
};

export default DoctorDetailView;
