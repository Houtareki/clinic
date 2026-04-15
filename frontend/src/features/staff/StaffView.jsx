import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/staff-view.css";
import { useAuth } from "../../context/useAuth";
import StaffCard from "./StaffCard";
import StaffDeleteModal from "./components/StaffDeleteModal";
import StaffFilterTabs from "./components/StaffFilterTabs";
import StaffFormModal from "./components/StaffFormModal";
import {
  ADMIN_API_BASE,
  RECEPTIONIST_API_BASE,
  createInitialStaffForm,
  getRoleUI,
  normalizeDoctorRecord,
} from "./staffUtils";

const StaffView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isReceptionist = user?.role === "RECEPTIONIST";
  const canManageStaff = isAdmin;

  const [staffList, setStaffList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("ADD");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState(createInitialStaffForm);

  const fetchStaff = async () => {
    try {
      if (isReceptionist) {
        const response = await axios.get(`${RECEPTIONIST_API_BASE}/doctors`, {
          params: { page: 0, size: 100 },
        });

        setStaffList(
          (response.data.content || []).map((doctor) =>
            normalizeDoctorRecord(doctor),
          ),
        );
        return;
      }

      if (!isAdmin) {
        setStaffList([]);
        return;
      }

      if (filterRole === "DOCTOR") {
        const response = await axios.get(`${ADMIN_API_BASE}/doctors`, {
          params: { page: 0, size: 100 },
        });

        setStaffList(
          (response.data.content || []).map((doctor) =>
            normalizeDoctorRecord(doctor),
          ),
        );
        return;
      }

      if (filterRole !== "ALL") {
        const response = await axios.get(`${ADMIN_API_BASE}/employees`, {
          params: { role: filterRole, page: 0, size: 100 },
        });
        setStaffList(response.data.content || []);
        return;
      }

      const [employeeRes, doctorRes] = await Promise.all([
        axios.get(`${ADMIN_API_BASE}/employees`, {
          params: { page: 0, size: 100 },
        }),
        axios.get(`${ADMIN_API_BASE}/doctors`, {
          params: { page: 0, size: 100 },
        }),
      ]);

      const employees = employeeRes.data.content || [];
      const doctors = (doctorRes.data.content || []).map((doctor) =>
        normalizeDoctorRecord(doctor),
      );
      const doctorMap = new Map(doctors.map((doctor) => [doctor.id, doctor]));

      const mergedStaff = employees.map((staff) => {
        if (staff.role === "DOCTOR" && doctorMap.has(staff.id)) {
          const doctorInfo = doctorMap.get(staff.id);
          return {
            ...staff,
            role: "DOCTOR",
            specialty: doctorInfo.specialty,
            degree: doctorInfo.degree,
            bio: doctorInfo.bio,
          };
        }

        return staff;
      });

      setStaffList(mergedStaff);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân sự:", error);
    }
  };

  useEffect(() => {
    if (isReceptionist && filterRole !== "DOCTOR") {
      setFilterRole("DOCTOR");
    }
  }, [filterRole, isReceptionist]);

  useEffect(() => {
    fetchStaff();
  }, [filterRole, isAdmin, isReceptionist]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!event.target.closest("[data-staff-dropdown-root]")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const filteredStaffList = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return staffList;
    }

    return staffList.filter((staff) =>
      [staff.fullName, staff.email, staff.phone, staff.specialty, staff.degree]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedKeyword),
        ),
    );
  }, [keyword, staffList]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseFormModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedStaff(null);
  };

  const openAddModal = (defaultRole = "DOCTOR") => {
    if (!canManageStaff) return;

    setModalMode("ADD");
    setSelectedStaff(null);
    setFormData(createInitialStaffForm(defaultRole));
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    if (!canManageStaff) return;

    setModalMode("EDIT");
    setSelectedStaff(staff);
    setFormData({
      ...createInitialStaffForm(staff.role || "DOCTOR"),
      role: staff.role || "DOCTOR",
      username: staff.username || "",
      password: "",
      fullName: staff.fullName || "",
      phone: staff.phone || "",
      email: staff.email || "",
      avatarUrl: staff.avatarUrl || "",
      specialty: staff.specialty || "",
      degree: staff.degree || "",
      bio: staff.bio || "",
    });
    setShowModal(true);
  };

  const handleOpenStaffDetail = (staff) => {
    if (!staff?.id) return;

    if ((staff.role || "DOCTOR") === "DOCTOR") {
      navigate(`/dashboard/doctors/${staff.id}`);
      return;
    }

    navigate(`/dashboard/profile/${staff.id}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canManageStaff) return;

    try {
      if (modalMode === "ADD") {
        if (formData.role === "DOCTOR") {
          await axios.post(`${ADMIN_API_BASE}/doctors`, formData);
        } else {
          await axios.post(`${ADMIN_API_BASE}/employees`, formData);
        }
        alert("Thêm thành công!");
      } else {
        if (formData.role === "DOCTOR") {
          await axios.put(
            `${ADMIN_API_BASE}/doctors/${selectedStaff.id}`,
            formData,
          );
        } else {
          await axios.put(
            `${ADMIN_API_BASE}/employees/${selectedStaff.id}`,
            formData,
          );
        }
        alert("Cập nhật thành công!");
      }

      handleCloseFormModal();
      fetchStaff();
    } catch (error) {
      console.error("Lỗi khi lưu nhân sự:", error);
      alert(error.response?.data || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff || !canManageStaff) return;

    try {
      await axios.delete(`${ADMIN_API_BASE}/employees/${selectedStaff.id}`);
      handleCloseDeleteModal();
      fetchStaff();
    } catch (error) {
      console.error("Lỗi khi xóa nhân sự:", error);
      alert("Không thể xóa!");
    }
  };

  if (!isAdmin && !isReceptionist) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-warning mb-0">
          Bạn không có quyền truy cập quản lý nhân sự.
        </div>
      </div>
    );
  }

  const pageTitle = isReceptionist ? "Danh sách bác sĩ" : "Danh sách nhân sự";

  return (
    <div className="container-fluid p-4">
      <div className="staff-view-header">
        <div className="staff-view-header-main">
          <h4 className="fw-bold staff-view-title">{pageTitle}</h4>
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
              placeholder="Tim theo tên, email, số điện thoại..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          {canManageStaff && (
            <button
              className="btn btn-success shadow-sm"
              onClick={() => openAddModal()}
            >
              <i className="fa-solid fa-plus me-1"></i> Thêm nhân sự
            </button>
          )}
        </div>
      </div>

      {canManageStaff && (
        <StaffFilterTabs filterRole={filterRole} onChange={setFilterRole} />
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 staff-view-grid">
        {filteredStaffList.map((staff) => {
          const staffKey = staff.id || staff.email || staff.fullName;

          return (
            <StaffCard
              key={staffKey}
              staff={staff}
              roleUI={getRoleUI(staff.role || "DOCTOR")}
              canManageStaff={canManageStaff}
              isDropdownOpen={openDropdownId === staff.id}
              onToggleDropdown={() =>
                setOpenDropdownId((currentId) =>
                  currentId === staff.id ? null : staff.id,
                )
              }
              onOpenDetail={() => handleOpenStaffDetail(staff)}
              onEdit={() => {
                setOpenDropdownId(null);
                openEditModal(staff);
              }}
              onDelete={() => {
                setOpenDropdownId(null);
                setSelectedStaff(staff);
                setShowDeleteModal(true);
              }}
            />
          );
        })}
      </div>

      {filteredStaffList.length === 0 && (
        <div className="text-center py-5 text-muted">
          Không có nhân sự phù hợp.
        </div>
      )}

      {canManageStaff && showModal && (
        <StaffFormModal
          mode={modalMode}
          formData={formData}
          onChange={handleInputChange}
          onClose={handleCloseFormModal}
          onSubmit={handleSubmit}
        />
      )}

      {canManageStaff && showDeleteModal && (
        <StaffDeleteModal
          staff={selectedStaff}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StaffView;
