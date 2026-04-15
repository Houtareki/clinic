function PatientFormModal({ mode, formData, onChange, onClose, onSubmit }) {
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

            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <form onSubmit={onSubmit}>
              <h6 className="fw-bold mb-3 text-muted">1. Thông tin cá nhân</h6>

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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
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
                    onChange={onChange}
                    placeholder="VD: Ha Noi"
                    required
                  />
                </div>
              </div>

              <hr className="text-muted" />

              <h6 className="fw-bold mb-3 text-muted">2. Thông tin bổ sung</h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium">Tiền sử bệnh án</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={onChange}
                    placeholder="Nhap tien su benh neu co..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer mt-4 px-0 pb-0 border-top pt-3">
                <button type="button" className="btn btn-light border" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary-custom">
                  {isAddMode ? "Lưu bệnh nhân" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientFormModal;