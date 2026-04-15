function StaffFormModal({ mode, formData, onChange, onClose, onSubmit }) {
  const isAddMode = mode === "ADD";

  return (
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
              {isAddMode ? (
                <>
                  <i className="fa-solid fa-user-plus me-2"></i> Thêm nhân sự
                </>
              ) : (
                <>
                  <i className="fa-regular fa-pen-to-square me-2"></i> Cập nhật hồ sơ
                </>
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={onSubmit}>
              <h6 className="fw-bold mb-3 text-muted">1. Thông tin tài khoản</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-12">
                  <label className="form-label fw-medium">
                    Vai trò <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select border-success"
                    name="role"
                    value={formData.role}
                    onChange={onChange}
                    required
                    disabled={!isAddMode}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
                    required
                  />
                </div>

                {isAddMode && (
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
                        onChange={onChange}
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
                        onChange={onChange}
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
                      <label className="form-label fw-medium">Chuyên khoa</label>
                      <input
                        type="text"
                        className="form-control"
                        name="specialty"
                        value={formData.specialty}
                        onChange={onChange}
                        placeholder="VD: Khoa Tim mach"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-medium">Bằng cấp</label>
                      <input
                        type="text"
                        className="form-control"
                        name="degree"
                        value={formData.degree}
                        onChange={onChange}
                        placeholder="VD: Tien si"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium">Giới thiệu</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="bio"
                        value={formData.bio}
                        onChange={onChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer mt-4 px-0 pb-0 border-top pt-3">
                <button type="button" className="btn btn-light border" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary-custom">
                  {isAddMode ? "Lưu" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffFormModal;