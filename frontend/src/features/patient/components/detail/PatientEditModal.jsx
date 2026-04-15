function PatientEditModal({
  patientForm,
  savingPatient,
  onChange,
  onActiveChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          <div
            className="modal-header text-start"
            style={{ backgroundColor: "#f5f8fa", borderRadius: "16px 16px 0 0" }}
          >
            <h5 className="modal-title fw-bold text-primary text-start w-100">
              <i className="fa-regular fa-pen-to-square me-2"></i>
              Cập nhật hồ sơ bệnh nhân
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-start">
            <form onSubmit={onSubmit}>
              <h6 className="fw-bold mb-3 text-muted text-start">1. Thông tin Hành chính</h6>

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
                    value={patientForm.phone}
                    onChange={onChange}
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
                    value={patientForm.gender}
                    onChange={onChange}
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium">Địa chỉ liên hệ</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={patientForm.address}
                    onChange={onChange}
                  />
                </div>
              </div>

              <hr className="text-muted opacity-25" />

              <h6 className="fw-bold mb-3 text-muted text-start">2. Thông tin Y tế</h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium">Tiền sử bệnh lý</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="medicalHistory"
                    value={patientForm.medicalHistory}
                    onChange={onChange}
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-medium">Trạng thái hồ sơ</label>
                  <select
                    className="form-select"
                    name="active"
                    value={String(patientForm.active)}
                    onChange={onActiveChange}
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
                <button type="button" className="btn btn-light border" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary-custom" disabled={savingPatient}>
                  {savingPatient ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientEditModal;