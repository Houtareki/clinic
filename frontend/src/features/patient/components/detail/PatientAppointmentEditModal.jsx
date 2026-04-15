function PatientAppointmentEditModal({
  selectedRecord,
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
            style={{
              backgroundColor: "#f5f8fa",
              borderRadius: "16px 16px 0 0",
              borderBottom: "2px solid #eaedf1",
            }}
          >
            <h5 className="modal-title fw-bold text-success text-start w-100">
              <i className="fa-regular fa-pen-to-square me-2"></i>
              Sửa ca khám
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-start">
            <form onSubmit={onSubmit} className="text-start">
              <div className="bg-light p-3 rounded-3 mb-4 border">
                <div className="row g-2 text-muted" style={{ fontSize: "0.85rem" }}>
                  <div className="col-md-4">
                    <div className="fw-bold text-dark">Ngày tạo lịch:</div>
                    {selectedRecord?.createdAt || "Chưa cập nhật"}
                  </div>
                  <div className="col-md-4">
                    <div className="fw-bold text-dark">Bác sĩ hiện tại:</div>
                    {selectedRecord?.doctorName || "Chưa cập nhật"}
                  </div>
                  <div className="col-md-4">
                    <div className="fw-bold text-dark">Trạng thái:</div>
                    {selectedRecord?.status || "Chưa cập nhật"}
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3 text-muted text-start">Thông tin ca khám</h6>

              <div className="row g-3">
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
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn btn-success px-4 text-white fw-bold shadow-sm"
                  style={{ borderRadius: "8px" }}
                  disabled={savingRecord}
                >
                  {savingRecord ? "Đang cập nhật..." : "Cập nhật ca khám"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointmentEditModal;
