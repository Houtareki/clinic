import React, { useEffect, useState } from "react";
import axios from "axios";

const StaffView = () => {
  const [staffList, setStaffList] = useState([]);
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

  const API_BASE = "http://localhost:8080/api/admin";

  // lấy ds nhân viên
  const fetchStaff = async () => {
    try {
      if (filterRole === "DOCTOR") {
        const doctorRes = await axios.get(`${API_BASE}/doctors`, {
          params: { page: 0, size: 20 },
        });
        setStaffList(doctorRes.data.content || []);
        return;
      }

      if (filterRole !== "ALL") {
        const employeeRes = await axios.get(`${API_BASE}/employees`, {
          params: { role: filterRole, page: 0, size: 20 },
        });
        setStaffList(employeeRes.data.content || []);
        return;
      }

      const [employeeRes, doctorRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`, {
          params: { page: 0, size: 20 },
        }),
        axios.get(`${API_BASE}/doctors`, {
          params: { page: 0, size: 20 },
        }),
      ]);

      const employees = employeeRes.data.content || [];
      const doctors = doctorRes.data.content || [];

      const doctorMap = new Map(doctors.map((doctor) => [doctor.id, doctor]));

      const mergedStaff = employees.map((staff) => {
        if (staff.role === "DOCTOR" && doctorMap.has(staff.id)) {
          const doctorInfo = doctorMap.get(staff.id);
          return {
            ...staff,
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
    fetchStaff();
  }, [filterRole]);

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

  const getFilterBtnClass = (role) =>
    `btn rounded-pill px-4 shadow-sm ${
      filterRole === role ? "btn-success" : "btn-outline-secondary"
    }`;

  // xử lý form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // thêm / sửa nhân viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "ADD") {
        if (formData.role === "DOCTOR") {
          await axios.post(`${API_BASE}/doctors`, formData);
        } else {
          await axios.post(`${API_BASE}/employees`, formData);
        }
        alert("Thêm thành công!");
      } else {
        if (formData.role === "DOCTOR") {
          await axios.put(`${API_BASE}/doctors/${selectedStaff.id}`, formData);
        } else {
          await axios.put(
            `${API_BASE}/employees/${selectedStaff.id}`,
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

  // xóa nhân viên
  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await axios.delete(`${API_BASE}/employees/${selectedStaff.id}`);
      setShowDeleteModal(false);
      fetchStaff();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Không thể xóa nhân sự này!");
    }
  };

  // mở modal thêm
  const openAddModal = (defaultRole = "DOCTOR") => {
    setModalMode("ADD");
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

  // mở modal edit
  const openEditModal = (staff) => {
    setModalMode("EDIT");
    setSelectedStaff(staff);
    setFormData({
      role: staff.role || "DOCTOR",
      username: staff.username || "",
      password: "", // Để trống khi edit
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

  // màu các role
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
        return { name: "Nhân viên", bg: "secondary", color: "000", hex: "eee" };
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Danh sách Nhân sự</h4>
        <button
          className="btn btn-success shadow-sm"
          onClick={() => openAddModal()}
        >
          <i className="fa-solid fa-plus me-1"></i> Thêm Nhân sự
        </button>
      </div>

      {/*Lọc Nhân Sự */}
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

      {/*Danh sách*/}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {staffList.map((staff) => {
          const roleUI = getRoleUI(staff.role);
          const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            staff.fullName || "Nhân viên",
          )}&background=${roleUI.hex}&color=${roleUI.color}&size=120`;

          const avatarSrc =
            staff.avatarUrl && staff.avatarUrl.trim() !== ""
              ? staff.avatarUrl
              : fallbackAvatar;

          return (
            <div className="col" key={staff.id}>
              <div className="doctor-card position-relative h-100">
                <div
                  className="dropdown position-absolute top-0 end-0 mt-3 me-3"
                  data-staff-dropdown-root
                  style={{ zIndex: 2 }}
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
                    className={`dropdown-menu dropdown-menu-end shadow-sm border-0 ${
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

                {/* thông tin card */}

                <div className="d-flex gap-3 text-decoration-none text-dark align-items-start">
                  <div className="staff-avatar-box shadow-sm">
                    <img
                      src={avatarSrc}
                      className="staff-avatar"
                      alt={staff.fullName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackAvatar;
                      }}
                    />
                  </div>
                  <div className="doctor-info flex-grow-1">
                    <span
                      className={`badge bg-${roleUI.bg} bg-opacity-10 text-${roleUI.bg} mb-2 border border-${roleUI.bg} border-opacity-25`}
                    >
                      {roleUI.name}
                    </span>

                    <h5>{staff.fullName}</h5>

                    {/*chuyên khoa bác sĩ */}
                    {staff.role === "DOCTOR" && (
                      <div
                        className="text-muted mb-1"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {staff.specialty || "Khoa chung"}
                      </div>
                    )}

                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      <i className="fa-solid fa-envelope me-2"></i>
                      {staff.email}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                      <i className="fa-solid fa-phone me-2"></i>
                      {staff.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/*modal thêm / sửa */}
      {showModal && (
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
                      <i className="fa-solid fa-user-plus me-2"></i> Thêm Nhân
                      sự mới
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
                    1. Thông tin Tài khoản
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
                        Họ và Tên <span className="text-danger">*</span>
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

                    {/* Chỉ cho phép nhập username và password khi Thêm Mới */}
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

                  {/* Form riêng cho Bác sĩ */}
                  {formData.role === "DOCTOR" && (
                    <div>
                      <hr className="text-muted" />
                      <h6 className="fw-bold mb-3 text-muted">
                        2. Hồ sơ chuyên môn (Dành riêng cho Bác sĩ)
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
                            placeholder="VD: Khoa Tim Mạch"
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
                            placeholder="VD: Tiến sĩ"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-medium">
                            Giới thiệu tiểu sử
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
                      {modalMode === "ADD" ? "Lưu Nhân sự" : "Cập nhật"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* modal xóa */}
      {showDeleteModal && (
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
                <h5 className="fw-bold mb-2 text-dark">Xác nhận Xóa?</h5>
                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Bạn có chắc chắn muốn xóa nhân sự{" "}
                  <strong>{selectedStaff?.fullName}</strong> khỏi hệ thống?
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
