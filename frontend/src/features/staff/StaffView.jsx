import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/staff-view.css";
import { useAuth } from "../../context/useAuth";

const ADMIN_API_BASE = "http://localhost:8080/api/admin";
const RECEPTIONIST_API_BASE = "http://localhost:8080/api/receptionist";

const isPresent = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
};

const pickFirstValue = (sources, keys, fallback = "") => {
  for (const source of sources) {
    if (!source) continue;

    for (const key of keys) {
      const value = source[key];

      if (isPresent(value)) {
        return value;
      }
    }
  }

  return fallback;
};

const normalizeDoctorRecord = (doctor) => {
  const sources = [
    doctor,
    doctor?.account,
    doctor?.user,
    doctor?.employee,
  ].filter(Boolean);

  return {
    ...doctor,
    id: pickFirstValue(
      sources,
      ["id", "doctorId", "accountId", "employeeId"],
      doctor?.id,
    ),
    role: "DOCTOR",
    fullName: pickFirstValue(sources, ["fullName", "name"], ""),
    phone: pickFirstValue(sources, ["phone", "phoneNumber"], ""),
    email: pickFirstValue(sources, ["email"], ""),
    username: pickFirstValue(sources, ["username"], ""),
    avatarUrl: pickFirstValue(sources, ["avatarUrl", "avatar"], ""),
    specialty: pickFirstValue(sources, ["specialty"], ""),
    degree: pickFirstValue(sources, ["degree"], ""),
    bio: pickFirstValue(sources, ["bio", "description"], ""),
  };
};

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

  const [formData, setFormData] = useState({
    role: "DOCTOR",
    username: "",
    password: "",
    fullName: "",
    phone: "",
    email: "",
    avatarUrl: "",
    specialty: "",
    degree: "",
    bio: "",
  });

  const fetchStaff = async () => {
    try {
      if (isReceptionist) {
        const doctorRes = await axios.get(`${RECEPTIONIST_API_BASE}/doctors`, {
          params: { page: 0, size: 100 },
        });

        setStaffList(
          (doctorRes.data.content || []).map((doctor) =>
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
        const doctorRes = await axios.get(`${ADMIN_API_BASE}/doctors`, {
          params: { page: 0, size: 100 },
        });

        setStaffList(
          (doctorRes.data.content || []).map((doctor) =>
            normalizeDoctorRecord(doctor),
          ),
        );
        return;
      }

      if (filterRole !== "ALL") {
        const employeeRes = await axios.get(`${ADMIN_API_BASE}/employees`, {
          params: { role: filterRole, page: 0, size: 100 },
        });
        setStaffList(employeeRes.data.content || []);
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

  const getFilterBtnClass = (role) =>
    `btn rounded-pill px-4 shadow-sm ${
      filterRole === role ? "btn-success" : "btn-outline-secondary"
    }`;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      setShowModal(false);
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
      setShowDeleteModal(false);
      fetchStaff();
    } catch (error) {
      console.error("Lỗi khi xóa nhân sự:", error);
      alert("Không thể xóa!");
    }
  };

  const openAddModal = (defaultRole = "DOCTOR") => {
    if (!canManageStaff) return;

    setModalMode("ADD");
    setSelectedStaff(null);
    setFormData({
      role: defaultRole,
      username: "",
      password: "",
      fullName: "",
      phone: "",
      email: "",
      avatarUrl: "",
      specialty: "",
      degree: "",
      bio: "",
    });
    setShowModal(true);
  };

  const openEditModal = (staff) => {
    if (!canManageStaff) return;

    setModalMode("EDIT");
    setSelectedStaff(staff);
    setFormData({
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

  const getRoleUI = (role) => {
    switch (role) {
      case "DOCTOR":
        return {
          name: "Bác sĩ",
          bg: "success",
          color: "264b33",
          hex: "eaf7ed",
        };
      case "RECEPTIONIST":
        return {
          name: "Lễ tân",
          bg: "primary",
          color: "4f46e5",
          hex: "eef2ff",
        };
      case "ADMIN":
        return {
          name: "Quản trị viên",
          bg: "danger",
          color: "e53e3e",
          hex: "fff5f5",
        };
      default:
        return {
          name: "Nhân viên",
          bg: "secondary",
          color: "000000",
          hex: "eeeeee",
        };
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
        <div
          className="d-flex gap-2 mb-4 overflow-auto pb-2"
          style={{ whiteSpace: "nowrap" }}
        >
          <button
            onClick={() => setFilterRole("ALL")}
            className={getFilterBtnClass("ALL")}
          >
            Tất cả
          </button>

          <button
            onClick={() => setFilterRole("DOCTOR")}
            className={getFilterBtnClass("DOCTOR")}
          >
            Bác sĩ
          </button>

          <button
            onClick={() => setFilterRole("RECEPTIONIST")}
            className={getFilterBtnClass("RECEPTIONIST")}
          >
            Lễ tân
          </button>

          <button
            onClick={() => setFilterRole("ADMIN")}
            className={getFilterBtnClass("ADMIN")}
          >
            Quản trị viên
          </button>
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 staff-view-grid">
        {filteredStaffList.map((staff) => {
          const role = staff.role || "DOCTOR";
          const roleUI = getRoleUI(role);
          const canOpenStaffDetail = Boolean(staff.id);
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            staff.fullName || "Nhan vien",
          )}&background=${roleUI.hex}&color=${roleUI.color}&size=120`;

          const avatarSrc =
            staff.avatarUrl && staff.avatarUrl.trim() !== ""
              ? staff.avatarUrl
              : fallbackAvatar;

          return (
            <div className="col" key={staff.id}>
              <div
                className={`doctor-card staff-card position-relative h-100 ${
                  openDropdownId === staff.id ? "staff-card-dropdown-open" : ""
                }`}
                onClick={() => {
                  if (!canOpenStaffDetail) return;

                  if (role === "DOCTOR") {
                    navigate(`/dashboard/doctors/${staff.id}`);
                    return;
                  }

                  navigate(`/dashboard/profile/${staff.id}`);
                }}
                style={{ cursor: canOpenStaffDetail ? "pointer" : "default" }}
              >
                {canManageStaff && (
                  <div
                    className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                    data-staff-dropdown-root
                    style={{ zIndex: 30 }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="action-btn border-0 bg-transparent p-1 dropdown-toggle dropdown-toggle-no-caret"
                      type="button"
                      aria-expanded={openDropdownId === staff.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenDropdownId((currentId) =>
                          currentId === staff.id ? null : staff.id,
                        );
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    <ul
                      className={`dropdown-menu dropdown-menu-end shadow-sm border-0 staff-action-menu ${
                        openDropdownId === staff.id ? "show" : ""
                      }`}
                    >
                      <li>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setOpenDropdownId(null);
                            openEditModal(staff);
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
                            setSelectedStaff(staff);
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
                      src={avatarSrc}
                      className="staff-avatar"
                      alt={staff.fullName}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackAvatar;
                      }}
                    />
                  </div>

                  <div className="doctor-info staff-card-info flex-grow-1">
                    <span
                      className={`badge staff-role-badge bg-${roleUI.bg} bg-opacity-10 text-${roleUI.bg} mb-2 border border-${roleUI.bg} border-opacity-25`}
                    >
                      {roleUI.name}
                    </span>

                    <h5 className="staff-card-name">{staff.fullName}</h5>

                    {role === "DOCTOR" && (
                      <div className="text-muted mb-1 staff-card-specialty">
                        {staff.specialty || "Khoa chung"}
                      </div>
                    )}

                    <div className="text-muted staff-card-contact">
                      <i className="fa-solid fa-envelope me-2"></i>
                      {staff.email || "Chưa cập nhật"}
                    </div>
                    <div className="text-muted staff-card-contact">
                      <i className="fa-solid fa-phone me-2"></i>
                      {staff.phone || "Chưa cập nhật"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStaffList.length === 0 && (
        <div className="text-center py-5 text-muted">
          Không có nhân sự phù hợp.
        </div>
      )}

      {canManageStaff && showModal && (
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
                      <i className="fa-solid fa-user-plus me-2"></i> Thêm nhân
                      sự
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-pen-to-square me-2"></i> Cập
                      nhật hồ sơ
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
                    1. Thông tin tài khoản
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-12">
                      <label className="form-label fw-medium">
                        Vai trò <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select border-success"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        disabled={modalMode === "EDIT"}
                      >
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="RECEPTIONIST">Lễ tân</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    </div>
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
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-medium">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {modalMode === "ADD" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Tên đăng nhập <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Mật khẩu <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {formData.role === "DOCTOR" && (
                    <div>
                      <hr className="text-muted" />
                      <h6 className="fw-bold mb-3 text-muted">
                        2. Hồ sơ chuyên môn (Dành cho bác sĩ)
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Chuyên khoa
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleInputChange}
                            placeholder="VD: Khoa Tim mach"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            Bằng cấp
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="degree"
                            value={formData.degree}
                            onChange={handleInputChange}
                            placeholder="VD: Tien si"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-medium">
                            Giới thiệu
                          </label>
                          <textarea
                            className="form-control"
                            rows="3"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="modal-footer mt-4 px-0 pb-0 border-top pt-3">
                    <button
                      type="button"
                      className="btn btn-light border"
                      onClick={() => setShowModal(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary-custom">
                      {modalMode === "ADD" ? "Lưu" : "Cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {canManageStaff && showDeleteModal && (
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
                  Bạn có chắc chắn muốn xóa
                  <strong>{selectedStaff?.fullName}</strong> khỏi hệ thống ?
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

export default StaffView;
