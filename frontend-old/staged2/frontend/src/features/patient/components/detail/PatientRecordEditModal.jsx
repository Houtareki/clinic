function PatientRecordEditModal({
  selectedRecord,
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
              backgroundColor: "#f8fafc",
              borderRadius: "16px 16px 0 0",
              borderBottom: "2px solid #eaedf1",
            }}
          >
            <h5 className="modal-title fw-bold text-primary text-start w-100">
              <i className="fa-solid fa-stethoscope me-2"></i>
              Hồ sơ khám bệnh
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-start">
            <form onSubmit={onSubmit} className="text-start">
              <div className="bg-light p-3 rounded-3 mb-4 border">
                <div className="row g-2 text-muted" style={{ fontSize: "0.85rem" }}>
                  <div className="col-md-4">
                    <div className="fw-bold text-dark">Ngày khám:</div>
                    {selectedRecord?.examinedAt || selectedRecord?.createdAt || "Chưa cập nhật"}
                  </div>
                  <div className="col-md-4">
                    <div className="fw-bold text-dark">Bác sĩ:</div>
                    {selectedRecord?.doctorName || "Chưa cập nhật"}
                  </div>
                  <div className="col-12 mt-2">
                    <div className="fw-bold text-dark">Triệu chứng ban đầu:</div>
                    <span className="text-danger">
                      {selectedRecord?.symptoms || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3 text-muted text-start">Kết quả khám & chẩn đoán</h6>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium text-start d-block">
                    Chẩn đoán <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={onChange}
                    required
                  />
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label fw-medium text-start d-block">Ghi chú & kê đơn</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="note"
                    value={formData.note}
                    onChange={onChange}
                  ></textarea>
                </div>

                <div className="col-12 mt-3">
                  <label className="form-label fw-medium text-start d-block">Triệu chứng</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={onChange}
                  ></textarea>
                </div>

                <div className="col-md-6 mt-3">
                  <label className="form-label fw-medium text-start d-block">Cập nhật trạng thái</label>
                  <select
                    className="form-select bg-light fw-medium border-success-subtle"
                    name="status"
                    value={formData.status}
                    onChange={onChange}
                  >
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đang chờ">Đang chờ</option>
                    <option value="Hủy">Hủy</option>
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
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-custom px-4"
                  disabled={savingRecord}
                >
                  {savingRecord ? "Đang lưu..." : "Lưu kết quả khám"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientRecordEditModal;
