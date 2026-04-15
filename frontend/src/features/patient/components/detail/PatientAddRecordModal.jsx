function PatientAddRecordModal({
  doctorOptions,
  formData,
  savingRecord,
  onChange,
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
            <h5 className="modal-title fw-bold text-success text-start w-100">
              <i className="fa-regular fa-calendar-plus me-2"></i>
              Đặt lịch / Thêm ca khám mới
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-start">
            <form onSubmit={onSubmit} className="text-start">
              <h6 className="fw-bold mb-3 text-muted text-start">1. Phân công bác sĩ</h6>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">
                    Bác sĩ phụ trách <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Chọn bác sĩ...</option>
                    {doctorOptions.map((doctor) => (
                      <option
                        key={doctor.id || doctor.doctorId || doctor.accountId}
                        value={doctor.id || doctor.doctorId || doctor.accountId}
                      >
                        {doctor.fullName}
                        {doctor.specialty ? ` - ${doctor.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="text-muted opacity-25" />

              <h6 className="fw-bold mb-3 text-muted text-start">2. Tình trạng bệnh nhân</h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium text-start d-block">
                    Triệu chứng / Lý do khám <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={onChange}
                    required
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium text-start d-block">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="note"
                    value={formData.note}
                    onChange={onChange}
                  ></textarea>
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
                <button
                  type="submit"
                  className="btn btn-success px-4 text-white fw-bold shadow-sm"
                  style={{ borderRadius: "8px" }}
                  disabled={savingRecord}
                >
                  {savingRecord ? "Đang tạo..." : "Tạo lịch khám"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAddRecordModal;